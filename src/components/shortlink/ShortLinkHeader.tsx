import { Trash2 } from "lucide-react";

type ShortLinkHeaderProps = {
    title: string;
    url: string;
    createdAt: string;
    onDelete: () => void;
};

export default function ShortLinkHeader({ title, url, createdAt, onDelete }: ShortLinkHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-2 mb-4">
            <div className="truncate flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 truncate" title={title}>
                    {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-200 font-mono truncate mt-0.5" title={url}>
                    {url}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                    Erstellt am {createdAt}
                </span>
            </div>
            <button onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Short-Link löschen"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}