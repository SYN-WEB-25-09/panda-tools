import { BarChart3 } from "lucide-react";

type TrackingSectionProps = {
    isTrackingEnabled: boolean;
    setIsTrackingEnabled: (val: boolean) => void;
    isUserLoggedIn: boolean;
};

export default function TrackingSection({ isTrackingEnabled, setIsTrackingEnabled, isUserLoggedIn }: TrackingSectionProps) {
    return (
        <div className="p-5 rounded-2xl border transition-all shadow-xs border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <label className="flex items-center gap-3 font-semibold text-sm text-slate-900 dark:text-slate-100 cursor-pointer select-none">
                <input type="checkbox" 
                       checked={isTrackingEnabled} 
                       onChange={(e) => setIsTrackingEnabled(e.target.checked)} 
                       className="w-4 h-4 rounded-sm text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 accent-purple-600"
                       disabled={!isUserLoggedIn} />
                <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" /> Dynamisches Tracking & Scan Counter Aktivieren
                </span>
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-7">
                {isTrackingEnabled 
                    ? "Aktiviert: Der QR-Code leitet über die App um, damit Scans gezählt werden können." 
                    : "Deaktiviert: Der QR-Code führt direkt zur Ziel-URL. Scans können nicht erfasst werden."}
            </p>
        </div>
    );
}