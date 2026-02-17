import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock success
            setSent(true);
            setLoading(false);
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
                    <h1 className="text-2xl font-bold text-text-default-primary">Forgot Password</h1>
                    <p className="text-text-default-secondary text-sm mt-1">
                        {sent
                            ? "Check your email for the reset link"
                            : "Enter your email to receive a reset link"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-8 shadow-sm">
                    {sent ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-brand-wakame/10 flex items-center justify-center mb-5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-wakame">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <p className="text-text-default-secondary text-sm mb-2">
                                We&apos;ve sent a password reset link to:
                            </p>
                            <p className="text-brand-wakame font-medium mb-6">{email}</p>
                            <p className="text-text-default-secondary/60 text-xs mb-6">
                                If you don&apos;t see the email, check your spam folder. The link expires in 1 hour.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-brand-wakame hover:text-brand-wakame/80 text-sm font-medium transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        /* Form State */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-background-actions-error/10 border border-background-actions-error/30 text-background-actions-error px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

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
                                        Sending…
                                    </span>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    {!sent && (
                        <div className="mt-6 pt-6 border-t border-stroke-default-primary text-center">
                            <p className="text-text-default-secondary text-sm">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-brand-wakame hover:text-brand-wakame/80 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
