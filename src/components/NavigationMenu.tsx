import React from "react";
import { NavLink } from "react-router-dom";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import { LayoutDashboard, QrCode, Link2 } from "lucide-react";

type NavigationLink = {
    target: string;
    displayName: string;
    icon: React.ComponentType<{ className?: string }>
}

export default function NavigationMenu() {
    const { user } = useFirebaseAuth();
    const menuLinks: NavigationLink[] = [];

    menuLinks.push({ target: "/", displayName: "Dashboard", icon: LayoutDashboard });

    if (user) {
        menuLinks.push(
            { target: "/qr-overview", displayName: "QR-Code", icon: QrCode },
            { target: "/short-link", displayName: "Short-Link", icon: Link2 },
        );
    }

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                Navigation
            </span>

            {menuLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                    <NavLink key={index}
                             to={link.target}
                             end={link.target === "/"}
                             className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                ${isActive 
                                    ? "bg-purple-600 text-white shadow-xs dark:bg-purple-500 cursor-default" 
                                    : "text-slate-600 hover:bg-slate-100 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-purple-400"
                                }`}>
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        <span>{link.displayName}</span>
                    </NavLink>
                );
            })}
        </div>
    )
}