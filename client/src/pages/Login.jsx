import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!email.endsWith("@neokred.tech")) {
                throw new Error("Only @neokred.tech emails are allowed.");
            }

            let userToLogin = null;
            let profileToLogin = null;

            // 1. Check Hardcoded Admin
            if (email === "madhav@neokred.tech" && password === "Madhav@0123") {
                userToLogin = {
                    id: "admin_user",
                    email: "madhav@neokred.tech",
                };
                profileToLogin = {
                    id: "admin_user",
                    full_name: "Madhav",
                    email: "madhav@neokred.tech",
                    designation: "Administrator",
                    role: "admin",
                    is_approved: true,
                };
            } else {
                // 2. Check Mock DB for other users
                const existingUsersStr = localStorage.getItem("nk_all_users");
                const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
                
                const foundUser = existingUsers.find(u => u.email === email);

                if (foundUser) {
                    // Simple password check (store password in plain text for this mock)
                    if (foundUser.password === password) {
                         userToLogin = {
                            id: foundUser.id,
                            email: foundUser.email,
                        };
                        profileToLogin = foundUser;
                    } else {
                        throw new Error("Invalid password.");
                    }
                } else {
                    // Fallback for "legacy" users or seeded data if not in DB, 
                    // OR throw error if we want strict DB only.
                    // For now, let's strict check against DB OR check against the hardcoded mock logic from before as fallback?
                    // actually let's treat the MOCK_USERS in Admin as the seed if DB is empty?
                    // For simplicity, let's strict check.
                     throw new Error("User not found. Please sign up.");
                }
            }

            localStorage.setItem("nk_user", JSON.stringify(userToLogin));
            localStorage.setItem("nk_profile", JSON.stringify(profileToLogin));

            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4">
            {/* Decorative accent */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-wakame via-brand-primary to-brand-wakame" />

            <div className="w-full max-w-md" style={{ minWidth: "400px" }}>
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-wakame mb-4 shadow-lg shadow-brand-wakame/20">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-default-primary">Welcome Back</h1>
                    <p className="text-text-default-secondary text-sm mt-1">Sign in to Neokred Wall</p>
                </div>

                {/* Card */}
                <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="bg-background-actions-error/10 border border-background-actions-error/30 text-background-actions-error px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@neokred.tech"
                                required
                                className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                            />
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right -mt-1">
                            <Link
                                to="/forgot-password"
                                className="text-xs text-brand-wakame hover:text-brand-wakame/80 font-medium transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
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
                                    Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-stroke-default-primary text-center">
                        <p className="text-text-default-secondary text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-brand-wakame hover:text-brand-wakame/80 font-medium transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-text-default-secondary/60 text-xs mt-6">
                    Only @neokred.tech email addresses are allowed
                </p>
            </div>
        </div>
    );
}
