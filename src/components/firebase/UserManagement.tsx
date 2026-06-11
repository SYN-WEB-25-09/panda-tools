import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFirebaseAuth } from "../../context/FirebaseAuthContext";
import { deleteUser } from "firebase/auth";
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2, User, Mail, Lock, Trash2 } from "lucide-react"
import { FormInput } from "../ui/FormInput";
import { profileSchema, ProfileFormData } from "../../schemas/profileSchema";
import { useFirebaseActionProfile } from "../../hooks/useFirebase";

export default function UserManagment() {
    const { user } = useFirebaseAuth();
    const navigate = useNavigate();

    const { isLoading, profileError, successMessage, handleProfileUpdate } = useFirebaseActionProfile();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            username: user?.displayName || "",
            email: user?.email || "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    if (!user) {
        return (
            <div className="text-center p-8">
                <p className="">
                    Bitte Melde dich an, um dein Profil zu verwalten.
                    <button onClick={() => navigate("/login")}
                            className="mt-4 text-sm font-semibold text-purple-600">
                        Zum Login
                    </button>
                </p>
            </div>
        )
    }

    const onSubmit = async (data: ProfileFormData) => {
        handleProfileUpdate(user, data, () => {
            reset({
                username: data.username,
                email: data.email,
                newPassword: "",
                confirmPassword: ""
            })
        });
    };

    const handleDeleteAccount = async () => {
        const confirmFirst = window.confirm(
            "WARNUNG: Mochtest du dein Konto wirklich unwiderruflich löschen? Alle deine Daten und Einstellungen gehen verloren."
        );

        if (!confirmFirst) return;

        const confirmSecond = window.prompt(
            "Um das Löschen zu bestätigen, gib bitte das Wort 'LÖSCHEN' ein:"
        );

        if (confirmSecond !== "LÖSCHEN") {
            alert("Die Bestätigung war nicht korrekt. Vorgang abgebrochen.")
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await deleteUser(user);
            alert("Dein Konto wurde erfolgreich gelöscht.");
            navigate("/login");
        } catch (error: any) {
            console.error("Fehler beim Löschen des Kontos:", error)

            if (error.code === "auth/requires-recent-login"){
                setDeleteError(
                    "Aus Sicherheitsgründen musst du dich frisch eingeloggt haben, um dein Konto zu löschen. Bitte melde dich ab, erneut an und versuche es noch einmal."
                );
            } else {
                setDeleteError("Fehler beim Löschen des Kontos. Bitte versuche es später erneut.")
            }
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto py-6 px-4">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
                <button onClick={() => navigate(-1)}
                        className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        Kontoverwaltung
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Verwalte deine Profildaten und Sicherheitsoptionen
                    </p>
                </div>
            </div>

            {profileError && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {profileError}
                    </span>
                </div>
            )}

            {successMessage && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {successMessage}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Nutzername"
                               icon={User}
                               error={errors.username?.message}
                               {...register("username")} />
                               
                    <FormInput label="E-Mail-Adresse"
                               icon={Mail}
                               type="email"
                               error={errors.email?.message}
                               {...register("email")} />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Passwort ändern (optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Neues Passwort"
                                   icon={Lock}
                                   type="password"
                                   placeholder="••••••••••••"
                                   error={errors.newPassword?.message}
                                   {...register("newPassword")} />

                        <FormInput label="Passwort wiederholen"
                                   icon={Lock}
                                   type="password"
                                   placeholder="••••••••••••"
                                   error={errors.confirmPassword?.message}
                                   {...register("confirmPassword")} />
                    </div>
                </div>

                <button type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Änderung Speichern</>}
                </button>
            </form>

            <div className="bg-rose-500/5 dark:bg-rose-950/10 p-6 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 shadow-xs flex flex-col gap-4">
                <div>
                    <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />Gefahrenzone
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Sobald du dein Konto löscht, gibt es kein Zurück mehr. Bitte sei dir absolut sicher.
                    </p>
                </div>

                <button type="button"
                        disabled={isLoading || isDeleting}
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs">
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Konto unwiderruflich löschen"
                    )}
                </button>
            </div>

        </div>
    )
}