import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Loader2, AlertCircle } from "lucide-react"
import { UAParser } from "ua-parser-js";
import { useRedirect } from "../hooks/useRedirect"
import { AdvancedDeviceInfo } from "../ts/redirect";

export default function Redirect() {
    const { id } = useParams<{id: string}>();
    const [deviceInfo, setDeviceInfo] = useState<AdvancedDeviceInfo | null>(null);
    const [isDataReady, setIsDataReady] = useState<boolean>(false);

    useEffect(() => {
        const collectData = async () => {
            try {
                const parser = new UAParser()
                const result = parser.getResult();

                let countryName = "Unbekannt";
                try {
                    const ipResponse = await fetch("https://ipapi.co/json/");
                    const ipData = await ipResponse.json();

                    if (ipData && ipData.country_name) {
                        countryName = ipData.country_name;
                    }
                } catch (e) {
                    console.warn("Länder-Ermittlung über IP fehlgeschlagen:", e)
                }

                const currentTimestamp = new Date().toLocaleString("de-DE", {
                    dateStyle: "medium",
                    timeStyle: "medium"
                });

                const fullAnalytics: AdvancedDeviceInfo = {
                    deviceType: result.device.type ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1) : "Desktop",
                    deviceBrand: result.device.vendor || (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad") ? "Apple" : "Unbekannt"),
                    browser: `${result.browser.name || "Unbekannt"} (v${result.browser.version?.split(".")[0] || "?"})`,
                    os: `${result.os.name || "Unbekannt"} ${result.os.version || ""}`,
                    country: countryName,
                    language: navigator.language,
                    timestamp: currentTimestamp
                }

                setDeviceInfo(fullAnalytics);

            } catch (error) {
                console.error("Fehler beim Zusammenstellen der Gerätedaten:", error)
                setDeviceInfo(null);
            } finally {
                setIsDataReady(true);
            }
        };

        collectData();
    }, []);

    const [error] = useRedirect(id, deviceInfo, isDataReady);

    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            {error ? (
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-lg">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                        Link konnte nicht geöffnet werden
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 font-medium">
                        {error}
                    </p>
                    <a href="/"
                       className="mt-5 inline-block text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400">
                        Zurück zum Dashboard
                    </a>
                </div>
            ) : (
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Link wird geöffnet...
                    </h2>
                </div>
            )}
        </div>
    );
}