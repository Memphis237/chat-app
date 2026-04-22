import React, { useEffect, useRef, useState } from "react";
import { socket } from "../services/socket";

export function ChatInput({ activeChat, user }) {
    const [text, setText] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const userId = user?.id_users ?? user?.id;
    const username = user?.username ?? user?.name;
    const conversationId = activeChat?.id_groups || activeChat?.id_users;
    const MAX_ATTACHMENT_SIZE = 200 * 1024 * 1024;
    const typingStartTimerRef = useRef(null);
    const stopTypingTimerRef = useRef(null);
    const isTypingRef = useRef(false);
    const fileInputRef = useRef(null);

    const emitTyping = () => {
        socket.emit("typing", {
            senderId: userId,
            user: username,
            conversationId,
            groupId: activeChat?.id_groups || null,
            receiverId: activeChat?.id_users || null,
        });
    };

    const emitStopTyping = () => {
        socket.emit("stop-typing", {
            senderId: userId,
            user: username,
            conversationId,
            groupId: activeChat?.id_groups || null,
            receiverId: activeChat?.id_users || null,
        });
    };

    const scheduleTypingEvents = (nextValue) => {
        window.clearTimeout(stopTypingTimerRef.current);

        if (!nextValue.trim()) {
            window.clearTimeout(typingStartTimerRef.current);
            typingStartTimerRef.current = null;
            isTypingRef.current = false;
            emitStopTyping();
            return;
        }

        if (!isTypingRef.current && !typingStartTimerRef.current) {
            typingStartTimerRef.current = window.setTimeout(() => {
                emitTyping();
                isTypingRef.current = true;
                typingStartTimerRef.current = null;
            }, 300);
        }

        stopTypingTimerRef.current = window.setTimeout(() => {
            if (isTypingRef.current) {
                emitStopTyping();
            }
            isTypingRef.current = false;
        }, 1000);
    };

    const stopTyping = () => {
        window.clearTimeout(typingStartTimerRef.current);
        window.clearTimeout(stopTypingTimerRef.current);
        typingStartTimerRef.current = null;
        stopTypingTimerRef.current = null;
        isTypingRef.current = false;
        emitStopTyping();
    };

    useEffect(() => {
        return () => {
            window.clearTimeout(typingStartTimerRef.current);
            window.clearTimeout(stopTypingTimerRef.current);
        };
    }, []);

    const getFileKind = (file) => {
        if (file.type.startsWith("image/")) {
            return "image";
        }

        if (file.type.startsWith("video/")) {
            return "video";
        }

        if (file.type === "application/pdf") {
            return "pdf";
        }

        return "file";
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setAttachment(null);
            setErrorMessage("");
            return;
        }

        if (file.size > MAX_ATTACHMENT_SIZE) {
            setAttachment(null);
            setErrorMessage("Le fichier est trop lourd. Limite autorisée: 200 Mo.");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setErrorMessage("");
            setAttachment({
                fileName: file.name,
                mimeType: file.type || "application/octet-stream",
                fileSize: file.size,
                fileKind: getFileKind(file),
                dataUrl: String(reader.result || ""),
            });
        };
        reader.readAsDataURL(file);
    };

    const clearAttachment = () => {
        setAttachment(null);
        setErrorMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const sendMessage = () => {
        if (!text.trim() && !attachment) {
            return;
        }

        const hasAttachment = Boolean(attachment);
        const msg = {
            sender_id: userId,
            receiver_id: activeChat.id_users || null,
            group_id: activeChat.id_groups || null,
            message: hasAttachment
                ? JSON.stringify({
                      caption: text.trim(),
                      fileName: attachment.fileName,
                      mimeType: attachment.mimeType,
                      fileSize: attachment.fileSize,
                      fileKind: attachment.fileKind,
                      dataUrl: attachment.dataUrl,
                  })
                : text,
            message_type: hasAttachment ? attachment.fileKind : "text",
        };

        socket.emit("send-message", msg);
        stopTyping();
        setText("");
        clearAttachment();
    };

    if (!activeChat || !user) {
        return null;
    }

    return (
        <div className="space-y-3">
            {errorMessage && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {errorMessage}
                </div>
            )}

            {attachment && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{attachment.fileName}</p>
                        <p className="text-xs text-slate-400">{attachment.fileKind.toUpperCase()}</p>
                    </div>
                    <button
                        type="button"
                        onClick={clearAttachment}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                    >
                        Retirer
                    </button>
                </div>
            )}

            <div className="flex items-end gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    aria-label="Ajouter un fichier"
                >
                    <span className="text-xl leading-none">+</span>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/pdf,.pdf,*/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <input
                    value={text}
                    onChange={(e) => {
                        const nextValue = e.target.value;
                        setText(nextValue);
                        scheduleTypingEvents(nextValue);
                    }}
                    onBlur={stopTyping}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#00A34A]"
                    placeholder="Écrire un message..."
                />

                <button
                    className="rounded-2xl bg-[#00A34A] px-5 py-3 font-semibold text-white"
                    onClick={sendMessage}
                    type="button"
                >
                    Envoyer
                </button>
            </div>
        </div>
    );
}
