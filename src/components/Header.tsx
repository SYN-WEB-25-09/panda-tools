import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router"
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu, X } from "lucide-react"
import FirebaseAuthStatus from "./firebase/FirebaseAuthStatus"
import NavigationMenu from "./NavigationMenu";

import logoPng from "../assets/logo.png";

export default function Header() {
    const { darkMode, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const location = useLocation();
    
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);
    
    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-slate-800 dark:bg-slate-900/80 transition-colors duration-300 w-full md:h-16 flex flex-col justify-center px-4 md:px-10">

            <div className="flex items-center justify-between h-16 w-full">
                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                        aria-label="Menü öffnen"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <NavLink to="/" className="flex items-center gap-2 text-md font-bold tracking-tight text-slate-950 dark:text-slate-50">
                        <img src={logoPng} alt="Panda Tools Logo" className="h-6 w-auto object-contain" />
                        <span>Panda <span className="text-purple-600 dark:text-purple-400">Tools</span></span>
                    </NavLink>
                </div>

                <div className="flex items-center gap-4 ml-auto shrink-0">
                    <FirebaseAuthStatus />

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
                        
                    <button onClick={toggleTheme} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 transition-all dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    aria-label="Theme umschalten">
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 dark:border-slate-800/60 py-4 px-2 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                    <NavigationMenu />
                </div>
            )}
            
        </header>
    )
}