import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save, Loader2 } from "lucide-react";

import GeneratorForm from "../components/qrcode/generator/form/GeneratorForm";
import PreviewSidebar from "../components/qrcode/generator/preview/PreviewSidebar";

import { db, storage } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { useFirebaseAuth } from "../context/FirebaseAuthContext";

export default function QRCodeGenerator() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth();

    const [qrCodeId, setQRCodeId] = useState("")
    const [isIdGenerating, setIsIdGenerating] = useState(true);

    const [title, setTitle] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [finalUrl, setFinalUrl] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);

    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [isTransparent, setIsTransparent] = useState(false);
    const [logo, setLogo] = useState("")
    const [logoSize, setLogoSize] = useState(44);
    const [exportFormat, setExportFormat] = useState("PNG");
    const [dpiScale, setDpiScale] = useState(4);

    const qrRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateCustomId = (): string => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = ""

        const randomValues = new Uint32Array(20)
        window.crypto.getRandomValues(randomValues)

        for (let i = 0; i < 20; i++) {
            result += chars.charAt(randomValues[i] % chars.length);
        }

        return result;
    };

    useEffect(() => {
        const fetchUniqueId = async () => {
            try {
                setIsIdGenerating(true);
                let uniqueId = "";
                let isUsed = true;
                let attempts = 0;

                while (isUsed && attempts < 10) {
                    uniqueId = generateCustomId()
                    const docRef = doc(db, "qrcodes", uniqueId);
                    const docSnap = await getDoc(docRef)

                    if (!docSnap.exists()) {
                        isUsed = false;
                    }
                    attempts++;
                }

                if (isUsed) {
                    throw new Error("Kollisionsfehler: Es konnte keine freie ID ermittlet werden.")
                }

                setQRCodeId(uniqueId)
            } catch (error) {
                console.error("Fehler bei der ID-Validierung:", error);
                alert("Fehler beim Initialisieren des QR-Codes. Bitte lade die Seite neu.");
            } finally {
                setIsIdGenerating(false);
            }
        }

        fetchUniqueId();
    }, []);

    console.log(window.location.host);

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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) setLogo(event.target.result as string)
            };
            
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogo("")
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const compressToWebPBlop = (base64Str: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxSide = 150;

                if (width > height) {
                    if (width > maxSide) {
                        height = Math.round((height * maxSide) / width);
                        width = maxSide;
                    }
                } else {
                    if (height > maxSide) {
                        width = Math.round((width * maxSide) / height);
                        height = maxSide;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas-Context konnte nicht erstellt werden."))
                }

                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Konvertierung in WebP fehlgeschlagen"))
                    }
                }, "image/wbp", 0.85);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const uploadLogoToStorage = async (id: string, base64Logo: string): Promise<string> => {
        const webpBlob = await compressToWebPBlop(base64Logo);
        const fileRef = storageRef(storage, `logos/${id}.webp`)

        await uploadBytes(fileRef, webpBlob, { contentType: "image/webp" });

        return await getDownloadURL(fileRef);
    }

    const handleSaveToDatabase = async () => {
        if (!user) {
            alert("Du muss eingeloggt sein, um QR-Codes zu speichern.");
            return;
        }

        if (!baseUrl || baseUrl === "https://example.com") {
            alert("Bitte gibt eine gültige Ziel-URL ein.")
            return;
        }

        if (!qrCodeId) {
            alert("Die ID wird noch generiert. Bitte kurz warten.");
            return;
        }

        try {
            setIsSaving(true);

            let finalLogoUrl: string | null = null;

            if (logo) {
                finalLogoUrl = await uploadLogoToStorage(qrCodeId, logo)
            }

            const qrCodeData = {
                title: title.trim() || "",
                url: baseUrl,
                bgColor: isTransparent && exportFormat !== "JPG" ? "transparent" : bgColor,
                fgColor: fgColor,
                image: finalLogoUrl,
                imageSize: logoSize,
                trackingActive: isTrackingEnabled,
                scanCount: 0,
                createdAt: new Date().toLocaleDateString("de-DE"),
                createdBy: user.uid,
            };

            await setDoc(doc(db, "qrcodes", qrCodeId), qrCodeData);

            alert("QR-Code erfolgreich gespeichert!");
            navigate("/qr-overview");
        } catch (error) {
            console.error("Fehler beim Speichern in Firestore:", error)
            alert("Fehler beim Speichern des QR-Codes.")
        } finally {
            setIsSaving(false);
        }
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
                    <button onClick={() => navigate("/qr-overview")} 
                            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 sm:order-1">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button onClick={handleSaveToDatabase} 
                            disabled={isSaving || isIdGenerating || !qrCodeId} 
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white font-semibold text-sm py-2.5 px-5 shadow-xs transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400 shrink-0 whitespace-nowrap sm:order-3">
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
                               logo={logo} handleLogoUpload={handleLogoUpload} handleRemoveLogo={handleRemoveLogo}
                               logoSize={logoSize} setLogoSize={setLogoSize} fileInputRef={fileInputRef} />

                <PreviewSidebar qrRef={qrRef} isIdGenerating={isIdGenerating} finalUrl={finalUrl}
                                isTransparent={isTransparent} exportFormat={exportFormat} setExportFormat={setExportFormat}
                                bgColor={bgColor} fgColor={fgColor} logo={logo} logoSize={logoSize}
                                dpiScale={dpiScale} setDpiScale={setDpiScale} handleDownload={handleDownload} />
            </div>
        </div>
    )
}