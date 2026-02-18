

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CURRENT_USER, formatDateTime } from "./data";
import {
    fetchUpdates as sbFetchUpdates,
    fetchFeedback as sbFetchFeedback,
    createUpdate as sbCreateUpdate,
    editUpdate as sbEditUpdate,
    removeUpdate as sbRemoveUpdate,
    createFeedback as sbCreateFeedback,
    removeFeedback as sbRemoveFeedback,
    toggleLikeOnFeedback as sbToggleLike,
    createReply as sbCreateReply,
} from "./mock-queries";
import { useNavigate } from "react-router-dom"; // Updated for Vite

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
    const navigate = useNavigate(); // Updated hook
    const [activeProduct, setActiveProductRaw] = useState("Perkle");
    const [activeStatusFilter, setActiveStatusFilter] = useState("WIP");
    const [updates, setUpdates] = useState({});
    const [feedback, setFeedback] = useState({});
    const [isNewUpdateModalOpen, setIsNewUpdateModalOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState(null);
    const [dateRangeStart, setDateRangeStartRaw] = useState(null);
    const [dateRangeEnd, setDateRangeEndRaw] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authUser, setAuthUserState] = useState(null);
    const authUserSet = useRef(false);

    const setDateRange = useCallback((start, end) => {
        setDateRangeStartRaw(start || null);
        setDateRangeEndRaw(end || null);
    }, []);

    const clearDateRange = useCallback(() => {
        setDateRangeStartRaw(null);
        setDateRangeEndRaw(null);
    }, []);

    // Set auth user from AuthGuard (only once)
    const setAuthUser = useCallback(({ user, profile }) => {
        if (authUserSet.current) return;
        authUserSet.current = true;
        setAuthUserState({
            email: profile?.email || user?.email || CURRENT_USER.email,
            name: profile?.full_name || user?.name || CURRENT_USER.name,
            designation: profile?.designation || "",
            role: profile?.role || user?.role || "employee",
        });
    }, []);

    const currentUser = authUser || CURRENT_USER;


    // Sign out
    const signOut = useCallback(async () => {
        localStorage.removeItem("nk_user");
        localStorage.removeItem("nk_profile");
        setAuthUserState(null);
        authUserSet.current = false;
        navigate("/login", { replace: true });
    }, [navigate]);

    // ── Load data from Supabase when product changes ──────────────────────
    const loadProductData = useCallback(async (productName) => {
        try {
            const [updatesData, feedbackData] = await Promise.all([
                sbFetchUpdates(productName),
                sbFetchFeedback(productName),
            ]);
            setUpdates((prev) => ({ ...prev, [productName]: updatesData }));
            setFeedback((prev) => ({ ...prev, [productName]: feedbackData }));
        } catch (err) {
            console.error("Failed to load data from Supabase:", err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await loadProductData("Perkle");
            setIsLoading(false);
        };
        init();

        // Restore theme preference
        try {
            const savedTheme = localStorage.getItem("neokred-theme");
            if (savedTheme === "dark") {
                setIsDarkMode(true);
                document.documentElement.classList.add("dark");
            }
        } catch (_) { }

    }, [loadProductData]);

    const setActiveProduct = useCallback(
        (product) => {
            setActiveProductRaw(product);
            setActiveStatusFilter("WIP");
            // Load data for the selected product if not already cached
            loadProductData(product);
        },
        [loadProductData]
    );

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
        async (data) => {
            try {
                const newUpdate = await sbCreateUpdate(activeProduct, {
                    ...data,
                    authorEmail: currentUser.email,
                });
                setUpdates((prev) => ({
                    ...prev,
                    [activeProduct]: [newUpdate, ...(prev[activeProduct] ?? [])],
                }));
            } catch (err) {
                console.error("Failed to create update:", err);
                // Fallback: add optimistically with local ID
                const fallback = {
                    ...data,
                    id: `update-${Date.now()}`,
                    product: activeProduct,
                    authorEmail: currentUser.email,
                    postedDate: formatDateTime(),
                    statusLog: [],
                };
                setUpdates((prev) => ({
                    ...prev,
                    [activeProduct]: [fallback, ...(prev[activeProduct] ?? [])],
                }));
            }
        },
        [activeProduct, currentUser.email]
    );

    const updateUpdate = useCallback(
        async (id, data) => {
            const list = updates[activeProduct] ?? [];
            const existing = list.find((u) => u.id === id);
            const oldStatus = existing?.status;

            // Optimistic local update
            setUpdates((prev) => {
                const product = activeProduct;
                const items = prev[product] ?? [];
                return {
                    ...prev,
                    [product]: items.map((u) => {
                        if (u.id !== id) return u;
                        const statusChanged = u.status !== data.status;
                        const newLog = statusChanged
                            ? [
                                ...(u.statusLog ?? []),
                                {
                                    from: u.status,
                                    to: data.status,
                                    date: new Date().toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }),
                                },
                            ]
                            : u.statusLog ?? [];
                        return { ...u, ...data, statusLog: newLog };
                    }),
                };
            });

            // Persist to Supabase
            try {
                await sbEditUpdate(id, data, oldStatus);
            } catch (err) {
                console.error("Failed to update in Supabase:", err);
            }
        },
        [activeProduct, updates]
    );

    const deleteUpdate = useCallback(
        async (id) => {
            // Optimistic local delete
            setUpdates((prev) => {
                const product = activeProduct;
                const list = prev[product] ?? [];
                return {
                    ...prev,
                    [product]: list.filter((u) => u.id !== id),
                };
            });

            try {
                await sbRemoveUpdate(id);
            } catch (err) {
                console.error("Failed to delete from Supabase:", err);
            }
        },
        [activeProduct]
    );

    // ── Feedback ───────────────────────────────────────────────────────────
    const addFeedback = useCallback(
        async (content) => {
            try {
                const newFeedback = await sbCreateFeedback(
                    activeProduct,
                    currentUser.name,
                    currentUser.email,
                    content
                );
                setFeedback((prev) => ({
                    ...prev,
                    [activeProduct]: [newFeedback, ...(prev[activeProduct] ?? [])],
                }));
            } catch (err) {
                console.error("Failed to create feedback:", err);
                // Fallback
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
            }
        },
        [activeProduct, currentUser]
    );

    const deleteFeedback = useCallback(
        async (id) => {
            setFeedback((prev) => ({
                ...prev,
                [activeProduct]: (prev[activeProduct] ?? []).filter((f) => f.id !== id),
            }));

            try {
                await sbRemoveFeedback(id);
            } catch (err) {
                console.error("Failed to delete feedback:", err);
            }
        },
        [activeProduct]
    );

    const toggleLike = useCallback(
        async (feedbackId) => {
            // Optimistic UI update
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

            try {
                await sbToggleLike(feedbackId, currentUser.email);
            } catch (err) {
                console.error("Failed to toggle like:", err);
            }
        },
        [activeProduct, currentUser.email]
    );

    const addReply = useCallback(
        async (feedbackId, content) => {
            try {
                const reply = await sbCreateReply(
                    feedbackId,
                    currentUser.name,
                    currentUser.email,
                    content
                );
                setFeedback((prev) => ({
                    ...prev,
                    [activeProduct]: (prev[activeProduct] ?? []).map((f) =>
                        f.id === feedbackId
                            ? { ...f, comments: [...f.comments, reply] }
                            : f
                    ),
                }));
            } catch (err) {
                console.error("Failed to add reply:", err);
                // Fallback
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
            }
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
                authUser,
                isNewUpdateModalOpen,
                editingUpdate,
                dateRangeStart,
                dateRangeEnd,
                isDarkMode,
                isLoading,
                // setters
                setActiveProduct,
                setActiveStatusFilter,
                setIsNewUpdateModalOpen,
                openEditModal,
                closeModal,
                setDateRange,
                clearDateRange,
                toggleTheme,
                setAuthUser,
                signOut,
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
