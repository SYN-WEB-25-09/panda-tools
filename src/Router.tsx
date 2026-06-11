import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import ImageLibrary from "./pages/ImageLibrary";
import QRCodeOverview from "./pages/QRCodeOverview"
import QRCodeDetail from "./pages/QRCodeDetail"
import QRCodeGenerator from "./pages/QRCodeGenerator";
import Redirect from "./components/Redirect";
import NotFound from "./pages/NotFound";
import FirebaseAuth from "./pages/FirebaseAuth"
import UserManagement from "./components/firebase/UserManagement"

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<FirebaseAuth />} />
            <Route path="/profile" element={<UserManagement />} />
            <Route path="/image-library" element={<ImageLibrary />} />
            <Route path="/qrcode" element={<QRCodeOverview />} />
            <Route path="/qrcode/:id" element={<QRCodeDetail />} />
            <Route path="/qrcode/qrcode-generator" element={<QRCodeGenerator />} />
            <Route path="/r/:id" element={<Redirect />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}