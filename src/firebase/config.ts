import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAVQef8058uY2EgVHpPxE4xv5IcSs8qhU",
  authDomain: "panda-tools-dcbe2.firebaseapp.com",
  projectId: "panda-tools-dcbe2",
  storageBucket: "panda-tools-dcbe2.firebasestorage.app",
  appId: "1:256252465852:web:67b79503de881c0a46b6b9",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);