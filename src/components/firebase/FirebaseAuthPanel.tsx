import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import { LogIn, UserPlus, Loader2, AlertCircle, User, Mail, Lock } from "lucide-react";
import { FormInput } from "../ui/FormInput";
import { authSchema, AuthFormData } from "../../schemas/authSchema";

export default function FirebaseAuthPanel() {
    const navigate = useNavigate();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [firebaseError, setFirebaseError] = useState("");
    const [loading, setLoading] = useState(false);


    const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>({
        resolver: yupResolver(authSchema),
        context: { isRegister: isRegisterMode }
    });

    const onSubmit = async (data: AuthFormData) => {
        setFirebaseError("");
        setLoading(true);

        try {
            if (isRegisterMode)             {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

                await updateProfile(userCredential.user, {
                    displayName: data.username?.trim()
                });
            } else {
                await signInWithEmailAndPassword(auth, data.email, data.password);
            }

            navigate("/")
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                setFirebaseError("Diese E-Mail-Adresse wird bereits verwendet.");
            } else if (err.code === "auth/invalid-credential") {
                setFirebaseError(err.message || "Ein Fehler ist aufgetreten.");
            }
        } finally {
            setLoading(false);
        }
    }

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setFirebaseError("");
        reset();
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

            {firebaseError && (
                <div className="flex imtes-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {firebaseError}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-stretch gap-4 w-full">
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

                {isRegisterMode && (
                    <FormInput label="Passwort wiederholen"
                               icon={Lock}
                               type="password"
                               placeholder="••••••••••••"
                               error={errors.passwordConfirm?.message}
                               {...register("passwordConfirm")} />
                )}

                <button type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all cursor-pointer disabled:bg-purple-400">
                            {loading ? (
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
                <button onClick={toggleMode}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                    {isRegisterMode ? "Bereits ein Konto? Hier einloggen" : "Noch kein Konto? Jetzt registrieren"}
                </button>
            </div>
        </div>
    );
}