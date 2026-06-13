import express from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: { error: "Zu viele Anfragen. Bitte warte eine Stunde." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());

app.options("/api/auth/forgot-password", (req, res) => {
    return res.status(200).end();
});

app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";
const frontend_url = isProduction ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV;

// Firebase Admin SDK initialisieren mit Fail-Safe
let firebaseInitialized = false;
try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        const jsonPath = path.join(__dirname, "../serviceAccountKey.json");
        if (fs.existsSync(jsonPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
    }
    
    if (serviceAccount) {
        initializeApp({ credential: cert(serviceAccount) });
        firebaseInitialized = true;
    }
} catch (error) {
    console.error("Firebase Init Fehler:", error.message);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: parseInt(process.env.SMTP_PORT || "465") === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "E-Mail-Adresse wird benötigt." });
    }

    if (!firebaseInitialized) {
        return res.status(500).json({ error: "Firebase Admin SDK ist nicht initialisiert. Bitte Umgebungsvariablen prüfen." });
    }

    try {
        const actionCodeSettings = {
            url: `${frontend_url}/reset-password`,
            handleCodeInApp: true,
        };

        const auth = getAuth();
        const rawFirebaseLink = await auth.generatePasswordResetLink(email, actionCodeSettings);

        const urlObj = new URL(rawFirebaseLink);
        const oobCode = urlObj.searchParams.get("oobCode");
        const apiKey = urlObj.searchParams.get("apiKey");

        const customResetLink = `${frontend_url}/reset-password?oobCode=${oobCode}&apiKey=${apiKey}&lang=de`;

        // Logo wird hier direkt von deiner echten Domain geladen, statt als lokales Attachment!
        const htmlEmail = `
            <!DOCTYPE html>
            <html lang="de">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: sans-serif; background-color: #f1f5f9; padding: 20px;">
                <div style="max-width: 550px; margin: 40px auto; background: #ffffff; border-radius: 24px; padding: 40px; text-align: center; border: 1px solid #e2e8f0;">
                    <img src="https://panda-tools.de/assets/logo.png" alt="Logo" style="width: 64px; height: 64px; margin-bottom: 16px;" onerror="this.src='https://placehold.co/64x64?text=Panda'">
                    <h2>Panda Tools Passwort zurücksetzen</h2>
                    <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
                    <a href="${customResetLink}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold;">Passwort zurücksetzen</a>
                </div>
            </body>
            </html>
        `;

        await transporter.sendMail({
            from: `"Panda Tools" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Passwort zurücksetzen - Panda Tools",
            html: htmlEmail
        });

        return res.status(200).json({ success: true, message: "E-Mail erfolgreich gesendet." });
        
    } catch (error) {
        console.error("Route Fehler:", error);
        // HIERMIT GEBEN WIR IMMER JSON ZURÜCK, DAMIT DAS FRONTEND DEN FEHLER ANZEIGEN KANN
        return res.status(500).json({ 
            error: "Interner Serverfehler beim Verarbeiten der Anfrage.", 
            details: error.message 
        });
    }
});

if (!isProduction) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🤖 Lokales Backend läuft auf Port ${PORT}`));
}

export default app;