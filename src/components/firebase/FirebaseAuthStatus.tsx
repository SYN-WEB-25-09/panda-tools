import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useFirebaseAuth } from "../../context/FirebaseAuthContext";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function FireabeAuthStatus() {
    const { user } = useFirebaseAuth();
    const navigate = useNavigate();

    const handleLogout = async(): Promise<void> => {
        try {
            await signOut(auth);
            navigate("/")
        } catch (error) {
            console.error("Fehler beim Abmelden:", error)
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div onClick={() => navigate("/profile")}
                     className="hidden md:flex flex-col items-end text-right cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-30 truncate">
                        {user.displayName || "User"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-30 truncate">
                        {user.email}
                    </span>
                </div>
                <button onClick={() => navigate("/profile")}
                        className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl md:mr-1 cursor-pointer hover:bg-purple-500/20 transition-colors">
                    <UserIcon className="w-4 h-4" />
                </button>
                <button onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                        Abmelden
                    </span>
                </button>
            </div>
        );
    }

    const isLoginPage = location.pathname === '/login';

    return (
        <button onClick={() => navigate("/login")}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs
                    ${isLoginPage 
                        ? "bg-purple-600 text-white dark:bg-purple-500 hover:bg-purple-500 dark:hover:bg-purple-400" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }
                `}>
            <LogIn className="w-4 h-4" />
            <span>Einloggen</span>
        </button>
    )
}