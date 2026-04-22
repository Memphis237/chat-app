import db from "../config/db.js";
import fs from "node:fs/promises";
import path from "node:path";

const uploadsRoot = path.resolve(process.cwd(), "uploads", "messages");

const getExtensionFromMime = (mimeType, fileName = "") => {
    const mimeMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/ogg": "ogg",
        "application/pdf": "pdf",
        "text/plain": "txt",
        "application/javascript": "js",
        "text/javascript": "js",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    };

    if (mimeMap[mimeType]) {
        return mimeMap[mimeType];
    }

    const match = String(fileName || "").match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : "bin";
};

const persistAttachment = async (payload) => {
    if (!payload?.dataUrl) {
        return payload;
    }

    const match = String(payload.dataUrl).match(/^data:([^;]+);base64,(.+)$/);

    if (!match) {
        return payload;
    }

    const mimeType = payload.mimeType || match[1];
    const base64Data = match[2];
    const extension = getExtensionFromMime(mimeType, payload.fileName);

    await fs.mkdir(uploadsRoot, { recursive: true });

    const safeName = String(payload.fileName || "file")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .slice(0, 80);
    const storedName = `${Date.now()}-${safeName || "file"}.${extension}`;
    const filePath = path.join(uploadsRoot, storedName);
    const publicPath = `/uploads/messages/${storedName}`;

    await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

    return {
        ...payload,
        mimeType,
        fileUrl: publicPath,
    };
};

export const createMessage = async (data) => {
    const { sender_id, receiver_id, group_id, message, message_type } = data;

    const now = new Date();

    try {
        let storedMessage = message;

        if (message_type && message_type !== "text") {
            const parsedPayload = typeof message === "string" ? JSON.parse(message) : message;
            const persistedPayload = await persistAttachment(parsedPayload);
            storedMessage = JSON.stringify({
                caption: persistedPayload.caption || "",
                fileName: persistedPayload.fileName || "fichier",
                mimeType: persistedPayload.mimeType || "",
                fileSize: persistedPayload.fileSize || 0,
                fileKind: persistedPayload.fileKind || message_type,
                fileUrl: persistedPayload.fileUrl || "",
            });
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO messages
            (sender_id, receiver_id, group_id, message, message_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [sender_id, receiver_id || null, group_id || null, storedMessage, message_type || "text", now]
        );

        return {
            id_messages: result.insertId,
            ...data,
            message: storedMessage,
            status: "sent",
            timestamp: now,
        };
    } catch (error) {
        console.error("Erreur Database createMessage:", error);
        throw error;
    }
};
