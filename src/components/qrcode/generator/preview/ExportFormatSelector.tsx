type ExportFormatSelectorProps = {
    exportFormat: string;
    setExportFormat: (val: string) => void;
    dpiScale: number;
    setDpiScale: (val: number) => void;
};

export default function ExportFormatSelector({ exportFormat, setExportFormat, dpiScale, setDpiScale }: ExportFormatSelectorProps) {
    return (
        <div className="w-full mt-6 flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Export-Format
                </label>
                <select value={exportFormat} 
                        onChange={(e) => setExportFormat(e.target.value)} 
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-hidden">
                    <option value="PNG">PNG (.png) — Ideal fürs Web</option>
                    <option value="JPG">JPG (.jpg) — Kompakt ohne Transparenz</option>
                    <option value="SVG">SVG (.svg) — Vektor Grafik</option>
                </select>
            </div>

            {exportFormat !== "SVG" && (
                <div className="flex flex-col gap-1">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Auflösung und DPI
                    </label>
                    <select value={dpiScale} 
                            onChange={(e) => setDpiScale(Number(e.target.value))} 
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:outline-hidden">
                        <option value={1}>72 DPI — Digitale Ansicht (256px)</option>
                        <option value={4}>300 DPI — Hochwertiger Druck (1024px)</option>
                        <option value={8}>600 DPI — Großformat & Plakat (2048px)</option>
                    </select>
                </div>
            )}
        </div>
    );
}