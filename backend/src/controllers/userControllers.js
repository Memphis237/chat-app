import db from "../config/db.js";
import fs from "node:fs/promises";
import path from "node:path";

const uploadsRoot = path.resolve(process.cwd(), "uploads", "avatars");

const saveAvatarFromDataUrl = async (dataUrl, userId) => {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        throw new Error("Format d'image invalide");
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
        throw new Error("Image invalide");
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const extensionMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    };

    const extension = extensionMap[mimeType];
    if (!extension) {
        throw new Error("Type d'image non supporté");
    }

    await fs.mkdir(uploadsRoot, { recursive: true });

    const filename = `avatar-${userId}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadsRoot, filename);
    const relativePath = `/uploads/avatars/${filename}`;

    await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

    return relativePath;
};

export const getUsers = async (req, res) => {
    const currentUserId = req.user.id;
    const search = String(req.query.q || "").trim();

    try {
        const params = [currentUserId];
        let whereClause = "WHERE id_users != ?";

        if (search) {
            whereClause += " AND (LOWER(username) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))";
            params.push(`%${search}%`, `%${search}%`);
        }

        const [rows] = await db.promise().query(
            `
            SELECT
                id_users,
                username,
                email,
                avatar,
                is_online,
                last_seen
            FROM users
            ${whereClause}
            ORDER BY username ASC
            `,
            params
        );

        res.json({ users: rows });
    } catch (error) {
        console.error("Erreur getUsers:", error);
        res.status(500).json({ message: "Impossible de charger les utilisateurs" });
    }
};

export const updateMyAvatar = async (req, res) => {
    const userId = req.user.id;
    const { avatar } = req.body;

    try {
        const avatarPath = await saveAvatarFromDataUrl(avatar, userId);

        await db.promise().query(
            `
            UPDATE users
            SET avatar = ?
            WHERE id_users = ?
            `,
            [avatarPath, userId]
        );

        const [rows] = await db.promise().query(
            `
            SELECT id_users, username, email, avatar
            FROM users
            WHERE id_users = ?
            LIMIT 1
            `,
            [userId]
        );

        const io = req.app.get("io");
        if (io) {
            io.emit("user-avatar-updated", {
                id_users: rows[0].id_users,
                avatar: rows[0].avatar,
                username: rows[0].username,
                email: rows[0].email,
            });
        }

        res.json({
            message: "Avatar mis à jour avec succès",
            user: rows[0],
        });
    } catch (error) {
        console.error("Erreur updateMyAvatar:", error);
        res.status(400).json({ message: error.message || "Impossible de mettre à jour l'avatar" });
    }
};
