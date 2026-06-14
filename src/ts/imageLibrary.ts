import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";

export type LibraryImage = {
    name: string;
    url: string;
    fullPath: string;
    size: number;
}

export function processAndResizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxSize = 1000;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Canvas-Kontext konnte nicht erstellt werden."));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("WebP-Konvertierung fehlgeschlagen."));
                }, "image/webp", 0.85);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

export async function fetchUserImages(userId: string): Promise<LibraryImage[]> {
    const storage = getStorage();
    const listRef = ref(storage, `images/${userId}`);

    console.log(userId);
    
    try {
        const res = await listAll(listRef);
        const imagePromises = res.items.map(async (item) => {
            const [url, metadata] = await Promise.all([
                getDownloadURL(item),
                getMetadata(item)
            ]);

            return {
                name: item.name,
                url: url,
                fullPath: item.fullPath,
                size: metadata.size,
            };
        });
        return await Promise.all(imagePromises);
    } catch (error) {
        console.error("Fehler beim Laden der Bilder:", error);
        return [];
    }
}

export async function uploadUserImage(userId: string, blob: Blob) {
    const storage = getStorage();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;
    const fileRef = ref(storage, `images/${userId}/${fileName}`);

    const uploadResult = await uploadBytes(fileRef, blob, { contentType: "image/webp" });
    const url = await getDownloadURL(fileRef);

    return {
        name: fileName,
        url: url,
        fullPath: fileRef.fullPath,
        size: uploadResult.metadata.size,
    };
}

export async function deleteUserImage(fullPath: string): Promise<void> {
    const storage = getStorage();
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
}