import React, { useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { socket } from "../services/socket";


export function ChatWindow({activeChat, user}){

    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);

    useEffect(()=>{
        socket.on("new-message", (msg)=>{
            setMessages(prev =>[...prev, msg]);

            socket.emit("message-delivered", {
                messageId: msg.id_messages
            });
        });

        socket.on("message-status", (data)=>{
            setMessages(prev =>prev.map(m => m.id_messages === data.messageId ? {...m, status: data.status} : m ))
        });

        socket.on("typing", (data)=>{
            setTypingUser(data.user);
        });
        socket.on("stop-typing", ()=>{
            setTypingUser(null);
        })


    }, [])

    useEffect(()=>{
        if(activeChat){
            socket.on("message-read", {
                conversationId: activeChat.id_groups || activeChat.id_users
            });
        }
    }, [activeChat]);

    return <>
        <div className="flex flex-col flex-1 bg-[#020618]">
            {messages.map(msg =>(
                <div key={msg.id_messages}>
                    <p>{msg.messages}</p>
                    {msg.sender_id === user.id_users && (
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
            <ChatInput/>
        </div>
    </>
    
}