import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

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
            if (!email.endsWith("@neokred.tech")) {
                throw new Error("Only @neokred.tech emails are allowed.");
            }

            const response = await api.signin({ email, password });

            if (response.user) {
                // Legacy compatibility
                const legacyProfile = {
                    ...response.user,
                    id: response.user.id,
                    full_name: response.user.name,
                    designation: response.user.department, // Map server field to client field
                    role: response.user.role, // Include role
                    is_approved: true
                };

                localStorage.setItem("nk_user", JSON.stringify(response.user));
                localStorage.setItem("nk_profile", JSON.stringify(legacyProfile));
                
                // Force reload/redirect
                window.location.href = "/";
            } else {
                 throw new Error("Login failed.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Invalid credentials. Please try again.");
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
