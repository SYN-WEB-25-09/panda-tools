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
Wichtig für die Verbindung im lokalen WLAN-Netzwerk.\
VITE_IPV4=deine.lokale.ipv4.adresse

### FIREBASE CONFIGURATION
Kopiere diese Werte aus deinen Firebase-Projekteinstellungen (Web-App)\
VITE_FIREBASE_APIKEY=dein_firebase_api_key\
VITE_FIREBASE_AUTHDOMAIN=dein_projekt_id.firebaseapp.com\
VITE_FIREBASE_PROJECTID=dein_projekt_id\
VITE_FIREBASE_STORAGEBUCKET=dein_projekt_id.appspot.com\
VITE_FIREBASE_APPID=deine_app_id

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