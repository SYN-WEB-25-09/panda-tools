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
    return (
        <div className="flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xs hover:shadow-md dark:hover:border-slate-700/50 transition-all group">
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