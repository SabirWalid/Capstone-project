// Mentor Profile
async function loadMentorProfile() {
  const res = await fetch('/api/mentor/profile', { headers: { Authorization: 'Bearer ' + localStorage.getItem('mentorToken') } });
  const mentor = await res.json();
  document.getElementById('mentor-name').value = mentor.name || '';
  document.getElementById('mentor-bio').value = mentor.bio || '';
  document.getElementById('mentor-avatar').value = mentor.avatar || '';
  document.getElementById('mentor-social').value = (mentor.socialLinks || []).join(', ');
  document.getElementById('mentor-work').value = (mentor.workLinks || []).join(', ');
  document.getElementById('mentor-calendar').value = mentor.calendarLink || '';
}
document.getElementById('mentor-profile-form').onsubmit = async function(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById('mentor-name').value,
    bio: document.getElementById('mentor-bio').value,
    avatar: document.getElementById('mentor-avatar').value,
    socialLinks: document.getElementById('mentor-social').value.split(',').map(s => s.trim()),
    workLinks: document.getElementById('mentor-work').value.split(',').map(s => s.trim()),
    calendarLink: document.getElementById('mentor-calendar').value
  };
  await fetch('/api/mentor/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('mentorToken') },
    body: JSON.stringify(body)
  });
  alert('Profile updated!');
};

let editingOppId = null;
async function loadMentorOpportunities() {
  const res = await fetch('/api/mentor/opportunities', { headers: { Authorization: 'Bearer ' + localStorage.getItem('mentorToken') } });
  const opps = await res.json();
  const list = document.getElementById('mentor-opps-list');
  list.innerHTML = opps.map(o => `
    <div class="card mb-2">
      <div class="card-body">
        <span class="badge bg-secondary">${o.type}</span>
        <h5>${o.title}</h5>
        <p>${o.description}</p>
        <span>Status: <strong>${o.status}</strong></span>
        <button class="btn btn-sm btn-warning ms-2" onclick="editMentorOpp('${o._id}')">Edit</button>
      </div>
    </div>
  `).join('');
}
window.editMentorOpp = function(id) {
  editingOppId = id;
  fetch('/api/mentor/opportunities', { headers: { Authorization: 'Bearer ' + localStorage.getItem('mentorToken') } })
    .then(res => res.json())
    .then(opps => {
      const o = opps.find(x => x._id === id);
      document.getElementById('opp-title').value = o.title;
      document.getElementById('opp-description').value = o.description;
      document.getElementById('opp-category').value = o.category;
      document.getElementById('opp-deadline').value = o.deadline;
      document.getElementById('opp-link').value = o.link;
      document.getElementById('opp-type').value = o.type;
      new bootstrap.Modal(document.getElementById('mentorOppModal')).show();
    });
};
document.getElementById('add-opp-btn').onclick = function() {
  editingOppId = null;
  document.getElementById('mentor-opp-form').reset();
  new bootstrap.Modal(document.getElementById('mentorOppModal')).show();
};
document.getElementById('mentor-opp-form').onsubmit = async function(e) {
  e.preventDefault();
  const body = {
    title: document.getElementById('opp-title').value,
    description: document.getElementById('opp-description').value,
    category: document.getElementById('opp-category').value,
    deadline: document.getElementById('opp-deadline').value,
    link: document.getElementById('opp-link').value,
    type: document.getElementById('opp-type').value
  };
  let url = '/api/mentor/opportunities';
  let method = 'POST';
  if (editingOppId) {
    url += '/' + editingOppId;
    method = 'PUT';
  }
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('mentorToken') },
    body: JSON.stringify(body)
  });
  bootstrap.Modal.getInstance(document.getElementById('mentorOppModal')).hide();
  loadMentorOpportunities();
};

document.addEventListener('DOMContentLoaded', () => {
  loadMentorProfile();
  loadMentorOpportunities();
});

// Mentor Register
document.getElementById('mentor-register-form').onsubmit = async function(e) {
  e.preventDefault();
  const res = await fetch('/api/mentor/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('mentor-register-name').value,
      email: document.getElementById('mentor-register-email').value,
      password: document.getElementById('mentor-register-password').value
    })
  });
  const data = await res.json();
  alert(data.message);
};

// Mentor Login
document.getElementById('mentor-login-form').onsubmit = async function(e) {
  e.preventDefault();
  const res = await fetch('/api/mentor/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('mentor-login-email').value,
      password: document.getElementById('mentor-login-password').value
    })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('mentorToken', data.token);
    window.location.href = 'mentor-dashboard.html'; // Redirect to mentor dashboard
  } else {
    alert(data.message);
  }
};