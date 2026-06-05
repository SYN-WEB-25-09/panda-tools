import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useFirebaseAuth } from "../../context/FirebaseAuthContext";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function UserManagment() {
    const { user } = useFirebaseAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [username, setUsername] = useState(user?.displayName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");

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

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (username.trim() !== user.displayName){
                await updateProfile(user, {displayName: username.trim() });
            }

            if (email.trim() !== user.email?.toLocaleLowerCase()) {
                await updateEmail(user, email.trim())
            }

            if (newPassword) {
                if(newPassword !== confirmPassword) {
                    throw new Error("Die Passwörter stimmen nicht überein.")
                }

                if (newPassword.length < 8) {
                    throw new Error("Das neue Passwort muss mindestens 8 Zeichen lang sein.")
                }

                await updatePassword(user, newPassword)
            }
        }
        catch (err: any) {

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

            {error && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {error}
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

            <form onSubmit={handleUpdateProfile}
                  className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Nutzername
                        </label>
                        <input type="text"
                               required
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            E-Mail-Adresse
                        </label>
                        <input type="email"
                               required
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
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
                                   value={newPassword}
                                   onChange={(e) => setNewPassword(e.target.value)}
                                   className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Passwort wiederholen
                            </label>
                            <input type="password"
                                   value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)}
                                   className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500" />
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