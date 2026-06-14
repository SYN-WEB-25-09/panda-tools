import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import ImageLibrary from "./pages/ImageLibrary";
import QRCodeOverview from "./pages/QRCodeOverview"
import QRCodeDetail from "./pages/QRCodeDetail"
import QRCodeGenerator from "./pages/QRCodeGenerator";
import ShortLinkOverview from "./pages/ShortLinkOverview";
import ShortLinkDetail from "./pages/ShortLinkDetail";
import ShortLinkGenerator from "./pages/ShortLinkGenerator";
import Redirect from "./components/Redirect";
import NotFound from "./pages/NotFound";
import FirebaseAuth from "./pages/FirebaseAuth"
import UserManagement from "./components/firebase/UserManagement"
import ResetPassword from "./pages/ResetPassword";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<FirebaseAuth />} />
            <Route path="/profile" element={<UserManagement />} />
            <Route path="/image-library" element={<ImageLibrary />} />
            <Route path="/qrcodes" element={<QRCodeOverview />} />
            <Route path="/qrcodes/:id" element={<QRCodeDetail />} />
            <Route path="/qrcodes/new" element={<QRCodeGenerator />} />
            <Route path="/short-links" element={<ShortLinkOverview />} />
            <Route path="/short-links/:id" element={<ShortLinkDetail />} />
            <Route path="/short-links/new" element={<ShortLinkGenerator />} />
            <Route path="/r/:id" element={<Redirect />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}