import { Trash2 } from "lucide-react";

type ShortLinkHeaderProps = {
    title: string;
    createdAt: string;
    onDelete: () => void;
};

export default function ShortLinkHeader({ title, createdAt, onDelete }: ShortLinkHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-2 mb-4">
            <div className="truncate">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 truncate" title={title}>
                    {title}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Erstellt am {createdAt}
                </span>
            </div>
            <button 
                onClick={(e) => {
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