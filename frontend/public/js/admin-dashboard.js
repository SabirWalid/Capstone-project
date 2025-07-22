window.showSection = function(section) {
  // Hide all sections first
  document.getElementById('dashboard-section').style.display = 'none';
  document.getElementById('courses-section').style.display = 'none';
  document.getElementById('opportunities-section').style.display = 'none';
  document.getElementById('mentors-section').style.display = 'none';
  document.getElementById('settings-section').style.display = 'none';
  document.getElementById('resources-section').style.display = 'none';

  // Show the selected section
  document.getElementById(section + '-section').style.display = 'block';

  // Highlight active link
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  document.querySelector('.sidebar a[onclick*="' + section + '"]').classList.add('active');

  // Load specific data for the section
  if (section === 'courses') loadCourses();
  if (section === 'opportunities') loadOpportunities();
  if (section === 'mentors') loadMentors();
  if (section === 'resources') {
    if (window.adminManager && window.adminManager.refresh) {
      window.adminManager.refresh();
    } else if (typeof loadResources === 'function') {
      loadResources();
    }
  }
};

const adminToken = localStorage.getItem('adminToken');
function showSection(section) {
  document.querySelectorAll('[id^="admin-section-"]').forEach(div => div.style.display = 'none');
  document.getElementById('admin-section-' + section).style.display = 'block';
  if (section === 'courses') loadCourses();
}

async function loadCourses() {
  const res = await fetch('/api/admin/courses', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  if (!res.ok) {
    alert('Failed to load courses');
    return;
  }
  const courses = await res.json();
  document.getElementById('courses-list').innerHTML = courses.map(c =>
    `<div>
      ${c.title} 
      <button onclick="showCourseDetail('${c._id}')">View/Edit</button>
      <button onclick="deleteCourse('${c._id}')">Delete</button>
    </div>`
  ).join('');
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  const res = await fetch('/api/admin/courses/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  if (res.ok) {
    loadCourses();
  } else {
    alert('Failed to delete course');
  }
}

// ...existing code...

async function showCourseDetail(id) {
  const res = await fetch('/api/admin/courses/' + id, {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  if (!res.ok) {
    alert('Failed to load course details');
    return;
  }
  const course = await res.json();

  document.getElementById('course-title').value = course.title;
  // ...repeat for other fields...

  document.getElementById('courseModalLabel').textContent = 'Edit Course';
  new bootstrap.Modal(document.getElementById('courseModal')).show();

  document.getElementById('course-form').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const updateRes = await fetch('/api/admin/courses/' + id, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + adminToken },
      body: formData
    });
    if (updateRes.ok) {
      alert('Course updated!');
      loadCourses();
      bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
    } else {
      alert('Failed to update course');
    }
  };
}

// Opportunity Management

let allOpportunities = [];
let editingOpportunityId = null;

async function loadOpportunities() {
  const res = await fetch('/api/admin/opportunities', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
  });
  allOpportunities = await res.json();
  renderOpportunities(allOpportunities);
}
window.loadOpportunities = loadOpportunities;


function filterOpportunities() {
  const type = document.getElementById('opportunity-filter').value;
  const filtered = type ? allOpportunities.filter(o => o.type === type) : allOpportunities;
  renderOpportunities(filtered);
}
window.filterOpportunities = filterOpportunities;

document.getElementById('opportunity-filter').addEventListener('change', filterOpportunities);

function showAddOpportunityForm() {
  editingOpportunityId = null;
  document.getElementById('opportunity-form').reset();
  document.getElementById('opportunityModalLabel').textContent = 'Add Opportunity';
  // Clear all input fields
  document.getElementById('opportunity-title').value = '';
  document.getElementById('opportunity-description').value = '';
  document.getElementById('opportunity-category').value = '';
  document.getElementById('opportunity-deadline').value = '';
  document.getElementById('opportunity-link').value = '';
  document.getElementById('opportunity-type').value = '';
  new bootstrap.Modal(document.getElementById('opportunityModal')).show();
}
window.showAddOpportunityForm = showAddOpportunityForm;

function renderOpportunities(opps) {
  const list = document.getElementById('opportunities-list');
  list.innerHTML = opps.map(o => `
    <div class="card mb-2">
      <div class="card-body">
        <span class="badge bg-secondary">${o.type}</span>
        <h5>${o.title}</h5>
        <p>${o.description}</p>
        <a href="${o.link}" target="_blank" class="btn btn-outline-primary btn-sm">Learn More / Apply</a>
        <button class="btn btn-sm btn-warning ms-2" onclick="editOpportunity('${o._id}')">Edit</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="deleteOpportunity('${o._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function editOpportunity(id) {
  editingOpportunityId = id;
  const res = await fetch('/api/admin/opportunities/' + id, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
  });
  const o = await res.json();
  document.getElementById('opportunity-title').value = o.title;
  document.getElementById('opportunity-description').value = o.description;
  document.getElementById('opportunity-category').value = o.category;
  document.getElementById('opportunity-deadline').value = o.deadline;
  document.getElementById('opportunity-link').value = o.link;
  document.getElementById('opportunity-type').value = o.type;
  document.getElementById('opportunityModalLabel').textContent = 'Edit Opportunity';
  new bootstrap.Modal(document.getElementById('opportunityModal')).show();
}

document.getElementById('opportunity-form').onsubmit = async function(e) {
  e.preventDefault();
  const body = {
    title: document.getElementById('opportunity-title').value,
    description: document.getElementById('opportunity-description').value,
    category: document.getElementById('opportunity-category').value,
    deadline: document.getElementById('opportunity-deadline').value,
    link: document.getElementById('opportunity-link').value,
    type: document.getElementById('opportunity-type').value
  };
  let url = '/api/admin/opportunities';
  let method = 'POST';
  if (editingOpportunityId) {
    url += '/' + editingOpportunityId;
    method = 'PUT';
  }
  await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
    },
    body: JSON.stringify(body)
  });
  bootstrap.Modal.getInstance(document.getElementById('opportunityModal')).hide();
  loadOpportunities();
};

async function deleteOpportunity(id) {
  if (!confirm('Delete this opportunity?')) return;
  await fetch('/api/admin/opportunities/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }
  });
  loadOpportunities();
}

document.addEventListener('DOMContentLoaded', loadOpportunities);

async function loadPendingOpportunities() {
  const res = await fetch('/api/admin/opportunities/pending', {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') }
  });
  const opps = await res.json();
  const list = document.getElementById('pending-opps-list');
  list.innerHTML = opps.map(o => `
    <div class="card mb-2">
      <div class="card-body">
        <span class="badge bg-secondary">${o.type}</span>
        <h5>${o.title}</h5>
        <p>${o.description}</p>
        <p>Mentor: ${o.mentor?.name || ''}</p>
        <button class="btn btn-success btn-sm" onclick="approveOpp('${o._id}')">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectOpp('${o._id}')">Reject</button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteOpp('${o._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}
window.approveOpp = async function(id) {
  await fetch(`/api/admin/opportunities/${id}/approve`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') }
  });
  loadPendingOpportunities();
};
window.rejectOpp = async function(id) {
  await fetch(`/api/admin/opportunities/${id}/reject`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') }
  });
  loadPendingOpportunities();
};
window.deleteOpp = async function(id) {
  await fetch(`/api/admin/opportunities/${id}`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') }
  });
  loadPendingOpportunities();
};
document.addEventListener('DOMContentLoaded', loadPendingOpportunities);

// At the end of /js/admin-dashboard.js
showSection('dashboard');