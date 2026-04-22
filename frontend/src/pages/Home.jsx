import React, { useContext, useState } from "react";
import {Navbar} from '../components/Navbar';
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import { AuthContext } from "../context/AuthContext";

export function Home(){
    const { user } = useContext(AuthContext);
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
            <ChatWindow activeChat={selectChat} user={user}/>
        </main>
    </>
}
