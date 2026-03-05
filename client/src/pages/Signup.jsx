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
    <div className="min-h-screen w-screen flex items-center justify-center bg-background-app px-4 py-8">
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
            Create Account
          </h1>
          <p className="text-text-default-secondary text-sm mt-1">
            Join the Neokred Wall
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-8 shadow-sm">
          <form
            onSubmit={step === "details" ? handleSendOtp : handleVerifyOtp}
            className="space-y-4"
          >
            {/* Error */}
            {error && (
              <div className="bg-background-actions-error/10 border border-background-actions-error/30 text-background-actions-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {step === "details" ? (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                    Email
                  </label>
                  <div className="flex rounded-lg shadow-sm">
                    <input
                      type="text"
                      value={emailPrefix}
                      onChange={(e) => {
                        updateEmailFromPrefix(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      placeholder="Email"
                      required
                      className={`flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-l-lg border text-text-default-primary focus:outline-none focus:ring-2 transition-all ${
                        emailError
                          ? "border-background-actions-error/50 focus:ring-background-actions-error/30 focus:border-background-actions-error/50"
                          : "border-stroke-default-primary focus:ring-brand-primary/40 focus:border-brand-primary"
                      }`}
                    />
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-stroke-default-primary bg-background-card-secondary text-text-default-secondary text-sm">
                      @neokred.tech
                    </span>
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-background-actions-error text-xs flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
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
                <div>
                  <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                    Password
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

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className={`w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all appearance-none ${
                      designation
                        ? "text-text-default-primary"
                        : "text-text-default-secondary/50"
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10L6 8z' fill='%23525252'/%3E%3C/svg%3E")`,
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
              <div>
                <label className="block text-sm font-medium text-text-default-primary mb-1.5">
                  Enter User Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    autoFocus
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white border border-stroke-default-primary rounded-lg text-text-default-primary placeholder-text-default-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Edit Details
                  </button>
                </div>
                <p className="text-xs text-text-default-secondary mt-2">
                  A verification code has been sent to{" "}
                  <span className="font-medium text-text-default-primary">
                    {email}
                  </span>
                  . Please enter it to complete signup.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                (step === "details" && (!!emailError || !emailPrefix.trim()))
              }
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/15 mt-2"
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
                  {step === "details"
                    ? "Sending Code…"
                    : "Verifying & Creating Account…"}
                </span>
              ) : step === "details" ? (
                "Verify Email"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-stroke-default-primary text-center">
            <p className="text-text-default-secondary text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-default-secondary/60 text-xs mt-6">
          Only @neokred.tech email addresses are allowed
        </p>
      </div>

      {/* Admin Approval Popup */}
      {showApprovalPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-stroke-default-primary rounded-xl p-6 shadow-lg w-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                <svg
                  className="w-6 h-6 text-orange-600"
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

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Account Created!
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                Admin needs to approve your request before you can access the
                platform.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-orange-800 text-xs font-medium">
                  📧 We'll notify you via email once approved.
                </p>
              </div>

              <button
                onClick={handleClosePopup}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
