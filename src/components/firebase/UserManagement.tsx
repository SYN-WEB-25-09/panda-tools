import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useFirebaseAuth } from "../../context/FirebaseAuthContext";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

type ProfileFormData = {
    username: string,
    email: string,
    newPassword?: string,
    confirmPassword?: string,
}

const profileSchema: yup.ObjectSchema<ProfileFormData> = yup.object({
    username: yup.string()
        .trim()
        .required("Der Nutzername ist ein Pflichtfeld und darf nicht leer sein.")
        .min(3, "Der Nutzername muss mindestens 3 Zeichen lang sein."),
    email: yup.string()
        .email("Bitte gibt eine gültige E-Mai-Adresse ein.")
        .required("Die E-Mail-Adresse ist ein Pflichtfeld."),
    newPassword: yup.string()
        .transform(value => value === "" ? undefined : value)
        .min(8, "Das neue Passwort muss mindestens 8 Zeichen lang sein (NIST-Standard).")
        .notRequired() as yup.Schema<string | undefined>,
    confirmPassword: yup.string()
        .transform(value => value === "" ? undefined : value)
        .notRequired()
        .when("newPassword", {
            is: (val: any) => val && val.length > 0,
            then: (schema) => schema
                .required("Bitte wiederhole dein neues Passwort.")
                .oneOf([yup.ref("newPassword")], "Die Passwörter stimmen nicht überein."),
            otherwise: (schema) => schema.notRequired()
        }) as yup.Schema<string | undefined>
})

export default function UserManagment() {
    const { user } = useFirebaseAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [firebaseError, setFirebaseError] = useState("");
    const [success, setSuccess] = useState("");

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
        setFirebaseError("");
        setSuccess("");
        setLoading(true);

        try {
            if (data.username.trim() !== user.displayName){
                await updateProfile(user, {displayName: data.username.trim() });
            }

            if (data.email.trim() !== user.email?.toLocaleLowerCase()) {
                await updateEmail(user, data.email.trim())
            }

            if (data.newPassword) {
               await updatePassword(user, data.newPassword)
            }

            reset({
                username: data.username,
                email: data.email,
                newPassword: "",
                confirmPassword: ""
            })
        }
        catch (err: any) {
            console.error(err);
            if (err.code === "auth/requires-recent-login") {
                setFirebaseError("Aus Sicherheitsgründen musst du dich vor dieser kritischen Änderung neu einloggen.");
            } else{
                setFirebaseError(err.message || "Fehler beim Aktualisieren des Profils.");
            }
        }
        finally {
            setLoading(false);
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

            {firebaseError && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {firebaseError}
                    </span>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {success}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Nutzername
                        </label>
                        <input type="text"
                               required
                               {...register("username")}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                        {errors.username && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            E-Mail-Adresse
                        </label>
                        <input type="email"
                               required
                               {...register("email")}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                        {errors.email && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                        Passwort ändern
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Neues Passwort
                            </label>
                            <input type="password"
                                   {...register("newPassword")}
                                   className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                            {errors.newPassword && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Passwort wiederholen
                            </label>
                            <input type="password"
                                   {...register("confirmPassword")}
                                   className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                            {errors.confirmPassword && <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>
                </div>

                <button type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Änderung Speichern</>}
                </button>

            </form>

        </div>
    )
}