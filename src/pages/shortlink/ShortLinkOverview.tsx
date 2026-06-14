import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, Plus } from "lucide-react";
import ShortLinkCard from "../../components/shortlink/ShortLinkCard";
import OverviewHeader from "../../components/OverviewHeader";
import SearchInput from "../../components/ui/SearchInput";
import ItemStatusGrid from "../../components/ItemStatusGrid";
import { useFirebaseAuth } from "../../context/FirebaseAuthContext"
import { useShortLinksSearch, useDeleteShortLink } from "../../hooks/useShortLink";
import { useItemDelete } from "../../hooks/useItemDelete";

export default function ShortLinkOverview() {
    const navigate = useNavigate();
    const { user } = useFirebaseAuth();
    const [searchTerm, setSearchTerm] = useState<string>("");

    const { triggerDelete, isDeleting } = useDeleteShortLink();
    const { refetchNonce, handleDelete } = useItemDelete(
        triggerDelete, 
        "Möchtest du diesen Short-Link wirklich löschen?"
    );

    const [results, error, isLoading] = useShortLinksSearch(user?.uid, searchTerm, refetchNonce);

    return (
        <div className="w-full max-w-5xl mx-auto py-6 px-4">
            <OverviewHeader 
                title="Meine Short-Links"
                count={results.length}
                countLabelSingular="Short-Link"
                countLabelPlural="Short-Links"
                buttonText="Kurzlink erstellen"
                buttonIcon={Plus}
                onButtonClick={() => navigate("/short-links/new")} 
            />
            
            <SearchInput 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Short-Links durchsuchen..."
            />
            
            <ItemStatusGrid
                error={error}
                isLoading={isLoading || isDeleting}
                loadingText={isDeleting ? "Short-Link wird gelöscht..." : "Lade deine Short-Links..."}
                isEmpty={results.length === 0}
                Icon={Link}
                title="Keine Short-Links gefunden"
                description="Kürze deinen ersten Link, indem du oben rechts auf den Button klickst."
            >
                {results.map((link) => (
                    <ShortLinkCard 
                        key={link.id}
                        id={link.id}
                        title={link.title}
                        url={link.url}
                        clickCount={link.clickCount}
                        trackingActive={link.trackingActive}
                        createdAt={link.createdAt}
                        onDelete={() => handleDelete(link.id ?? "")} 
                    />
                ))}
            </ItemStatusGrid>
        </div>
    )
}