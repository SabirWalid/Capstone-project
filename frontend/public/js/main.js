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
    /**if (data.success) {
      window.location.href = 'login.html';
    } else {
      console.error(data.error);
    }/** */
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

const interestsList = [
  "Business", "Design", "Programming", "Marketing", "Data Science", 
  "AI", "Healthcare", "Education", "Finance", "Engineering", 
  "Social Impact", "Entrepreneurship", "Creative Arts", "Writing", 
  "Research", "Data Analysis", "Project Management", "Cybersecurity", 
  "Blockchain", "Sustainability", "Robotics", "Gaming", "IoT", "Cloud Computing", 
  "Sports", "Law", "Information Technology", "Community Service", "Mental Health", 
  "Software Development", "Fashion Design", 
  "Architecture", "Journalism", "Human Resources", "Sales", "Customer Service", 
  "Freelancing", "Nonprofit Management", "Public Relations", 
  "Consulting", "Supply Chain Management", "Logistics", "Real Estate", 
  "Retail Management", "E-commerce"
];

function renderInterestCheckboxes() {
  const container = document.getElementById('interests-checkboxes');
  if (!container) return;
  container.innerHTML = interestsList.map(interest =>
    `<label class="form-check-label me-3">
      <input type="checkbox" class="form-check-input" name="interests" value="${interest}"> ${interest}
    </label>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', renderInterestCheckboxes);

if (document.getElementById('career-test-form')) {
  document.getElementById('career-test-form').onsubmit = async (e) => {
    e.preventDefault();
    const skills = document.getElementById('skills').value.split(',').map(s => s.trim());
    // Get checked interests
    const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value);
    const res = await fetch(`${api}/career/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, interests })
    });
    const data = await res.json();
    const suggestionDiv = document.getElementById('career-suggestion');
    if (data.matches && data.matches.length > 0) {
      suggestionDiv.innerHTML = data.matches.map(match => `
        <div class="alert alert-success mb-2">
          <h4>${match.path} (Score: ${match.score})</h4>
          <strong>Recommended Courses:</strong>
          <ul>${match.courses.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
      `).join('');
    } else {
      suggestionDiv.innerHTML = `<div class="alert alert-warning">No matching career path found. Try entering more or different skills/interests.</div>`;
    }
  };
}

//  Add similar JS for courses, mentorship, chat, toolkit, opportunities, admin, etc.

// Example: Courses
const courses = []; // TODO: Replace with the hardcoded array of courses

function renderCourses() {
  // TODO: Implement rendering logic for courses
}

document.addEventListener('DOMContentLoaded', () => {
  renderCourses();
  updateNotifications();
});

// Attach booking listeners for notifications and offline sync
document.querySelectorAll('.book-session-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const idx = this.getAttribute('data-idx');
    bookMentorSession(idx);
  });
});

// Show notification in dashboard
function addNotification(message) {
  let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.unshift({ message, time: new Date().toLocaleTimeString() });
  localStorage.setItem('notifications', JSON.stringify(notifications));
  if (typeof updateNotifications === "function") updateNotifications();
}

// Booking handler
function bookMentorSession(idx) {
  const mentor = mentors[idx];
  saveMentorBookingOffline(mentor);
  addNotification(`You booked a session with ${mentor.name}.`);
  // Optionally: trigger sync if online
  if (navigator.onLine) syncMentorBookings();
}

// Sync mentor bookings with backend when online
function syncMentorBookings() {
  let bookings = JSON.parse(localStorage.getItem('mentorBookings') || '[]');
  if (bookings.length === 0) return;
  fetch('/api/sync-mentor-bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookings })
  }).then(res => {
    if (res.ok) {
      bookings.forEach(b => b.synced = true);
      localStorage.setItem('mentorBookings', JSON.stringify(bookings));
      addNotification('Your mentor bookings have been synced.');
    }
  }).catch(() => {
    // If offline or error, keep for next sync
  });
}

// Auto-sync when back online
window.addEventListener('online', syncMentorBookings);

// Use Google Material Icons
const iconLink = document.createElement('link');
iconLink.rel = "stylesheet";
iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
document.head.appendChild(iconLink);

document.addEventListener('DOMContentLoaded', renderMentors);

// Example: opportunities
let allOpportunities = [];

// Fetch opportunities from backend on page load
async function loadOpportunities() {
  const res = await fetch('/api/opportunities');
  allOpportunities = await res.json();
  renderOpportunities(allOpportunities);
}

// Filter by type (Scholarship, Job, Funding)
function filterOpportunities() {
  const type = document.getElementById('opportunity-filter').value;
  const filtered = type ? allOpportunities.filter(o => o.type === type) : allOpportunities;
  renderOpportunities(filtered);
}

// Render opportunities to the page
function renderOpportunities(opps) {
  const list = document.getElementById('opportunity-list');
  list.innerHTML = opps.map(o => `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge bg-secondary">${o.type}</span>
          <h5 class="card-title">${o.title}</h5>
          <p class="card-text">${o.description}</p>
          <a href="${o.link}" target="_blank" class="btn btn-outline-primary">Learn More / Apply</a>
        </div>
      </div>
    </div>
  `).join('');
}

// Load opportunities on page load
document.addEventListener('DOMContentLoaded', loadOpportunities);

// If you have a filter dropdown, add this:
document.getElementById('opportunity-filter')?.addEventListener('change', filterOpportunities);

// notification system

// Assume userId is available (from login/session/localStorage)
const userId = localStorage.getItem('userId');

// Show/hide notification dropdown
document.getElementById('notification-bell').onclick = function(e) {
  e.stopPropagation();
  const list = document.getElementById('notification-list');
  list.style.display = (list.style.display === 'none' || !list.style.display) ? 'block' : 'none';
};
// Hide dropdown when clicking outside
document.addEventListener('click', function() {
  document.getElementById('notification-list').style.display = 'none';
});

// Fetch notifications from backend
async function fetchNotifications() {
  if (!userId) return;
  const res = await fetch(`${api}/notifications/${userId}`);
  const data = await res.json();
  updateNotifications(data.notifications || []);
}

// Update notification UI
function updateNotifications(notifications) {
  document.getElementById('notification-count').innerText = notifications.length;
  const items = notifications.map(n => `<li class="list-group-item">${n.message}<br><small class="text-muted">${n.time}</small></li>`).join('');
  document.getElementById('notification-items').innerHTML = items || '<li class="list-group-item text-muted">No notifications</li>';
}

// Add a notification (call backend)
async function addNotification(message) {
  if (!userId) return;
  await fetch(`${api}/notifications/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message })
  });
  fetchNotifications();
}

// Example: Add notification on login/register (set this after login/register)
if (localStorage.getItem('justLoggedIn')) {
  addNotification('Welcome! You have successfully logged in.');
  localStorage.removeItem('justLoggedIn');
}

// Example: Call addNotification() when user enrolls, books, etc.
function onEnrollCourse(courseName) {
  addNotification(`You enrolled in ${courseName}.`);
}
function onBookMentorSession(mentorName) {
  addNotification(`You booked a session with ${mentorName}.`);
}
function onTakeCareerTest() {
  addNotification('You completed the career test.');
}

// Fetch notifications on page load
window.addEventListener('DOMContentLoaded', fetchNotifications);


// Use idb for IndexedDB (add <script src="https://unpkg.com/idb@7/build/iife/index-min.js"></script> in your HTML)
let db;
async function setupDB() {
  // Use the same database as offline manager for consistency
  db = await openIndexedDB();
}

// Helper function to open IndexedDB (consistent with offline manager)
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('refugee-techpreneurs-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('offlineProgress')) {
        const progressStore = db.createObjectStore('offlineProgress', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        progressStore.createIndex('courseId', 'courseId', { unique: false });
        progressStore.createIndex('userId', 'userId', { unique: false });
      }
      
      // Add other stores as needed
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'courseId' });
      }
    };
  });
}

// Enhanced save progress function with offline support
async function saveProgress(courseId, progressData) {
  if (!db) await setupDB();
  
  const userId = localStorage.getItem('userId') || 'anonymous';
  const timestamp = Date.now();
  
  // Save to local progress store (for backwards compatibility)
  await db.put('progress', { 
    courseId, 
    ...progressData, 
    timestamp 
  });
  
  // Save to offline progress store for syncing
  const tx = db.transaction(['offlineProgress'], 'readwrite');
  const store = tx.objectStore('offlineProgress');
  await store.add({
    courseId,
    userId,
    progress: progressData.progress || 0,
    completedLessons: progressData.completedLessons || 0,
    timeSpent: progressData.timeSpent || 0,
    lastAccessed: timestamp,
    timestamp,
    synced: false
  });
  
  console.log('Progress saved:', { courseId, ...progressData });
  
  // Try to sync immediately if online
  if (navigator.onLine && window.offlineManager) {
    try {
      await window.offlineManager.syncProgress();
    } catch (error) {
      console.log('Immediate sync failed, will retry later:', error);
    }
  }
}

// Load progress locally
async function loadProgress() {
  if (!db) await setupDB();
  const tx = db.transaction('progress', 'readonly');
  return await tx.store.getAll();
}

// Enhanced sync progress with backend
async function syncProgress(userId) {
  if (!navigator.onLine || !db) return;
  
  try {
    const tx = db.transaction(['offlineProgress'], 'readonly');
    const store = tx.objectStore('offlineProgress');
    const index = store.index('userId');
    const userProgress = await index.getAll(userId);
    
    if (userProgress.length === 0) return;
    
    const unsyncedProgress = userProgress.filter(p => !p.synced);
    if (unsyncedProgress.length === 0) return;
    
    const response = await fetch('/api/sync/progress', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ userId, progressData: unsyncedProgress })
    });
    
    if (response.ok) {
      // Mark progress as synced
      const updateTx = db.transaction(['offlineProgress'], 'readwrite');
      const updateStore = updateTx.objectStore('offlineProgress');
      
      for (const progress of unsyncedProgress) {
        progress.synced = true;
        await updateStore.put(progress);
      }
      
      console.log('Progress synced successfully');
      
      // Store last sync time
      localStorage.setItem('lastSyncTime', Date.now());
    }
  } catch (error) {
    console.error('Error syncing progress:', error);
  }
}

// Enhanced auto-sync when online
window.addEventListener('online', () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    syncProgress(userId);
    
    // Also trigger offline manager sync if available
    if (window.offlineManager) {
      window.offlineManager.syncAllOfflineData();
    }
  }
});

// Course completion handler with offline support
async function markCourseComplete(courseId) {
  const progressData = {
    progress: 100,
    completedLessons: await getCourseMaxLessons(courseId),
    timeSpent: 0, // Could be tracked separately
    completed: true
  };
  
  await saveProgress(courseId, progressData);
  
  // Show notification
  if (typeof addNotification === 'function') {
    addNotification('Course completed! Progress will sync when online.');
  }
}

// Helper function to get course max lessons
async function getCourseMaxLessons(courseId) {
  try {
    // Try to get from cached course data
    const cached = localStorage.getItem('cachedCourses');
    if (cached) {
      const data = JSON.parse(cached);
      const course = data.courses?.find(c => c._id === courseId || c.id === courseId);
      if (course && course.materials) {
        return course.materials.length;
      }
    }
    
    // Default fallback
    return 10;
  } catch (error) {
    return 10;
  }
}

// Enrollment with offline support
async function enrollInCourse(courseId) {
  const userId = localStorage.getItem('userId') || 'anonymous';
  
  if (navigator.onLine) {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ courseId, userId })
      });
      
      if (response.ok) {
        addNotification('Successfully enrolled in course!');
        return true;
      } else {
        throw new Error('Enrollment failed');
      }
    } catch (error) {
      console.error('Online enrollment failed:', error);
      // Fallback to offline enrollment
      return await enrollOffline(courseId, userId);
    }
  } else {
    return await enrollOffline(courseId, userId);
  }
}

// Offline enrollment
async function enrollOffline(courseId, userId) {
  if (!db) await setupDB();
  
  try {
    const enrollmentData = {
      courseId,
      userId,
      enrolledAt: Date.now(),
      progress: 0,
      status: 'enrolled'
    };
    
    // Store in offline enrollments for syncing later
    if (window.offlineManager) {
      await window.offlineManager.enrollOffline(courseId, userId);
    } else {
      // Fallback storage
      const enrollments = JSON.parse(localStorage.getItem('offlineEnrollments') || '[]');
      enrollments.push(enrollmentData);
      localStorage.setItem('offlineEnrollments', JSON.stringify(enrollments));
    }
    
    addNotification('Enrolled in course (will sync when online)');
    return true;
  } catch (error) {
    console.error('Offline enrollment failed:', error);
    addNotification('Failed to enroll in course');
    return false;
  }
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', () => {
  setupDB().catch(error => {
    console.error('Failed to setup database:', error);
  });
});

// Export functions for use in other scripts
window.courseHelpers = {
  saveProgress,
  loadProgress,
  syncProgress,
  markCourseComplete,
  enrollInCourse,
  enrollOffline
};

// Example usage in your course page
document.getElementById('complete-btn').onclick = () => {
  saveProgress(courseId, true);
};

document.getElementById('sync-btn').onclick = () => {
  const userId = localStorage.getItem('userId');
  if (userId) syncProgress(userId);
};
window.addEventListener('online', () => {
  document.getElementById('online-banner').style.display = 'block';
  setTimeout(() => document.getElementById('online-banner').style.display = 'none', 2000);
});
window.addEventListener('offline', () => {
  document.getElementById('offline-banner').style.display = 'block';
});

// Exampe account

const accountApi = '/api/account';
// userId is already declared earlier, so do not redeclare it here

// Load user info
async function loadProfile() {
  if (!userId) return;
  const res = await fetch(`${accountApi}/profile?userId=${userId}`);
  const data = await res.json();
  if (data.success) {
    const user = data.user;
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-links').value = (user.links || []).join(', ');
    document.getElementById('profile-timezone').value = user.timeZone || '';
    document.getElementById('profile-language').value = user.language || '';
    if (user.profilePicture) {
      const img = document.getElementById('profile-img-preview');
      img.src = user.profilePicture;
      img.style.display = 'block';
    }
  }
}

document.getElementById('profile-picture').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const img = document.getElementById('profile-img-preview');
      img.src = evt.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('profile-form').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  formData.append('userId', userId);
  // Convert links to array
  const links = formData.get('links');
  if (links) {
    formData.set('links', links.split(',').map(l => l.trim()).filter(Boolean));
  }
  const res = await fetch(`${accountApi}/profile`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  const msg = document.getElementById('profile-msg');
  if (data.success) {
    msg.textContent = 'Profile updated!';
    loadProfile();
  } else {
    msg.textContent = 'Update failed: ' + (data.error || 'Unknown error');
  }
};

document.addEventListener('DOMContentLoaded', loadProfile);