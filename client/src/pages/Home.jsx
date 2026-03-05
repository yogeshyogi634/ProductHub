import { useEffect } from "react";
import { Navbar } from "../components/layout/Navbar";
import { ProductUpdates } from "../components/layout/ProductUpdates";
import { FeedbackWall } from "../components/layout/FeedbackWall";
import { NewUpdateModal } from "../components/features/NewUpdateModal";
import { useStore } from "../lib/store";

export default function Home() {
    const { activeProduct, setAuthUser } = useStore();
    const isCompany = activeProduct === "Neokred";

    useEffect(() => {
        const storedUser = localStorage.getItem("nk_user");
        const storedProfile = localStorage.getItem("nk_profile");
        if (storedUser && storedProfile) {
            setAuthUser({
                user: JSON.parse(storedUser),
                profile: JSON.parse(storedProfile)
            });
        }
    }, [setAuthUser]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-background-app via-background-app to-orange-50/30 font-sans relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-primary)/3,_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-brand-primary)/2,_transparent_70%)]" />
            
            <Navbar />
            <div className="flex flex-1 w-full overflow-hidden relative z-10">
                {!isCompany && <ProductUpdates />}
                <FeedbackWall />
            </div>
            {!isCompany && <NewUpdateModal />}
        </div>
    );
}
