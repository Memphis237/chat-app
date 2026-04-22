import db from "../config/db.js";

const query = (sql, params = []) => db.promise().query(sql, params);

export const getChats = async (req, res) => {
    const userId = req.user.id;

    try {
        const [privateChats] = await query(
            `
            SELECT
            CASE
                WHEN m.sender_id = ? THEN m.receiver_id
                ELSE m.sender_id
            END AS id_users,
                u.username AS name,
                u.avatar,
                u.is_online,
                u.last_seen,
                MAX(m.created_at) AS timestamp,
                SUBSTRING_INDEX(
                    GROUP_CONCAT(
                        CASE
                            WHEN m.message_type = 'text' THEN m.message
                            WHEN m.message_type = 'image' THEN 'Image'
                            WHEN m.message_type = 'video' THEN 'Vidéo'
                            WHEN m.message_type = 'pdf' THEN 'PDF'
                            ELSE 'Fichier'
                        END
                        ORDER BY m.created_at DESC SEPARATOR '||'
                    ),
                    '||',
                    1
                ) AS last_message
            FROM messages m
            INNER JOIN users u
                ON u.id_users = CASE
                    WHEN m.sender_id = ? THEN m.receiver_id
                    ELSE m.sender_id
                END
            WHERE (m.sender_id = ? OR m.receiver_id = ?)
              AND m.receiver_id IS NOT NULL
            GROUP BY id_users, u.username, u.is_online, u.last_seen
            ORDER BY timestamp DESC
            `,
            [userId, userId, userId, userId]
        );

        const [groupChats] = await query(
            `
            SELECT
                g.id_groups,
                g.name,
                MAX(m.created_at) AS timestamp,
                SUBSTRING_INDEX(
                    GROUP_CONCAT(
                        CASE
                            WHEN m.message_type = 'text' THEN m.message
                            WHEN m.message_type = 'image' THEN 'Image'
                            WHEN m.message_type = 'video' THEN 'Vidéo'
                            WHEN m.message_type = 'pdf' THEN 'PDF'
                            ELSE 'Fichier'
                        END
                        ORDER BY m.created_at DESC SEPARATOR '||'
                    ),
                    '||',
                    1
                ) AS last_message
            FROM chat_groups g
            INNER JOIN group_members gm ON gm.group_id = g.id_groups
            LEFT JOIN messages m ON m.group_id = g.id_groups
            WHERE gm.user_id = ?
            GROUP BY g.id_groups, g.name
            ORDER BY timestamp DESC
            `,
            [userId]
        );

        const chats = [...privateChats, ...groupChats]
            .map((chat) => ({
                ...chat,
                unread: 0,
            }))
            .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return dateB - dateA;
            });

        res.json({ chats });
    } catch (error) {
        console.error("Erreur getChats:", error);
        res.status(500).json({ message: "Impossible de charger les discussions" });
    }
};

export const getMessages = async (req, res) => {
    const userId = req.user.id;
    const conversationId = Number(req.params.id);
    const conversationType = req.query.type || "private";

    try {
        let rows = [];

        if (conversationType === "group") {
            [rows] = await query(
                `
                SELECT
                    m.id_messages,
                    m.sender_id,
                    m.receiver_id,
                    m.group_id,
                    m.message,
                    m.message_type,
                    m.created_at AS timestamp,
                    u.username AS sender_name
                FROM messages m
                INNER JOIN group_members gm ON gm.group_id = m.group_id
                INNER JOIN users u ON u.id_users = m.sender_id
                WHERE m.group_id = ?
                  AND gm.user_id = ?
                ORDER BY m.created_at ASC
                `,
                [conversationId, userId]
            );
        } else {
            [rows] = await query(
                `
                SELECT
                    m.id_messages,
                    m.sender_id,
                    m.receiver_id,
                    m.group_id,
                    m.message,
                    m.message_type,
                    m.created_at AS timestamp,
                    u.username AS sender_name
                FROM messages m
                INNER JOIN users u ON u.id_users = m.sender_id
                WHERE (
                    (m.sender_id = ? AND m.receiver_id = ?)
                    OR
                    (m.sender_id = ? AND m.receiver_id = ?)
                )
                ORDER BY m.created_at ASC
                `,
                [userId, conversationId, conversationId, userId]
            );
        }

        res.json({ messages: rows });
    } catch (error) {
        console.error("Erreur getMessages:", error);
        res.status(500).json({ message: "Impossible de charger les messages" });
    }
};
