import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save, Loader2, Check, ExternalLink, Eye } from "lucide-react";

import { useUniqueId } from "../hooks/useUniqueId";
import { useSaveShortLink } from "../hooks/useShortLink";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";

export default function ShortLinkGenerator() {

    const navigate = useNavigate();
    const { user } = useFirebaseAuth();

    const { unequeId: shortLinkId, isIdGenerating } = useUniqueId("shortlinks", 8);
    const { triggerSave, isSaving } = useSaveShortLink();

    const[isSaved, setIsSaved] = useState(false);

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
            onSuccess: () => {
                setIsSaved(true);
                navigate(`/short-links/${shortLinkId}`);
            }
        });
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-6">
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

                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                            Live-Vorschau
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            So wrid dein gekürzer Link aussehen und weiterleiten.
                        </p>
                    </div>

                    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 justify-between min-h-65 w-full max-w-90 mx-auto select-none pointer-events-none opacity-90">
                        <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="truncate flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-slate-50 truncate">
                                    {title.trim() || "Unbenannter Kurzlink"}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-200 font-mono truncate mt-0.5">
                                    {baseUrl.trim() || "https://deine-ziel-url.de"}
                                </p>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                    Erstellt am Heute
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col grow justify-between bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 border border-slate-100 dark:border-slate-950 min-h-40">
                            
                            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
                                <span className="text-xs font-semibold text-purple-400 dark:text-purple-500/80 truncate pr-2">
                                    {isIdGenerating ? "Generiere ID..." : finalUrl.replace(/^https?:\/\//, "")}
                                </span>
                                <Sparkles className="w-3.5 h-3.5 text-purple-400/50 shrink-0" />
                            </div>

                            <div className="flex flex-col items-center justify-center my-auto py-3">
                                {isTrackingEnabled ? (
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                                            0
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Eye className="w-3 h-3" /> Klicks
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-200/60 dark:bg-slate-900 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Tracking Inaktiv
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300 dark:text-slate-600">
                                Link testen <ExternalLink className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}