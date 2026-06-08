import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export function useUniqueId(collectionName: string, idLenght: number = 20) {
    const [unequeId, setUniqueId] = useState("");
    const [isIdGenerating, setIsIdGenerating] = useState(true);
    const hasGenerated = useRef(false);

    useEffect(() => {
        if (hasGenerated.current) return;
        hasGenerated.current = true;

        const generateCustomId = (length: number): string => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            const randomValues = new Uint32Array(length);
            window.crypto.getRandomValues(randomValues);

            for (let i = 0; i < length; i++) {
                result += chars.charAt(randomValues[i] % chars.length)
            }

            return result;
        };

        const fetchUniqueId = async () => {
            try {
                setIsIdGenerating(true);
                let generatedId = "";
                let isUsed = true;
                let attempts = 0;

                while (isUsed && attempts < 10) {
                    generatedId = generateCustomId(idLenght);
                    const docRef = doc(db, collectionName, generatedId);
                    const docSnap = await getDoc(docRef)

                    if (!docSnap.exists()) {
                        isUsed = false;
                    }
                    attempts++;
                }

                if (isUsed) {
                    throw new Error("Kollisionsfehler: Es konnte keine freie ID ermittelt werden.")
                }

                setUniqueId(generatedId);
            } catch (error) {
                console.error(`Fehler bei der ID-Generierung für ${collectionName}:`, error);
                alert("Fehler beim Initialisieren der ID. Bitte lade die Seite neu.");
            } finally {
                setIsIdGenerating(false);
            }
        }

        fetchUniqueId();
    }, [collectionName, idLenght]);

    return { unequeId, isIdGenerating } as const
}