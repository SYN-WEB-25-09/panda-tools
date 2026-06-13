import { useNavigate } from "react-router-dom";
import QRCodeHeader from "./QRCodeHeader";
import QRCodeBody from "./QRCodeBody";

type QRCodeCardProps = {
    id: string;
    title: string;
    url: string;
    scanCount: number;
    trackingActive: boolean;
    createdAt: string;
    bgColor?: string;
    fgColor?: string;
    image?: string;
    imageSize?: number;
    onDelete: () => void;
}

export default function QRCodeCard({ id, title, url, scanCount, trackingActive, createdAt, bgColor, fgColor, image, imageSize, onDelete }: QRCodeCardProps) {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/qrcodes/${id}`)}
             className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-md cursor-pointer group">
        <QRCodeHeader title={title}
                      createdAt={createdAt}
                      onDelete={onDelete} />

        <QRCodeBody id={id}
                    url={url}
                    scanCount={scanCount}
                    trackingActive={trackingActive}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    image={image}
                    imageSize={imageSize} />
    </div>
    )
    
}