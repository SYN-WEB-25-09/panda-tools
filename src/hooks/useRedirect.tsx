import { useEffect, useState, useRef } from "react";
import { processRedirect } from "../ts/redirect";

export function useRedirect(id: string | undefined) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!id || hasTriggered.current) return;

        async function triggerRedirect() {
            try {
                hasTriggered.current = true;
                setIsLoading(true);
                setError(null);

                const { targetUrl } = await processRedirect(id!);

                window.location.replace(targetUrl);
            } catch (err: any) {
                console.error("Fehler im useRedirect-Hook:", err);
                setError(err.message || "Verbindung zur Datenbank fehlgeschlagen.")
            } finally {
                setIsLoading(false);
            }
        }

        triggerRedirect();
    }, [id]);

    return [error, isLoading] as const;
}