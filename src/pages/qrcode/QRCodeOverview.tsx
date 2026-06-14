import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, QrCode } from "lucide-react"
import QRCodeCard from "../../components/qrcode/QRCodeCard"
import OverviewHeader from "../../components/OverviewHeader"
import SeachInput from "../../components/ui/SearchInput"
import ItemStatusGrid from "../../components/ItemStatusGrid"
import { useFirebaseAuth } from "../../context/FirebaseAuthContext"
import { useQRCodesSearch, useDeleteQRCode } from "../../hooks/useQRCode";
import { useItemDelete } from "../../hooks/useItemDelete"

export default function QRCodeOverview() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth()
    const [searchTerm, setSearchTerm] = useState<string>("");

    const { triggerDelete, isDeleting } = useDeleteQRCode();
    const { refetchNonce, handleDelete } = useItemDelete(
        triggerDelete,
        "Möchtest du diesen QR-Code wirklich löschen?"
    );

    const [results, error, isLoading] = useQRCodesSearch(user?.uid, searchTerm, refetchNonce)

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">

            <OverviewHeader title="Meine QR-Codes"
                            count={results.length} 
                            countLabelSingular="QR-Code"
                            countLabelPlural="QR-Codes"
                            buttonText="QR-Code erstellen"
                            buttonIcon={Plus}
                            onButtonClick={() => navigate("/qrcodes/new")} />

            <SeachInput value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="QR-Codes durchsuchen..." />

            <ItemStatusGrid error={error}
                            isLoading={isLoading || isDeleting}
                            loadingText={isDeleting ? "QR-Code wird gelöscht..." : "Lade deine QR-Codes..."}
                            isEmpty={results.length === 0}
                            Icon={QrCode}
                            title="Keine QR-Codes gefunden"
                            description="Erstelle deinen ersten QR-Code, indem du oben rechts auf den Button klickts.">
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
            </ItemStatusGrid>
        </div>
    )
}