import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import { LogIn, UserPlus, Loader2, AlertCircle } from "lucide-react";

export default function FirebaseAuthPanel() {
    const navigate = useNavigate();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const validatePassword = (pass: string): string | null => {
        if (pass.length < 8) return "Das Passwort muss mindestens 10 Zeichen lang sein."

        const commonPasswods = ["passwort123", "password123", "1234567890", "wichtig123"];
        if (commonPasswods.includes(pass.toLowerCase())) {
            return "Dieses Passwort ist zu leicht zu erraten. Bitte wähle ein kreativeres Passwort."
        }

        return null;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegisterMode) {
                if (!username.trim()) throw new Error("Bitte gib einen Nutzuernamen ein.");
                if (password !== passwordConfirm) throw new Error("Die Passwärter stimmen nicht überein.");

                const pwdError = validatePassword(password);
                if (pwdError) throw new Error(pwdError);

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await updateProfile(userCredential.user, {
                    displayName: username.trim()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            
            navigate("/");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                setError("Diese E-Mail-Adresse wird bereits verwendet.")
            } else if (err.code === "auth/invalid-credential") {
                setError("Ungültige E-Mail oder falsches Passwort.");
            } else {
                setError(err.message || "Ein Fehler ist aufgetreten.");
            }
        } finally {
            setLoading(false);
        }
    };

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

            {error && (
                <div className="flex imtes-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        {error}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Nutzername
                        </label>
                        <input type="text"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                               placeholder="DeinName" />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        E-Mail-Adresse
                    </label>
                    <input type="email"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                           placeholder="beispiel@domain.de" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Passwort
                    </label>
                    <input type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                           placeholder="••••••••••••" />
                </div>

                {isRegisterMode && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Passwort wiederholen
                        </label>
                        <input type="password"
                               required
                               value={passwordConfirm}
                               onChange={(e) => setPasswordConfirm(e.target.value)}
                               className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                               placeholder="••••••••••••" />
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
                <button onClick={() => { setIsRegisterMode(!isRegisterMode); setError(""); }}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                    {isRegisterMode ? "Bereits ein Konto? Hier einloggen" : "Noch kein Konto? Jetzt registrieren"}
                </button>
            </div>
        </div>
    );
}