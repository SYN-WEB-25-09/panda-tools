# Panda Tools 🐼

Ein praktisches Tool-Set. Diese Anwendung nutzt Firebase für das Backend/Datenmanagement und erfordert für die lokale Kommunikation (z.B. zwischen einer mobilen App/Frontend und einem lokalen Server) die Konfiguration deiner lokalen IPv4-Adresse.

## 🚀 Voraussetzungen

Stelle sicher, dass du folgende Tools auf deinem System installiert hast:
- [Node.js](https://nodejs.org/) (aktuelle LTS-Version empfohlen)
- Ein registriertes [Firebase-Projekt](https://console.firebase.google.com/)

## 🛠️ Installation & Setup

1. **Repository klonen:**
   ```bash
   git clone [https://github.com/SYN-WEB-25-09/panda-tools.git](https://github.com/SYN-WEB-25-09/panda-tools.git)
   cd panda-tools

2. **Abhängigkeiten installieren:**\
`npm install`\
oder falls du yarn nutzt:\
`yarn install`

3. **Umgebungsvariablen konfigurieren (.env)**
### LOKALE NETZWERK-KONFIGURATION
Ersetze dies mit deiner tatsächlichen lokalen IPv4-Adresse (z.B. 192.168.1.50)\
Wichtig für die Verbindung im lokalen WLAN-Netzwerk.
LOCAL_IPV4_ADDRESS=deine.lokale.ipv4.adresse

### FIREBASE CONFIGURATION
Kopiere diese Werte aus deinen Firebase-Projekteinstellungen (Web-App)
FIREBASE_API_KEY=dein_firebase_api_key
FIREBASE_AUTH_DOMAIN=dein_projekt_id.firebaseapp.com
FIREBASE_PROJECT_ID=dein_projekt_id
FIREBASE_STORAGE_BUCKET=dein_projekt_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=deine_messaging_sender_id
FIREBASE_APP_ID=deine_app_id
FIREBASE_MEASUREMENT_ID=deine_measurement_id

💡 Tipp zur IPv4-Adresse:

- Windows (Eingabeaufforderung): Öffne die CMD und tippe ipconfig ein. Suche nach IPv4-Adresse.

- Mac / Linux (Terminal): Öffne das Terminal und tippe ifconfig oder ip a ein (oft unter en0 oder wlan0 zu finden).

4. **WICHTIGER HINWEIS ZUM DATENSCHUTZ**
Die .env-Datei enthält sensible Anmeldedaten und sollte niemals auf GitHub hochgeladen werden. Vergewissere dich, dass deine .gitignore-Datei den Eintrag .env enthält.

## 🏃‍♂️ Anwendung starten
`npm start`\
oder für den Entwicklungsmodus (falls konfiguriert):\
`npm run dev`

## 📄 Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert – siehe die LICENSE Datei für Details.