import { useNavigate } from "react-router-dom";
import ShortLinkHeader from "./ShortLinkHeader";
import ShortLinkBody from "./ShortLinkBody";

type ShortLinkCardProps = {
    id: string;
    title: string;
    url: string;
    clickCount: number;
    trackingActive: boolean;
    createdAt: string;
    onDelete: () => void;
}

export default function ShortLinkCard({ id, title, url, clickCount, trackingActive, createdAt, onDelete }: ShortLinkCardProps) {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/short-links/${id}`)}
             className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-md cursor-pointer group">
            <ShortLinkHeader title={title} createdAt={createdAt} onDelete={onDelete} />
            <ShortLinkBody 
                id={id} 
                url={url} 
                clickCount={clickCount} 
                trackingActive={trackingActive} 
            />
        </div>
    )
}