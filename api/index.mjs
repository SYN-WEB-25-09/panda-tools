// 1. DYNAMISCHER IMPORT-FIX FÜR DEN VERCEL-BUNDLER (Löst ERR_REQUIRE_ESM)
import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
    // Wir laden jose vorab als echtes ES-Modul
    const joseModule = await import("jose");
    
    // Wir klinken uns in das require-System von Node.js ein
    const Module = require("module");
    const originalRequire = Module.prototype.require;
    
    Module.prototype.require = function (manifestPath) {
        if (manifestPath === "jose") {
            return joseModule; // Falls jwks-rsa 'jose' via require() sucht, geben wir das ESM-Modul zurück
        }
        return originalRequire.apply(this, arguments);
    };
} catch (error) {
    console.warn("CORS/ESM Patch Warning:", error.message);
}

// 2. DEINE GANZ NORMALEN ESM IMPORTS
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

// Umgebungsvariablen laden
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Spam-Schutz (Rate Limiting)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3, 
    message: { 
        error: "Zu viele Anfragen. Bitte warte eine Stunde, bevor du es erneut versuchst." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());

// Preflight-Anfragen sofort mit 200 OK beantworten
app.options("/api/auth/forgot-password", (req, res) => {
    return res.status(200).end();
});

app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";
const frontend_url = isProduction ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV;

// Firebase Admin SDK initialisieren
try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        const jsonPath = path.join(__dirname, "../serviceAccountKey.json");
        if (fs.existsSync(jsonPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        } else {
            console.warn("⚠️ Keine serviceAccountKey.json gefunden.");
        }
    }
    
    if (serviceAccount) {
        try {
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("🚀 Firebase Admin erfolgreich initialisiert.");
        } catch (initError) {
            if (initError.code === "app/duplicate-app" || initError.message.includes("already exists")) {
                console.log("🔄 Firebase Admin bereits aktiv.");
            } else {
                throw initError;
            }
        }
    }
} catch (error) {
    console.error("❌ Fehler beim Initialisieren von Firebase:", error.message);
}

// Nodemailer Transporter einrichten
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: parseInt(process.env.SMTP_PORT || "465") === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// API-Endpunkt
app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "E-Mail-Adresse wird benötigt."});
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

        const htmlEmail = `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Panda Tools Passwort zurücksetzen</h2>
                    <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
                    <a href="${customResetLink}" style="background: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a>
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

        return res.status(200).json({ success: true, message: "E-Mail erfolgreich gesendet."});
        
    } catch (error) {
        console.error("Fehler beim Generieren/Senden des Passwort-Resets:", error);
        return res.status(500).json({ error: "Das Passwort konnte nicht zurückgesetzt werden."});
    }
});

if (!isProduction) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🤖 Lokales Backend läuft auf Port ${PORT}`);
    });
}

export default app;