import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export type QRCodeItem = {
    id: string;
    title: string;
    url: string;
    bgColor: string;
    fgColor: string;
    image?: string;
    imageSize?: number;
    trackingActive: boolean;
    scanCount: number;
    createdAt: string;
    createdBy: string;
};

export async function fetchQRCodesByUserId(userId: string): Promise<QRCodeItem[]> {
    const q = query(
        collection(db, "qrcodes"),
        where("createdBy", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const qrCodes: QRCodeItem[] = [];

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        qrCodes.push({
            id: docSnap.id,
            title: data.title,
            url: data.url,
            bgColor: data.bgColor,
            fgColor: data.fgColor,
            image: data.image,
            trackingActive: data.trackingActive,
            scanCount: data.scanCount || 0,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
        });
    });

    return qrCodes;
}