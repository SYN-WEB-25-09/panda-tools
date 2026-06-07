import { forwardRef, InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: LucideIcon;
    error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, icon: Icon, error, type = "text", ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {label}
                </label>
                <div className="relative w-full">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />

                    <input ref={ref}
                           type={type}
                           {...props}
                           className={`w-full min-w-full block pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 box-border transition-colors ${error ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`} />
                </div>

                {error && (
                    <p className="text-rose-500 text-[11px] mt-1 font-medium">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)