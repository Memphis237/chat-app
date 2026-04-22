import db from "../config/db.js";

export const createGroup = async (req, res) => {
    const userId = req.user.id;
    const { name, memberIds = [] } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedMemberIds = [...new Set((memberIds || []).map((id) => Number(id)).filter(Boolean))];

    if (!normalizedName) {
        return res.status(400).json({ message: "Le nom du groupe est obligatoire" });
    }

    if (normalizedMemberIds.length === 0) {
        return res.status(400).json({ message: "Sélectionnez au moins un utilisateur" });
    }

    try {
        const connection = db.promise();
        await connection.beginTransaction();

        try {
            const [groupResult] = await connection.query(
                `
                INSERT INTO chat_groups (name)
                VALUES (?)
                `,
                [normalizedName]
            );

            const groupId = groupResult.insertId;
            const groupMembers = [userId, ...normalizedMemberIds];

            for (const memberId of groupMembers) {
                await connection.query(
                    `
                    INSERT INTO group_members (group_id, user_id)
                    VALUES (?, ?)
                    `,
                    [groupId, memberId]
                );
            }

            const [rows] = await connection.query(
                `
                SELECT id_groups, name
                FROM chat_groups
                WHERE id_groups = ?
                LIMIT 1
                `,
                [groupId]
            );

            await connection.commit();

            res.status(201).json({
                message: "Groupe créé avec succès",
                group: rows[0],
            });
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        }
    } catch (error) {
        console.error("Erreur createGroup:", error);
        res.status(500).json({ message: "Impossible de créer le groupe" });
    }
};
