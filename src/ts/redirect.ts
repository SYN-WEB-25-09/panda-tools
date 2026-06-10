import { db } from "../firebase/config"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

export type RedirectResult = {
    targetUrl: string;
    isShortLink: boolean;
    trackingActive: boolean;
}

export type AdvancedDeviceInfo = {
    deviceType: string;
    deviceBrand: string;
    browser: string;
    os: string;
    country: string;
    language: string;
    timestamp: string;
}

export async function processRedirect(id:string, deviceInfo: AdvancedDeviceInfo): Promise<RedirectResult> {
    const isShortLink = id.length === 8;
    const collectionName = isShortLink ? "shortlinks" : "qrcodes"

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
    const isTrackingActive = data.trackingActive === true;

    if (!targetUrl) {
        throw new Error("Für diesen Eintrag wurde keine gültige Ziel-Adresse gefunden.")
    }

    if (isTrackingActive && deviceInfo) {
        const analysticsSubcollectionRef = collection(db, collectionName, id, "analytics");
        await addDoc(analysticsSubcollectionRef, deviceInfo)
        console.log("Tracking aktiv: Device-Infos wurden im Unterdokument gespeichert.");
    } else {
        console.log("Tracking deaktiviert: Es wurden keine personenbezogenen Device-Infos gespeichert.");
    }


    return {targetUrl, isShortLink, trackingActive: isTrackingActive};
}