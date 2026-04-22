import { createMessage } from "../controllers/messageControllers.js";
import db from "../config/db.js";

const onlineUsers = new Map();

const emitToUsers = (io, userIds, event, payload) => {
    const uniqueIds = [...new Set(userIds.map((id) => Number(id)).filter(Boolean))];

    uniqueIds.forEach((userId) => {
        io.to(`user:${userId}`).emit(event, payload);
    });
};

const emitToUsersExcept = (io, userIds, excludedId, event, payload) => {
    const excluded = Number(excludedId || 0);
    emitToUsers(
        io,
        userIds.filter((id) => Number(id) !== excluded),
        event,
        payload
    );
};

const getGroupMemberIds = async (groupId) => {
    const [rows] = await db.promise().query(
        `
        SELECT user_id
        FROM group_members
        WHERE group_id = ?
        `,
        [groupId]
    );

    return rows.map((row) => row.user_id);
};

export default (io) => {
    io.on("connection", (socket) => {
        let connectUserId = null;

        socket.on("user-online", (userId) => {
            connectUserId = userId;
            onlineUsers.set(userId, socket.id);
            socket.join(`user:${userId}`);

            io.emit("online-users", Array.from(onlineUsers.keys()));
        });

        socket.on("typing", async (data) => {
            if (data.groupId) {
                const memberIds = await getGroupMemberIds(data.groupId);
                emitToUsersExcept(io, memberIds, connectUserId, "typing", {
                    ...data,
                    senderId: connectUserId,
                });
                return;
            }

            if (data.receiverId) {
                emitToUsers(io, [data.receiverId], "typing", {
                    ...data,
                    senderId: connectUserId,
                });
            }
        });

        socket.on("stop-typing", async (data) => {
            if (data.groupId) {
                const memberIds = await getGroupMemberIds(data.groupId);
                emitToUsersExcept(io, memberIds, connectUserId, "stop-typing", {
                    ...data,
                    senderId: connectUserId,
                });
                return;
            }

            if (data.receiverId) {
                emitToUsers(io, [data.receiverId], "stop-typing", {
                    ...data,
                    senderId: connectUserId,
                });
            }
        });

        socket.on("send-message", async (msg) => {
            const savedMessage = await createMessage(msg);

            if (savedMessage.group_id) {
                const memberIds = await getGroupMemberIds(savedMessage.group_id);
                emitToUsers(io, memberIds, "new-message", savedMessage);
                emitToUsers(io, memberIds, "update-chat-list", savedMessage);
                return;
            }

            const participantIds = [savedMessage.sender_id, savedMessage.receiver_id];
            emitToUsers(io, participantIds, "new-message", savedMessage);
            emitToUsers(io, participantIds, "update-chat-list", savedMessage);
        });

        socket.on("delete-message", async ({ messageId }) => {
            if (!connectUserId || !messageId) {
                return;
            }

            const [rows] = await db.promise().query(
                `
                SELECT id_messages, sender_id, receiver_id, group_id
                FROM messages
                WHERE id_messages = ?
                LIMIT 1
                `,
                [messageId]
            );

            if (!rows.length) {
                return;
            }

            const message = rows[0];
            if (Number(message.sender_id) !== Number(connectUserId)) {
                return;
            }

            await db.promise().query(
                `
                DELETE FROM messages
                WHERE id_messages = ?
                `,
                [messageId]
            );

            if (message.group_id) {
                const memberIds = await getGroupMemberIds(message.group_id);
                emitToUsers(io, memberIds, "message-deleted", {
                    messageId,
                    groupId: message.group_id,
                });
                emitToUsers(io, memberIds, "chat-list-refresh", {
                    groupId: message.group_id,
                });
                return;
            }

            const participantIds = [message.sender_id, message.receiver_id];
            emitToUsers(io, participantIds, "message-deleted", {
                messageId,
                receiverId: message.receiver_id,
            });
            emitToUsers(io, participantIds, "chat-list-refresh", {
                receiverId: message.receiver_id,
            });
        });

        socket.on("message-delivered", ({ messageId, senderId }) => {
            if (!senderId) {
                return;
            }

            io.to(`user:${Number(senderId)}`).emit("message-status", {
                messageId,
                status: "delivered",
            });
        });

        socket.on("message-read", async ({ conversationId }) => {
            const isGroupConversation = String(conversationId || "").startsWith("g:");
            const targetId = isGroupConversation
                ? Number(String(conversationId).slice(2))
                : Number(conversationId);

            if (isGroupConversation) {
                const memberIds = await getGroupMemberIds(targetId);
                emitToUsers(io, memberIds, "message-read-update", {
                    conversationId,
                    status: "read",
                });
                return;
            }

            io.to(`user:${targetId}`).emit("message-read-update", {
                conversationId,
                status: "read",
            });
        });

        socket.on("disconnect", () => {
            if (connectUserId) {
                onlineUsers.delete(connectUserId);
                io.emit("online-users", Array.from(onlineUsers.keys()));
            }
        });
    });
};
