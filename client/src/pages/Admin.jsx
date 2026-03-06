import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

const ADMIN_EMAIL = "madhav@neokred.tech";

const ROLE_OPTIONS = [
    { value: "EMPLOYEE", label: "Employee", color: "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-blue-500/20" },
    { value: "MANAGEMENT", label: "Manager", color: "bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-purple-500/20" },
    { value: "ADMIN", label: "Admin", color: "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-orange-500/20" },
];

export default function AdminPage() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Store current user to prevent self-actions
    const [actionLoading, setActionLoading] = useState({});
    const [tab, setTab] = useState("pending"); // pending | all | logs

    useEffect(() => {
        checkAdminAccess();
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (tab === "logs") {
            fetchLogs();
        }
    }, [tab]);

    const fetchLogs = async () => {
        try {
            const response = await api.getAdminLogs();
            if (response && response.logs) {
                setLogs(response.logs);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        }
    };

    useEffect(() => {
        checkAdminAccess();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.getDepartments();
            if (response && Array.isArray(response)) {
                setDepartments(response);
            }
        } catch (err) {
            console.error("Failed to fetch departments:", err);
            // Fallback default departments if API fails
            setDepartments([
                "Product Manager", "Engineer", "Designer", "QA", "Finance", "HR", "Marketing", "Other"
            ]);
        }
    };

    const checkAdminAccess = async () => {
        try {
            const { user } = await api.getMe();
            
            // STRICT ADMIN CHECK: Only specific emails are allowed to see/access Admin Panel
            const ADMIN_EMAILS = ["madhav@neokred.tech"];
            
            const isMasterAdmin = user.email === "madhav@neokred.tech";

            // Check both Role AND Email match. Case-insensitive role check.
            // MASTER OVERRIDE: madhav@neokred.tech is always allowed, regardless of role
            if (!isMasterAdmin) {
                if (!user || user.role?.toUpperCase() !== "ADMIN" || !Object.values(ADMIN_EMAILS).includes(user.email)) {
                    console.log("Access denied. Role:", user?.role, "Email:", user?.email);
                    navigate("/", { replace: true });
                    return;
                }
            }

            setCurrentUser(user);
            setIsAdmin(true);
            await fetchUsers();
            setLoading(false);
        } catch (err) {
            console.error("Admin check failed:", err);
            navigate("/", { replace: true });
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.getUsers();
            if (response.users) {
                // Map API response to match existing UI structure if needed
                // API: { id, name, email, role, department, createdAt... }
                setUsers(response.users);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const approveUser = async (userId, role) => {
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            // Default to EMPLOYEE if no role passed, though UI should provide one
            const targetRole = role || "EMPLOYEE";
            await api.updateUser(userId, { isVerified: true, role: targetRole });
            
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, isVerified: true, role: targetRole } : u
            ));
        } catch (err) {
            console.error("Approve failed:", err);
            // Log full error details for debugging
            alert(`Failed to approve user: ${err.message || err.toString()}`);
        }
        setActionLoading((prev) => ({ ...prev, [userId]: false }));
    };

    const rejectUser = async (userId) => {
        if (!confirm("Are you sure you want to remove this user? This action cannot be undone.")) return;
        
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error("Reject failed:", err);
            alert("Failed to delete user.");
        }
        setActionLoading((prev) => ({ ...prev, [userId]: false }));
    };

    const updateUserRole = async (userId, newRole) => {
        setActionLoading((prev) => ({ ...prev, [userId]: true }));
        try {
             await api.updateUser(userId, { role: newRole });
             setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, role: newRole } : u
            ));
        } catch (err) {
            console.error("Role update failed:", err);
            alert(`Failed to update role: ${err.message || err.toString()}`);
        }
        setActionLoading((prev) => ({ ...prev, [userId]: false }));
    };

    const pendingUsers = users.filter((u) => !u.isVerified); // Using isVerified from API
    const allUsers = users.filter((u) => u.isVerified);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-app">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-default-secondary text-sm">Loading admin panel…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-app/95 via-background-card-primary/80 to-background-app/90 backdrop-blur-2xl relative overflow-hidden">
            {/* Enhanced background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="border-b border-stroke-default-primary-v2/30 bg-gradient-to-r from-background-card-primary/80 to-background-card-secondary/60 backdrop-blur-xl shadow-xl relative z-10">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-text-default-secondary hover:text-orange-600 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-100/20 to-orange-200/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-orange-600 transition-colors duration-300">
                                    <path d="M19 12H5" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </div>
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                        <div className="w-px h-8 bg-gradient-to-b from-transparent via-stroke-default-primary to-transparent" />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black bg-gradient-to-r from-text-default-primary via-orange-600 to-orange-500 bg-clip-text leading-tight">Admin Panel</h1>
                                <p className="text-text-default-secondary/70 text-sm font-medium">User Management & Analytics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <StatCard
                        label="Pending Approvals"
                        value={pendingUsers.length}
                        color="text-brand-primary"
                        bgColor="bg-brand-primary/10"
                    />
                    <StatCard
                        label="Total Users"
                        value={allUsers.length}
                        color="text-blue-400"
                        bgColor="bg-blue-500/10"
                    />
                    <StatCard
                        label="Managers"
                        value={allUsers.filter((u) => u.role === "MANAGEMENT" || u.role === "ADMIN").length}
                        color="text-purple-400"
                        bgColor="bg-purple-500/10"
                    />
                </div>

                {/* Enhanced Tabs */}
                <div className="flex gap-2 items-center p-2 bg-gradient-to-r from-background-card-secondary/50 to-background-card-primary/50 backdrop-blur-xl rounded-2xl border border-stroke-default-primary/20 shadow-xl shadow-orange-500/10 w-fit mb-10">
                    <button
                        onClick={() => setTab("pending")}
                        className={`px-6 py-3 rounded-xl font-bold border transition-all duration-500 relative overflow-hidden group cursor-pointer transform ${
                            tab === "pending"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl shadow-orange-500/30 scale-105"
                                : "bg-transparent border-transparent text-text-default-secondary hover:bg-background-card-primary/60 hover:text-orange-600 hover:scale-102"
                        }`}
                    >
                        {tab !== "pending" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                        <span className="relative z-10 tracking-wide flex items-center gap-2">
                            Pending Approvals
                            {pendingUsers.length > 0 && (
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                                    tab === "pending" 
                                        ? "bg-white/20 text-white" 
                                        : "bg-red-500/20 text-red-300"
                                }`}>
                                    {pendingUsers.length}
                                </span>
                            )}
                        </span>
                        {tab === "pending" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                    </button>
                    <button
                        onClick={() => setTab("all")}
                        className={`px-6 py-3 rounded-xl font-bold border transition-all duration-500 relative overflow-hidden group cursor-pointer transform ${
                            tab === "all"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl shadow-orange-500/30 scale-105"
                                : "bg-transparent border-transparent text-text-default-secondary hover:bg-background-card-primary/60 hover:text-orange-600 hover:scale-102"
                        }`}
                    >
                        {tab !== "all" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                        <span className="relative z-10 tracking-wide">All Users</span>
                        {tab === "all" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                    </button>
                    <button
                        onClick={() => setTab("logs")}
                        className={`px-6 py-3 rounded-xl font-bold border transition-all duration-500 relative overflow-hidden group cursor-pointer transform ${
                            tab === "logs"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl shadow-orange-500/30 scale-105"
                                : "bg-transparent border-transparent text-text-default-secondary hover:bg-background-card-primary/60 hover:text-orange-600 hover:scale-102"
                        }`}
                    >
                        {tab !== "logs" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                        <span className="relative z-10 tracking-wide">Activity Logs</span>
                        {tab === "logs" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        )}
                    </button>
                </div>

                {/* Pending Approvals Tab */}
                {tab === "pending" && (
                    <div className="space-y-3">
                        {pendingUsers.length === 0 ? (
                            <EmptyState message="No pending approvals" description="All signups have been reviewed." />
                        ) : (
                            pendingUsers.map((user) => (
                                <PendingUserCard
                                    key={user.id}
                                    user={user}
                                    loading={actionLoading[user.id]}
                                    onApprove={(role) => approveUser(user.id, role)}
                                    onReject={() => rejectUser(user.id)}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* All Users Tab */}
                {tab === "all" && (
                    <div className="bg-gradient-to-br from-background-card-primary/90 to-background-card-secondary/50 border border-stroke-default-primary-v2/30 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/10 backdrop-blur-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-stroke-default-primary">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Designation</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-default-primary">
                                {allUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-default-secondary text-sm">
                                            No approved users yet
                                        </td>
                                    </tr>
                                ) : (
                                    allUsers.map((user) => (
                                        <UserRow
                                            key={user.id}
                                            user={user}
                                            isSelf={currentUser?.id === user.id}
                                            loading={actionLoading[user.id]}
                                            onRoleChange={(role) => updateUserRole(user.id, role)}
                                            onRemove={() => rejectUser(user.id)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Logs Tab */}
                {tab === "logs" && (
                    <div className="bg-gradient-to-br from-background-card-primary/90 to-background-card-secondary/50 border border-stroke-default-primary-v2/30 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/10 backdrop-blur-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-stroke-default-primary">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Time</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Admin</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Action</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Target User</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-text-default-secondary uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke-default-primary">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-default-secondary text-sm">
                                            No activity recorded yet
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-background-card-secondary/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-text-default-secondary">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-default-primary font-medium">
                                                {log.adminUser?.name || "Unknown"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    log.action === "APPROVE" ? "bg-green-500/10 text-green-400" :
                                                    log.action === "REJECT" ? "bg-red-500/10 text-red-400" :
                                                    log.action === "REMOVE" ? "bg-red-500/10 text-red-400" :
                                                    "bg-blue-500/10 text-blue-400"
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-default-secondary">
                                                {log.targetUser ? (
                                                    <div>
                                                        <p className="text-text-default-primary">{log.targetUser.name}</p>
                                                        <p className="text-xs">{log.targetUser.email}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-text-default-primary">{log.targetName || "Deleted User"}</p>
                                                        <p className="text-xs">{log.targetEmail || "No email"}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-default-secondary">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Sub-Components ──────────────────────────────────────────────────── */

function StatCard({ label, value, color, bgColor }) {
    return (
        <div className="bg-gradient-to-br from-background-card-primary/90 to-background-card-secondary/50 border border-stroke-default-primary-v2/30 rounded-2xl p-6 shadow-xl shadow-orange-500/5 hover:shadow-orange-500/15 transition-all duration-500 group hover:scale-105 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
                <p className="text-text-default-secondary/80 text-sm mb-3 font-medium tracking-wide">{label}</p>
                <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black ${color} group-hover:scale-110 transition-transform duration-300`}>{value}</span>
                    <div className={`w-3 h-3 rounded-full ${bgColor} shadow-lg group-hover:animate-pulse`} />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message, description }) {
    return (
        <div className="bg-gradient-to-br from-background-card-primary/90 to-background-card-secondary/50 border border-stroke-default-primary-v2/30 rounded-2xl p-16 text-center shadow-xl shadow-orange-500/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50" />
            <div className="relative z-10">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100/20 to-orange-200/20 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20 transform rotate-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 transform -rotate-3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <p className="text-xl font-black text-text-default-primary bg-gradient-to-r from-text-default-primary to-orange-600 bg-clip-text mb-2">{message}</p>
                <p className="text-text-default-secondary/70 font-medium">{description}</p>
            </div>
        </div>
    );
}

function PendingUserCard({ user, loading, onApprove, onReject }) {
    const [selectedRole, setSelectedRole] = useState("EMPLOYEE");

    return (
        <div className="bg-gradient-to-br from-background-card-primary/90 to-background-card-secondary/50 border border-stroke-default-primary-v2/30 rounded-2xl p-6 flex items-center justify-between gap-6 shadow-xl shadow-orange-500/5 hover:shadow-orange-500/15 transition-all duration-500 group hover:scale-105 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-primary font-semibold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-text-default-primary font-medium truncate">
                            {user.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 flex-shrink-0">
                            Pending
                        </span>
                    </div>
                    <p className="text-text-default-secondary text-sm truncate">{user.email}</p>
                    <p className="text-text-default-secondary text-xs mt-0.5">{user.department}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
                {/* Role selector */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-default-secondary">Assign role:</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-gradient-to-r from-background-card-secondary/80 to-background-card-primary/50 border border-stroke-default-primary hover:border-orange-500/40 rounded-xl text-sm text-text-default-primary focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer transition-all duration-300 hover:scale-105 shadow-md backdrop-blur-sm"
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Approve */}
                <button
                    onClick={() => onApprove(selectedRole)}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative z-20 backdrop-blur-sm"
                >
                    {loading ? (
                        <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            …
                        </span>
                    ) : (
                        "Approve"
                    )}
                </button>

                {/* Reject */}
                <button
                    onClick={onReject}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/40 hover:border-red-500/60 text-red-300 hover:text-red-200 text-sm font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative z-20"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}

function UserRow({ user, isSelf, loading, onRoleChange, onRemove }) {
    const currentRole = ROLE_OPTIONS.find((r) => r.value === user.role) || ROLE_OPTIONS[0];
    const isAdmin = user.email === ADMIN_EMAIL;
    const [confirmRemove, setConfirmRemove] = useState(false);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <tr className={`hover:bg-background-card-secondary/50 transition-colors ${isSelf ? 'bg-brand-primary/5' : ''}`}>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-primary font-semibold text-xs">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-text-default-primary text-sm font-medium">{user.name}</p>
                            {isSelf && <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-1.5 rounded">YOU</span>}
                        </div>
                        <p className="text-text-default-secondary text-xs">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-text-default-secondary text-sm">{user.department || "—"}</span>
            </td>
            <td className="px-6 py-4">
                {isAdmin || isSelf ? (
                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${currentRole.color} backdrop-blur-sm`}>
                        {currentRole.label}
                    </span>
                ) : (
                    <select
                        value={user.role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border bg-gradient-to-r from-background-card-secondary/80 to-background-card-primary/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg ${currentRole.color} disabled:opacity-50`}
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value} className="bg-[#1e1e1e] text-white">
                                {r.label}
                            </option>
                        ))}
                    </select>
                )}
            </td>
            <td className="px-6 py-4">
                <span className="text-text-default-secondary text-xs">{formatDate(user.createdAt)}</span>
            </td>
            <td className="px-6 py-4 text-right">
                {!isAdmin && !isSelf && (
                    confirmRemove ? (
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-orange-300">Remove?</span>
                            <button
                                onClick={() => { onRemove(); setConfirmRemove(false); }}
                                disabled={loading}
                                className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setConfirmRemove(false)}
                                className="px-3 py-1 bg-gradient-to-r from-background-card-secondary/80 to-background-card-primary/50 hover:from-background-card-primary to-background-card-secondary border border-stroke-default-primary hover:border-orange-500/40 text-text-default-primary hover:text-orange-300 text-xs font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md backdrop-blur-sm cursor-pointer"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmRemove(true)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/40 hover:border-red-500/60 text-red-300 hover:text-red-200 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-lg shadow-red-500/20 backdrop-blur-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Remove
                        </button>
                    )
                )}
            </td>
        </tr>
    );
}
