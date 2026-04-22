import React, { useEffect } from "react";
import {socket} from '../services/socket';


export function ChatList({chats, setChats, onSelectChat, currentChatId}){

    useEffect(()=>{
            socket.on("update-chat-list", (msg)=>{
            setChats(prev =>{
            return prev.map(chat =>{
                    const isMatch = chat.id_groups === msg.group_id ||
                                    chat.id_users === msg.sender_id ||
                                    chat.id_users === msg.receiver.id;
                    if(isMatch){
                        return {
                            ...chat,
                            last_message: msg.message,
                            unread: (chat.id_groups === currentChatId || chat.id_users === currentChatId)
                            ? 0 : (chat.unread || 0) + 1
                        };
                    }
                    return chat;
                });
            });
        });
    return socket.off("update-chat-list");

    }, [setChats, currentChatId]);
    
    return <>
        <div className="bg-[#0F172B] w-[500px] flex flex-col overflow-y-auto">
            {chats.map(chat =>{
                const chatId = chat.id_groups || chat.id_users;
                const isActive = currentChatId === chatId;

                <div key={chatId} onClick={()=>{
                    onSelectChat(chat);
                    setChats(prev => prev.map(c =>(c.id_groups === chatId || c.id_users === chatId) ? {...c, unread: 0} : c))
                }} className={`${isActive ? 'bg-[#1D293D]' : ''}`}>
                    <div>
                        <h3>{chat.name}</h3>
                        <p>{chat.last_message || ""}</p>
                    </div>

                    <span>{chat.timestamp}</span>                    
                    {chat.unread &&
                        <span>{chat.unread}</span>
                    }

                </div>
            })}
        </div>
    </>
}