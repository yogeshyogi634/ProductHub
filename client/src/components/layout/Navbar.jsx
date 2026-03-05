import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { ProductLogo } from "../ui/ProductLogo";
import { DateRangeCalendar } from "../ui/DateRangeCalendar";
import { Link } from "react-router-dom";

export function Navbar() {
  const {
    activeProduct,
    setActiveProduct,
    setIsNewUpdateModalOpen,
    dateRangeStart,
    dateRangeEnd,
    setDateRange,
    clearDateRange,
    isDarkMode,
    toggleTheme,
    currentUser,
    signOut,
    authUser,
    products,
  } = useStore();

  const userRole = (authUser?.role || "EMPLOYEE").toUpperCase();

  // STRICT ADMIN CHECK: Only specific emails are allowed to see/access Admin Panel
  const ADMIN_EMAILS = ["madhav@neokred.tech"];
  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email);

  // Can post updates if: MANAGEMENT role, ADMIN role, or admin user
  // userRole comes from the database (assigned by admin in the Admin Panel)
  const canPostUpdates =
    userRole === "MANAGEMENT" || userRole === "ADMIN" || isAdmin;

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  // Format range for the button label
  const formatRangeLabel = () => {
    if (!dateRangeStart) return null;
    const fmt = (str) => {
      const [y, m, d] = str.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    };
    if (dateRangeStart && dateRangeEnd)
      return `${fmt(dateRangeStart)} — ${fmt(dateRangeEnd)}`;
    return fmt(dateRangeStart);
  };

  const hasFilter = !!dateRangeStart;

  return (
    <div className="w-full bg-background-app/80 backdrop-blur-xl border-b border-stroke-default-primary-v2/50 px-lg-2 py-lg flex justify-between items-center shrink-0 relative z-20">
      {/* Navbar glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      {/* Left: Product Tabs */}
      <div className="flex gap-md items-center h-10">
        {/* Company Logo */}
        <div
          className="h-full flex items-center pr-md mr-md border-r border-stroke-default-primary-v2/50 cursor-pointer group"
          title="Neokred Feed"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/10 rounded-lg blur-lg group-hover:bg-orange-500/20 transition-all duration-300 scale-110" />
            <img
              src="/assets/nk-logo.svg"
              alt="Neokred"
              className="h-6 w-auto object-contain relative z-10 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md"
            />
          </div>
        </div>

        {(products || [])
          .filter((product) => product !== "Neokred")
          .map((product) => {
            const isActive = product === activeProduct;
            return (
              <button
                key={product}
                onClick={() => setActiveProduct(product)}
                className={[
                  "rounded-lg px-md py-2xs flex gap-sm items-center h-full transition-all duration-300 relative overflow-hidden group cursor-pointer",
                  isActive
                    ? "bg-background-card-primary/80 backdrop-blur-sm border-[1.5px] border-orange-500 shadow-lg shadow-orange-500/20"
                    : "bg-background-app/60 backdrop-blur-sm border border-stroke-default-primary-v2/60 hover:bg-background-card-primary/80 hover:border-orange-500/30 hover:shadow-md hover:shadow-orange-500/10",
                ].join(" ")}
              >
                {/* Button glow effect */}
                <div
                  className={`cursor-pointer absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? "opacity-50" : ""}`}
                />
                {isActive && (
                  <span className="text-text-default-primary font-semibold text-sm relative z-10">
                    {product}
                  </span>
                )}
                <ProductLogo
                  product={product}
                  className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </button>
            );
          })}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-xl">
        <div className="flex gap-md items-center">
          {/* New Update Button — hidden for Neokred (company) and employees */}
          {activeProduct !== "Neokred" && canPostUpdates && (
            <button
              onClick={() => setIsNewUpdateModalOpen(true)}
              className="bg-orange-500/90 hover:bg-orange-600/90 text-white px-md py-sm rounded-xl flex items-center gap-xs font-medium text-sm transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-102 active:scale-98 relative overflow-hidden group border border-orange-400/30 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">
                New Update for {activeProduct}
              </span>
              <img
                src="/assets/new update-icon.png"
                alt="New Update"
                width={16}
                height={16}
                className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-6 "
              />
            </button>
          )}

          {/* Calendar Button + Range Picker */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar((v) => !v)}
              className={[
                "border p-sm rounded-xl flex items-center justify-center transition-all duration-300 gap-xs backdrop-blur-sm relative overflow-hidden group cursor-pointer",
                hasFilter
                  ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/25"
                  : "bg-background-card-primary/80 border-stroke-default-primary/60 hover:bg-background-card-secondary/80 hover:border-orange-500/30 hover:shadow-md",
              ].join(" ")}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hasFilter ? "opacity-30" : ""}`}
              />
              <img
                src="/assets/Calendar-icon.svg"
                alt="Calendar"
                width={16}
                height={16}
                className="w-4 h-4 dark-invert relative z-10 transition-transform duration-300 group-hover:scale-110"
              />
              {hasFilter && (
                <span className="text-xs font-semibold text-text-brand-on-background whitespace-nowrap relative z-10">
                  {formatRangeLabel()}
                </span>
              )}
            </button>

            {/* Calendar dropdown */}
            {showCalendar && (
              <div className="absolute top-full right-0 mt-2 bg-background-app/95 backdrop-blur-xl border border-stroke-default-primary-v2/50 rounded-2xl shadow-2xl shadow-black/10 p-lg z-50 w-[300px] animate-in slide-in-from-top-2 duration-300">
                <DateRangeCalendar
                  startDate={dateRangeStart}
                  endDate={dateRangeEnd}
                  onRangeChange={(start, end) => setDateRange(start, end)}
                  onClear={() => {
                    clearDateRange();
                    setShowCalendar(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-lg h-10">
          {/* Admin Panel Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-600 text-sm font-semibold hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="relative z-10">Admin</span>
            </Link>
          )}

          {/* Email Signature Generator Link */}
          <Link
            to="/email-signature-generator"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-600 text-sm font-semibold hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <span className="relative z-10">Email Signature</span>
          </Link>

          <div className="bg-background-card-secondary/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-stroke-default-primary/30">
            <span className="text-text-default-secondary text-sm font-medium">
              {currentUser?.email || "user@neokred.tech"}
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="bg-background-card-primary/80 backdrop-blur-sm border border-stroke-default-primary/60 p-sm rounded-xl flex items-center justify-center hover:bg-background-card-secondary/80 hover:border-orange-500/30 transition-all duration-300 group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isDarkMode ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-icon-default-primary relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-icon-default-primary relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 border border-red-400 hover:border-red-500 p-sm rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm relative overflow-hidden group shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/assets/SignOut-icon.svg"
              alt="Sign Out"
              width={16}
              height={16}
              className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110 filter brightness-0 invert"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
