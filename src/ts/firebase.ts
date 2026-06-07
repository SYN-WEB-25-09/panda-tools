import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential } from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthFormData } from "../schemas/authSchema";

export async function  loginWithEmail({ email, password }: AuthFormData): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
}


export async function registerWithEmail({ email, password, username}: AuthFormData): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (username?.trim()) {
        await updateProfile(userCredential.user, {
            displayName: username.trim()
        });
    }

    return userCredential;
}