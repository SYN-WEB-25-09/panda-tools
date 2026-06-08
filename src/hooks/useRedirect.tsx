import { useEffect, useState, useRef } from "react";
import { processRedirect, AdvancedDeviceInfo } from "../ts/redirect";

export function useRedirect(id: string | undefined, deviceInfo: AdvancedDeviceInfo | null, isDataReady: boolean) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!id || !isDataReady || hasTriggered.current) return;

        async function triggerRedirect() {
            try {
                hasTriggered.current = true;
                setIsLoading(true);
                setError(null);

                const { targetUrl } = await processRedirect(id!, deviceInfo!);

                window.location.replace(targetUrl);
            } catch (err: any) {
                console.error("Fehler im useRedirect-Hook:", err);
                setError(err.message || "Verbindung zur Datenbank fehlgeschlagen.")
            } finally {
                setIsLoading(false);
            }
        }

        triggerRedirect();
    }, [id, deviceInfo, isDataReady]);

    return [error, isLoading] as const;
}