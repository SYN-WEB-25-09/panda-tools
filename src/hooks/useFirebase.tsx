import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, registerWithEmail } from "../ts/firebase";
import { AuthFormData } from "../schemas/authSchema";

export function useFirebaseAuthAction() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [firebaseError, setFirebaseError] = useState<string>("")

    const executeAuth = async (data: AuthFormData, isRegisterMode: boolean) => {
        setFirebaseError("");
        setIsLoading(true);

        try {
            if (isRegisterMode) {
                await registerWithEmail(data);
            } else {
                await loginWithEmail(data);
            }

            navigate("/");
        } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
                setFirebaseError("Diese E-Mail-Adresse wird bereits verwendet.");
            } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
                setFirebaseError("Ungültige E-Mail-Adresse oder falsches Passwort.");
            } else if (err.code === "auth/too-many-requests") {
                setFirebaseError("Zu viele Fehlversuche. Bitte warte einen Moment oder setze dein Passwort zurück.");
            } else {
                setFirebaseError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
            }
        } finally {
            setIsLoading(false)
        }
    };

    const clearError = () => setFirebaseError("")
    return { executeAuth, isLoading, firebaseError, clearError}
}