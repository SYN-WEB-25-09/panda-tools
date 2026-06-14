import React from "react";
import { AlertCircle, Loader2, LucideIcon } from "lucide-react";

type ItemStatusGridProps = {
    error: Error | null;
    isLoading: boolean;
    loadingText: string;
    isEmpty: boolean;
    Icon: LucideIcon;
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function ItemStatusGrid({ error, isLoading, loadingText, isEmpty, Icon, title, description, children}: ItemStatusGridProps) {
    return (
        <>
            {error && (
                <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 flex items-center gap-3 text-rose-800 dark:text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>Fehler beim Laden: {error.message || "Es gibt ein Problem mit der Datenbank."}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-24">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {loadingText}
                    </p>
                </div>
            ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <Icon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                        {description}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
                    {children}
                </div>
            )}
        </>
    )
}