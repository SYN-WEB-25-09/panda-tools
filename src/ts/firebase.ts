import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updateEmail, updatePassword, User, UserCredential } from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthFormData } from "../schemas/authSchema";
import { ProfileFormData } from "../schemas/profileSchema";

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

export async function  updateUserProfile(user: User, data: ProfileFormData): Promise<void> {
    if (data.username.trim() !== user.displayName) {
        await updateProfile(user, { displayName: data.username.trim() });
    }

    if (data.email.trim().toLowerCase() !== user.email?.toLowerCase()) {
        await updateEmail(user, data.email.trim());
    }

    if (data.newPassword) {
        await updatePassword(user, data.newPassword)
    }
}