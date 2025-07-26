import config from './config.js';

// Login handler
if (document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    
    try {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      console.log('Attempting login to:', `${config.apiUrl}/auth/login`);
      
      const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        ...config.fetchOptions,
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error || 'Login failed');
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