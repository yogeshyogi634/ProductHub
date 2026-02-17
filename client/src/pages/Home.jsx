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
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background-app font-sans">
            <Navbar />
            <div className="flex flex-1 w-full overflow-hidden">
                {!isCompany && <ProductUpdates />}
                <FeedbackWall />
            </div>
            {!isCompany && <NewUpdateModal />}
        </div>
    );
}
