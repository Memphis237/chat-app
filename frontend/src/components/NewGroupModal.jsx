import React, { useMemo, useState } from "react";

export function NewGroupModal({ open, users, loading = false, onClose, onCreateGroup }) {
    const [search, setSearch] = useState("");
    const [groupName, setGroupName] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

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

    const toggleUser = (userId) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleClose = () => {
        setSearch("");
        setGroupName("");
        setSelectedIds([]);
        setError("");
        setCreating(false);
        onClose();
    };

    const handleCreate = async () => {
        try {
            setCreating(true);
            setError("");
            await onCreateGroup({
                name: groupName,
                memberIds: selectedIds,
            });
            setSearch("");
            setGroupName("");
            setSelectedIds([]);
        } catch (err) {
            setError(err?.message || "Impossible de créer le groupe.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0E162A] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Nouveau groupe</p>
                        <h2 className="text-xl font-semibold text-white">Créer une discussion de groupe</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 hover:bg-white/10"
                    >
                        Fermer
                    </button>
                </div>

                <div className="grid gap-4 border-b border-white/5 px-6 py-4">
                    <div>
                        <label className="mb-2 block text-sm text-slate-400" htmlFor="group-name">
                            Nom du groupe
                        </label>
                        <input
                            id="group-name"
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Famille, Amis, Travail..."
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#00A34A]"
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-400" htmlFor="group-search">
                            Ajouter des membres
                        </label>
                        <input
                            id="group-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un utilisateur..."
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#00A34A]"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="max-h-[42vh] overflow-y-auto p-4">
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
                            {filteredUsers.map((user) => {
                                const isSelected = selectedIds.includes(user.id_users);

                                return (
                                    <button
                                        key={user.id_users}
                                        type="button"
                                        onClick={() => toggleUser(user.id_users)}
                                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                                            isSelected ? "bg-[#00A34A]/20 ring-1 ring-[#00A34A]" : "bg-white/5 hover:bg-white/10"
                                        }`}
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
                                            {isSelected ? "Sélectionné" : user.is_online ? "En ligne" : "Hors ligne"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
                    {error && (
                        <p className="mr-auto text-sm text-rose-400">{error}</p>
                    )}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating || !groupName.trim() || selectedIds.length === 0}
                        className="rounded-2xl bg-[#00A34A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0bbf5a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {creating ? "Création..." : "Créer le groupe"}
                    </button>
                </div>
            </div>
        </div>
    );
}
