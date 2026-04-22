import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export function SettingsPanel({ embedded = true, className = "", contentClassName = "" }) {
    const { logout } = useContext(AuthContext);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const wrapperClass = embedded
        ? "relative flex h-full min-w-0 flex-1 items-center justify-center bg-[#020618] px-6 py-8 text-white"
        : "min-h-screen bg-[#020618] px-6 py-10 text-white";

    return (
        <div className={`${wrapperClass} ${className}`}>
            <div className={`w-full rounded-3xl border border-white/10 bg-[#0F172B] p-8 text-center shadow-2xl shadow-black/30 ${embedded ? "max-w-2xl" : "max-w-2xl"} ${contentClassName}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Settings</p>
                <h1 className="mt-3 text-3xl font-bold text-white">
                    Vous êtes bien dans les paramètres settings
                </h1>
                <p className="mt-3 text-sm text-slate-400">
                    Cet écran remplace la zone de conversation lorsque vous ouvrez les paramètres.
                </p>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-8">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#00A34A]/15 text-[#00A34A]">
                        <span className="text-2xl">S</span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white">Panneau settings</p>
                    <p className="mt-2 text-sm text-slate-400">
                        Vous pouvez connecter ici vos futures options de configuration.
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172B] p-6 shadow-2xl shadow-black/60">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Confirmation</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">
                            Voulez-vous vraiment vous déconnecter ?
                        </h2>
                        <p className="mt-3 text-sm text-slate-400">
                            Cette action fermera votre session et vous renverra vers la page de connexion.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => logout()}
                                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
