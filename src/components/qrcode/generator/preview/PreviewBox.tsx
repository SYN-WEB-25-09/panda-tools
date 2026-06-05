import { QRCodeSVG } from "qrcode.react";
import { Loader2 } from "lucide-react";

type PreviewBoxProps = {
    qrRef: React.RefObject<HTMLDivElement | null>;
    isIdGenerating: boolean;
    finalUrl: string;
    isTransparent: boolean;
    exportFormat: string;
    bgColor: string;
    fgColor: string;
    logo: string;
    logoSize: number;
};

export default function PreviewBox({
    qrRef, isIdGenerating, finalUrl, isTransparent, exportFormat, bgColor, fgColor, logo, logoSize
}: PreviewBoxProps) {
    return (
        <>
            <div className="w-full p-6 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-800 bg-white flex items-center justify-center relative overflow-hidden"
                 style={{
                     backgroundImage: (isTransparent && exportFormat !== "JPG")
                         ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)' 
                         : 'none',
                     backgroundSize: "16px 16px"
                 }}>
                <div ref={qrRef} 
                     className={`p-4 rounded-lg max-w-full flex items-center justify-center 
                        ${isTransparent && exportFormat !== 'JPG' 
                            ? 'bg-transparent' 
                            : 'bg-white'}
                        `}>
                    {isIdGenerating ? (
                        <div className="w-55 h-55 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            Sichere ID wird ermittelt
                        </div>
                    ) : (
                        <div className="w-full max-w-55 aspect-square [&>svg]:w-full [&>svg]:h-auto">
                            <QRCodeSVG value={finalUrl} 
                                    size={220} 
                                    bgColor={(isTransparent && exportFormat !== "JPG") ? "transparent" : bgColor} 
                                    fgColor={fgColor} 
                                    level="H" 
                                    includeMargin={true} 
                                    imageSettings={logo 
                                            ? { src: logo, 
                                                height: logoSize, 
                                                width: logoSize, 
                                                excavate: true } 
                                            : undefined} />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full mt-6 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold tracking-tight text-slate-400 dark:text-slate-500 block mb-0.5">
                    Vorschau des Inhalts
                </span>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all leading-relaxed max-h-16 overflow-y-auto">
                    {isIdGenerating ? "Generiere sichere Tracking-URL..." : finalUrl}
                </div>
            </div>
        </>
    );
}