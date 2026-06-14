import { useEffect, useState, useRef } from "react"
import { useFirebaseAuth } from "../context/FirebaseAuthContext"
import { fetchUserImages, processAndResizeImage, uploadUserImage, deleteUserImage, LibraryImage } from "../ts/imageLibrary"
import { UploadCloud, Trash2, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

const MAX_TOTAL_SIZE_MB = 100;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

export default function ImageLibrary() {
    const { user } = useFirebaseAuth();
    const navigate = useNavigate();

    const [images, setImages] = useState<LibraryImage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [isDragActive, setIsDragActive] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentCount = images.length;
    const currentSizeBytes = images.reduce((sum, img) => sum + (img.size || 0), 0);
    const currentSizeMB = currentSizeBytes / (1024 * 1024);

    const loadLibrary = async () => {
        if (!user) return;
        setLoading(true);
        const data = await fetchUserImages(user.uid);
        setImages(data);
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            loadLibrary();
        }
    }, [user]);

    const handleFiles = async (files: FileList) => {
        if (!user || files.length === 0) return;
        setUploading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) continue;

                const webpBlob = await processAndResizeImage(file);

                await uploadUserImage(user.uid, webpBlob);
            }

            await loadLibrary();
        } catch (error) {
            console.error("Fehler beim Upload:", error)
            alert("Ein Fehler ist beim Verarbeiten der Bilder aufgetreten.")
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter"|| e.type === "dragover" ) {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDelete = async(fullPath: string) => {
        if (!confirm("Möchtest du dieses Bild unwiederruflich aus deiner Library löschen?")) return;

        try {
            await deleteUserImage(fullPath);
            setImages(prev => prev.filter(img => img.fullPath !== fullPath));
        } catch (error) {
            console.error("Fehler beim Löschen:", error);
            alert("Bild konnte nicht gelöscht werden.")
        }
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-rose-500 font-medium">
                    Bitte logge dich ein, um deine Library zu nutzen.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <button onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Zurück zum Dashboard
            </button>

            <div className="mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Bilder Library
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Deine Bilder werden automatisch auf maximal 1000x1000 Pixel herunterskaliert und als optimiertes WebP gespeichert.
                    </p>
                </div>
                
                <div className="flex flex-col items-end text-right bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-3 min-w-48">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Speicherplatz: <span className="text-purple-600 dark:text-purple-400">{currentSizeMB.toFixed(2)} MB</span> / {MAX_TOTAL_SIZE_MB} MB
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Vorhandene Bilder: {currentCount}
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all ${currentSizeMB > (MAX_TOTAL_SIZE_MB * 0.9) ? 'bg-rose-500' : 'bg-purple-600'}`} 
                            style={{ width: `${Math.min((currentSizeMB / MAX_TOTAL_SIZE_MB) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div onDragEnter={handleDrag}
                 onDragOver={handleDrag}
                 onDragLeave={handleDrag}
                 onDrop={handleDrop}
                 onClick={() => fileInputRef.current?.click()}
                 className={`w-full border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all mb-8 ${
                    isDragActive 
                        ? "border-purple-500 bg-purple-500/5" 
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}>
                <input ref={fileInputRef}
                       type="file"
                       multiple
                       accept="image/*"
                       className="hidden"
                       onChange={(e) => e.target.files && handleFiles(e.target.files)} />

                       {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Bilder werden verarbeitet und hochgeladen...
                                </p>
                            </div>
                       ) : (
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Ziehe Bilder hierher oder <span className="text-purple-600 dark:text-purple-400">durchsuche</span> deinen Computer
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Unterstützt mehrere Bilder gleichzeitig (PNG, JPG, WEBP)
                                </p>
                            </div>
                       )}
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Deine vorhanden Bilder
            </h3>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    Noch keine Bilder in deiner Library vorhanden.
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(164px,1fr))] gap-6 justify-center sm:justify-start">
                    {images.map((img) => (
                        <div key={img.name}
                             className="group relative border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center w-41 h-41 shadow-2xs hover:shadow-xs transition-all overflow-hidden mx-auto sm:mx-0">
                            <div className="w-full h-full flex items-center justify-center relative">
                                <img src={img.url}
                                     alt="Library Item"
                                     className="max-w-full max-h-full object-contain rounded-lg"
                                     loading="lazy" />
                            </div>

                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl z-20">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(img.fullPath);
                                    }}
                                    className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-transform transform scale-90 group-hover:scale-100 cursor-pointer"
                                    title="Bild löschen">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}