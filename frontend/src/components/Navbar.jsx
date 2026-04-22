import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Avatar } from "./Avatar";

export function Navbar({
    notificationCount = 0,
    activeView = "chat",
    onOpenChatView,
    onOpenSettingsView,
    onOpenProfileView,
}){
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const openChatView = () => {
        if (onOpenChatView) {
            onOpenChatView();
            return;
        }
        navigate("/Home");
    };

    const openSettingsView = () => {
        if (onOpenSettingsView) {
            onOpenSettingsView();
            return;
        }
        navigate("/Home");
    };

    const openProfileView = () => {
        if (onOpenProfileView) {
            onOpenProfileView();
            return;
        }
        navigate("/Profil");
    };

    return <header>
        <nav className="flex flex-col justify-between bg-[#0F172B] max-w-[100px] items-center h-screen">
            <div className="mt-10 mx-10">
                <ul className="flex flex-col justify-around items-center h-[130px]">
                    <li>
                        <button
                            type="button"
                            onClick={openChatView}
                            className={`relative rounded-md px-3 py-2 transition hover:bg-[#0bbf5a] ${
                                activeView === "chat" ? "bg-[#00A34A]" : "bg-[#0F172B] border border-white/10"
                            }`}
                        >
                            <i className="fa fa-comment-o text-3xl text-[#ffff]" aria-hidden="true"></i>
                        {notificationCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-[#ff4d4f] px-1.5 py-0.5 text-[11px] font-bold text-white">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                        </button>
                    </li>
                    <li>
                        <div className="rounded-md bg-[#00A34A] px-3 py-2">
                            <i className="fa fa-user-circle-o text-3xl text-[#ffff] cursor-pointer" aria-hidden="true"></i>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="mb-10">
                <ul className="flex flex-col justify-around items-center h-[130px]">
                    <li>
                        <button
                            type="button"
                            onClick={openSettingsView}
                            className={`rounded-md p-2 transition hover:bg-white/5 ${
                                activeView === "settings" ? "bg-white/10" : ""
                            }`}
                            aria-label="Ouvrir les settings"
                        >
                            <i className="fa fa-cog text-3xl text-gray-400" aria-hidden="true"></i>
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            onClick={openProfileView}
                            className="rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[2px] transition hover:scale-105"
                            aria-label="Ouvrir le profil"
                        >
                            <span className="flex rounded-full bg-[#0F172B] p-1">
                                <Avatar
                                    avatar={user?.avatar}
                                    name={user?.username || user?.name}
                                    size={12}
                                    className="border border-white/10"
                                />
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
}
