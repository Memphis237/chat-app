import React, { useState } from "react";
import {Navbar} from '../components/Navbar';
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";

export function Home(){
    const [chats, setChats] = useState([]);
    const [selectChat, setSelectChat] = useState(null);
    return <>
        <main className="flex h-screen divide-x">
            <Navbar/>
            <ChatList 
                chats={chats}
                setChats={setChats}
                onSelectChat={setSelectChat}
                currentChatId={selectChat?.id_groups || selectChat?.id_users}
            />
            <ChatWindow/>
        </main>
    </>
}