import { QrCode, Link, Image as ImageIcon, LucideIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import ToolCard from "../components/ToolCard";

type ToolItem = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    action: () => void;
}

export default function Home() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth();

    const handleToolNagivation = (targetPath: string) => {
        if (user) {
            navigate(targetPath)
        } else {
            if (targetPath === "/qrcode") navigate("/qrcode/qrcode-generator")
            else navigate("/login")
        }
    }

    const tools: ToolItem[] = [
        {
            id: 'image-library',
            title: 'Bilder Library',
            description: 'Verwalte deine Logos und Bilder. Uploads werden automatisch als kompakte WebP-Grafiken optimiert.',
            icon: ImageIcon,
            color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            action: () => handleToolNagivation('/image-library'),
        },
        {
            id: 'qr-generator',
            title: 'QR-Code Generator',
            description: 'Erstelle im Handumdrehen anpassbare QR-Codes für Links, Texte oder WLAN-Zugänge.',
            icon: QrCode,
            color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            action: () => handleToolNagivation('/qrcode'),
        },
        {
            id: 'short-link',
            title: 'Short-Link Generator',
            description: 'Kürze lange URLs in saubere, trackbare und leicht teilbare Kurzlinks.',
            icon: Link,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            action: () => handleToolNagivation('/short-link'),
        },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-50">
                    Willkommen bei den Panda <span className="text-purple-600 dark:text-purple-400">Tools</span>
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl">
                    Wähle eines der untenstehenden Werkzeuge aus, um zu starten. Alle Tools laufen direkt in deinem Browser.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <ToolCard key={tool.id}
                              title={tool.title}
                              description={tool.description}
                              icon={tool.icon}
                              color={tool.color}
                              action={tool.action} />
                ))}
            </div>
        </div>
    )
}