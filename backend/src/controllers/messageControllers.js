import db from "../config/db.js";

export const createMessage = async (data) => {
    const {sender_id, receiver_id, group_id, message, message_type} = data;

    const now = new Date();

    try {
        //Insertion en base de données
        const [result] = await db.query(
        `INSERT INTO messages 
        (sender_id, receiver_id, group_id, message, message_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [sender_id, receiver_id || null, group_id || null, message, message_type || 'text', now]
        );

        return {
        id_messages: result.insertId,
        ...data,
        status: "sent",
        timestamp: now
        };
    } catch (error) {
        console.error("Erreur Database createMessage:", error);
        throw error;
    }
};