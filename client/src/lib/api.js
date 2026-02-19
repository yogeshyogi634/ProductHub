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
};
