import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

type ShortLinkBodyProps = {
    id: string;
    url: string;
    clickCount: number;
    trackingActive: boolean;
}

export default function ShortLinkBody({ id, url, clickCount, trackingActive }: ShortLinkBodyProps) {
    const [copied, setCopied] = useState(false);
    const { protocol, hostname, port } = window.location;

    const baseUrl = hostname === "localhost" || hostname === "127.0.0.1"
        ? `${protocol}//${import.meta.env.VITE_IPV4}${port ? `:${port}` : ''}`
        : `${protocol}//${window.location.hostname}`;

    const shortURL = `${baseUrl}/r/${id}`;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(shortURL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Kopieren fehlgeschlagen", err);
        }
    };

    return (
        <>
            <div className="flex flex-col grow justify-center bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-950 gap-2">
                <div 
                    onClick={handleCopy}
                    className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-inner cursor-pointer hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors group/link"
                    title="In Zwischenablage kopieren"
                >
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 truncate pr-2">
                        {shortURL.replace(/^https?:\/\//, "")}
                    </span>
                    <div className="text-slate-400 group-hover/link:text-purple-500 transition-colors shrink-0">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </div>
                </div>

                <a 
                    href={shortURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors mt-1"
                >
                    Link testen <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-auto">
                <span 
                    className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-37.5"
                    title={url}
                >
                    {url}
                </span>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                    trackingActive 
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        trackingActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                    }`}>
                        Klicks:
                    </span>
                    <span className="text-xs font-bold">
                        {trackingActive ? clickCount : "INAKTIV"}
                    </span>
                </div>
            </div>
        </>
    );
}