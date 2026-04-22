import React, { useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { socket } from "../services/socket";


export function ChatWindow({activeChat, user}){

    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);

    useEffect(()=>{
        const handleNewMessage = (msg) => {
            setMessages(prev =>[...prev, msg]);

            socket.emit("message-delivered", {
                messageId: msg.id_messages
            });
        };

        const handleMessageStatus = (data) => {
            setMessages(prev =>prev.map(m => m.id_messages === data.messageId ? {...m, status: data.status} : m ));
        };

        const handleTyping = (data) => {
            setTypingUser(data.user);
        };

        const handleStopTyping = () => {
            setTypingUser(null);
        };

        socket.on("new-message", handleNewMessage);
        socket.on("message-status", handleMessageStatus);
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("message-status", handleMessageStatus);
            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);
        };

    }, [])

    useEffect(()=>{
        if(activeChat){
            socket.emit("message-read", {
                conversationId: activeChat.id_groups || activeChat.id_users
            });
        }
    }, [activeChat]);

    return <>
        <div className="flex flex-col flex-1 bg-[#020618]">
            {messages.map(msg =>(
                <div key={msg.id_messages}>
                    <p>{msg.messages}</p>
                    {user && msg.sender_id === user.id_users && (
                        <span>
                            <span>{msg.timestamp}</span>
                            {msg.status === "sent" && "✓"}
                            {msg.status === "delivered" && "✓✓"}
                            {msg.status === "read" && (
                                <span className="text-[#4fc3f7]">{"✓✓"}</span>
                            )}
                        </span>
                    )}
                </div>
            ))}
            {typingUser && (
                <div>
                    {typingUser} est entrain d'écrit....
                </div>
            )}
            <ChatInput activeChat={activeChat} user={user}/>
        </div>
    </>
    
}
