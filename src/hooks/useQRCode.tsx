import { useEffect, useState } from "react"
import { deleteQRCOdeFormDatabase, fetchQRCodesByUserId, QRCodeItem, saveQRCodeToDatabase, uploadLogoToStarage } from "../ts/qrcode"

type SavePayload = {
    id: string;
    userId: string | undefined;
    title: string;
    baseUrl: string;
    bgColor: string;
    fgColor: string;
    image: string;
    imageSize: number;
    isTrackingEnabled: boolean;
    isTransparent: boolean;
    exportFormat: string;
    onSuccess: () => void;
}

export function useDeleteQRCode() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

    useEffect(() => {
        if (!deleteId) return;

        const currentDeleteId = deleteId;

        async function processDelete() {
            setIsDeleting(true);
            try {
                await deleteQRCOdeFormDatabase(currentDeleteId);
                alert("QR Code erfolgreich gelöscht.")
                if (onSuccessCallback) onSuccessCallback();
            } catch (error) {
                console.error("Fehler beim Löschen des QR-Codes", error);
                alert("Fehler beim löschen des QR-Codes.")
            } finally {
                setIsDeleting(false);
                setDeleteId(null);
            }
        }

        processDelete();
    }, [deleteId, onSuccessCallback]);

    const triggerDelete = (id: string, onSuccess: () => void) => {
        setDeleteId(id);
        setOnSuccessCallback(() => onSuccess)
    }

    return { triggerDelete, isDeleting };
}

export function useSaveQRCode() {
    const [isSaving, setIsSaving] = useState(false);
    const [savePayload, setSavePayload] = useState<SavePayload | null>(null);

    useEffect(() => {
        if (!savePayload) return;

        const { id, userId, title, baseUrl, bgColor, fgColor, image, imageSize, isTrackingEnabled, isTransparent, exportFormat, onSuccess } = savePayload;

        if (!userId) {
            alert ("Du musst eingeloggt sein, um QR-Codes zu speichern.")
            setIsSaving(false);
            setSavePayload(null);
            return;
        }

        if (!baseUrl || baseUrl === "https://example.com") {
            alert("Bitte gib eine gültige Ziel-Url ein.")
            setIsSaving(false);
            setSavePayload(null);
            return;
        }

        const validateUserId: string = userId;

        async function processSave() {
            setIsSaving(true);
            try {
                let finalLogoUrl: string | null = null;
                if (image) {
                    finalLogoUrl = await uploadLogoToStarage(id, image);
                }

                const qrCodeData: Omit<QRCodeItem, "id"> = {
                    title: title.trim(),
                    url: baseUrl,
                    bgColor: isTransparent && exportFormat !== "JPG" ? "transparent" : bgColor,
                    fgColor: fgColor,
                    image: finalLogoUrl,
                    imageSize: imageSize,
                    trackingActive: isTrackingEnabled,
                    scanCount: 0,
                    createdAt: new Date().toLocaleDateString("de-DE"),
                    createdBy: validateUserId,
                };

                await saveQRCodeToDatabase(id, qrCodeData);
                alert("QR-Code erfolgreich gespeichert!")
                onSuccess();
            } catch (error) {
                console.error("Fehler beim Speichern des QR-Codes:", error);
                alert("Fehler beim Speichern des QR-Codes.");
            } finally {
                setIsSaving(false);
                setSavePayload(null);
            }
        }

        processSave();
    }, [savePayload]);

    const triggerSave = (payload: SavePayload) => {
        setSavePayload(payload);
    }

    return { triggerSave, isSaving }
}

export function useQRCodesSearch(userId: string | undefined, searchTerm: string = "", refetchTrigger: number = 0) {
    const [results, setResults] = useState<QRCodeItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function load() {
            if (!userId) {
                setResults([])
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchQRCodesByUserId(userId);

                const filteredData = data.filter(code => 
                    code.title.toLocaleLowerCase().includes(searchTerm.toLowerCase()) ||
                    code.url.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
                );

                setResults(filteredData);
                setError(null);
            } catch (err) {
                console.error("Fehler bei QR-Code Suche:", err);
                setError(err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [userId, searchTerm, refetchTrigger]);

    return [results, error, isLoading] as const;
}