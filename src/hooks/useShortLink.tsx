import { useEffect, useState } from "react";
import { deleteShortLinkFromDatabase, fetchShortLinksByUserId, ShortLinkItem, saveShortLinkToDatabase } from "../ts/shortlink"

type ShortLinkSavePayload = {
    id: string;
    userId: string | undefined;
    title: string;
    baseUrl: string;
    isTrackingEnabled: boolean;
    onSuccess: () => void;
}

export function useDeleteShortLink() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

    useEffect(() => {
        if (!deleteId) return;

        const currentDeleteId = deleteId;

        async function processDelete() {
            setIsDeleting(true);
            try {
                await deleteShortLinkFromDatabase(currentDeleteId);
                alert("Short-Link erfolgreich gelöscht.")
                if (onSuccessCallback) onSuccessCallback();
            } catch (error) {
                console.error("Fehler beim Löschen des Short-Links", error)
                alert("Fehler beim Löschen des Short-Links.")
            } finally {
                setIsDeleting(false);
                setDeleteId(null);
            }
        }

        processDelete();
    }, [deleteId, onSuccessCallback]);

    const triggerDelete = (id: string, onSucces: () => void) => {
        setDeleteId(id);
        setOnSuccessCallback(() => onSucces);
    }

    return { triggerDelete, isDeleting };
}

export function useSaveShortLink() {
    const [isSaving, setIsSaving] = useState(false);
    const [savePayload, setSavePayload] = useState<ShortLinkSavePayload | null>(null);

    useEffect(() => {
        if (!savePayload) return;

        const { id, userId, title, baseUrl, isTrackingEnabled, onSuccess } = savePayload;

        if (!userId) {
            alert("DU musst eingeloggt sein, um Short-Links zu speichern.")
            setIsSaving(false);
            setSavePayload(null);
            return;
        }

        if (!baseUrl || baseUrl === "https://example.com") {
            alert("Bitte gibt eine gültige Ziel-URL ein.")
            setIsSaving(false);
            setSavePayload(null);
            return;
        }

        const validateUserId: string = userId;

        async function processSave() {
            setIsSaving(true);
            try {
                const shortLinkData: Omit<ShortLinkItem, "id" | "clickCount"> = {
                    title: title.trim(),
                    url: baseUrl.trim(),
                    trackingActive: isTrackingEnabled,
                    createdAt: new Date().toLocaleDateString("de-DE"),
                    createdBy: validateUserId,
                };

                await saveShortLinkToDatabase(id, shortLinkData);
                alert("Short-Link erfolgreich gespeichert!")
                onSuccess();
            } catch (error) {
                console.error("Fehler beim Speichern des Short-Links:", error);
                alert("Fehler beim Speichern des Short-Links.");
            } finally {
                setIsSaving(false);
                setSavePayload(null);
            }
        }

        processSave();
    }, [savePayload]);

    const triggerSave = (payload: ShortLinkSavePayload) => {
        setSavePayload(payload);
    }

    return { triggerSave, isSaving };
}

export function useShortLinksSearch(userId: string | undefined, searchTerm: string = "", refetchTrigger: number = 0) {
    const [results, setResults] = useState<ShortLinkItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function load() {
            if (!userId) {
                setResults([]);
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchShortLinksByUserId(userId);

                const filteredData = data.filter(link => 
                    link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    link.id.toLowerCase().includes(searchTerm.toLowerCase())
                );

                setResults(filteredData);
                setError(null);
            } catch (err) {
                console.error("Fehler bei Short-Link Suche:", err);
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