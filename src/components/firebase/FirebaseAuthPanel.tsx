import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2, User, Mail, Lock } from "lucide-react";
import { FormInput } from "../ui/FormInput";
import { authSchema, AuthFormData } from "../../schemas/authSchema";
import { useFirebaseActionAuth } from "../../hooks/useFirebase";

export default function FirebaseAuthPanel() {
    const { isRegisterMode, isLoading, authError, handleAuth, toggleMode } = useFirebaseActionAuth();

    const [resetLoading, setResetLoading] = useState<boolean>(false);
    const [resetSuccess, setResetSuccess] = useState<string | null>(null);
    const [resetError, setResetError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, watch, setError } = useForm<AuthFormData>({
        resolver: yupResolver(authSchema),
        context: { isRegister: isRegisterMode }
    });

    const currentEmail = watch("email");

    const handeForgotPassword = async () => {
        setResetSuccess(null);
        setResetError(null);

        if (!currentEmail) {
            setError("email", {
                type: "manual",
                message: "Bitte gib zuerst deine E-Mail-Adresse ein."
            })
            return;
        }

        setResetLoading(true);

        const backend_url = import.meta.env.DEV ? "http://localhost:3000" : "https://api.panda-tools.de";

        try {
            const response = await fetch(`${backend_url}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: currentEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Fehler beim Senden.")
            }

            setResetSuccess("Eine maßgeschneiderte E-Mail mit Anweisungen zum Zurücksetzen wurde an dich gesendet!");
        } catch (error: any) {
            console.error("API Fehler:", error)
            setResetError(error.message || "Es gab ein Problem beim Kommunizieren mit dem Server.");
        } finally {
            setResetLoading(false);
        }

        /*const auth = getAuth();

        try {
            await sendPasswordResetEmail(auth, currentEmail);
            setResetSuccess("Eine E-Mail zum Zurücksetzen deines Passworts wurde versendet!")
        } catch (error: any) {
            console.error("Fehler beim Zurücksetzen des Passwort", error)
            if (error.code === "auth/user-not-found") {
                setResetError("Es existiert kein Konto mit dieser E-Mail-Adresse.");
            } else if (error.code === "auth/invalid-email") {
                setResetError("Bitte gib eine gültige E-Mail-Adresse ein.");
            } else {
                setResetError("Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.");
            }
        } finally {
            setResetLoading(false);
        }*/
    }

    return (
        <div className="w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {isRegisterMode ? "Konto erstellen" : "Willkommen zurück"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                    {isRegisterMode ? "Rigstriere dich um alle funktionen zu nutzen." : "Melde dich an, um fortzufahren."}
                </p>
            </div>

            {authError && (
                <div className="flex imtes-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {authError}
                    </span>
                </div>
            )}

            {resetError && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {resetError}
                    </span>
                </div>
            )}

            {resetSuccess && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetSuccess}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(handleAuth)} className="flex flex-col items-stretch gap-4 w-full">
                {isRegisterMode && (
                    <FormInput label="Nutzername"
                               icon={User}
                               placeholder="DeinName"
                               error={errors.username?.message}
                               {...register("username")} />
                )}

                <FormInput label="E-Mail-Adresse"
                           icon={Mail}
                           type="email"
                           placeholder="beispiel@domain.de"
                           error={errors.email?.message}
                           {...register("email")} />

                <FormInput label="Passwort"
                           icon={Lock}
                           type="password"
                           placeholder="••••••••••••"
                           error={errors.password?.message}
                           {...register("password")} />

                {!isRegisterMode && (
                    <div className="flex justify-end mt-1.5">
                        <button type="button"
                                disabled={resetLoading}
                                onClick={handeForgotPassword}
                                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50">
                            {resetLoading ? "Wird gesendet..." : "Passwort vergessen?"}
                        </button>
                    </div>
                )}

                {isRegisterMode && (
                    <FormInput label="Passwort wiederholen"
                               icon={Lock}
                               type="password"
                               placeholder="••••••••••••"
                               error={errors.passwordConfirm?.message}
                               {...register("passwordConfirm")} />
                )}

                <button type="submit"
                        disabled={isLoading || resetLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all cursor-pointer disabled:bg-purple-400">
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isRegisterMode ? (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Registrieren
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Einloggen
                                </>
                            )}
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
                <button type="button"
                        onClick={() => {
                            setResetSuccess(null)
                            setResetError(null)
                            toggleMode(reset);
                        }}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                    {isRegisterMode ? "Bereits ein Konto? Hier einloggen" : "Noch kein Konto? Jetzt registrieren"}
                </button>
            </div>
        </div>
    );
}