import { db } from "../firebase/config";
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { AdvancedDeviceInfo } from "./redirect";

export type ShortLinkItem = {
    id: string;
    title: string;
    url: string;
    trackingActive: boolean;
    clickCount: number;
    createdAt: string;
    createdBy: string;
}

export async function fetchShortLinkAnalytics(id: string): Promise<AdvancedDeviceInfo[]> {
    try {
        const analyticsSnapshot = await getDocs(collection(db, "shortlinks", id, "analytics"))

        if (!analyticsSnapshot || analyticsSnapshot.empty) {
            return[]
        }

        const records: AdvancedDeviceInfo[]  = [];
        analyticsSnapshot.forEach((docSnap) => {
            if (docSnap.exists()) {
                records.push(docSnap.data() as AdvancedDeviceInfo)
            }
        });

        return records;
    }
    catch (error) {
        console.warn(`Keine Analytics für Short-Link ${id} gefunden:`, error);
        return[]
    }
}

export async function fetchShortLinkById(id: string): Promise<ShortLinkItem | null> {
    const docRef = doc(db, "shortlinks", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    if (!data) return null;

    const analytics = await fetchShortLinkAnalytics(id);

    return {
        id: docSnap.id,
        title: data.title,
        url: data.url,
        trackingActive: data.trackingActive,
        clickCount: analytics.length,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
    } as ShortLinkItem;
}

export async function deleteShortLinkFromDatabase(id: string): Promise<void> {
    const docRef = doc(db, "shortlinks", id)
    await deleteDoc(docRef);
}

export async function saveShortLinkToDatabase(id: string, shortLinkData: Omit<ShortLinkItem, "id" | "clickCount">): Promise<void> {
    await setDoc(doc(db, "shortlinks", id), shortLinkData)
}

export async function fetchShortLinksByUserId(userId: string): Promise<ShortLinkItem[]> {
    const q = query(
        collection(db, "shortlinks"),
        where("createdBy", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    const shortLinks: ShortLinkItem[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const analytics = await fetchShortLinkAnalytics(docSnap.id);

            return {
                id: docSnap.id,
                title: data.title || "Unbenannter Link",
                url: data.url || "",
                trackingActive: !!data.trackingActive,
                clickCount: analytics.length,
                createdAt: data.createdAt || "",
                createdBy: data.createdBy || "",
            };
        })
    );

    return shortLinks;
}