import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save, Loader2, Copy, Check, ExternalLink, Inbox } from "lucide-react";

import { useUniqueId } from "../hooks/useUniqueId";
import { useSaveShortLink } from "../hooks/useShortLink";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";

export default function ShortLinkGenerator() {

    const navigate = useNavigate();
    const { user } = useFirebaseAuth();

    const { unequeId: shortLinkId, isIdGenerating } = useUniqueId("shortlinks", 8);
    const { triggerSave, isSaving } = useSaveShortLink();

    const[isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const [title, setTitle] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [finalUrl, setFinalUrl] = useState("");
    const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);

    useEffect(() => {
        if (shortLinkId) {
            const { protocol, hostname, port } = window.location;
            const domain = hostname === "localhost" || hostname === "127.0.0.1" 
                ? `${protocol}//${import.meta.env.VITE_IPV4}${port ? `:${port}` : ''}`
                : `${protocol}//${window.location.hostname}`;
            
            setFinalUrl(`${domain}/r/${shortLinkId}`);
        }
    }, [shortLinkId])

    const handleSaveToDatabase = async () => {
        if (!user) {
            alert("Du musst eingeloggt sein, um Short-Links zu speichern")
            return;
        }

        if (!title.trim()) {
            alert("Bitte gibt einen Titel für dein Short-Link ein.");
            return;
        }

        if (!baseUrl.trim() || baseUrl === "https://example.com") {
            alert("Bitte gib eine gültige Ziel-Url ein.")
            return;
        }

        triggerSave({
            id: shortLinkId,
            userId: user.uid,
            title,
            baseUrl,
            isTrackingEnabled,
            onSuccess: () => {setIsSaved(true);}
        });
    };
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Fehler beim Kopieren", error)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
                <div className="sm:flex-1 sm:text-left sm:order-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2 justify-start">
                        Short-Link Studio <Sparkles className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    </h1>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Kürze lange URLs in Kompakte, leicht teilbare und trackbare Kurzlinks.
                    </p>
                </div>

                <div className="flex items-center justify-between sm:contents">
                    <button onClick={() => navigate("/short-links")}
                            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 sm:order-1">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button onClick={handleSaveToDatabase}
                            disabled={isSaving || isIdGenerating || !shortLinkId || !user || isSaved}
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-semibold text-sm py-2.5 px-5 shadow-xs transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400 shrink-0 whitespace-nowrap sm:order-3 disabled:cursor-not-allowed">
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Wird gespeichert... </>
                        ) : isIdGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> ID prüfen... </>
                        ) : isSaved ? (
                            "Gespeichert"
                        ) : (
                            <><Save className="w-4 h-4" /> Link generieren</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Titel des Links
                        </label>
                        <input type="text"
                               placeholder="z.B. Sommer-Kampagne Newsletter"
                               value={title}
                               onChange={(e) => { setTitle(e.target.value); setIsSaved(false)} }
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Ziel-URL
                        </label>
                        <input type="url"
                               placeholder="https://deine-lange-website.de/unterseite/spezial?ref=tracking"
                               value={baseUrl}
                               onChange={(e) => { setBaseUrl(e.target.value); setIsSaved(false); }}
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs" />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox"
                                       checked={isTrackingEnabled}
                                       onChange={(e) => { setIsTrackingEnabled(e.target.checked)}}
                                       className="peer sr-only" />

                                <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 peer-checked:bg-purple-600 peer-checked:border-purple-600 flex items-center justify-center transition-all shadow-inner group-hover:border-purple-400">
                                    <Check className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform stroke-[3px]" />
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors">
                                    Klicks & Analytics tracken
                                </span>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    Zeichnet Gerätekennungen und Klickzahlen auf, wenn Nutzer den Link öffnen.
                                </p>
                            </div>
                        </label>
                    </div>

                    {!user && (
                        <p className="text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                            Hinweis: Du musst angemeldet sein, um diesen Link dauerhaft zu speichern.
                        </p>
                    )}
                </div>

                <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                            Live-Vorschau
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            So wrid dein gekürzer Link aussehen und weiterleiten.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Dein Kurzlink
                            </span>

                            <div onClick={handleCopy}
                                 className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors group/preview">
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 truncate pr-2">
                                    {isIdGenerating ? "Generiere ID..." : finalUrl.replace(/^https?:\/\//, "")}
                                </span>
                                <div className="text-slate-400 group-hover/preview:text-purple-500 transition-colors shrink-0">
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Typ & Routing
                            </span>
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-600 dark:text-slate-400">
                                    Status:
                                </span>
                                <span className={isTrackingEnabled ? "text-purple-600 dark:text-purple-400" : "text-slate-500"}>
                                    {isTrackingEnabled ? "Dynamisch mit Analytics" : "Direkter Redirect"}
                                </span>
                            </div>
                        </div>

                        {baseUrl && baseUrl !== "https://example.com" && (
                            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                                <span className="text-slate-400 dark:text-slate-500 truncate max-w-45" title={baseUrl}>
                                    Ziel: {baseUrl}
                                </span>
                                <a href={baseUrl}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline">
                                    Testen <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>

                    {isTrackingEnabled && !isSaved && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal px-2">
                            ⚠️ Vergiss nicht, den Link oben rechts zu <strong>speichern</strong>, damit das Routing in der Datenbank aktiv geschaltet wird!
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}