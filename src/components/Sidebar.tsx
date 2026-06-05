import { NavLink } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";
import logoPng from "../assets/logo.png";

export default function Sidebar() {
    return (
        <aside className="hidden md:flex w-64 h-screen bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex-col p-6 sticky top-0 transition-colors duration-300 z-20">
            <div className="mb-8 flex items-center">
                <NavLink to="/"
                         className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                    <img src={logoPng}
                         alt="Panda Tools"
                         className="h-8 w-auto object-contain" />
                    <span>
                        Panda <span className="text-purple-600 dark:text-purple-400">Tools</span>
                    </span>
                </NavLink>
            </div>

            <div className="grow">
                <NavigationMenu />
            </div>
        </aside>
    )
}