import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

const DESIGNATIONS = [
  "Product Manager",
  "Engineer",
  "Designer",
  "QA",
  "Finance",
  "HR",
  "Marketing",
  "Other",
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [emailPrefix, setEmailPrefix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [step, setStep] = useState("details"); // 'details' | 'otp'

  // Update email when emailPrefix changes
  const updateEmailFromPrefix = (prefix) => {
    setEmailPrefix(prefix);
    setEmail(prefix ? `${prefix}@neokred.tech` : "");
    if (emailError && prefix) {
      validateEmail(`${prefix}@neokred.tech`);
    }
  };

  const validateEmail = (value) => {
    if (value && !value.endsWith("@neokred.tech")) {
      setEmailError("Only @neokred.tech email addresses are allowed");
      return false;
    }
    if (value && !value.includes("@")) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailPrefix.trim()) {
      setError("Please enter your email prefix");
      return;
    }

    if (!validateEmail(email)) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!designation) {
      setError("Please select your designation");
      return;
    }

    setLoading(true);

    try {
      await api.requestOtp({
        name: fullName,
        email,
        department: designation,
      });

      setStep("otp");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send verification code.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.signup({
        name: fullName,
        email,
        password,
        department: designation,
        otp,
      });

      // Show admin approval popup instead of redirecting
      setShowApprovalPopup(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowApprovalPopup(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background-app via-background-app to-orange-50 px-4 py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-primary)/5,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-brand-primary)/3,_transparent_50%)]" />

      {/* Animated gradient accent */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 animate-pulse" />

      <div
        className="w-full max-w-md relative z-10"
        style={{ minWidth: "400px" }}
      >
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
            Create Account
          </h1>
          <p className="text-text-default-secondary text-base font-medium">
            Join the Neokred Wall community
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-card-primary/80 backdrop-blur-xl border border-stroke-default-primary/50 rounded-2xl p-8 shadow-2xl shadow-black/5 relative overflow-hidden">
          {/* Card inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <form
            onSubmit={step === "details" ? handleSendOtp : handleVerifyOtp}
            className="space-y-4"
          >
            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/80 text-red-800 px-4 py-3 rounded-xl text-sm font-medium shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {step === "details" ? (
              <>
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-text-default-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-stroke-default-primary rounded-xl text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90 shadow-lg shadow-black/5 group-hover:shadow-orange-500/10"
                  />
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-text-default-primary mb-2">
                    Email Address
                  </label>
                  <div
                    className={`flex rounded-xl shadow-lg shadow-black/5 group-hover:shadow-orange-500/10 transition-all duration-300 ${
                      emailError ? "ring-2 ring-red-200" : ""
                    }`}
                  >
                    <input
                      type="text"
                      value={emailPrefix}
                      onChange={(e) => {
                        updateEmailFromPrefix(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      placeholder="Enter your email"
                      required
                      className={`flex-1 min-w-0 block w-full px-4 py-3.5 rounded-none rounded-l-xl border bg-white/80 backdrop-blur-sm text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 transition-all duration-300 hover:bg-white/90 ${
                        emailError
                          ? "border-red-300 focus:ring-red-500/30 focus:border-red-500"
                          : "border-stroke-default-primary focus:ring-orange-500/30 focus:border-orange-500"
                      }`}
                    />
                    <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-stroke-default-primary bg-background-card-secondary/80 backdrop-blur-sm text-text-default-secondary text-sm font-medium">
                      @neokred.tech
                    </span>
                  </div>
                  {emailError && (
                    <p className="mt-2 text-red-600 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {emailError}
                    </p>
                  )}
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
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-stroke-default-primary rounded-xl text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90 shadow-lg shadow-black/5 group-hover:shadow-orange-500/10"
                  />
                </div>

                {/* Designation */}
                <div className="group">
                  <label className="block text-sm font-semibold text-text-default-primary mb-2">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className={`w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-stroke-default-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90 shadow-lg shadow-black/5 group-hover:shadow-orange-500/10 appearance-none ${
                      designation
                        ? "text-text-default-primary"
                        : "text-text-default-secondary/60"
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10L6 8z' fill='%23f97316'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                    }}
                  >
                    <option value="" disabled>
                      Select your designation
                    </option>
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              /* OTP Step */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-text-default-primary mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-text-default-secondary">
                    We've sent a verification code to{" "}
                    <span className="font-semibold text-orange-600">
                      {email}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-text-default-primary mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      autoFocus
                      maxLength={6}
                      className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-stroke-default-primary rounded-xl text-text-default-primary placeholder-text-default-secondary/60 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 hover:bg-white/90 shadow-lg shadow-black/5 group-hover:shadow-orange-500/10 tracking-widest text-center text-lg font-mono"
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-all duration-300 hover:underline underline-offset-2 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg border border-orange-200"
                    >
                      ← Edit Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                (step === "details" && (!!emailError || !emailPrefix.trim()))
              }
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group mt-6"
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
                  <span className="font-semibold">
                    {step === "details" ? "Sending Code…" : "Creating Account…"}
                  </span>
                </span>
              ) : (
                <span className="relative z-10 text-lg">
                  {step === "details"
                    ? "Send Verification Code"
                    : "Create Account"}
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-stroke-default-primary/30 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background-card-primary px-4 text-text-default-secondary/60 text-xs font-medium uppercase tracking-wider">
              Already Member?
            </div>
            <p className="text-text-default-secondary text-base font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-500 hover:text-orange-600 font-bold transition-all duration-300 hover:underline underline-offset-2"
              >
                Sign In
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

      {/* Admin Approval Popup */}
      {showApprovalPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-stroke-default-primary/50 rounded-2xl p-8 shadow-2xl  transform animate-in zoom-in-95 duration-300">
            <div className="text-center">
              {/* Success Icon with animation */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-100 to-orange-200 mb-6 animate-bounce">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text mb-3">
                Account Created!
              </h3>

              <p className="text-text-default-secondary text-base mb-6 leading-relaxed">
                Your account has been created successfully. Our admin team will
                review and approve your request shortly.
              </p>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200/80 rounded-xl p-4 mb-6">
                <p className="text-orange-800 text-sm font-semibold flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  We'll notify you via email once approved
                </p>
              </div>

              <button
                onClick={handleClosePopup}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 text-lg">
                  Perfect! Take me to login
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
