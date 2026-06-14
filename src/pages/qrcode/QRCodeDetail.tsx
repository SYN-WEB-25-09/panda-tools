import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Compass, Globe, Laptop, Eye, Calendar, Cpu, Languages, Download, Check } from "lucide-react"
import { fetchQRCodeById, fetchQRCodeAnalytics, QRCodeItem } from "../../ts/qrcode";
import { AdvancedDeviceInfo } from "../../ts/redirect";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const qrRef = useRef<HTMLDivElement | null>(null);

    const [qrCode, setQrCode] = useState<QRCodeItem | null>(null);
    const [analytics, setAnalytics] = useState<AdvancedDeviceInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [exportFormat, setExportFormat] = useState<string>("PNG");
    const [dpiScale, setDpiScale] = useState<number>(4);
    const [isTransparent, setIsTransparent] = useState<boolean>(false);
    const [finalUrl, setFinalUrl] = useState<string>("");

    useEffect(() => {
        if (!id) return;
        async function loadDetail() {
            try {
                const codeData = await fetchQRCodeById(id!);
                if (codeData) {
                    setQrCode(codeData);
                    if (codeData.trackingActive) {
                        const analyticsData = await fetchQRCodeAnalytics(id!);
                        setAnalytics(analyticsData);
                    }
                }
            } catch (err) {
                console.error("Fehler beim Laden der QR-Details:", err)
            } finally {
                setLoading(false);
            }
        }
        loadDetail();
    }, [id]);

    useEffect(() => {
        if (!qrCode) return;

        if (qrCode.trackingActive) {
            const { protocol, hostname, port } = window.location;
            const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
            
            const domain = isLocal
                ? `${protocol}//${import.meta.env.VITE_IPV4 || hostname}${port ? `:${port}` : ''}`
                : `${protocol}//${hostname}`;
                
            setFinalUrl(`${domain}/r/${qrCode.id}`);
        } else {
            setFinalUrl(qrCode.url);
        }
    }, [qrCode]);

    const triggerDownload = (url: string, filename: string) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleDownload = () => {
        const svgElement = qrRef.current?.querySelector("svg");
        if (!svgElement || !qrCode) return;

        const currentBgColor = qrCode.bgColor || "#ffffff";
        const filenameBase = (qrCode.title || "qrcode").toLowerCase().replace(/\s+/g, '_');

        if (exportFormat === "SVG") {
            const originalBg = svgElement.getAttribute("style");
            if (isTransparent) {
                const bgRect = svgElement.querySelector("rect");
                if (bgRect) bgRect.setAttribute("fill", "transparent");
            }

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);

            triggerDownload(svgUrl, `${filenameBase}.svg`);
            URL.revokeObjectURL(svgUrl);
            if (originalBg) svgElement.setAttribute("style", originalBg);
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const qrImage = new Image();
        qrImage.onload = () => {
            const baseSize = 256;
            const targetSize = baseSize * dpiScale;

            const canvas = document.createElement("canvas");
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            if (exportFormat === "JPG" || !isTransparent) {
                ctx.fillStyle = (exportFormat === "JPG" && isTransparent) ? "#ffffff" : currentBgColor;
                ctx.fillRect(0, 0, targetSize, targetSize);
            } else {
                ctx.clearRect(0, 0, targetSize, targetSize);
            }

            ctx.drawImage(qrImage, 0, 0, targetSize, targetSize);

            if (qrCode.image) {
                const logoImage = new Image();
                logoImage.crossOrigin = "anonymous";
                logoImage.onload = () => {
                    const calculatedLogoSize = (qrCode.imageSize || 40) * (targetSize / 220);
                    const position = (targetSize - calculatedLogoSize) / 2;

                    ctx.fillStyle = (exportFormat === "JPG" || !isTransparent) ? currentBgColor : "#ffffff";
                    ctx.fillRect(position, position, calculatedLogoSize, calculatedLogoSize);

                    ctx.drawImage(logoImage, position, position, calculatedLogoSize, calculatedLogoSize);

                    executeCanvasExport(canvas, filenameBase, targetSize);
                    URL.revokeObjectURL(svgUrl);
                };
                logoImage.onerror = () => {
                    executeCanvasExport(canvas, filenameBase, targetSize);
                    URL.revokeObjectURL(svgUrl);
                };
                logoImage.src = qrCode.image ?? "";
                console.log(logoImage.src);
            } else {
                executeCanvasExport(canvas, filenameBase, targetSize);
                URL.revokeObjectURL(svgUrl);
            }
        };
        qrImage.src = svgUrl;
    };

    const executeCanvasExport = (canvas: HTMLCanvasElement, filename: string, size: number) => {
        const mimeType = exportFormat === "JPG" ? "image/jpeg" : "image/png";
        const quality = exportFormat === "JPG" ? 0.95 : undefined;
        const imgUrl = canvas.toDataURL(mimeType, quality);
        triggerDownload(imgUrl, `${filename}-${size}px.${exportFormat.toLowerCase()}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-slate-500">
                    Lade QR-Code Statistiken...
                </p>
            </div>
        );
    }

    if (!qrCode) {
        return (
            <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-slate-500">
                    QR-Code wurde nicht gefunden.
                </p>
                <button onClick={() => navigate("/qrcodes")}
                        className="mt-4 text-purple-600 text-sm font-semibold">
                    Zurück
                </button>
            </div>
        )
    }

    const getDistribution = (key: keyof AdvancedDeviceInfo) => {
        const counts: Record<string, number> = {};
        analytics.forEach(item => {
            const val = item[key] ? String(item[key]) : "Unbekannt";
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    };

    const totalScans = analytics.length;

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <button 
                onClick={() => navigate("/qrcodes")} 
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
            </button>

            <div className="grid gap-6 sm:grid-cols-2 items-stretch mb-6">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">Stammdaten (Schreibgeschützt)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Bezeichnung</label>
                                <div className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {qrCode.title}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Ziel-URL</label>
                                <div className="w-full bg-slate-50 dark:bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-600 dark:text-slate-400 break-all">
                                    {qrCode.url}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-4 h-4" /> Erstellt am {qrCode.createdAt}
                        </div>
                        
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                            qrCode.trackingActive 
                                ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                            <Eye className={`w-4 h-4 ${qrCode.trackingActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}`} />
                            <span className="text-xs font-bold">
                                {qrCode.trackingActive ? `Scans: ${totalScans}` : "INAKTIV"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
                    
                    <div className="flex-1 flex items-center justify-center py-2">
                        <div 
                            className="p-6 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-800 bg-white flex items-center justify-center relative overflow-hidden"
                            style={{
                                backgroundImage: (isTransparent && exportFormat !== "JPG")
                                    ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)' 
                                    : 'none',
                                backgroundSize: "16px 16px"
                            }}
                        >
                            <div 
                                ref={qrRef} 
                                className={`p-4 rounded-lg max-w-full flex items-center justify-center ${
                                    isTransparent && exportFormat !== 'JPG' ? 'bg-transparent' : 'bg-white'
                                }`}
                            >
                                <div className="w-full max-w-55 aspect-square [&>svg]:w-full [&>svg]:h-auto">
                                    <QRCodeSVG 
                                        value={finalUrl || qrCode.url} 
                                        size={220} 
                                        bgColor={(isTransparent && exportFormat !== "JPG") ? "transparent" : (qrCode.bgColor || "#ffffff")} 
                                        fgColor={qrCode.fgColor || "#000000"} 
                                        level="H" 
                                        includeMargin={true} 
                                        imageSettings={qrCode.image 
                                            ? { 
                                                src: qrCode.image, 
                                                height: qrCode.imageSize || 40, 
                                                width: qrCode.imageSize || 40, 
                                                excavate: true 
                                              } 
                                            : undefined
                                        } 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-3">
                            <div className="flex flex-col gap-1">
                                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Export-Format
                                </label>
                                <select 
                                    value={exportFormat} 
                                    onChange={(e) => {
                                        setExportFormat(e.target.value);
                                        if (e.target.value === "JPG") setIsTransparent(false);
                                    }} 
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-hidden"
                                >
                                    <option value="PNG">PNG (.png) — Ideal fürs Web</option>
                                    <option value="JPG">JPG (.jpg) — Kompakt ohne Transparenz</option>
                                    <option value="SVG">SVG (.svg) — Vektor Grafik</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                {exportFormat !== "SVG" ? (
                                    <>
                                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                            Auflösung und DPI
                                        </label>
                                        <select 
                                            value={dpiScale} 
                                            onChange={(e) => setDpiScale(Number(e.target.value))} 
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-hidden"
                                        >
                                            <option value={1}>72 DPI — Digitale Ansicht (256px)</option>
                                            <option value={4}>300 DPI — Hochwertiger Druck (1024px)</option>
                                            <option value={8}>600 DPI — Großformat & Plakat (2048px)</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                            Skalierbarkeit
                                        </label>
                                        <div className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium">
                                            Verlustfrei unendlich skalierbar
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {exportFormat !== "JPG" && (
                            <div className="mb-4 flex items-center">
                                <label className="relative flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={isTransparent}
                                        onChange={(e) => setIsTransparent(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all shadow-2xs">
                                        <Check className="w-3 h-3 text-white stroke-[3px] hidden peer-checked:block" />
                                    </div>
                                    <span>Hintergrund transparent machen</span>
                                </label>
                            </div>
                        )}

                        <button 
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 px-4 shadow-xs transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400"
                        >
                            <Download className="w-3.5 h-3.5" /> QR-Code herunterladen
                        </button>
                    </div>

                </div>
            </div>

            <div className="w-full">
                {!qrCode.trackingActive ? (
                    <div className="bg-slate-100 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        Für diesen QR-Code ist kein Tracking aktiviert. Es werden keine Gerätedaten erfasst.
                    </div>
                ) : totalScans === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        Bisher wurden noch keine Scans für diesen QR-Code registriert.
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:max-md:grid-cols-2 md:grid-cols-3">
                        <div className="sm:max-md:order-1 md:order-1">
                            <StatCard title="Gerätetyp" icon={<Smartphone className="w-4 h-4 text-blue-500" />} data={getDistribution("deviceType")} total={totalScans} />
                        </div>
                        <div className="sm:max-md:order-2 md:order-2">
                            <StatCard title="Branding" icon={<Cpu className="w-4 h-4 text-purple-500" />} data={getDistribution("deviceBrand")} total={totalScans} />
                        </div>
                        <div className="sm:max-md:order-3 md:order-3">
                            <StatCard title="Betriebssysteme" icon={<Laptop className="w-4 h-4 text-rose-500" />} data={getDistribution("os")} total={totalScans} />
                        </div>
                        <div className="sm:max-md:order-4 md:order-4">
                            <StatCard title="Browser" icon={<Compass className="w-4 h-4 text-amber-500" />} data={getDistribution("browser")} total={totalScans} />
                        </div>
                        <div className="sm:max-md:order-5 md:order-5">
                            <StatCard title="Herkunftsländer" icon={<Globe className="w-4 h-4 text-emerald-500" />} data={getDistribution("country")} total={totalScans} />
                        </div>
                        <div className="sm:max-md:order-6 md:order-6">
                            <StatCard title="Sprache" icon={<Languages className="w-4 h-4 text-cyan-500" />} data={getDistribution("language")} total={totalScans} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, icon, data, total}: { title: string; icon: React.ReactNode; data: [string, number][]; total: number}) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div>
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
                                    <span className="shrink-0">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                                <div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}