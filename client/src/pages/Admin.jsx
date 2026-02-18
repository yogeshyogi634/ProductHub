import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

const ADMIN_EMAIL = "madhav@neokred.tech";

const ROLE_OPTIONS = [
    { value: "EMPLOYEE", label: "Employee", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    { value: "MANAGEMENT", label: "Manager", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
    { value: "ADMIN", label: "Admin", color: "bg-brand-primary/15 text-brand-primary border-brand-primary/30" },
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
        <div className="min-h-screen bg-background-app">
            {/* Header */}
            <div className="border-b border-stroke-default-primary bg-background-card-primary">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-text-default-secondary hover:text-text-default-primary transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            <span className="text-sm">Back to Dashboard</span>
                        </Link>
                        <div className="w-px h-6 bg-stroke-default-primary" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-text-default-primary">Admin Panel</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
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
                        value={allUsers.filter((u) => u.role === "manager" || u.role === "admin").length}
                        color="text-purple-400"
                        bgColor="bg-purple-500/10"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-background-card-primary p-1 rounded-xl border border-stroke-default-primary w-fit">
                    <button
                        onClick={() => setTab("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "pending"
                            ? "bg-brand-primary text-black shadow-sm"
                            : "text-text-default-secondary hover:text-text-default-primary"
                            }`}
                    >
                        Pending Approvals
                        {pendingUsers.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "all"
                            ? "bg-brand-primary text-black shadow-sm"
                            : "text-text-default-secondary hover:text-text-default-primary"
                            }`}
                    >
                        All Users
                    </button>
                    <button
                        onClick={() => setTab("logs")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "logs"
                            ? "bg-brand-primary text-black shadow-sm"
                            : "text-text-default-secondary hover:text-text-default-primary"
                            }`}
                    >
                        Activity Logs
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
                    <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl overflow-hidden">
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
                    <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl overflow-hidden">
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
        <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-5">
            <p className="text-text-default-secondary text-sm mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${color}`}>{value}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${bgColor}`} />
            </div>
        </div>
    );
}

function EmptyState({ message, description }) {
    return (
        <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <p className="text-text-default-primary font-medium mb-1">{message}</p>
            <p className="text-text-default-secondary text-sm">{description}</p>
        </div>
    );
}

function PendingUserCard({ user, loading, onApprove, onReject }) {
    const [selectedRole, setSelectedRole] = useState("EMPLOYEE");

    return (
        <div className="bg-background-card-primary border border-stroke-default-primary rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-primary font-semibold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-text-default-primary font-medium truncate">
                            {user.full_name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 flex-shrink-0">
                            Pending
                        </span>
                    </div>
                    <p className="text-text-default-secondary text-sm truncate">{user.email}</p>
                    <p className="text-text-default-secondary text-xs mt-0.5">{user.designation}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Role selector */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-default-secondary">Assign role:</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-background-card-secondary border border-stroke-default-primary rounded-lg text-sm text-text-default-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${currentRole.color}`}>
                        {currentRole.label}
                    </span>
                ) : (
                    <select
                        value={user.role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        disabled={loading}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer ${currentRole.color} disabled:opacity-50`}
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
                <span className="text-text-default-secondary text-xs">{formatDate(user.created_at)}</span>
            </td>
            <td className="px-6 py-4 text-right">
                {!isAdmin && !isSelf && (
                    confirmRemove ? (
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-300">Remove?</span>
                            <button
                                onClick={() => { onRemove(); setConfirmRemove(false); }}
                                disabled={loading}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setConfirmRemove(false)}
                                className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/70 text-xs font-medium rounded-md transition-colors"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmRemove(true)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 text-red-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            Remove
                        </button>
                    )
                )}
            </td>
        </tr>
    );
}
