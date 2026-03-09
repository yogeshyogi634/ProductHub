import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [emailPrefix, setEmailPrefix] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Update email when emailPrefix changes
  const updateEmailFromPrefix = (prefix) => {
    setEmailPrefix(prefix);
    setEmail(prefix ? `${prefix}@neokred.tech` : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!emailPrefix.trim()) {
        throw new Error("Please enter your email prefix.");
      }

      if (!email.endsWith("@neokred.tech")) {
        throw new Error("Only @neokred.tech emails are allowed.");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success
      setSent(true);
      setLoading(false);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4">
      {/* Decorative accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

      <div className="w-full max-w-md" style={{ minWidth: "400px" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="flex items-center justify-center mb-4"
            // onClick={() => setActiveProduct("Neokred")}
            title="Neokred Feed"
          >
            <img
              src="/assets/nk-logo.svg"
              alt="Neokred"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-text-default-primary">
            Forgot Password
          </h1>
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
              <div className="mx-auto w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-primary"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p className="text-text-default-secondary text-sm mb-2">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="text-brand-primary font-medium mb-6">{email}</p>
              <p className="text-text-default-secondary/60 text-xs mb-6">
                If you don&apos;t see the email, check your spam folder. The
                link expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-brand-primary hover:opacity-80 text-sm font-medium transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="text"
                    value={emailPrefix}
                    onChange={(e) => updateEmailFromPrefix(e.target.value)}
                    placeholder="Email"
                    required
                    className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-l-lg border border-stroke-default-primary text-text-default-primary focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
                  />
                  <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-stroke-default-primary bg-background-card-secondary text-text-default-secondary text-sm">
                    @neokred.tech
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !emailPrefix.trim()}
                className="w-full py-3 bg-brand-primary hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
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
                Remember your password?
                <Link
                  to="/login"
                  className="text-brand-primary hover:opacity-80 font-medium transition-colors"
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
