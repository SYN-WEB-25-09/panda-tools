import { useEffect, useState } from "react"
import { fetchQRCodesByUserId, QRCodeItem } from "../ts/qrcode"

export function useQRCodesSearch(userId: string | undefined, searchTerm: string = "") {
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

                console.log("Geladene QR-Codes:", filteredData);
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
    }, [userId, searchTerm]);

    return [results, error, isLoading] as const;
}