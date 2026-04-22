import React from "react";
import { SettingsPanel } from "../components/SettingsPanel";

export function Settings({ className = "" }) {
    return <SettingsPanel embedded={false} className={className} />;
}
