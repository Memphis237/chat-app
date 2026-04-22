import React, { useMemo, useState } from "react";

export function NewChatModal({ open, users, loading = false, onClose, onSelectUser }) {
    const [search, setSearch] = useState("");

    const filteredUsers = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return users;
        }

        return users.filter((user) => {
            const username = String(user.username || "").toLowerCase();
            const email = String(user.email || "").toLowerCase();
            return username.includes(normalized) || email.includes(normalized);
        });
    }, [search, users]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0E162A] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Nouvelle discussion</p>
                        <h2 className="text-xl font-semibold text-white">Choisir un utilisateur</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 hover:bg-white/10"
                    >
                        Fermer
                    </button>
                </div>

                <div className="border-b border-white/5 px-6 py-4">
                    <label className="mb-2 block text-sm text-slate-400" htmlFor="new-chat-search">
                        Rechercher par nom
                    </label>
                    <input
                        id="new-chat-search"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tapez le nom d'un utilisateur..."
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#00A34A]"
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                            Chargement des utilisateurs...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                            Aucun utilisateur disponible.
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-slate-400">
                            Aucun utilisateur ne correspond à votre recherche.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id_users}
                                    type="button"
                                    onClick={() => {
                                        onSelectUser(user);
                                        setSearch("");
                                    }}
                                    className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-4 text-left transition hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-[#00A34A] text-sm font-bold text-white">
                                            {user.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.username}</p>
                                            <p className="text-sm text-slate-400">{user.email}</p>
                                        </div>
                                    </div>

                                    <span className="text-xs text-slate-400">
                                        {user.is_online ? "En ligne" : "Hors ligne"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
