import { useNavigate } from "react-router-dom";
import { ArrowLeft, LucideIcon } from "lucide-react";

type OverviewHeaderProps = {
    title: string;
    count: number;
    countLabelSingular: string;
    countLabelPlural: string;
    buttonText: string;
    buttonIcon: LucideIcon;
    onButtonClick: () => void;
    backTarget?: string;
}

export default function OverviewHeader({ title, count, countLabelSingular, countLabelPlural, buttonText, buttonIcon: ButtonIcon, onButtonClick, backTarget = "/" }: OverviewHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(backTarget)}
                        className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        aria-label="Zurück">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {title}
                    </h1>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Gesamt: {count} {count === 1 ? countLabelSingular : countLabelPlural}
                    </p>
                </div>
            </div>
        
            <button onClick={onButtonClick}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-purple-500 transition-all cursor-pointer dark:bg-purple-500 dark:hover:bg-purple-400 self-start sm:self-auto">
                <ButtonIcon className="w-4 h-4" />
                {buttonText}
            </button>
        </div>
    );
}