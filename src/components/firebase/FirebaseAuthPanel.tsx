import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import { LogIn, UserPlus, Loader2, AlertCircle } from "lucide-react";

type AuthFormData = {
    email: string;
    password: string,
    username?: string,
    passwordConfirm?: string,
}

const COMMON_PASSWORDS = ["passwort123", "password123", "1234567890", "wichtig123", "qwertz123"];

const authSchema: yup.ObjectSchema<AuthFormData> = yup.object({
    email: yup.string()
        .email("Bitte gib eine gültige E-Mail-Adresse ein.")
        .required("E-Mail ist ein Pflichtfeld."),
    password: yup.string()
        .required("Passwort ist ein Pflichtfeld.")
        .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein (NIST-Standard).")
        .test("not-common", "Dieses Passwort ist zu leicht zu erraten. Bitte wähle ein kreativeres Passwort.",
            value => !value || !COMMON_PASSWORDS.includes(value.toLowerCase())
        ),
    username: yup.string().when("$isRegister", {
        is: true,
        then: (schema) => schema
            .trim()
            .required("Der Nutzername ist ein Pflichtfeld.")
            .min(3, "Der Nutzername muss mindestens 3 Zeichen lang sein."),
        otherwise: (schema) => schema.notRequired()
    }),
    passwordConfirm: yup.string().when("$isRegister", {
        is: true,
        then: (schema) => schema
            .required("Bitte wiederhole dein Passwort.")
            .oneOf([yup.ref("password")], "Die Passwörter stimmen nicht überein."),
        otherwise: (schema) => schema.notRequired()
    })
}).required();

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {isRegisterMode && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Nutzername
                        </label>
                        <input type="text"
                               {...register("username")}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                               placeholder="DeinName" />
                        {errors.username && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.username.message}</p>}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        E-Mail-Adresse
                    </label>
                    <input type="email"
                           required
                           {...register("email")}
                           className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                           placeholder="beispiel@domain.de" />
                    {errors.email && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Passwort
                    </label>
                    <input type="password"
                           required
                           {...register("password")}
                           className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                           placeholder="••••••••••••" />
                    {errors.password && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.password.message}</p>}
                </div>

                {isRegisterMode && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Passwort wiederholen
                        </label>
                        <input type="password"
                               required
                               {...register("passwordConfirm")}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                               placeholder="••••••••••••" />
                        {errors.passwordConfirm && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.passwordConfirm.message}</p>}
                    </div>
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