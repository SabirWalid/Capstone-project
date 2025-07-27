// adminAuth.js
import config from './config.js';

// Admin Registration handler
if (document.getElementById('admin-register-form')) {
    document.getElementById('admin-register-form').onsubmit = async (e) => {
        e.preventDefault();
        
        try {
            const name = document.getElementById('admin-name').value;
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;
            
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            console.log('Admin registration attempt:', {
                url: `${config.apiUrl}/admin/auth/register`,
                email: email
            });
            
            const res = await fetch(`${config.apiUrl}/admin/auth/register`, {
                method: 'POST',
                ...config.fetchOptions,
                body: JSON.stringify({ name, email, password })
            });

            const responseText = await res.text();
            console.log('Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error('Invalid response format from server');
            }

            if (!res.ok) {
                throw new Error(data.error || `Server error: ${res.status}`);
            }

            if (data.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'admin-login.html';
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Admin registration error details:', error);
            const errorDiv = document.getElementById('admin-register-error');
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Failed to register. Please try again.';
                errorDiv.style.display = 'block';
            }
        }
    };
}

// Admin Login handler
if (document.getElementById('admin-login-form')) {
    document.getElementById('admin-login-form').onsubmit = async (e) => {
        e.preventDefault();
        
        try {
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            
            console.log('Admin login attempt:', {
                url: `${config.apiUrl}/admin/auth/login`,
                email: email
            });
            
            const res = await fetch(`${config.apiUrl}/admin/auth/login`, {
                method: 'POST',
                ...config.fetchOptions,
                body: JSON.stringify({ email, password })
            });

            // Get the response text first
            const responseText = await res.text();
            console.log('Raw response:', responseText);

            // Try to parse it as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error('Invalid response format from server');
            }

            if (!res.ok) {
                throw new Error(data.error || `Server error: ${res.status}`);
            }

            if (data.success) {
                console.log('Admin login successful:', data);
                localStorage.setItem('admin', JSON.stringify(data.admin));
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'admin-dashboard.html';
            } else {
                throw new Error(data.error || 'Admin login failed');
            }
        } catch (error) {
            console.error('Admin login error details:', error);
            const errorDiv = document.getElementById('admin-login-error');
            if (errorDiv) {
                errorDiv.textContent = error.message || 'Failed to login. Please try again.';
                errorDiv.style.display = 'block';
            }
        }
    };
}

// Check admin authentication status
export function checkAdminAuth() {
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (!adminToken || !admin) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Admin logout
export function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = 'admin-login.html';
}

// Make functions available globally
window.checkAdminAuth = checkAdminAuth;
window.adminLogout = adminLogout;

// Add admin token to request headers if available
export function getAdminHeaders() {
    const adminToken = localStorage.getItem('adminToken');
    return adminToken ? {
        ...config.fetchOptions.headers,
        'Authorization': `Bearer ${adminToken}`
    } : config.fetchOptions.headers;
}
