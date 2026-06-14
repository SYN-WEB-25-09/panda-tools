import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Compass, Globe, Laptop, Eye, Calendar, Cpu, Languages, Copy, Check, ExternalLink } from "lucide-react";
import { fetchShortLinkById, fetchShortLinkAnalytics, ShortLinkItem } from "../ts/shortlink";
import { AdvancedDeviceInfo } from "../ts/redirect";


export default function ShortLinkDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [shortLink, setShortLink] = useState<ShortLinkItem | null>(null);
    const [analytics, setAnalytics] = useState<AdvancedDeviceInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [finalUrl, setFinalUrl] = useState(window.location.href);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return
        async function loadDetail() {
            try {
                const linkData = await fetchShortLinkById(id!);
                if (linkData) {
                    setShortLink(linkData);
                    if (linkData.trackingActive) {
                        const analyticsData = await fetchShortLinkAnalytics(id!);
                        setAnalytics(analyticsData);
                    }
                }
            } catch (error) {
                console.error("Fehler beim Laden der ShortLink.Details", error)
            } finally {
                setLoading(false)
            }
        }
        loadDetail();
    }, [id]);

    useEffect(() => {
        if (!shortLink) return;

        const { protocol, hostname, port } = window.location;
        const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
        
        const domain = isLocal
            ? `${protocol}//${import.meta.env.VITE_IPV4 || hostname}${port ? `:${port}` : ''}`
            : `${protocol}//${hostname}`;
            
        setFinalUrl(`${domain}/r/${shortLink.id}`);
    }, [shortLink]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(finalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Fehler beim Kopieren:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2">
                    <p className="text-sm text-slate-500">
                        Lade Short-Link Statistiken...
                    </p>
                </div>
            </div>
        );
    }

    if (!shortLink) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-slate-500">
                    Short-Link wurde nicht gefunden.
                </p>
                <button onClick={() => navigate("/short-links")}
                        className="mt-4 text-purple-600 text-sm font-semibold hover:underline">
                    Zurück zur Übersicht
                </button>
            </div>
        )
    }

    const getDistribution = (key: keyof AdvancedDeviceInfo) => {
        const counts: Record<string, number> = {};
        analytics.forEach(item => {
            const val = item[key] ? String(item[key]) : "Unbekannt";
            counts[val] = (counts[val] || 0) + 1;
        })
        return Object.entries(counts).sort((a, b) => b[1] - a[1])
    }

    const totalClicks = analytics.length;

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <button onClick={() => navigate("/qrcodes")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 cursor-pointer group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Zurück zur Übersicht
            </button>

            <div className="grid gap-6 sm:grid-cols-2 items-stretch mb-8">

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">
                            Stammdaten (Schreibgeschützt)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                                    Bezeichnung
                                </label>
                                <div className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {shortLink.title}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                                    Ziel-URL
                                </label>
                                <div className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-600 dark:text-slate-400 break-all">
                                    {shortLink.url}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-4 h-4" /> Erstellt am {shortLink.createdAt}
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                                            shortLink.trackingActive 
                                                ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" 
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                       }`}>
                            <Eye className={`w-4 h-4 ${shortLink.trackingActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}`} />
                            <span className="text-xs font-bold">
                                {shortLink.trackingActive ? `Klicks: ${totalClicks}` : "TRACKING INAKTIV"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">
                            Dein genrierter Kurzlink
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                            Teile diese Kurz-URL anstelle des langen Links.
                        </p>

                        <div className="space-y-4">
                            <div onClick={handleCopy}
                                 className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors group">
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 truncate pr-2">
                                    {finalUrl.replace(/^https?:\/\//, "")}
                                </span>
                                <div className="text-slate-400 group-hover:text-purple-500 transition-colors shrink-0">
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-3">
                        <button onClick={handleCopy}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 px-4 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
                            {copied ? (
                                <><Check className="w-3.5 h-3.5 text-emerald-500" /> Kopiert</>
                            ) : (
                                <><Copy className="w-3.5 h-3.5" /> Link kopieren</>
                            )}
                        </button>

                        <a href={finalUrl}
                           target="_blank"
                           rel="nooper noreferrer"
                           className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 px-4 shadow-xs transition-all dark:bg-purple-500 dark:hover:bg-purple-400 text-center">
                            Link testen <ExternalLink className="w-3.5 h3.5" />
                        </a>
                    </div>
                </div>

            </div>

                        <div className="w-full">
                {!shortLink.trackingActive ? (
                    <div className="bg-slate-100 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        Für diesen Short-Link ist kein Tracking aktiviert. Es werden keine Klick- und Gerätedaten erfasst.
                    </div>
                ) : totalClicks === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        Bisher wurden noch keine Klicks für diesen Kurzlink registriert.
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:max-md:grid-cols-2 md:grid-cols-3">
                        <div>
                            <StatCard title="Gerätetyp" icon={<Smartphone className="w-4 h-4 text-blue-500" />} data={getDistribution("deviceType")} total={totalClicks} />
                        </div>
                        <div>
                            <StatCard title="Marken-Hersteller" icon={<Cpu className="w-4 h-4 text-purple-500" />} data={getDistribution("deviceBrand")} total={totalClicks} />
                        </div>
                        <div>
                            <StatCard title="Betriebssysteme" icon={<Laptop className="w-4 h-4 text-rose-500" />} data={getDistribution("os")} total={totalClicks} />
                        </div>
                        <div>
                            <StatCard title="Browser" icon={<Compass className="w-4 h-4 text-amber-500" />} data={getDistribution("browser")} total={totalClicks} />
                        </div>
                        <div>
                            <StatCard title="Herkunftsländer" icon={<Globe className="w-4 h-4 text-emerald-500" />} data={getDistribution("country")} total={totalClicks} />
                        </div>
                        <div>
                            <StatCard title="Sprachen" icon={<Languages className="w-4 h-4 text-cyan-500" />} data={getDistribution("language")} total={totalClicks} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

type StatCardProps = {
    title: string;
    icon: React.ReactNode;
    data: [string, number][];
    total: number;
}

function StatCard({ title, icon, data, total }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-50 dark:border-slate-800/60 pb-2">
                {icon}
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {title}
                </h4>
            </div>
            <div className="space-y-2.5">
                {data.slice(0, 5).map(([label, count]) => {
                    const percentage = Math.round((count / total) * 100);

                    return (
                        <div key={label} className="text-xs">
                            <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300 mb-1">
                                <span className="truncate max-w-[65%]" title={label}>
                                    {label}
                                </span>
                                <span className="shrink-0 font-semibold">
                                    {count} ({percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}