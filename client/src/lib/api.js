const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    // Include credentials (cookies) for all requests
    config.credentials = "include";

    try {
        const response = await fetch(url, config);
        
        // Handle 204 No Content
        if (response.status === 204) {
             return null;
        }

        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || json.message || "Something went wrong");
        }

        // Unwrap the 'data' property if it exists (standard response format)
        return json.data || json;
    } catch (error) {
        throw error;
    }
}

// Helper function to format date-time from API response to frontend format
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const d = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    return `${time} | ${d}`;
}

export const api = {
    // Auth
    requestOtp: (data) => request("/auth/request-otp", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    verifyOtp: (data) => request("/auth/verify-otp", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    signup: (data) => request("/auth/signup", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    signin: (data) => request("/auth/signin", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    logout: () => request("/auth/logout", { method: "POST" }),
    
    getMe: () => request("/auth/me"),
    
    // Departments
    getDepartments: () => request("/auth/departments"),
    
    // Admin
    getUsers: () => request("/auth/users"),
    getAdminLogs: () => request("/auth/admin-logs"),
    
    updateUser: (id, data) => request(`/auth/users/${id}`, { 
        method: "PATCH", 
        body: JSON.stringify(data) 
    }),
    
    deleteUser: (id) => request(`/auth/users/${id}`, { 
        method: "DELETE" 
    }),

    // Products
    getProducts: () => request("/products"),
    
    // Updates
    getUpdates: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/updates${queryString ? `?${queryString}` : ''}`;
        return request(endpoint);
    },
    
    getUpdateById: (id) => request(`/updates/${id}`),
    
    createUpdate: (data) => request("/updates", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    updateUpdate: (id, data) => request(`/updates/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(data) 
    }),
    
    changeUpdateStatus: (id, status, reason = null) => request(`/updates/${id}/status`, { 
        method: "PATCH", 
        body: JSON.stringify({ status, reason }) 
    }),
    
    deleteUpdate: (id) => request(`/updates/${id}`, { 
        method: "DELETE" 
    }),
    
    getUpdateStatusHistory: (id) => request(`/updates/${id}/history`),
    
    getStatuses: () => request("/updates/statuses"),
    
    // Feedback
    getFeedback: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/feedback${queryString ? `?${queryString}` : ''}`;
        return request(endpoint);
    },
    
    createFeedback: (data) => request("/feedback", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    deleteFeedback: (id) => request(`/feedback/${id}`, { 
        method: "DELETE" 
    }),
    
    getCurrentUser: () => request("/feedback/me"),
    
    getFeedbackCalendar: () => request("/feedback/calendar"),
    
    getFeedbackDateRange: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/feedback/date-range${queryString ? `?${queryString}` : ''}`);
    },
    
    // Votes (for feedback likes)
    castVote: (data) => request("/votes", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    removeVote: (updateId) => request(`/votes/${updateId}`, { 
        method: "DELETE" 
    }),
    
    // Replies
    createReply: (data) => request("/replies", { 
        method: "POST", 
        body: JSON.stringify(data) 
    }),
    
    deleteReply: (id) => request(`/replies/${id}`, { 
        method: "DELETE" 
    }),
};

// Product-specific API functions that match the existing frontend structure
export const productApi = {
    // Get all products
    async getProducts() {
        const products = await api.getProducts();
        return products.map(p => p.name); // Return just names for compatibility
    },

    // Get updates for a specific product
    async getUpdates(productName) {
        // First get product ID by name
        const products = await api.getProducts();
        const product = products.find(p => p.name === productName);
        if (!product) {

            
            throw new Error(`Product not found: ${productName}`);
        }

        const updates = await api.getUpdates({ productId: product.id });
        
        // Transform to match frontend format
        return updates.map(update => ({
            id: update.id,
            product: productName,
            title: update.title,
            description: update.description,
            status: update.status,
            department: update.author?.department || "",
            departmentType: update.author?.department || "",
            authorEmail: update.author?.email,
            postedDate: formatDateTime(update.createdAt),
            statusLog: update.statusHistory?.map(log => ({
                from: log.fromStatusDisplay,
                to: log.toStatusDisplay,
                date: new Date(log.timestamp).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            })) || [],
        }));
    },

    // Create a new update
    async createUpdate(productName, data) {
        // Get product ID
        const products = await api.getProducts();
        const product = products.find(p => p.name === productName);
        if (!product) {
            throw new Error(`Product not found: ${productName}`);
        }

        const updateData = {
            productId: product.id,
            title: data.title,
            description: data.description,
            status: data.status,
            department: data.department,
        };

        const newUpdate = await api.createUpdate(updateData);
        
        // Transform to match frontend format
        return {
            id: newUpdate.id,
            product: productName,
            title: newUpdate.title,
            description: newUpdate.description,
            status: newUpdate.status,
            department: data.department,
            departmentType: data.department,
            authorEmail: newUpdate.author?.email,
            postedDate: formatDateTime(newUpdate.createdAt),
            statusLog: [],
        };
    },

    // Edit existing update
    async editUpdate(updateId, data, oldStatus) {
        const updateData = {
            title: data.title,
            description: data.description,
            status: data.status,
            department: data.department,
        };

        await api.updateUpdate(updateId, updateData);
        
        // If status changed, add to status history
        if (oldStatus && oldStatus !== data.status) {
            await api.changeUpdateStatus(updateId, data.status);
        }
    },

    // Delete update
    async removeUpdate(updateId) {
        await api.deleteUpdate(updateId);
    },

    // Get feedback for a product
    async getFeedback(productName) {
        // Get product ID
        const products = await api.getProducts();
        const product = products.find(p => p.name === productName);
        if (!product) {
            throw new Error(`Product not found: ${productName}`);
        }

        const feedback = await api.getFeedback({ productId: product.id });
        
        // Transform to match frontend format
        return feedback.map(item => ({
            id: item.id,
            product: productName,
            authorName: item.author?.name || item.author?.email?.split('@')[0],
            authorEmail: item.author?.email,
            isAnonymous: false, // Backend doesn't have isAnonymous field currently
            content: item.message, // Backend uses 'message' field
            createdAt: new Date(item.createdAt).getTime(), // Add createdAt timestamp
            postedDate: formatDateTime(item.createdAt),
            likes: 0, // No vote system for feedback yet
            likedBy: [], 
            isOwner: item.isOwner || false,
            canDelete: item.canDelete || false,
            canReply: item.canReply || false,
            comments: item.replies?.map(reply => ({
                id: reply.id,
                authorName: reply.author?.name || reply.author?.email?.split('@')[0],
                authorEmail: reply.author?.email,
                isAnonymous: false,
                content: reply.message, // Backend uses 'message' field
                createdAt: new Date(reply.createdAt).getTime(), // Add createdAt timestamp
                postedDate: formatDateTime(reply.createdAt),
                canDelete: reply.canDelete || false,
            })) || [],
        }));
    },

    // Create feedback
    async createFeedback(productName, authorName, authorEmail, content) {
        // Get product ID
        const products = await api.getProducts();
        const product = products.find(p => p.name === productName);
        if (!product) {
            throw new Error(`Product not found: ${productName}`);
        }

        const feedbackData = {
            productId: product.id,
            message: content, // Backend expects 'message' field
        };

        const newFeedback = await api.createFeedback(feedbackData);
        
        return {
            id: newFeedback.id,
            product: productName,
            authorName: authorName,
            authorEmail: authorEmail,
            isAnonymous: false,
            content: content,
            createdAt: new Date(newFeedback.createdAt).getTime(), // Add createdAt timestamp
            postedDate: formatDateTime(newFeedback.createdAt),
            likes: 0,
            likedBy: [],
            comments: [],
            isOwner: newFeedback.isOwner || true, // New feedback is always owned by creator
            canDelete: newFeedback.canDelete || true, // New feedback can be deleted by creator for 60s
            canReply: newFeedback.canReply || true,
        };
    },

    // Delete feedback
    async removeFeedback(feedbackId) {
        await api.deleteFeedback(feedbackId);
    },

    // Toggle like on feedback (this would use votes API)
    async toggleLikeOnFeedback(feedbackId, email) {
        // This is a simplified implementation - the actual vote system might be more complex
        try {
            await api.castVote({
                targetType: 'FEEDBACK',
                targetId: feedbackId,
                type: 'UP'
            });
            return { likes: 1, likedBy: [email] }; // Simplified return
        } catch (error) {
            // If already voted, remove vote
            await api.removeVote(feedbackId);
            return { likes: 0, likedBy: [] };
        }
    },

    // Create reply to feedback
    async createReply(feedbackId, authorName, authorEmail, content) {
        const replyData = {
            feedbackId: feedbackId,
            message: content, // Backend expects 'message' field
        };

        const newReply = await api.createReply(replyData);
        
        return {
            id: newReply.id,
            authorName: authorName,
            authorEmail: authorEmail,
            isAnonymous: false,
            content: content,
            createdAt: new Date(newReply.createdAt).getTime(), // Add createdAt timestamp
            postedDate: formatDateTime(newReply.createdAt),
            canDelete: newReply.canDelete || true, // New reply can be deleted by creator for 60s
        };
    },
};
