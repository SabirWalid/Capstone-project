// API Configuration
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : 'https://sabir-techpreneurs.onrender.com';

// API Helper Functions
const api = {
    // Base fetch function with error handling
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('adminToken');
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                },
                credentials: 'include', // This is important for cookies/sessions
                mode: 'cors' // Explicitly state we're using CORS
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage;
                try {
                    const jsonError = JSON.parse(errorData);
                    errorMessage = jsonError.message || jsonError.error || `HTTP error! status: ${response.status}`;
                } catch {
                    errorMessage = errorData || `HTTP error! status: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                endpoint: endpoint,
                headers: defaultHeaders
            });
            throw error;
        }
    },

    // Common API endpoints
    mentors: {
        getAll: () => api.fetch('/api/admin/mentors'),
        getOne: (id) => api.fetch(`/api/admin/mentors/${id}`),
        create: (data) => api.fetch('/api/admin/mentors', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`/api/admin/mentors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`/api/admin/mentors/${id}`, {
            method: 'DELETE'
        })
    },

    courses: {
        getAll: () => api.fetch('/api/admin/courses'),
        getOne: (id) => api.fetch(`/api/admin/courses/${id}`),
        create: (data) => api.fetch('/api/admin/courses', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`/api/admin/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`/api/admin/courses/${id}`, {
            method: 'DELETE'
        })
    },

    opportunities: {
        getAll: () => api.fetch('/api/admin/opportunities'),
        getOne: (id) => api.fetch(`/api/admin/opportunities/${id}`),
        create: (data) => api.fetch('/api/admin/opportunities', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`/api/admin/opportunities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`/api/admin/opportunities/${id}`, {
            method: 'DELETE'
        })
    },

    resources: {
        getAll: () => api.fetch('/api/admin/resources'),
        getOne: (id) => api.fetch(`/api/admin/resources/${id}`),
        create: (data) => api.fetch('/api/admin/resources', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => api.fetch(`/api/admin/resources/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => api.fetch(`/api/admin/resources/${id}`, {
            method: 'DELETE'
        })
    }
};

// Export the API helper
window.api = api;
