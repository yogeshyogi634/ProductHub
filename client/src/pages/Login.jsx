import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailPrefix, setEmailPrefix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Update email when emailPrefix changes
  const updateEmailFromPrefix = (prefix) => {
    setEmailPrefix(prefix);
    setEmail(prefix ? `${prefix}@neokred.tech` : "");
  };

  useEffect(() => {
    // Check for success message from signup
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state?.email) {
        const fullEmail = location.state.email;
        setEmail(fullEmail);
        // Extract prefix from full email for display
        if (fullEmail.includes("@neokred.tech")) {
          setEmailPrefix(fullEmail.split("@")[0]);
        }
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!emailPrefix.trim()) {
        throw new Error("Please enter your email prefix.");
      }

      if (!email.endsWith("@neokred.tech")) {
        throw new Error("Only @neokred.tech emails are allowed.");
      }

      const response = await api.signin({ email, password });
      console.log("FULL LOGIN RESPONSE:", JSON.stringify(response, null, 2));

      if (response.user) {
        console.log("User Verified Status:", response.user.isVerified);
        // Check if user is verified/approved
        if (!response.user.isVerified && response.user.role !== "ADMIN") {
          // Store user info temporarily for the pending approval page
          localStorage.setItem(
            "nk_pending_user",
            JSON.stringify({
              email: response.user.email,
              name: response.user.name,
            }),
          );
          navigate("/pending-approval", { replace: true });
          return;
        }

        // Legacy compatibility for approved users
        const legacyProfile = {
          ...response.user,
          id: response.user.id,
          full_name: response.user.name,
          designation: response.user.department, // Map server field to client field
          role: response.user.role, // Include role
          is_approved: response.user.isVerified,
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
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background-app via-background-app to-orange-50 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-primary)/5,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-brand-primary)/3,_transparent_50%)]" />
      
      {/* Animated gradient accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 animate-pulse" />

      <div className="w-full max-w-md relative z-10" style={{ minWidth: "400px" }}>
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="flex items-center justify-center mb-6 group cursor-pointer transform transition-transform duration-300 hover:scale-105"
            title="Neokred Feed"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all duration-300" />
              <img
                src="/assets/nk-logo.svg"
                alt="Neokred"
                className="h-12 w-auto object-contain relative z-10 transition-all duration-300 group-hover:drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text mb-2">
            Welcome Back
          </h1>
          <p className="text-text-default-secondary text-base font-medium">
            Sign in to your Neokred Wall
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-card-primary/80 backdrop-blur-xl border border-stroke-default-primary/50 rounded-2xl p-8 shadow-2xl shadow-black/5 relative overflow-hidden">
          {/* Card inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success */}
            {success && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200/80 text-orange-800 px-4 py-3 rounded-xl text-sm font-medium shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/80 text-red-800 px-4 py-3 rounded-xl text-sm font-medium shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-text-default-primary mb-2">
                Email Address
              </label>
              <div className="flex rounded-xl shadow-lg shadow-black/5 group-hover:shadow-orange-500/10 transition-all duration-300">
                <input
                  type="text"
                  value={emailPrefix}
                  onChange={(e) => updateEmailFromPrefix(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 min-w-0 block w-full px-4 py-3.5 rounded-none rounded-l-xl border border-stroke-default-primary bg-white/80 backdrop-blur-sm text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90"
                />
                <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-stroke-default-primary bg-background-card-secondary/80 backdrop-blur-sm text-text-default-secondary text-sm font-medium">
                  @neokred.tech
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-text-default-primary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-stroke-default-primary rounded-xl text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90 shadow-lg shadow-black/5 group-hover:shadow-orange-500/10"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right -mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-all duration-300 hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !emailPrefix.trim()}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {loading ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
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
                  <span className="font-semibold">Signing in…</span>
                </span>
              ) : (
                <span className="relative z-10 text-lg">Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-stroke-default-primary/30 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background-card-primary px-4 text-text-default-secondary/60 text-xs font-medium uppercase tracking-wider">
              New Here?
            </div>
            <p className="text-text-default-secondary text-base font-medium">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-orange-500 hover:text-orange-600 font-bold transition-all duration-300 hover:underline underline-offset-2"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-text-default-secondary/70 text-sm font-medium bg-background-card-secondary/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-stroke-default-primary/30">
            🔒 Only @neokred.tech email addresses are allowed
          </p>
        </div>
      </div>
    </div>
  );
}
