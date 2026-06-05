import { useNavigate } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-12">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <AlertTriangle className="h-10 w-10" />
            </div>

            <h1 className="text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-8xl">
                404
            </h1>

            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                Seite nicht gefunden
            </h2>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400 max-w-md">
                Hoppla! Die von dir gesuchte Seite existiert nicht oder wurde an eine andere Stelle verschoben.
            </p>

            <button onClick={() => navigate("/")}
                    className="mt-8 flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-purple-500 active:bg-purple-700 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 dark:bg-purple-500 dark:hover:bg-purple-400 dark:active:bg-purple-600">
                <Home className="w-4 h-4" />
                Zurück zur Startseite
            </button>
        </div>
    )
}