import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/data";
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
    } = useStore();

    const userRole = authUser?.role || "employee";
    
    // STRICT ADMIN CHECK: Only specific emails are allowed to see/access Admin Panel
    const ADMIN_EMAILS = ["madhav@neokred.tech", "admin@neokred.tech", "ceo@neokred.tech"];
    const isAdmin = Object.values(ADMIN_EMAILS).includes(currentUser?.email); //userRole === "admin";
    
    const canPostUpdates = userRole === "manager" || userRole === "admin";

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
            return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        };
        if (dateRangeStart && dateRangeEnd) return `${fmt(dateRangeStart)} — ${fmt(dateRangeEnd)}`;
        return fmt(dateRangeStart);
    };

    const hasFilter = !!dateRangeStart;

    return (
        <div className="w-full bg-background-app border-b border-stroke-default-primary-v2 px-lg-2 py-lg flex justify-between items-center shrink-0">
            {/* Left: Product Tabs */}
            <div className="flex gap-md items-center h-10">
                {PRODUCTS.map((product) => {
                    const isActive = product === activeProduct;
                    return (
                        <button
                            key={product}
                            onClick={() => setActiveProduct(product)}
                            className={[
                                "rounded-xs px-md py-2xs flex gap-sm items-center h-full transition-colors",
                                isActive
                                    ? "bg-background-card-primary border-[1.5px] border-brand-wakame"
                                    : "bg-background-app border border-stroke-default-primary-v2 hover:bg-background-card-primary",
                            ].join(" ")}
                        >
                            {isActive && (
                            <span className="text-text-default-primary font-medium text-sm">
                                    {product}
                                </span>
                            )}
                            <ProductLogo product={product} className="w-5 h-5" />
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
                            className="bg-brand-primary text-text-brand-on-background px-md py-sm rounded-sm flex items-center gap-xs font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                            New Update for {activeProduct}
                            <img
                                src="/assets/new update-icon.png"
                                alt="New Update"
                                width={16}
                                height={16}
                                className="w-4 h-4"
                            />
                        </button>
                    )}

                    {/* Calendar Button + Range Picker */}
                    <div className="relative" ref={calendarRef}>
                        <button
                            onClick={() => setShowCalendar((v) => !v)}
                            className={[
                                "border p-sm rounded-sm flex items-center justify-center transition-colors gap-xs",
                                hasFilter
                                    ? "bg-brand-primary border-brand-primary"
                                    : "bg-background-card-primary border-stroke-default-primary hover:bg-background-card-secondary",
                            ].join(" ")}
                        >
                            <img
                                src="/assets/Calendar-icon.svg"
                                alt="Calendar"
                                width={16}
                                height={16}
                                className="w-4 h-4 dark-invert"
                            />
                            {hasFilter && (
                                <span className="text-xs font-medium text-text-brand-on-background whitespace-nowrap">
                                    {formatRangeLabel()}
                                </span>
                            )}
                        </button>

                        {/* Calendar dropdown */}
                        {showCalendar && (
                            <div className="absolute top-full right-0 mt-2 bg-background-app border border-stroke-default-primary-v2 rounded-sm shadow-xl p-lg z-50 w-[300px]">
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
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/15 border border-brand-primary/30 rounded-lg text-brand-primary text-sm font-medium hover:bg-brand-primary/25 transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Admin
                        </Link>
                    )}

                    <span className="text-text-default-secondary text-sm">
                        {currentUser?.email || "user@neokred.tech"}
                    </span>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className="bg-background-card-primary border border-stroke-default-primary p-sm rounded-sm flex items-center justify-center hover:bg-background-card-secondary transition-colors"
                    >
                        {isDarkMode ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-icon-default-primary">
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-icon-default-primary">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={signOut}
                        className="bg-background-actions-error border border-stroke-actions-error-hover p-sm rounded-sm flex items-center justify-center hover:opacity-90 transition-opacity">
                        <img
                            src="/assets/SignOut-icon.svg"
                            alt="Sign Out"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
