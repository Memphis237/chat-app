import React, { useState } from "react";
import { socket } from "../services/socket";

export function ChatInput({activeChat, user}){

    const [text, setText] = useState("");

    if(!activeChat || !user){
        return null;
    }

    const handleTyping = () => {
        socket.emit("typing", {
            user: user.username,
            conversationId: activeChat.id_groups || activeChat.id_users
        });
    };

    const sendMessage = () => {

        const msg = {
            sender_id: user.id_users,
            receiver_id: activeChat.id_users || null,
            group_id: activeChat.id_groups || null,
            message: text,
            message_type: "text"
        };

        socket.emit("send-message", msg);

        setText("");
    };

    return <>
        <div className="flex justify-between">
            <input value={text} onChange={(e)=>{
                setText(e.target.value);
                handleTyping();
            }}/>
            <button className="bg-red-500" onClick={sendMessage}>Envoyer</button>
        </div>
    </>
}
