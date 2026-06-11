import { useEffect, useState } from "react";
import { ImageIcon, Trash2, FolderOpen, X, Loader2 } from "lucide-react";
import { useFirebaseAuth } from "../../../../context/FirebaseAuthContext";
import { fetchUserImages, LibraryImage } from "../../../../ts/imageLibrary";

type LogoSectionProps = {
    logo: string;
    setLogo: (url: string) => void;
    logoSize: number;
    setLogoSize: (val: number) => void;
    handleRemoveLogo: () => void;
};

export default function LogoSection({
    logo, setLogo, logoSize, setLogoSize, handleRemoveLogo
}: LogoSectionProps) {
    const { user } = useFirebaseAuth();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [images, setImages] = useState<LibraryImage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isModalOpen && user) {
            const loadLibraryImages = async () => {
                setLoading(true);
                const data = await fetchUserImages(user.uid);
                setImages(data);
                setLoading(false);
            };
            loadLibraryImages();
        }
    }, [isModalOpen, user]);

    const handleLogoSizeNumberChange = (val: number) => {
        if (isNaN(val) || val === 0) setLogoSize(0);
        
        if (val > 100) {
            setLogoSize(100);
        } else {
            setLogoSize(val);
        }
    };

    const selectLogoFromLibrary = (url: string) => {
        setLogo(url);
        setIsModalOpen(false);
    };

    return (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500"/> Eigenes Logo einbinden
            </h3>

            <div className="flex flex-wrap gap-3 items-center">
                <button type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                    <FolderOpen className="w-4 h-4" />
                    {logo ? "Logo wechseln" : "Aus Image Library wählen"}
                </button>

                {logo && (
                    <button type="button"
                            onClick={handleRemoveLogo}
                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0">
                                <Trash2 className="w-4 h-4" /> Logo entfernen
                            </button>
                )}
            </div>

            {logo && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-fit">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center">
                        <img src={logo} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-40">Logo aktiv</span>
                </div>
            )}

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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl h-[80vh] max-h-150 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                                    Logo aus Library wählen
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                    Klicke auf ein Bild, um es in der QR-Code einzubetten
                                </p>
                            </div>
                            <button type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/20">
                            {!user ? (
                                <p className="text-xs text-rose-500 text-center py-8">
                                    Bitte logge dich ein, um deine Library zu sehen.
                                </p>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2">
                                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                                    <span className="text-xs text-slate-400">
                                        Lade Galerie...
                                    </span>
                                </div>
                            ) : images.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                                    Deine Library ist leer. Lade zuerst Bilder im Dashboard hoch.
                                </div>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 justify-center">
                                    {images.map((img) =>(
                                        <button key={img.name}
                                                type="button"
                                                onClick={() => selectLogoFromLibrary(img.url)}
                                                className={`group relative border bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center w-30 h-30 transition-all overflow-hidden cursor-pointer ${
                                                logo === img.url 
                                                    ? "border-purple-600 ring-2 ring-purple-600/20" 
                                                    : "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-xs"
                                            }`}>
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img src={img.url}
                                                     alt="Library Item"
                                                     className="max-w-full max-h-full object-contain rounded-md"
                                                     loading="lazy" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right">
                            <button type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}