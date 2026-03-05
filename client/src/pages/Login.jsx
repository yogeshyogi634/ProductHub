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
    <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4">
      {/* Decorative accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />

      <div className="w-full max-w-md" style={{ minWidth: "400px" }}>
        {/* Logo / Brand */}
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
            Welcome Back
          </h1>
          <p className="text-text-default-secondary text-sm mt-1">
            Sign in to Neokred Wall
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Success */}
            {success && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

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
              <div className="flex rounded-lg shadow-sm">
                <input
                  type="text"
                  value={emailPrefix}
                  onChange={(e) => updateEmailFromPrefix(e.target.value)}
                  placeholder="Email"
                  required
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-l-lg border border-stroke-default-primary text-text-default-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                />
                <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-stroke-default-primary bg-background-card-secondary text-text-default-secondary text-sm">
                  @neokred.tech
                </span>
              </div>
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
                className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !emailPrefix.trim()}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/15"
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
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
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
