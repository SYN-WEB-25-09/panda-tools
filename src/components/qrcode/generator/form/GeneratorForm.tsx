import NameUrlSection from "./NameUrlSection";
import TrackingSection from "./TrackingSection";
import StyleSection from "./StyleSection";
import LogoSection from "./LogoSection";

type GeneratorFormProps = {
    title: string;
    setTitle: (val: string) => void;
    baseUrl: string;
    setBaseUrl: (val: string) => void;
    isTrackingEnabled: boolean;
    setIsTrackingEnabled: (val: boolean) => void;
    fgColor: string;
    setFgColor: (val: string) => void;
    bgColor: string;
    setBgColor: (val: string) => void;
    isTransparent: boolean;
    setIsTransparent: (val: boolean) => void;
    exportFormat: string;
    logo: string;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveLogo: () => void;
    logoSize: number;
    setLogoSize: (val: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isUserLoggedIn: boolean;
};

export default function GeneratorForm({
    title, setTitle,
    baseUrl, setBaseUrl,
    isTrackingEnabled, setIsTrackingEnabled,
    fgColor, setFgColor,
    bgColor, setBgColor,
    isTransparent, setIsTransparent,
    exportFormat,
    logo, handleLogoUpload, handleRemoveLogo,
    logoSize, setLogoSize, fileInputRef,
    isUserLoggedIn
}: GeneratorFormProps) {
    return (
        <div className="lg:col-span-7 flex flex-col gap-6">
            <NameUrlSection 
                title={title} 
                setTitle={setTitle} 
                baseUrl={baseUrl} 
                setBaseUrl={setBaseUrl} 
            />
            
            <TrackingSection 
                isTrackingEnabled={isTrackingEnabled} 
                setIsTrackingEnabled={setIsTrackingEnabled} 
                isUserLoggedIn={isUserLoggedIn}
            />
            
            <StyleSection 
                fgColor={fgColor} 
                setFgColor={setFgColor} 
                bgColor={bgColor} 
                setBgColor={setBgColor} 
                isTransparent={isTransparent} 
                setIsTransparent={setIsTransparent} 
                exportFormat={exportFormat} 
            />
            
            <LogoSection 
                logo={logo} 
                logoSize={logoSize} 
                setLogoSize={setLogoSize} 
                handleLogoUpload={handleLogoUpload} 
                handleRemoveLogo={handleRemoveLogo} 
                fileInputRef={fileInputRef} 
            />
        </div>
    );
}