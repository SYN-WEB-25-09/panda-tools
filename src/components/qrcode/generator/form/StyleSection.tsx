import { Palette } from "lucide-react";

type StyleSectionProps = {
    fgColor: string;
    setFgColor: (val: string) => void;
    bgColor: string;
    setBgColor: (val: string) => void;
    isTransparent: boolean;
    setIsTransparent: (val: boolean) => void;
    exportFormat: string;
};

export default function StyleSection({
    fgColor, setFgColor, bgColor, setBgColor, isTransparent, setIsTransparent, exportFormat
}: StyleSectionProps) {
    return (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" /> Farben & Stil anpassen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        Vordergrund (Code)
                    </label>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                        <input type="color" 
                               value={fgColor} 
                               onChange={(e) => setFgColor(e.target.value)} 
                               className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none shrink-0" />
                        <input type="text" 
                               value={fgColor} 
                               onChange={(e) => setFgColor(e.target.value)} 
                               maxLength={7} 
                               className="w-full bg-transparent border-none px-1 text-xs uppercase font-mono font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        Hintergrund
                    </label>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 
                        ${isTransparent && exportFormat !== 'JPG' 
                            ? 'bg-slate-200/50 dark:bg-slate-800/50 opacity-50' 
                            : 'bg-slate-50 dark:bg-slate-950'}
                        `}>
                            
                        <input type="color" 
                               value={bgColor} 
                               onChange={(e) => setBgColor(e.target.value)} 
                               disabled={isTransparent && exportFormat !== "JPG"} 
                               className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none shrink-0 disabled:cursor-not-allowed" />
                        <input type="text" 
                               value={isTransparent && exportFormat !== 'JPG' ? '#TRANSP' : bgColor} 
                               onChange={(e) => setBgColor(e.target.value)} 
                               disabled={isTransparent && exportFormat !== 'JPG'} 
                               maxLength={7} 
                               className="w-full bg-transparent border-none px-1 text-xs uppercase font-mono font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden disabled:cursor-not-allowed" />
                    </div>
                </div>
                <div className="pb-2">
                    <label className={`flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none 
                        ${exportFormat === 'JPG' 
                            ? 'opacity-40 cursor-not-allowed' 
                            : ''}
                        `}>
                        <input type="checkbox" 
                               checked={isTransparent && exportFormat !== "JPG"} 
                               onChange={(e) => setIsTransparent(e.target.checked)} 
                               disabled={exportFormat === "JPG"} 
                               className="w-4 h-4 rounded-sm text-purple-600 border-slate-300 accent-purple-600 disabled:cursor-not-allowed" />
                        Transparent
                    </label>
                </div>
            </div>
        </div>
    );
}