import { Link2 } from "lucide-react"

type NameUrlSectionProps = {
    title: string;
    setTitle: (val: string) => void;
    baseUrl: string;
    setBaseUrl: (val: string) => void;
}

export default function NameUrlSection({ title, setTitle, baseUrl, setBaseUrl}: NameUrlSectionProps) {
    return (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-500" /> Name & Ziel-Adresse hinterlegen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        Bezeichnung
                    </label>
                    <input type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           placeholder="z.B. Sommer Postkarte"
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        Ziel-URL
                    </label>
                    <input type="text" 
                           value={baseUrl} 
                           onChange={(e) => setBaseUrl(e.target.value)} 
                           placeholder="https://deine-website.de" 
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all" />
                </div>
            </div>
        </div>
    )
}