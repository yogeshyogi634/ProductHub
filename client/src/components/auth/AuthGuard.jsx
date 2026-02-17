import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGuard({ children }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            try {
                const storedUser = localStorage.getItem("nk_user");
                const storedProfile = localStorage.getItem("nk_profile");

                if (!storedUser || !storedProfile) {
                    navigate("/login", { replace: true });
                    return;
                }

                const parsedProfile = JSON.parse(storedProfile);

                // Check if user is approved
                if (!parsedProfile.is_approved) {
                    navigate("/pending-approval", { replace: true });
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error("Auth check failed:", err);
                navigate("/login", { replace: true });
            }
        };

        checkSession();
        
        // Listen for storage changes in other tabs
        const handleStorageChange = (e) => {
            if (e.key === "nk_user" && !e.newValue) {
                 navigate("/login", { replace: true });
            }
        };
        
        window.addEventListener("storage", handleStorageChange);

        return () => window.removeEventListener("storage", handleStorageChange);
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-app">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-default-secondary text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    return children;
}
