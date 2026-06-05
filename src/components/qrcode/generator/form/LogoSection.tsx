import { ImageIcon, Trash2 } from "lucide-react";

type LogoSectionProps = {
    logo: string;
    logoSize: number;
    setLogoSize: (val: number) => void;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveLogo: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function LogoSection({
    logo, logoSize, setLogoSize, handleLogoUpload, handleRemoveLogo, fileInputRef
}: LogoSectionProps) {
    const handleLogoSizeNumberChange = (val: number) => {
        if (isNaN(val) || val === 0) setLogoSize(0);
        
        if (val > 100) {
            setLogoSize(100);
        } else {
            setLogoSize(val);
        }
    };

    return (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500"/> Eigenes Logo einbinden
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input type="file" 
                       accept="image/*" 
                       ref={fileInputRef} 
                       onChange={handleLogoUpload} 
                       className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/40 dark:file:text-purple-300 file:cursor-pointer" />
                {logo && (
                    <button onClick={handleRemoveLogo} 
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0">
                        <Trash2 className="w-3.5 h-3.5" /> Logo entfernen
                    </button>
                )}
            </div>

            {logo && (
                <div className="pt-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between items-center mb-2.5">
                        <label className="text-xs font-medium text-slate-400 dark:text-slate-500">Logo-Größe im Code</label>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            <input type="number" 
                                   min="20" 
                                   max="100" 
                                   value={logoSize} 
                                   onChange={(e) => handleLogoSizeNumberChange(Number(e.target.value))} 
                                   onBlur={() => logoSize < 20 && setLogoSize(20)} 
                                   className="w-10 text-right bg-transparent border-none text-xs font-bold font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                px
                            </span>
                        </div>
                    </div>
                    <input type="range" 
                           min="20" 
                           max="100" 
                           value={logoSize} 
                           onChange={(e) => setLogoSize(Number(e.target.value))} 
                           className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                </div>
            )}
        </div>
    );
}