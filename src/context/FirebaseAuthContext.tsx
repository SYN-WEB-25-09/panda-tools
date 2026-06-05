import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";

type AuthContextTyp = {
    user: User | null;
    loading: boolean;
}

const FirebaseAuthContext = createContext<AuthContextTyp | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function FirebaseAuthProvider ({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <FirebaseAuthContext.Provider value={{ user, loading}}>
            {!loading && children}
        </FirebaseAuthContext.Provider>
    );
}

export function useFirebaseAuth() {
    const context = useContext(FirebaseAuthContext);
    if (context == null) {
        throw new Error("useAuth must be used withn AuthProvider");
    }

    return context;
}