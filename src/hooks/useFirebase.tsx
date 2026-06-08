import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { loginWithEmail, registerWithEmail, updateUserProfile } from "../ts/firebase";
import { AuthFormData } from "../schemas/authSchema";
import { ProfileFormData } from "../schemas/profileSchema";

export function useFirebaseActionAuth() {
    const navigate = useNavigate();
    const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string>("")
    const [authData, setAuthData] = useState<AuthFormData | null>(null)

    useEffect(() => {
        if (!authData) return;

        const currentData = authData;

        async function processAuth() {
            setAuthError("");
            setIsLoading(true);

            try {
                if (isRegisterMode) {
                    await registerWithEmail(currentData);
                } else {
                    await loginWithEmail(currentData);
                }

                navigate("/");
            } catch (err: any) {
                if (err.code === "auth/email-already-in-use") {
                    setAuthError("Diese E-Mail-Adresse wird bereits verwendet.");
                } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
                    setAuthError("Ungültige E-Mail-Adresse oder falsches Passwort.");
                } else if (err.code === "auth/too-many-requests") {
                    setAuthError("Zu viele Fehlversuche. Bitte warte einen Moment oder setze dein Passwort zurück.");
                } else {
                    setAuthError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
                }
            } finally {
                setIsLoading(false);
                setAuthData(null);
            }
        }

        processAuth();
    }, [authData, isRegisterMode, navigate])

    const handleAuth = (data: AuthFormData) => {
        setAuthData(data);
    };

    const toggleMode = (resetForm: () => void) => {
        setIsRegisterMode((prev) => !prev);
        setAuthError("");
        resetForm();
    };
    return { isRegisterMode, isLoading, authError, handleAuth, toggleMode} as const;
}

export function useFirebaseActionProfile() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [profileError, setProfileError] = useState<string>("");
    const [successMessage, setSuccesMesage] = useState<string>("");

    const [profileData, setProfileData] = useState<{
        user: User | null;
        data: ProfileFormData;
        onResetCallback: () => void;
    } | null>(null);

    useEffect(() => {
        if (!profileData) return;

        const { user, data, onResetCallback } = profileData;

        if (!user) {
            setProfileError("Kein angemeldeter Benutzer gefunden.");
            setProfileData(null);
            return;
        }

        const currentUser = user;

        async function processProfileUpdate() {
            setProfileError("");
            setSuccesMesage("");
            setIsLoading(true);

            try {
                await updateUserProfile(currentUser, data);
                setSuccesMesage("Profile erfolgreich aktualisiert!")
                onResetCallback();
            } catch (err: any) {
                console.error("Profile-Update-Fehler im useEffect:", err);
                if (err.code === "auth/requires-recent-login") {
                    setProfileError("Aus Sicherheitsgründen musst du dich vor dieser kritischen Änderung neu einloggen.");
                } else {
                    setProfileError(err.message || "Fehler beim Aktualisieren des Profils.");
                }
            } finally {
                setIsLoading(false);
                setProfileData(null);
            }
        }

        processProfileUpdate();
    }, [profileData])

    const handleProfileUpdate = (user: User | null, data: ProfileFormData, onResetCallback: () => void) => {
        setProfileData({ user, data, onResetCallback });
    };

    const clearMessages = () => {
        setProfileError("");
        setSuccesMesage("");
    }

    return { isLoading, profileError, successMessage, handleProfileUpdate, clearMessages } as const
}