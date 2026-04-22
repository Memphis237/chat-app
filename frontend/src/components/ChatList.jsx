import React, { useEffect, useMemo, useState } from "react";
import { socket } from "../services/socket";
import { formatChatDate, formatLastSeen } from "../utils/chatFormat";
import { Avatar } from "./Avatar";

export function ChatList({ chats, setChats, onSelectChat, currentChatId, onNewChat, onCreateGroup }) {
    const currentId = Number(currentChatId || 0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = useMemo(() => {
        const normalized = searchQuery.trim().toLowerCase();

        if (!normalized) {
            return chats;
        }

        return chats.filter((chat) => {
            const name = String(chat.name || "").toLowerCase();
            const lastMessage = String(chat.last_message || "").toLowerCase();
            const presence = chat.id_groups ? "discussion de groupe" : "";

            return (
                name.includes(normalized) ||
                lastMessage.includes(normalized) ||
                presence.includes(normalized)
            );
        });
    }, [chats, searchQuery]);

    useEffect(() => {
        const handleUpdateChatList = (msg) => {
            const messageGroupId = Number(msg.group_id || 0);
            const messageSenderId = Number(msg.sender_id || 0);
            const messageReceiverId = Number(msg.receiver_id || msg.receiver?.id || 0);

            setChats((prev) => {
                return prev.map((chat) => {
                    const chatGroupId = Number(chat.id_groups || 0);
                    const chatUserId = Number(chat.id_users || 0);
                    const isMatch =
                        chatGroupId === messageGroupId ||
                        chatUserId === messageSenderId ||
                        chatUserId === messageReceiverId;

                    if (isMatch) {
                        return {
                            ...chat,
                            last_message: msg.message,
                            unread:
                                chatGroupId === currentId || chatUserId === currentId
                                    ? 0
                                    : (chat.unread || 0) + 1,
                        };
                    }

                    return chat;
                });
            });
        };

        socket.on("update-chat-list", handleUpdateChatList);

        return () => {
            socket.off("update-chat-list", handleUpdateChatList);
        };
    }, [setChats, currentChatId, currentId]);

    useEffect(() => {
        const handleOutsideClick = () => setMenuOpen(false);
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    return (
        <div className="bg-[#0F172B] w-[500px] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Discussions</p>
                    <h2 className="text-lg font-semibold text-white">Messages</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onNewChat}
                        className="rounded-full bg-[#00A34A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0bbf5a]"
                    >
                        Nouvelle discussion
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen((prev) => !prev);
                            }}
                            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                            aria-label="Options des discussions"
                        >
                            <span className="text-xl leading-none">⋮</span>
                        </button>

                        {menuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0E162A] shadow-2xl"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onCreateGroup?.();
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-[#00A34A]/15 text-[#00A34A]">
                                        +
                                    </span>
                                    <span>Créer nouveau groupe</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-b border-white/5 px-4 py-4">
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">
                    Rechercher une discussion
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom d'un utilisateur ou d'un groupe..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#00A34A]"
                />
            </div>

            {filteredChats.length === 0 ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center">
                    <div>
                        <p className="text-lg font-medium text-white">
                            {searchQuery.trim() ? "Aucune discussion trouvée" : "Aucune discussion"}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            {searchQuery.trim()
                                ? "Essayez un autre nom pour retrouver une conversation."
                                : "Vous n'avez pas encore de discussion disponible."}
                        </p>
                    </div>
                </div>
            ) : (
                filteredChats.map((chat) => {
                    const chatId = chat.id_groups || chat.id_users;
                    const isActive = Number(currentChatId || 0) === Number(chatId || 0);
                    const isOnline = Boolean(chat.id_users && chat.is_online);
                    const presenceText = chat.id_groups
                        ? "Discussion de groupe"
                        : isOnline
                            ? "en ligne"
                            : formatLastSeen(chat.last_seen);
                    const timestampText = formatChatDate(chat.timestamp);

                    return (
                        <div
                            key={chatId}
                            onClick={() => {
                                onSelectChat(chat);
                                setChats((prev) =>
                                    prev.map((c) =>
                                        Number(c.id_groups || c.id_users || 0) === Number(chatId || 0)
                                            ? { ...c, unread: 0 }
                                            : c
                                    )
                                );
                            }}
                            className={`px-4 py-3 ${isActive ? "bg-[#1D293D]" : ""}`}
                        >
                            <div className="flex items-start gap-4">
                                <Avatar
                                    avatar={chat.avatar}
                                    name={chat.name}
                                    size={12}
                                    className="border border-white/10"
                                />
                                <div className="min-w-0">
                                    <h3 className="truncate text-white">{chat.name}</h3>
                                    <p className="truncate text-sm text-slate-400">{chat.last_message || ""}</p>
                                    <p className={`mt-1 text-xs ${isOnline ? "text-[#00A34A]" : "text-slate-500"}`}>
                                        {presenceText}
                                    </p>
                                </div>

                                <div className="ml-auto flex flex-col items-end gap-2">
                                    <span className="text-xs text-slate-500">{timestampText}</span>
                                    {chat.unread > 0 && (
                                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#00A34A] px-2 py-0.5 text-xs font-semibold text-white">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
