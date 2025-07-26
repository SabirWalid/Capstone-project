import config from './config.js';

// Login handler
if (document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      console.log('Login attempt:', {
        url: `${config.apiUrl}/auth/login`,
        email: email,
        config: config.fetchOptions
      });
      
      const res = await fetch(`${config.apiUrl}/auth/login`, {
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
        console.log('Login successful:', data);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token); // Save token if provided
        window.location.href = 'dashboard.html';
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', error);
      alert(error.message || 'Login failed. Please try again.');
    }
  };
}

// Register handler
if (document.getElementById('register-form')) {
  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    const res = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (data.success) {
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } else {
      alert(data.error || 'Registration failed');
    }
  };
}