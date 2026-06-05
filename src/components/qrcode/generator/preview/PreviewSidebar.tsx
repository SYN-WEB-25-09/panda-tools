import PreviewBox from "./PreviewBox";
import ExportFormatSelector from "./ExportFormatSelector";
import DownloadButton from "./DownloadButton";

type PreviewSidebarProps = {
    qrRef: React.RefObject<HTMLDivElement | null>;
    isIdGenerating: boolean;
    finalUrl: string;
    isTransparent: boolean;
    exportFormat: string;
    setExportFormat: (val: string) => void;
    bgColor: string;
    fgColor: string;
    logo: string;
    logoSize: number;
    dpiScale: number;
    setDpiScale: (val: number) => void;
    handleDownload: () => void;
};

export default function PreviewSidebar({
    qrRef, isIdGenerating, finalUrl, isTransparent,
    exportFormat, setExportFormat, bgColor, fgColor,
    logo, logoSize, dpiScale, setDpiScale, handleDownload
}: PreviewSidebarProps) {
    return (
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col items-center">
            <div className="w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center flex flex-col items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-4 block">
                    Vorschau
                </span>

                <PreviewBox 
                    qrRef={qrRef}
                    isIdGenerating={isIdGenerating}
                    finalUrl={finalUrl}
                    isTransparent={isTransparent}
                    exportFormat={exportFormat}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    logo={logo}
                    logoSize={logoSize}
                />

                <ExportFormatSelector 
                    exportFormat={exportFormat}
                    setExportFormat={setExportFormat}
                    dpiScale={dpiScale}
                    setDpiScale={setDpiScale}
                />

                <DownloadButton 
                    handleDownload={handleDownload}
                    isIdGenerating={isIdGenerating}
                    exportFormat={exportFormat}
                />
            </div>
        </div>
    );
}