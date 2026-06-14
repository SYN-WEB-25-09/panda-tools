import { Search, X } from "lucide-react";

type SeachInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

export default function SeachInputProps({ value, onChange, placeholder }: SeachInputProps) {
    return (
        <div className="mb-6 w-full">
            <div className="relative w-full flex items-center">
                <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <Search className="w-4 h-4" />
                </div>

                <input type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs" />

                    {value && (
                        <button onClick={() => onChange("")}
                                className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                title="Suche zurücksetzen"
                                aria-label="Suche löschen">

                        <X className="w-4 h-4" />

                        </button>
                    )}
            </div>
                
        </div>
    )
}