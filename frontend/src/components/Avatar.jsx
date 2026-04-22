import React from "react";

const palette = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-lime-500",
];

const getColorClass = (seed = "") => {
    const value = String(seed).trim().toLowerCase();
    if (!value) {
        return palette[0];
    }

    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
};

const getAvatarSrc = (avatar) => {
    if (!avatar) {
        return null;
    }

    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
        return avatar;
    }

    return `${import.meta.env.VITE_API_URL}${avatar}`;
};

export function Avatar({
    avatar,
    name,
    size = 12,
    className = "",
    textClassName = "text-white",
}) {
    const src = getAvatarSrc(avatar);
    const letter = String(name || "?")
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
        <div
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
            style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name ? `Avatar de ${name}` : "Avatar"}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div
                    className={`flex h-full w-full items-center justify-center font-bold ${getColorClass(name)} ${textClassName}`}
                >
                    {letter}
                </div>
            )}
        </div>
    );
}
