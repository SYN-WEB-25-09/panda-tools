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

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { 
        error: "Zu viele Anfragen. Bitte warte eine Stunde, bevor du es erneut versuchst." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
    "https://panda-tools.de",
    "https://www.panda-tools.de",
    "http://localhost:5173",
    "http://localhost:3000"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Nicht erlaubt durch CORS-Richtlinie"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";
const frontend_url = isProduction ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV;

try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        const jsonPath = path.join(__dirname, "../serviceAccountKey.json");
        serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    }
    
    initializeApp({
        credential: cert(serviceAccount)
    });
    
    console.log("🚀 Firebase Admin erfolgreich initialisiert.");
} catch (error) {
    console.error("❌ Fehler beim Initialisieren von Firebase:", error.message);
    throw error; 
}

/*try {
    const jsonPath = path.join(__dirname, "../serviceAccountKey.json");
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    
    initializeApp({
        credential: cert(serviceAccount)
    });
    
    console.log("🚀 Firebase Admin erfolgreich initialisiert.");
} catch (error) {
    console.error("❌ Fehler beim Initialisieren von Firebase:", error.message);
    process.exit(1);
}*/

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: parseInt(process.env.SMTP_PORT || "465") === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error) => {
    if (error) {
        console.error("❌ SMTP Verbindung fehlgeschlagen:", error.message);
    } else {
        console.log("📧 SMTP Server ist bereit für den E-Mail-Versand.");
    }
});

app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "E-Mail-Adresse wird benötigt."});
    }

    try {
        const actionCodeSettings = {
            url:`${frontend_url}/reset-password`,
            handleCodeInApp: true,
        }

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
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
                    .container { max-width: 550px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                    .header { padding: 40px 0; text-align: center; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
                    .content { padding: 40px; text-align: center; }
                    .logo-img { width: 64px; height: 64px; margin-bottom: 16px; }
                    h1 { color: #0f172a; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.025em; }
                    .highlight { color: #9333ea; }
                    p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0; }
                    .btn { display: inline-block; background: #9333ea; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.2); transition: background 0.2s; }
                    .footer { padding: 24px; background: #f8fafc; color: #94a3b8; font-size: 11px; text-align: center; border-top: 1px solid #f1f5f9; line-height: 1.5; }
                    .link-alt { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 36px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px dashed #e2e8f0; text-align: left; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:logo" alt="Panda Tools Logo" class="logo-img">
                        <h1>Panda <span class="highlight">Tools</span></h1>
                    </div>
                    <div class="content">
                        <p>Hallo,<br><br>wir haben eine Anfrage zum Zurücksetzen deines Passworts für dein Panda Tools Konto erhalten. Klicke auf den folgenden Button, um ein neues Passwort festzulegen:</p>
                        
                        <a href="${customResetLink}" class="btn" target="_blank">Passwort zurücksetzen</a>
                        
                        <div class="link-alt">
                            <strong>Link funktioniert nicht?</strong> Kopiere die folgende URL in deinen Browser:<br>
                            <span style="color: #9333ea;">${customResetLink}</span>
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

        await transporter.sendMail({
            from: `"Panda Tools" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Passwort zurücksetzen - Panda Tools",
            html: htmlEmail,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, 'assets/logo.png'),
                cid: 'logo'
            }]
        });

        return res.status(200).json({ success: true, message: "E-Mail erfolgreich gesendet."})
        
    } catch (error) {
        console.error("Fehler beim Generieren/Senden des Passwort-Rests:", error);

        if (error.code === "auth/user-not-found") {
            return res.status(444).json({ error: "Diese E-Mail-Adresse ist uns nicht bekannt."});
        }

        return res.status(500).json({ error: "Das Passwort konnte nicht zurückgesetzt werden. Versuche es später erneut."})
    }
});

if (!isProduction) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🤖 Lokales Panda Tools Backend läuft auf Port ${PORT}`);
    });
}

export default app;