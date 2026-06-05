import { ReactNode } from "react"
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer"

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">

            <Sidebar />

            <div className="flex flex-col flex-1 md:h-screen md:overflow-y-auto">
                <Header />

                <main className="grow p-6 md:p-10 mx-auto w-full max-w-5xl">
                    {children}
                </main>
                
                <Footer />
            </div>
        </div>
    )
}