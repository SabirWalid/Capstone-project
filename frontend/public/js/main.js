const api = 'http://localhost:5000/api';

// Example: Login
if (document.getElementById('login-form')) {
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.error);
    }
  };
}

// Example: Register
if (document.getElementById('register-form')) {
  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    const res = await fetch(`${api}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (data.success) {
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } else {
      alert(data.error);
    }
  };
}

// Example: Dashboard Recommendations
if (document.getElementById('user-name')) {
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('user-name').innerText = user ? user.name : '';
  // Fetch personalized recommendations from backend
  fetch(`${api}/career/recommendations?userId=${user._id}`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('recommendations');
      data.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.innerText = r;
        ul.appendChild(li);
      });
    });
}

// Example: Career Test
if (document.getElementById('career-test-form')) {
  document.getElementById('career-test-form').onsubmit = async (e) => {
    e.preventDefault();
    const skills = document.getElementById('skills').value.split(',');
    const interests = document.getElementById('interests').value.split(',');
    const res = await fetch(`${api}/career/test`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, interests })
    });
    const data = await res.json();
    document.getElementById('career-suggestion').innerText =
      `Suggested Path: ${data.path}, Suggestion: ${data.suggestion}`;
  };
}

// Add similar JS for courses, mentorship, chat, toolkit, opportunities, admin, etc.