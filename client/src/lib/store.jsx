"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    INITIAL_UPDATES,
    INITIAL_FEEDBACK,
    CURRENT_USER,
    formatDateTime,
} from "./data";

const StoreContext = createContext(null);

const STORAGE_KEY = "neokred-wall-v1";

export function StoreProvider({ children }) {
    const [activeProduct, setActiveProductRaw] = useState("Perkle");
    const [activeStatusFilter, setActiveStatusFilter] = useState("WIP");
    const [updates, setUpdates] = useState(INITIAL_UPDATES);
    const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
    const [isNewUpdateModalOpen, setIsNewUpdateModalOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState(null); // the update object being edited
    const [dateRangeStart, setDateRangeStartRaw] = useState(null); // "YYYY-MM-DD" or null
    const [dateRangeEnd, setDateRangeEndRaw] = useState(null);   // "YYYY-MM-DD" or null
    const [isDarkMode, setIsDarkMode] = useState(false);

    const setDateRange = useCallback((start, end) => {
        setDateRangeStartRaw(start || null);
        setDateRangeEndRaw(end || null);
    }, []);

    const clearDateRange = useCallback(() => {
        setDateRangeStartRaw(null);
        setDateRangeEndRaw(null);
    }, []);

    const currentUser = CURRENT_USER;

    // Hydrate from localStorage once on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const { updates: u, feedback: f } = JSON.parse(raw);
                if (u) setUpdates(u);
                if (f) setFeedback(f);
            }
        } catch (_) { }
        // Restore theme preference
        try {
            const savedTheme = localStorage.getItem("neokred-theme");
            if (savedTheme === "dark") {
                setIsDarkMode(true);
                document.documentElement.classList.add("dark");
            }
        } catch (_) { }
    }, []);

    // Persist whenever data changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ updates, feedback }));
        } catch (_) { }
    }, [updates, feedback]);

    const setActiveProduct = useCallback((product) => {
        setActiveProductRaw(product);
        setActiveStatusFilter("WIP");
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDarkMode((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("neokred-theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("neokred-theme", "light");
            }
            return next;
        });
    }, []);

    // Open modal in edit mode
    const openEditModal = useCallback((update) => {
        setEditingUpdate(update);
        setIsNewUpdateModalOpen(true);
    }, []);

    // Close modal and clear edit state
    const closeModal = useCallback(() => {
        setIsNewUpdateModalOpen(false);
        setEditingUpdate(null);
    }, []);

    // ── Updates ────────────────────────────────────────────────────────────
    const addUpdate = useCallback(
        (data) => {
            const newUpdate = {
                ...data,
                id: `update-${Date.now()}`,
                product: activeProduct,
                authorEmail: currentUser.email,
                postedDate: formatDateTime(),
                statusLog: [],
            };
            setUpdates((prev) => ({
                ...prev,
                [activeProduct]: [newUpdate, ...(prev[activeProduct] ?? [])],
            }));
        },
        [activeProduct, currentUser.email]
    );

    const updateUpdate = useCallback(
        (id, data) => {
            setUpdates((prev) => {
                const product = activeProduct;
                const list = prev[product] ?? [];
                return {
                    ...prev,
                    [product]: list.map((u) => {
                        if (u.id !== id) return u;
                        const statusChanged = u.status !== data.status;
                        const newLog = statusChanged
                            ? [
                                ...(u.statusLog ?? []),
                                {
                                    from: u.status,
                                    to: data.status,
                                    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                                },
                            ]
                            : (u.statusLog ?? []);
                        return {
                            ...u,
                            ...data,
                            statusLog: newLog,
                        };
                    }),
                };
            });
        },
        [activeProduct]
    );

    const deleteUpdate = useCallback(
        (id) => {
            setUpdates((prev) => {
                const product = activeProduct;
                const list = prev[product] ?? [];
                return {
                    ...prev,
                    [product]: list.filter((u) => u.id !== id),
                };
            });
        },
        [activeProduct]
    );

    // ── Feedback ───────────────────────────────────────────────────────────
    const addFeedback = useCallback(
        (content) => {
            const entry = {
                id: `fb-${Date.now()}`,
                product: activeProduct,
                authorName: currentUser.name,
                authorEmail: currentUser.email,
                isAnonymous: false,
                content,
                createdAt: Date.now(),
                postedDate: formatDateTime(),
                likes: 0,
                likedBy: [],
                comments: [],
            };
            setFeedback((prev) => ({
                ...prev,
                [activeProduct]: [entry, ...(prev[activeProduct] ?? [])],
            }));
        },
        [activeProduct, currentUser]
    );

    const deleteFeedback = useCallback(
        (id) => {
            setFeedback((prev) => ({
                ...prev,
                [activeProduct]: (prev[activeProduct] ?? []).filter((f) => f.id !== id),
            }));
        },
        [activeProduct]
    );

    const toggleLike = useCallback(
        (feedbackId) => {
            setFeedback((prev) => ({
                ...prev,
                [activeProduct]: (prev[activeProduct] ?? []).map((f) => {
                    if (f.id !== feedbackId) return f;
                    const already = f.likedBy.includes(currentUser.email);
                    return {
                        ...f,
                        likes: already ? f.likes - 1 : f.likes + 1,
                        likedBy: already
                            ? f.likedBy.filter((e) => e !== currentUser.email)
                            : [...f.likedBy, currentUser.email],
                    };
                }),
            }));
        },
        [activeProduct, currentUser.email]
    );

    const addReply = useCallback(
        (feedbackId, content) => {
            const reply = {
                id: `reply-${Date.now()}`,
                authorName: currentUser.name,
                authorEmail: currentUser.email,
                isAnonymous: false,
                content,
                postedDate: formatDateTime(),
            };
            setFeedback((prev) => ({
                ...prev,
                [activeProduct]: (prev[activeProduct] ?? []).map((f) =>
                    f.id === feedbackId
                        ? { ...f, comments: [...f.comments, reply] }
                        : f
                ),
            }));
        },
        [activeProduct, currentUser]
    );

    return (
        <StoreContext.Provider
            value={{
                // state
                activeProduct,
                activeStatusFilter,
                updates,
                feedback,
                currentUser,
                isNewUpdateModalOpen,
                editingUpdate,
                dateRangeStart,
                dateRangeEnd,
                isDarkMode,
                // setters
                setActiveProduct,
                setActiveStatusFilter,
                setIsNewUpdateModalOpen,
                openEditModal,
                closeModal,
                setDateRange,
                clearDateRange,
                toggleTheme,
                // actions
                addUpdate,
                updateUpdate,
                deleteUpdate,
                addFeedback,
                deleteFeedback,
                toggleLike,
                addReply,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useStore must be used within StoreProvider");
    return ctx;
}
