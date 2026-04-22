import React, { useCallback, useContext, useEffect, useState } from "react";
import {Navbar} from '../components/Navbar';
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import { NewChatModal } from "../components/NewChatModal";
import { NewGroupModal } from "../components/NewGroupModal";
import { ProfilePanel } from "../components/ProfilePanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { Settings as SettingsView } from "../pages/Settings";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { socket } from "../services/socket";

export function Home(){
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectChat, setSelectChat] = useState(null);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [onlineRosterReady, setOnlineRosterReady] = useState(false);
    const [activeSidebarView, setActiveSidebarView] = useState("chat");
    const discussionNotificationCount = chats.filter((chat) => (chat.unread || 0) > 0).length;

    const loadChats = useCallback(async () => {
        if (!user) {
            setChats([]);
            return;
        }

        try {
            const response = await api.get("/chats");
            setChats(response.data.chats || []);
        } catch (error) {
            console.error("Erreur chargement discussions:", error);
        }
    }, [user]);

    useEffect(() => {
        if (!user?.id_users && !user?.id) {
            return;
        }

        const currentUserId = Number(user.id_users ?? user.id);
        socket.emit("user-online", currentUserId);

        const handleOnlineUsers = (ids) => {
            const normalizedIds = (ids || []).map((id) => Number(id));
            setOnlineUserIds(normalizedIds);
            setOnlineRosterReady(true);
        };

        socket.on("online-users", handleOnlineUsers);

        return () => {
            socket.off("online-users", handleOnlineUsers);
        };
    }, [user]);

    useEffect(() => {
        setSelectChat(null);
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        const handleChatListRefresh = () => {
            loadChats();
        };

        socket.on("chat-list-refresh", handleChatListRefresh);

        return () => {
            socket.off("chat-list-refresh", handleChatListRefresh);
        };
    }, [loadChats]);

    useEffect(() => {
        const handleUserAvatarUpdated = (payload) => {
            const updatedUserId = Number(payload?.id_users || 0);
            if (!updatedUserId) {
                return;
            }

            setChats((prev) =>
                prev.map((chat) =>
                    Number(chat.id_users || 0) === updatedUserId
                        ? {
                              ...chat,
                              avatar: payload.avatar,
                              name: payload.username || chat.name,
                          }
                        : chat
                )
            );

            setSelectChat((prev) => {
                if (!prev || Number(prev.id_users || 0) !== updatedUserId) {
                    return prev;
                }

                return {
                    ...prev,
                    avatar: payload.avatar,
                    name: payload.username || prev.name,
                };
            });
        };

        socket.on("user-avatar-updated", handleUserAvatarUpdated);

        return () => {
            socket.off("user-avatar-updated", handleUserAvatarUpdated);
        };
    }, []);

    useEffect(() => {
        const loadUsers = async () => {
            if ((!isNewChatOpen && !isNewGroupOpen) || !user) {
                return;
            }

            try {
                setLoadingUsers(true);
                const response = await api.get("/users");
                setUsers(response.data.users || []);
            } catch (error) {
                console.error("Erreur chargement utilisateurs:", error);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [isNewChatOpen, isNewGroupOpen, user]);

    const handleSelectUser = (selectedUser) => {
        const syntheticChat = {
            id_users: selectedUser.id_users,
            name: selectedUser.username,
            avatar: selectedUser.avatar,
            is_online: selectedUser.is_online,
            last_seen: selectedUser.last_seen,
            last_message: "",
            timestamp: "",
            unread: 0,
        };

        const existingChat = chats.find((chat) => chat.id_users === selectedUser.id_users);
        if (existingChat) {
            setSelectChat(existingChat);
            setIsNewChatOpen(false);
            return;
        }

        setChats((prev) => [syntheticChat, ...prev]);
        setSelectChat(syntheticChat);
        setIsNewChatOpen(false);
    };

    const handleCreateGroup = async ({ name, memberIds }) => {
        try {
            const response = await api.post("/chats/groups", {
                name,
                memberIds,
            });

            const createdGroup = {
                id_groups: response.data.group?.id_groups,
                name: response.data.group?.name || name,
                last_message: "",
                timestamp: "",
                unread: 0,
            };

            setChats((prev) => [createdGroup, ...prev]);
            setSelectChat(createdGroup);
            setActiveSidebarView("chat");
            setIsNewGroupOpen(false);
        } catch (error) {
            console.error("Erreur création groupe:", error);
            throw new Error(error.response?.data?.message || "Impossible de créer le groupe");
        }
    };

    useEffect(() => {
        if (!onlineRosterReady) {
            return;
        }

        setChats((prev) =>
            prev.map((chat) =>
                chat.id_users
                    ? {
                          ...chat,
                          is_online: onlineUserIds.includes(Number(chat.id_users)),
                      }
                    : chat
            )
        );

        setSelectChat((prev) => {
            if (!prev || !prev.id_users) {
                return prev;
            }

            return {
                ...prev,
                is_online: onlineUserIds.includes(Number(prev.id_users)),
            };
        });
    }, [onlineUserIds, onlineRosterReady]);

    return <>
        <main className="flex h-screen divide-x">
            <Navbar
                notificationCount={discussionNotificationCount}
                activeView={activeSidebarView}
                onOpenChatView={() => setActiveSidebarView("chat")}
                onOpenSettingsView={() => {
                    setActiveSidebarView("settings");
                    setSelectChat(null);
                }}
                onOpenProfileView={() => {
                    setActiveSidebarView("profile");
                    setSelectChat(null);
                }}
            />

            {activeSidebarView === "chat" ? (
                <>
                    <ChatList 
                        chats={chats}
                        setChats={setChats}
                        onSelectChat={setSelectChat}
                        currentChatId={selectChat?.id_groups || selectChat?.id_users}
                        onNewChat={() => setIsNewChatOpen(true)}
                        onCreateGroup={() => setIsNewGroupOpen(true)}
                    />
                    <ChatWindow activeChat={selectChat} user={user}/>
                </>
            ) : activeSidebarView === "profile" ? (
                <div className="flex min-w-0 flex-1 divide-x divide-white/10">
                    <ProfilePanel embedded className="w-[500px] shrink-0" />
                    <SettingsPanel embedded className="min-w-0 flex-1" />
                </div>
            ) : activeSidebarView === "settings" ? (
                <div className="flex min-w-0 flex-1 divide-x divide-white/10">
                    <SettingsView className="w-[500px] shrink-0" />
                    <SettingsPanel embedded className="min-w-0 flex-1" contentClassName="max-w-none" />
                </div>
            ) : (
                <SettingsPanel embedded />
            )}
            <NewChatModal
                open={isNewChatOpen}
                users={users}
                loading={loadingUsers}
                onClose={() => {
                    setIsNewChatOpen(false);
                    setUsers([]);
                }}
                onSelectUser={handleSelectUser}
            />
            <NewGroupModal
                open={isNewGroupOpen}
                users={users}
                loading={loadingUsers}
                onClose={() => {
                    setIsNewGroupOpen(false);
                    setUsers([]);
                }}
                onCreateGroup={handleCreateGroup}
            />
        </main>
    </>
}
