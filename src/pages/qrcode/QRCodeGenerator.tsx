import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save, Loader2 } from "lucide-react";

import GeneratorForm from "../../components/qrcode/generator/form/GeneratorForm";
import PreviewSidebar from "../../components/qrcode/generator/preview/PreviewSidebar";

import { useFirebaseAuth } from "../../context/FirebaseAuthContext";
import { useUniqueId } from "../../hooks/useUniqueId";
import { useSaveQRCode } from "../../hooks/useQRCode";

export default function QRCodeGenerator() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth();

    const { unequeId: qrCodeId, isIdGenerating } = useUniqueId("qrcodes", 20);
    const { triggerSave, isSaving } = useSaveQRCode();

    const [isSaved, setIsSaved] = useState(false);

    const [title, setTitle] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [finalUrl, setFinalUrl] = useState("");

    const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);

    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [isTransparent, setIsTransparent] = useState(false);
    const [image, setImage] = useState("")
    const [imageSize, setImageSize] = useState(44);
    const [exportFormat, setExportFormat] = useState("PNG");
    const [dpiScale, setDpiScale] = useState(4);

    const qrRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isTrackingEnabled && qrCodeId) {
            const { protocol, hostname, port } = window.location;
            const url = hostname === "localhost" || hostname === "127.0.0.1" 
                        ? `${protocol}//${import.meta.env.VITE_IPV4}${port ? `:${port}` : ''}`
                        : `${protocol}//${window.location.hostname}`;
            setFinalUrl(`${url}/r/${qrCodeId}`);
        } else {
            setFinalUrl(baseUrl);
        }
    }, [baseUrl, isTrackingEnabled, qrCodeId]);

    const handleRemoveLogo = () => {
        setImage("")
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleSaveToDatabase = async () => {
        if (!user) {
            alert ("Du musst eingeloggt sein, um QR-Codes zu Speichern.");
            return;
        }

        triggerSave({
            id: qrCodeId, 
            userId: user.uid, 
            title, 
            baseUrl, 
            bgColor, 
            fgColor, 
            image, 
            imageSize, 
            isTrackingEnabled, 
            isTransparent, 
            exportFormat, 
            onSuccess: () => {
                setIsSaved(true);
                navigate(`/qrcodes/${qrCodeId}`);
            }
        })
    };

    const triggerDownload = (url: string, fileName: string) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleDownload = () => {
        if (isTrackingEnabled && !isSaved) {
            alert("Dieser QR-Code nutzt Tracking, Bitte speichere ihn zuerst, um den Download freizuschalten.")
            return;
        }

        const svgElement = qrRef.current?.querySelector("svg");
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utg-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        if (exportFormat === "SVG") {
            triggerDownload(svgUrl, `${title.toLowerCase().replace(/\s+/g,'_')}.${exportFormat.toLowerCase()}`);
            return;
        }

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const baseSize = 256;
            const targetSize = baseSize * dpiScale;

            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext("2d")
            if (!ctx) return;

            if (exportFormat === "JPG" || !isTransparent) {
                ctx.fillStyle = exportFormat === "JPG" && isTransparent ? "#ffffff" : bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

            const mimeType = exportFormat === "JPG" ? "image/jpeg" : "image/png";
            const quality = exportFormat === "JPG" ? 0.95 : undefined;
            const imgUrl = canvas.toDataURL(mimeType, quality);

            triggerDownload(imgUrl, `${title.toLowerCase().replace(/\s+/g, '_')}-${targetSize}px.${exportFormat.toLowerCase()}`);
            URL.revokeObjectURL(svgUrl);
        }

        image.src = svgUrl;
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
                <div className="sm:flex-1 sm:text-left sm:order-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-left gap-2 justify-start sm:justify-left">
                        QR-Code Studio <Sparkles className="w-5 h-5 text-purple-500 fill-purple-500/20" />
                    </h1>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 text-left sm:text-left">
                        Erstelle hochauflösende QR-Codes mit individuellem Branding und Tracking-optionen.
                    </p>
                </div>

                <div className="flex items-center justify-between sm:contents">
                    <button onClick={() => navigate("/qrcodes")} 
                            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 sm:order-1">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button onClick={handleSaveToDatabase} 
                            disabled={isSaving || isIdGenerating || !qrCodeId || !user || isSaved} 
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-semibold text-sm py-2.5 px-5 shadow-xs transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400 shrink-0 whitespace-nowrap sm:order-3 disabled:cursor-not-allowed">
                        {isSaving 
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gespeichert... </> 
                        : isIdGenerating 
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Id prüfen... </> 
                            : <><Save className="w-4 h-4" /> Speichern</>}
                    </button>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <GeneratorForm title={title} setTitle={setTitle}
                               baseUrl={baseUrl} setBaseUrl={setBaseUrl}
                               isTrackingEnabled={isTrackingEnabled} setIsTrackingEnabled={setIsTrackingEnabled}
                               fgColor={fgColor} setFgColor={setFgColor}
                               bgColor={bgColor} setBgColor={setBgColor}
                               isTransparent={isTransparent} setIsTransparent={setIsTransparent}
                               exportFormat={exportFormat}
                               logo={image} setLogo={setImage} handleRemoveLogo={handleRemoveLogo}
                               logoSize={imageSize} setLogoSize={setImageSize} fileInputRef={fileInputRef}
                               isUserLoggedIn={!!user} />

                <PreviewSidebar qrRef={qrRef} isIdGenerating={isIdGenerating} finalUrl={finalUrl}
                                isTransparent={isTransparent} exportFormat={exportFormat} setExportFormat={setExportFormat}
                                bgColor={bgColor} fgColor={fgColor} logo={image} logoSize={imageSize}
                                dpiScale={dpiScale} setDpiScale={setDpiScale} handleDownload={handleDownload}
                                isDownloadDisabled={isTrackingEnabled && !isSaved} />
            </div>
        </div>
    )
}