import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = () => {
            try {
                const storedUser = localStorage.getItem("nk_user");
                if (!storedUser) {
                    navigate("/login", { replace: true });
                    return;
                }
                const user = JSON.parse(storedUser);

                // Check against "DB"
                const allUsersStr = localStorage.getItem("nk_all_users");
                const allUsers = allUsersStr ? JSON.parse(allUsersStr) : [];
                const foundUser = allUsers.find(u => u.email === user.email);

                if (foundUser && foundUser.is_approved) {
                    // Update session profile with valid role
                    localStorage.setItem("nk_profile", JSON.stringify(foundUser));
                    navigate("/", { replace: true });
                } else if (!foundUser) {
                     // Removed?
                     localStorage.removeItem("nk_user");
                     localStorage.removeItem("nk_profile");
                     navigate("/login", { replace: true });
                }
            } catch (err) {
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

        // Poll for changes
        const interval = setInterval(() => {
            checkStatus();
        }, 2000);

        return () => clearInterval(interval);
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-app">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-default-secondary text-sm">Checking status…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-text-default-primary mb-2">
                    Account Pending Approval
                </h1>
                
                <p className="text-text-default-secondary mb-8">
                    Your account has been created but is awaiting administrator approval. 
                    You&apos;ll be able to access the dashboard once approved.
                </p>

                <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-sm font-medium text-text-default-primary mb-2">What happens next?</h3>
                    <ul className="text-sm text-text-default-secondary space-y-2 list-disc pl-4">
                        <li>An admin will review your registration details.</li>
                        <li>This usually takes 24-48 hours.</li>
                        <li>Try refreshing this page later or check back tomorrow.</li>
                    </ul>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem("nk_user");
                        localStorage.removeItem("nk_profile");
                        navigate("/login", { replace: true });
                    }}
                    className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm transition-colors"
                >
                    Return to Sign In
                </button>
            </div>
        </div>
    );
}
