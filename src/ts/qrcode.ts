import { db, storage } from "../firebase/config";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export type QRCodeItem = {
    id: string;
    title: string;
    url: string;
    bgColor: string;
    fgColor: string;
    image: string | null;
    imageSize?: number;
    trackingActive: boolean;
    scanCount: number;
    createdAt: string;
    createdBy: string;
};

export async function deleteQRCOdeFormDatabase(id: string): Promise<void> {
    const docRef = doc(db, "qrcodes", id);
    await deleteDoc(docRef);
}

const compressToWebPBlob = (base64Str: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxSide = 150;

            if (width > height) {
                if (width > maxSide) {
                    height = Math.round((height * maxSide) / width);
                    width = maxSide;
                } else {
                    if (height > maxSide) {
                        width = Math.round((width * maxSide) / height);
                        height = maxSide;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Canvas-Context konnte nicht erstellt werden."));

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve (blob);
                    else reject(new Error("Konvertierung in WebP fehlgeschlagen"));
                }, "image/webp", 0.85)
            };
            img.onerror = (err) => reject(err);
        };
    });
}

export async function  uploadLogoToStarage(id: string, base64Logo: string): Promise<string> {
    const webpBlob = await compressToWebPBlob(base64Logo);
    const fileRef = storageRef(storage, `logos/${id}.webp`);
    await uploadBytes(fileRef, webpBlob, { contentType: "image/webp" })

    return await getDownloadURL(fileRef);
}

export async function saveQRCodeToDatabase(id: string, qrCodeData: Omit<QRCodeItem, "id">): Promise<void> {
    await setDoc(doc(db, "qrcodes", id), qrCodeData);
}

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