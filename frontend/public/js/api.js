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
        
        console.log(`API Request to: ${BASE_URL}${endpoint}`);

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
                console.warn(`API call failed: ${errorMessage}`);
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
        getAll: () => {
            console.log('Fetching all resources from API');
            return api.fetch('/api/admin/resources')
                .then(data => {
                    console.log('Resources API response:', data);
                    console.log('Resources response type:', typeof data);
                    if (Array.isArray(data)) {
                        console.log('Response is an array with length:', data.length);
                    } else if (data && typeof data === 'object') {
                        console.log('Response is an object with keys:', Object.keys(data));
                        if (data.resources) {
                            console.log('Found resources property with length:', data.resources.length);
                        }
                    }
                    return data;
                })
                .catch(err => {
                    console.error('Resources API error:', err);
                    throw err;
                });
        },
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
