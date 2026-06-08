import { QRCodeSVG } from "qrcode.react";

type QRCodeBodyProps = {
    id: string;
    url: string;
    scanCount: number;
    trackingActive: boolean;
    bgColor?: string;
    fgColor?: string;
    image?: string;
    imageSize?: number;
}

export default function QRCodeBody({ id, url, scanCount, trackingActive, bgColor, fgColor, image, imageSize }: QRCodeBodyProps) {

    const { protocol, hostname, port } = window.location;

    const baseUrl = trackingActive 
                    ? (hostname === "localhost" || hostname === "127.0.0.1" 
                        ? `${protocol}//${import.meta.env.VITE_IPV4}${port ? `:${port}` : ''}`
                        : `${protocol}//${window.location.hostname}`) 
                    : url;

    const qrURL = trackingActive ? (baseUrl + "/r/" + id) : baseUrl;

    console.log(qrURL);

    const finalFgColor = fgColor || "#000000";
    
    const finalBgColor = (!bgColor || bgColor === "transparent") ? "#ffffff" : bgColor;

    return (
        <>
            <div className="flex justify-center items-center grow bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-950">
                <div className="p-2 bg-white rounded-lg shadow-inner">
                    <QRCodeSVG value={qrURL}
                               size={120}
                               bgColor={finalBgColor}
                               fgColor={finalFgColor}
                               level="H"
                               imageSettings={
                                image ? {
                                            src: image,
                                            height: imageSize || 32,
                                            width: imageSize || 32,
                                            excavate: true
                                        }
                                     : undefined
                               } />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-auto">
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-37.5"
                    title="{url}">
                    {url}
                </span>
                <div className="flex items-center gap-1.5 bg-purple-500/10 dark:bg-purple-500/20 px-2.5 py-1 rounded-md">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Scans:
                    </span>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {scanCount}
                    </span>
                </div>
            </div>
        </>
    );
}