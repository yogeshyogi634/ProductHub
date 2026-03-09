import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Simulate checking for validity link
        const checkLink = async () => {
             await new Promise(resolve => setTimeout(resolve, 500));
             setSessionReady(true);
        }
        checkLink();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSuccess(true);
            setLoading(false);

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4">
            {/* Decorative accent */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-wakame via-brand-primary to-brand-wakame" />

            <div className="w-full max-w-md" style={{ minWidth: "400px" }}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-wakame mb-4 shadow-lg shadow-brand-wakame/20">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-default-primary">Reset Password</h1>
                    <p className="text-text-default-secondary text-sm mt-1">
                        {success ? "Your password has been updated" : "Enter your new password"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-8 shadow-sm">
                    {success ? (
                        /* Success state */
                        <div className="text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-[#edfcf2] flex items-center justify-center mb-5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#084c2e]">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="text-text-default-secondary text-sm mb-4">
                                Your password has been reset successfully. You&apos;ll be redirected to sign in shortly.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-brand-wakame hover:text-brand-wakame/80 text-sm font-medium transition-colors"
                            >
                                Sign in now
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    ) : !sessionReady ? (
                        /* Waiting for session */
                        <div className="text-center py-4">
                            <div className="w-8 h-8 border-2 border-brand-wakame border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-text-default-secondary text-sm">Verifying your reset link…</p>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-background-actions-error/10 border border-background-actions-error/30 text-background-actions-error px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-wakame hover:bg-brand-wakame/90 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-wakame/15"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Updating…
                                    </span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-text-default-secondary/60 text-xs mt-6">
                    <Link to="/login" className="hover:text-text-default-secondary transition-colors">
                        ← Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
