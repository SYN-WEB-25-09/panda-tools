import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth"
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const oobCode = searchParams.get("oobCode");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isVerifiying, setIsVerifiying] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!oobCode) {
            setError("Ungültiger oder abgelaufener Link. Bitte fordere ein neues Passwort an.")
            setIsVerifiying(false);
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then(() => {
                setIsVerifiying(false);
            })
            .catch((err) => {
                console.error("Token-Verifizierung fehlgeschlagen:", err);
                setError("Der Link ist ungültig oder wurde bereits verwendet.");
                setIsVerifiying(false);
            })
    }, [oobCode, auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError("Das Passwort muss mindestens 8 Zeichen lang sein.")
        }

        if (newPassword !== confirmPassword) {
            setError("Die Passworter stimmen nicht überein.");
            return;
        }

        if (!oobCode) return;

        setIsLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess("Dein Passwort wurde erfolgreich geändert! Du wirst zum Login weitergeleitet...");

            setTimeout(() => {
                navigate("/login")
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setError("Das Passwort konnte nicht zurückgesetzt werden. Der Link ist möglicherweise abgelaufen.");
        } finally {
            setIsLoading(false);
        }
    }

    if (isVerifiying) {
        return (
            <div className="w-full max-w-md mx-auto py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="text-xs text-slate-400">
                    Sicherheitslink wird überprüft...
                </span>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto py-16 px-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    Panda <span className="text-purple-600 dark:text-purple-400">Tools</span>
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Sicherheit & Kontoverwaltung
                </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        Neues Passwort festlegen
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Wähle ein neues, sicheres Passwort für deinen Zugang.
                    </p>
                </div>

                {error && (
                    <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            {error}
                        </div>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            {success}
                        </div>
                    </div>
                )}

                {!success && !error && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput label="Neues Passwort"
                                icon={Lock}
                                type="password"
                                placeholder="••••••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} />
                        
                        <FormInput label="Wiederholen"
                                icon={Lock}
                                type="password"
                                placeholder="••••••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} />
                        
                        <button type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-500/20">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Passwort aktualisieren"}
                        </button>
                    </form>
                )}
                
                {error && (
                    <Link to="/login"
                          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Zurück zum Login
                    </Link>
                )}
            </div>
        </div>
    )
}

const FormInput: React.FC<FormInputProps> = ({ label, icon: Icon, ...props }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                {label}
            </label>
            <div className="relative flex items-center">
                <Icon className="absolute left-4 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                    {...props}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-500/10 transition-all"
                />
            </div>
        </div>
    );
};