import { db } from "../firebase/config"; 
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

export type RedirectResult = {
    targetUrl: string;
    isShortLink: boolean;
}

export async function processRedirect(id:string): Promise<RedirectResult> {
    const isShortLink = id.length === 8;
    const collectionName = isShortLink ? "shortlinks" : "qrcodes"
    const counterFieldName = isShortLink ? "clickCount" : "scanCount";

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error(
            isShortLink 
            ? "Dieser Kurzlink existiert leider nicht oder ist abgelaufen."
            : "Dieser QR-Code existiert leider nicht oder wurde gelöscht."
        );
    }

    const data = docSnap.data();
    const targetUrl = data.url;

    if (!targetUrl) {
        throw new Error("Für diesen Eintrag wurde keine gültige Ziel-Adresse gefunden.")
    }

    await updateDoc(docRef, {[counterFieldName]: increment(1)});

    return {targetUrl, isShortLink};
}