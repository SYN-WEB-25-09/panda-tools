import { Link } from "react-router-dom"

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 transition-colors duration-300">
            <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium">
                <div>
                    &copy; 2026 Panda Tools. Alle Rechte vorbehalten.
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/kontakt"
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Kontakt
                    </Link>

                    <Link to="/datenschutz"
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Datenschutz
                    </Link>

                    <Link to="/impressum"
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Impressum
                    </Link>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                    <a href="https://www.twitch.tv/glutarios"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-slate-400 hover:text-[#9146FF] dark:text-slate-500 dark:hover:text-[#9146FF] transition-colors p-1"
                       aria-label="Twitch Kanal besuchen">
                        <svg className="w-5 h-5 fill-current"
                             viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                        </svg>
                        
                    </a>
                </div>
            </div>
        </footer>
    );
}