import { Download } from "lucide-react";

type DownloadButtonProps = {
    handleDownload: () => void;
    isIdGenerating: boolean;
    exportFormat: string;
    isDownloadDisabled: boolean;
};

export default function DownloadButton({ handleDownload, isIdGenerating, exportFormat, isDownloadDisabled }: DownloadButtonProps) {
    return (
        <button onClick={handleDownload} 
                disabled={isIdGenerating || isDownloadDisabled} 
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm py-3 px-4 shadow-sm transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400 
                       disabled:bg-slate-200 disabled:text-slate-400 
                       dark:disabled:bg-slate-800 dark:disabled:text-slate-600 
                       disabled:cursor-not-allowed disabled:shadow-none">
            <Download className="w-4 h-4" /> Als {exportFormat} herunterladen
        </button>
    );
}