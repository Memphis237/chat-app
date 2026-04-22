import React, { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { socket } from "../services/socket";
import api from "../utils/api";
import { formatChatDate, formatLastSeen } from "../utils/chatFormat";
import { Avatar } from "./Avatar";

const resolveFileUrl = (url) => {
    if (!url) {
        return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `${import.meta.env.VITE_API_URL}${url}`;
};

function TypingIndicator() {
    return (
        <div className="px-6 pb-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
                <span>En train d&apos;écrire</span>
                <span className="typing-dots" aria-hidden="true">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                </span>
            </div>
        </div>
    );
}

const parseMessagePayload = (msg) => {
    if (msg.message_type === "text") {
        return {
            type: "text",
            text: msg.message || "",
        };
    }

    try {
        const payload = JSON.parse(msg.message || "{}");
        return {
            type: msg.message_type || payload.fileKind || "file",
            caption: payload.caption || "",
            fileName: payload.fileName || "fichier",
            fileUrl: resolveFileUrl(payload.fileUrl || payload.dataUrl || ""),
            downloadUrl: resolveFileUrl(payload.fileUrl || payload.dataUrl || ""),
            mimeType: payload.mimeType || "",
        };
    } catch {
        return {
            type: msg.message_type || "file",
            caption: "",
            fileName: "fichier",
            fileUrl: "",
            downloadUrl: "",
            mimeType: "",
        };
    }
};

const getAttachmentLabel = (type) => {
    switch (type) {
        case "image":
            return "Image";
        case "video":
            return "Vidéo";
        case "pdf":
            return "PDF";
        default:
            return "Fichier";
    }
};

export function ChatWindow({ activeChat, user }) {
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const [showPresenceStatus, setShowPresenceStatus] = useState(false);
    const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
    const [pendingDeleteMessage, setPendingDeleteMessage] = useState(null);
    const menuRootRef = useRef(null);
    const userId = Number(user?.id_users ?? user?.id ?? 0);
    const activeChatUserId = Number(activeChat?.id_users || 0);
    const activeChatGroupId = Number(activeChat?.id_groups || 0);
    const activeChatId = activeChat?.id_groups || activeChat?.id_users;
    const isGroupChat = Boolean(activeChat?.id_groups);
    const readConversationId = isGroupChat ? `g:${activeChatGroupId}` : activeChatId;
    const activeChatIsOnline = Boolean(activeChat?.id_users && activeChat?.is_online);
    const activeChatPresenceText = isGroupChat
        ? "Discussion de groupe"
        : activeChatIsOnline
            ? "en ligne"
            : formatLastSeen(activeChat?.last_seen);

    useEffect(() => {
        if (!activeChatId || !user) {
            setMessages([]);
            setTypingUser(null);
            setShowPresenceStatus(false);
            setOpenMessageMenuId(null);
            setPendingDeleteMessage(null);
            return;
        }

        const loadMessages = async () => {
            try {
                const response = await api.get(`/chats/${activeChatId}/messages`, {
                    params: {
                        type: isGroupChat ? "group" : "private",
                    },
                });
                const loadedMessages = response.data.messages || [];
                const decoratedMessages = isGroupChat
                    ? loadedMessages
                    : loadedMessages.map((message) =>
                          Number(message.sender_id) === userId
                              ? { ...message, status: message.status || "read" }
                              : message
                      );

                setMessages(decoratedMessages);
            } catch (error) {
                console.error("Erreur chargement messages:", error);
                setMessages([]);
            }
        };

        loadMessages();
        setTypingUser(null);
        setShowPresenceStatus(false);
        setOpenMessageMenuId(null);
        setPendingDeleteMessage(null);

        const timer = window.setTimeout(() => {
            setShowPresenceStatus(true);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [activeChatId, isGroupChat, user]);

    useEffect(() => {
        const handleNewMessage = (msg) => {
            const messageGroupId = Number(msg.group_id || 0);
            const messageSenderId = Number(msg.sender_id || 0);
            const messageReceiverId = Number(msg.receiver_id || 0);
            const isRelevantGroup = activeChatGroupId && messageGroupId === activeChatGroupId;
            const isRelevantPrivate =
                activeChatUserId &&
                !messageGroupId &&
                ((messageSenderId === userId && messageReceiverId === activeChatUserId) ||
                    (messageSenderId === activeChatUserId && messageReceiverId === userId));

            if (!isRelevantGroup && !isRelevantPrivate) {
                return;
            }

            setMessages((prev) => [...prev, msg]);

            socket.emit("message-delivered", {
                messageId: msg.id_messages,
                senderId: msg.sender_id,
            });
        };

        const handleMessageStatus = (data) => {
            setMessages((prev) =>
                prev.map((m) => (m.id_messages === data.messageId ? { ...m, status: data.status } : m))
            );
        };

        const handleMessageReadUpdate = (data) => {
            if (!readConversationId || String(data.conversationId || "") !== String(readConversationId)) {
                return;
            }

            setMessages((prev) =>
                prev.map((m) =>
                    Number(m.sender_id) === userId ? { ...m, status: "read" } : m
                )
            );
        };

        const handleTyping = (data) => {
            const incomingGroupId = Number(data.groupId || 0);
            const incomingSenderId = Number(data.senderId || 0);
            const isCurrentGroup = activeChatGroupId && incomingGroupId === activeChatGroupId;
            const isCurrentPrivate = !isGroupChat && incomingSenderId === activeChatUserId;

            if (!isCurrentGroup && !isCurrentPrivate) {
                return;
            }

            setTypingUser(data.user);
        };

        const handleStopTyping = (data) => {
            const incomingGroupId = Number(data.groupId || 0);
            const incomingSenderId = Number(data.senderId || 0);
            const isCurrentGroup = activeChatGroupId && incomingGroupId === activeChatGroupId;
            const isCurrentPrivate = !isGroupChat && incomingSenderId === activeChatUserId;

            if (!isCurrentGroup && !isCurrentPrivate) {
                return;
            }

            setTypingUser(null);
        };

        const handleMessageDeleted = (data) => {
            const deletedId = Number(data.messageId || 0);
            if (!deletedId) {
                return;
            }

            setMessages((prev) => prev.filter((message) => Number(message.id_messages) !== deletedId));
            setOpenMessageMenuId((current) => (Number(current) === deletedId ? null : current));
        };

        socket.on("new-message", handleNewMessage);
        socket.on("message-status", handleMessageStatus);
        socket.on("message-read-update", handleMessageReadUpdate);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);
        socket.on("message-deleted", handleMessageDeleted);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("message-status", handleMessageStatus);
            socket.off("message-read-update", handleMessageReadUpdate);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
            socket.off("message-deleted", handleMessageDeleted);
        };
    }, [activeChatId, activeChatGroupId, activeChatUserId, userId]);

    useEffect(() => {
        if (readConversationId) {
            socket.emit("message-read", {
                conversationId: readConversationId,
            });
        }
    }, [readConversationId]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!menuRootRef.current) {
                return;
            }

            if (!menuRootRef.current.contains(event.target)) {
                setOpenMessageMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const confirmDeleteMessage = () => {
        const msg = pendingDeleteMessage;
        const messageId = Number(msg.id_messages || 0);
        if (!messageId) {
            setPendingDeleteMessage(null);
            return;
        }

        setOpenMessageMenuId(null);
        setPendingDeleteMessage(null);
        setMessages((prev) => prev.filter((message) => Number(message.id_messages) !== messageId));
        socket.emit("delete-message", { messageId });
    };

    if (!activeChat) {
        return (
            <div className="flex flex-1 items-center justify-center bg-[#020618] px-6 text-center">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-black/20">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#0F172B] text-[#00A34A]">
                        <span className="text-2xl">C</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Aucune discussion sélectionnée</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Veuillez sélectionner une discussion pour que le contenu s'affiche.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-1 flex-col bg-[#020618]">
            <div className="border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-4">
                    <Avatar
                        avatar={activeChat.avatar}
                        name={activeChat.name}
                        size={14}
                        className="border border-white/10"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-white">{activeChat.name}</h2>
                        <p className={`text-sm ${isGroupChat || !showPresenceStatus ? "text-slate-400" : activeChatIsOnline ? "text-[#00A34A]" : "text-slate-400"}`}>
                            {isGroupChat
                                ? "Discussion de groupe"
                                : !showPresenceStatus
                                    ? "Discussion privée"
                                    : activeChatPresenceText}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto">
                {messages.map((msg) => {
                    const isMine = Number(msg.sender_id) === userId;
                    const payload = parseMessagePayload(msg);
                    const isAttachment = payload.type !== "text";
                    const downloadUrl = payload.downloadUrl || payload.fileUrl;

                    return (
                        <div
                            key={msg.id_messages}
                            className={`flex px-6 py-2 ${isMine ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                ref={Number(openMessageMenuId) === Number(msg.id_messages) ? menuRootRef : null}
                                className={`group relative max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                                    isMine
                                        ? "rounded-br-md bg-[#00A34A] text-white"
                                        : "rounded-bl-md bg-[#1D293D] text-slate-100"
                                }`}
                                >
                                    {isMine && (
                                        <div className="absolute -right-2 -top-2 z-20">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOpenMessageMenuId((current) =>
                                                        Number(current) === Number(msg.id_messages) ? null : msg.id_messages
                                                    )
                                                }
                                                className={`flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#0F172B] text-white shadow-lg transition hover:bg-[#1D293D] group-focus-within:opacity-100 ${
                                                    Number(openMessageMenuId) === Number(msg.id_messages)
                                                        ? "opacity-100"
                                                        : "opacity-0 group-hover:opacity-100"
                                                }`}
                                                aria-label="Options du message"
                                            >
                                                <span className="text-lg leading-none">⋮</span>
                                            </button>

                                            {Number(openMessageMenuId) === Number(msg.id_messages) && (
                                                <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0F172B] shadow-2xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingDeleteMessage(msg)}
                                                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-rose-400 transition hover:bg-white/5"
                                                    >
                                                        <span>Supprimer</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isAttachment ? (
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                                {payload.type === "image" && payload.fileUrl && (
                                                    <img
                                                        src={payload.fileUrl}
                                                        alt={payload.fileName}
                                                        className="max-h-80 w-full rounded-xl object-cover"
                                                    />
                                                )}

                                            {payload.type === "video" && payload.fileUrl && (
                                                <video controls className="max-h-80 w-full rounded-xl">
                                                    <source src={payload.fileUrl} type={payload.mimeType || "video/mp4"} />
                                                    Votre navigateur ne supporte pas la lecture vidéo.
                                                </video>
                                                )}

                                                {(payload.type === "pdf" || payload.type === "file") && downloadUrl && (
                                                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                                                        <span className="flex size-10 items-center justify-center rounded-full bg-[#00A34A]/15 text-[#00A34A]">
                                                            {getAttachmentLabel(payload.type).slice(0, 1)}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium">{payload.fileName}</p>
                                                            <p className="text-xs text-slate-400">{getAttachmentLabel(payload.type)}</p>
                                                        </div>
                                                        <a
                                                            href={downloadUrl}
                                                            download={payload.fileName}
                                                            className="rounded-full border border-white/10 bg-[#00A34A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0bbf5a]"
                                                        >
                                                            Télécharger
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {downloadUrl && (
                                                <a
                                                    href={downloadUrl}
                                                    download={payload.fileName}
                                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                                                >
                                                    Télécharger
                                                </a>
                                            )}

                                            {payload.caption && (
                                                <p className="whitespace-pre-wrap break-words">{payload.caption}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    )}
                                    <div
                                        className={`mt-2 flex items-center gap-2 text-xs ${
                                            isMine ? "text-white/80" : "text-slate-400"
                                        }`}
                                    >
                                    <span>{formatChatDate(msg.timestamp)}</span>
                                    {isMine && (
                                        <>
                                            {msg.status === "sent" && <span>✓</span>}
                                            {msg.status === "delivered" && <span>✓✓</span>}
                                            {msg.status === "read" && <span className="text-[#4fc3f7]">✓✓</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {typingUser && <TypingIndicator />}
            </div>

            <div className="border-t border-white/5 p-4">
                <ChatInput activeChat={activeChat} user={user} />
            </div>

            {pendingDeleteMessage && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172B] p-6 shadow-2xl shadow-black/50">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Suppression</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Supprimer ce message ?</h3>
                        <p className="mt-3 text-sm text-slate-400">
                            Cette action supprimera le message de la discussion et de la base de données.
                        </p>

                        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
                            <p className="text-sm text-slate-100">{pendingDeleteMessage.message}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingDeleteMessage(null)}
                                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteMessage}
                                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
