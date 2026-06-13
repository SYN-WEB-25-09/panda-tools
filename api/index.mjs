import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
    const joseModule = await import("jose");
    const Module = require("module");
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function (manifestPath) {
        if (manifestPath === "jose") return joseModule;
        return originalRequire.apply(this, arguments);
    };
} catch (error) {
    console.warn("CORS/ESM Patch Warning:", error.message);
}

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
        return res.status(500).json({ error: "Firebase Admin SDK ist nicht initialisiert." });
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

        const logoPath = path.join(__dirname, "assets", "logo.png");
        const logoExists = fs.existsSync(logoPath);

        const imgHtml = logoExists 
            ? `<img src="cid:pandatoolslogo" alt="Panda Tools Logo" style="width: 64px; height: 64px; margin-bottom: 16px;">`
            : `<div style="font-size: 32px; margin-bottom: 16px;">🐼</div>`;

        const htmlEmail = `
			<!DOCTYPE html>
			<html lang="de">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta name="color-scheme" content="dark">
				<meta name="supported-color-schemes" content="dark">
				<style>
					body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #020617; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
					.container { max-width: 550px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); border: 1px solid #1e293b; }
					.header { padding: 40px 0; text-align: center; background-color: #0f172a; border-bottom: 1px solid #1e293b; }
					.content { padding: 40px; text-align: center; background-color: #0f172a; }
					.logo-img { width: 64px; height: 64px; margin-bottom: 16px; }
					h1 { color: #f8fafc; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.025em; }
					.highlight { color: #a855f7; }
					p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0; }
					.btn { display: inline-block; background-color: #a855f7; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px 0 rgba(168, 85, 247, 0.4); transition: background-color 0.2s; }
					.footer { padding: 24px; background-color: #0b1329; color: #64748b; font-size: 11px; text-align: center; border-top: 1px solid #1e293b; line-height: 1.5; }
					.link-alt { font-size: 11px; color: #64748b; word-break: break-all; margin-top: 36px; padding: 16px; background-color: #020617; border-radius: 12px; border: 1px dashed #334155; text-align: left; }
					.link-alt strong { color: #94a3b8; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						${imgHtml}
						<h1>Panda <span class="highlight">Tools</span></h1>
					</div>
					<div class="content">
						<p>Hallo,<br><br>wir haben eine Anfrage zum Zurücksetzen deines Passworts für dein Panda Tools Konto erhalten. Klicke auf den folgenden Button, um ein neues Passwort festzulegen:</p>
						
						<a href="${frontend_url}/reset-password?oobCode=${oobCode}&apiKey=${apiKey}&lang=de" class="btn" target="_blank">Passwort zurücksetzen</a>
						
						<div class="link-alt">
							<strong>Link funktioniert nicht?</strong> Kopiere die folgende URL in deinen Browser:<br>
							<span style="color: #a855f7; display: inline-block; margin-top: 6px;">${frontend_url}/reset-password?oobCode=${oobCode}&apiKey=${apiKey}&lang=de</span>
						</div>
					</div>
					<div class="footer">
						&copy; ${new Date().getFullYear()} Panda Tools. <br>
						Wenn du diese Änderung nicht beantragt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
					</div>
				</div>
			</body>
			</html>
		`;

        const emailAttachments = [];
        if (logoExists) {
            emailAttachments.push({
                filename: "logo.png",
                path: logoPath,
                cid: "pandatoolslogo"
            });
        }

        await transporter.sendMail({
            from: `"Panda Tools" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Passwort zurücksetzen - Panda Tools",
            html: htmlEmail,
            attachments: emailAttachments
        });

        return res.status(200).json({ success: true, message: "E-Mail erfolgreich gesendet." });
        
    } catch (error) {
        console.error("Route Fehler:", error);
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