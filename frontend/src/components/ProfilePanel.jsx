import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import api from "../utils/api";

export function ProfilePanel({ embedded = true, className = "" }) {
    const { user, updateUser } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            setPreview("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setAlert({
                type: "error",
                title: "Format invalide",
                message: "Veuillez sélectionner une image.",
            });
            return;
        }

        setAlert(null);
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setPreview(String(reader.result || ""));
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!preview) {
            setAlert({
                type: "error",
                title: "Image manquante",
                message: "Veuillez choisir une image avant d'enregistrer.",
            });
            return;
        }

        try {
            setLoading(true);
            setAlert(null);

            const response = await api.put("/users/me/avatar", {
                avatar: preview,
            });

            updateUser(response.data.user);
            setSelectedFile(null);
            setPreview("");
            setAlert({
                type: "success",
                title: "Photo enregistrée",
                message: "Votre photo de profil a été mise à jour avec succès.",
            });
        } catch (err) {
            setAlert({
                type: "error",
                title: "Erreur",
                message: err.response?.data?.message || "Impossible de mettre à jour la photo.",
            });
        } finally {
            setLoading(false);
        }
    };

    const wrapperClass = embedded
        ? "relative flex h-full items-center justify-center bg-[#020618] px-6 py-8 text-white"
        : "min-h-screen bg-[#020618] px-6 py-10 text-white";

    return (
        <div className={`${wrapperClass} ${className}`}>
            <div className="relative w-full max-w-[500px] rounded-3xl border border-white/10 bg-[#0F172B] p-8 shadow-2xl shadow-black/30">
                {alert && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-4">
                        <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#0F172B] p-6 shadow-2xl shadow-black/50">
                            <p className={`text-xs uppercase tracking-[0.25em] ${alert.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                                {alert.title}
                            </p>
                            <p className="mt-3 text-sm text-slate-300">{alert.message}</p>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setAlert(null)}
                                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profil</p>
                <h1 className="mt-2 text-3xl font-bold">Photo de profil</h1>
                <p className="mt-2 text-sm text-slate-400">
                    Ajoute une image ou laisse l'avatar par défaut avec la première lettre de ton nom.
                </p>

                <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-center">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar
                            avatar={user?.avatar}
                            name={user?.username || user?.name}
                            size={28}
                            className="border border-white/10 shadow-lg shadow-black/20"
                        />
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white">{user?.username || user?.name}</p>
                            <p className="text-sm text-slate-400">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6">
                        <label className="block text-sm font-medium text-slate-300">
                            Sélectionner une image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-3 block w-full cursor-pointer rounded-2xl border border-white/10 bg-[#0F172B] px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-[#00A34A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0bbf5a]"
                        />

                        {preview && (
                            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0F172B] p-4">
                                <img
                                    src={preview}
                                    alt="Aperçu"
                                    className="size-20 rounded-2xl object-cover"
                                />
                                <div>
                                    <p className="font-medium text-white">Aperçu de l'image</p>
                                    <p className="text-sm text-slate-400">
                                        {selectedFile?.name || "Image sélectionnée"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreview("");
                                    setAlert(null);
                                }}
                                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                            >
                                Réinitialiser
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={loading}
                                className="rounded-2xl bg-[#00A34A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0bbf5a] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Enregistrement..." : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
