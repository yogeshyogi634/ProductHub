import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function PendingApprovalPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Check for pending user info first
                const pendingUserStr = localStorage.getItem("nk_pending_user");
                if (!pendingUserStr) {
                    navigate("/login", { replace: true });
                    return;
                }
                
                const pendingUser = JSON.parse(pendingUserStr);
                setUserInfo(pendingUser);

                // Check current user status from server
                try {
                    const response = await api.getMe();
                    if (response.user && response.user.isVerified) {
                        // User has been approved, redirect to main app
                        localStorage.removeItem("nk_pending_user");
                        
                        const legacyProfile = {
                            ...response.user,
                            id: response.user.id,
                            full_name: response.user.name,
                            designation: response.user.department,
                            role: response.user.role,
                            is_approved: response.user.isVerified
                        };

                        localStorage.setItem("nk_user", JSON.stringify(response.user));
                        localStorage.setItem("nk_profile", JSON.stringify(legacyProfile));
                        
                        window.location.href = "/";
                    }
                } catch (statusErr) {
                    // User might not be logged in anymore, continue showing pending page
                    console.log("Could not fetch user status:", statusErr.message);
                }
            } catch (err) {
                console.error("Error checking status:", err);
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

        // Poll for changes every 30 seconds
        const interval = setInterval(() => {
            checkStatus();
        }, 30000);

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
        <div className=" min-h-screen flex items-center justify-center bg-background-app px-4 py-8">
            {/* Decorative accent */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-wakame via-brand-primary to-brand-wakame" />

            <div className="w-full max-w-4xl mx-auto flex justify-center items-center">
                {/* Main Card */}
                <div className="w-full max-w-[900px] bg-background-card-primary border border-stroke-default-primary rounded-2xl p-8 sm:p-10 shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Section - Icon & Header */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl items-center justify-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-text-default-primary mb-4 leading-tight">
                                Account Pending Approval
                            </h1>
                            <p className="text-text-default-secondary text-lg leading-relaxed">
                                Your account has been created successfully! An administrator needs to approve your request before you can access the platform.
                            </p>
                        </div>

                        {/* Right Section - Content */}
                        <div className="w-full">
                            {/* User Info */}
                            {userInfo && (
                                <div className="bg-background-card-secondary border border-stroke-default-primary rounded-xl p-5 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center">
                                            <span className="text-brand-primary font-semibold text-lg">
                                                {userInfo.name?.charAt(0)?.toUpperCase() || userInfo.email?.charAt(0)?.toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-text-default-primary font-semibold text-lg">{userInfo.name || "User"}</p>
                                            <p className="text-text-default-secondary">{userInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Card */}
                            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/50 rounded-xl p-6 mb-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                            <path d="M9 11l3 3L22 4" />
                                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-default-primary">What happens next?</h3>
                                </div>
                                <div className="space-y-5 text-text-default-secondary ml-12">
                                    <div className="flex items-start gap-4">
                                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                        <p className="text-base leading-relaxed">An administrator will review your registration details</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                        <p className="text-base leading-relaxed">
                                            This process typically takes{" "}
                                            <span className="font-bold text-text-default-primary px-3 py-1.5 bg-yellow-100/90 rounded-lg">
                                                12 to 24 hours
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                        <p className="text-base leading-relaxed">Once approved, you'll be able to sign in and access all features</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                                        <p className="text-base leading-relaxed">This page will automatically refresh when your account is approved</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="text-center lg:text-left">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("nk_pending_user");
                                        localStorage.removeItem("nk_user");
                                        localStorage.removeItem("nk_profile");
                                        navigate("/login", { replace: true });
                                    }}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-background-card-secondary hover:bg-stroke-default-primary/20 border border-stroke-default-primary rounded-xl text-text-default-primary font-semibold transition-all duration-200 hover:shadow-md"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 12H5" />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Return to Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {/* <div className="text-center mt-8">
                    <p className="text-text-default-secondary/60 text-base">
                        Need help? Contact your system administrator
                    </p>
                </div> */}
            </div>
        </div>
    );
}
