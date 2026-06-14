import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, Loader2, Plus, QrCode, Search, X } from "lucide-react"
import QRCodeCard from "../../components/qrcode/QRCodeCard"
import OverviewHeader from "../../components/OverviewHeader"
import { useFirebaseAuth } from "../../context/FirebaseAuthContext"
import { useQRCodesSearch, useDeleteQRCode } from "../../hooks/useQRCode";

export default function QRCodeOverview() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth()

    const [searchTerm, setSearchTerm] = useState<string>("");

    const [refetchNonce, setRefetchNonce] = useState<number>(0)

    const [results, error, isLoading] = useQRCodesSearch(user?.uid, searchTerm, refetchNonce)

    const { triggerDelete, isDeleting } = useDeleteQRCode();

    console.log(results);

    const handleDelete = (id:string): void => {
        if (confirm("Möchtest du diesen QR-Code wirklich löschen?")) {
            triggerDelete(id, () => {
                setRefetchNonce(refetchNonce + 1);
            });
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">

            <OverviewHeader title="Meine QR-Codes"
                            count={results.length} 
                            countLabelSingular="QR-Code"
                            countLabelPlural="QR-Codes"
                            buttonText="QR-Code erstellen"
                            buttonIcon={Plus}
                            onButtonClick={() => navigate("/qrcodes/new")} />

            <div className="mb-6 w-full">
                <div className="relative w-full flex items-center">
                    <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Search className="w-4 h-4" />
                    </div>

                    <input type="text"
                        placeholder="QR-Codes durchsuchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs" />

                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")}
                                className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title="Suche zurücksetzen"
                                aria-abel="Suche löschen">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 flex items-center gap-3 text-rose-800 dark:text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>Fehler beim Laden: {error.message || "Es gibt ein Problem mit Firestore."}</span>
                </div>
            )}

            {isLoading || isDeleting ? (
                <div className="flex flex-col items-center justify-center p-24">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {isDeleting ? "QR-Code wird gelöscht..." : "Lade deine Qr-Codes..."}
                    </p>
                </div>
            ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        keine QR-Codes gefunden
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                        Erstelle deinen ersten QR-Code, indem du oben rechts auf den Button klickst.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((code) => (
                        <QRCodeCard key={code.id}
                                    id={code.id}
                                    title={code.title}
                                    url={code.url}
                                    scanCount={code.scanCount}
                                    trackingActive={code.trackingActive}
                                    createdAt={code.createdAt}
                                    bgColor={code.bgColor}
                                    fgColor={code.fgColor}
                                    image={code.image || ""}
                                    imageSize={code.imageSize}
                                    onDelete={() => handleDelete(code.id ?? "")} />
                    ))}
                </div>
            )}
        </div>
    )
}