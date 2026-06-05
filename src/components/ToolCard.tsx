import { ArrowUpRight, LucideIcon } from "lucide-react";

type ToolCardProps = {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    action: () => void;
}

export default function ToolCard(toolCardProps: ToolCardProps) {
    const { title, description, icon: IconComponent, color, action } = toolCardProps;

    return (
        <button onClick={action}
                className="group relative flex flex-col text-left p-6 rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-purple-500/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-400/50 cursor-pointer w-full">
            <div className="flex items-center justify-between w-full mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <IconComponent className="w-6 h-6" />
                </div>

                <ArrowUpRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-purple-500 transition-all duration-300 dark:group-hover:text-purple-400" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 grow">
                {description}
            </p>

            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left dark:bg-purple-400" />
        </button>
    )
}