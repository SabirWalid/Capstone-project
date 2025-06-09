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

//  Add similar JS for courses, mentorship, chat, toolkit, opportunities, admin, etc.

// Example: Courses
const courses = [
  {
    title: "Introduction to Coding",
    description: "Learn programming fundamentals with Python and JavaScript",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    progress: 75
  },
  {
    title: "Green Tech Basics",
    description: "Sustainable technology and environmental solutions",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    progress: 40
  },
  {
    title: "Entrepreneurship 101",
    description: "Start your own business with proven strategies",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    progress: 20
  },
  {
    title: "Digital Marketing",
    description: "Master online marketing and social media strategies",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    progress: 60
  }
];

function renderCourses() {
  const courseList = document.getElementById('course-list');
  courseList.innerHTML = '';
  courses.forEach(course => {
    courseList.innerHTML += `
      <div class="col-md-3 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${course.image}" class="card-img-top" alt="${course.title}">
          <div class="card-body">
            <h5 class="card-title">${course.title}</h5>
            <p class="card-text">${course.description}</p>
            <div class="progress mb-2" style="height: 6px;">
              <div class="progress-bar bg-info" role="progressbar" style="width: ${course.progress}%"></div>
            </div>
            <small class="text-muted">${course.progress}% Complete</small>
          </div>
        </div>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', renderCourses);

// Example: Mentorship
const mentors = [
  {
    name: "Sarah Johnson",
    title: "Tech Entrepreneur, 15+ years experience",
    tags: ["Coding", "Startup"],
    color: "green",
    btnClass: "btn-green"
  },
  {
    name: "Michael Chen",
    title: "Green Tech Specialist, Environmental Engineer",
    tags: ["GreenTech", "Sustainability"],
    color: "blue",
    btnClass: "btn-blue"
  },
  {
    name: "Emily Rodriguez",
    title: "Marketing Director, Digital Strategy Expert",
    tags: ["Marketing", "Strategy"],
    color: "orange",
    btnClass: "btn-orange"
  },
  {
    name: "David Kim",
    title: "Financial Advisor, Investment Specialist",
    tags: ["Finance", "Investment"],
    color: "purple",
    btnClass: "btn-purple"
  }
];

const colorMap = {
  green: "#388e3c",
  blue: "#1976d2",
  orange: "#ffa000",
  purple: "#8e24aa"
};

function renderMentors() {
  const mentorList = document.getElementById('mentor-list');
  mentorList.innerHTML = '';
  mentors.forEach(mentor => {
    mentorList.innerHTML += `
      <div class="col-md-3">
        <div class="mentor-card">
          <div class="mentor-avatar" style="background:${colorMap[mentor.color]}">
            <span class="material-icons" style="font-size:3.5rem;">person</span>
          </div>
          <div class="mentor-name">${mentor.name}</div>
          <div class="mentor-title">${mentor.title}</div>
          <div class="mentor-tags">
            ${mentor.tags.map(tag => `<span class="mentor-tag">${tag}</span>`).join('')}
          </div>
          <button class="btn btn-book ${mentor.btnClass}">BOOK SESSION</button>
        </div>
      </div>
    `;
  });
}

// Use Google Material Icons
const iconLink = document.createElement('link');
iconLink.rel = "stylesheet";
iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
document.head.appendChild(iconLink);

document.addEventListener('DOMContentLoaded', renderMentors);

// Example: opportunities
const opportunities = [
  {
    type: "Scholarship",
    badgeClass: "",
    icon: `<svg width="22" height="22" fill="#388e3c" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.18L18.09 9 12 12.82 5.91 9 12 5.18zM3 17v2c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2l-9 4.91L3 17z"/></svg>`,
    title: "Tech Innovators Scholarship",
    desc: "$5,000 scholarship for underrepresented students in STEM fields",
    url: "https://preview.uxpin.com/external-url",
    btnText: "LEARN MORE",
    btnClass: "btn-outline-success"
  },
  {
    type: "Funding",
    badgeClass: "funding",
    icon: `<svg width="22" height="22" fill="#1976d2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-2.83.48-5.48-1.51-5.96-4.34-.08-.5.36-.93.87-.93.41 0 .76.31.85.71.35 1.6 1.8 2.76 3.44 2.76 1.93 0 3.5-1.57 3.5-3.5 0-1.61-1.08-2.96-2.61-3.36V7.5c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2V7.5c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-.5c0-.28.22-.5.5-.5s.5.22.5.5v.5c0 1.1-.9 2-2 2s-2-.9-2-2z"/></svg>`,
    title: "Green Startup Grant",
    desc: "Up to $25,000 for environmentally focused startup ventures",
    url: "https://preview.uxpin.com/external-url",
    btnText: "APPLY NOW",
    btnClass: "btn-outline-primary"
  },
  {
    type: "Job Opportunity",
    badgeClass: "job",
    icon: `<svg width="22" height="22" fill="#ffa000" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2s-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0V4h4v2h-4zm6 14H4V8h16v12zm-8-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
    title: "Junior Developer Position",
    desc: "Entry-level position at a fast-growing tech company",
    url: "https://preview.uxpin.com/external-url",
    btnText: "VIEW DETAILS",
    btnClass: "btn-outline-warning",
    remote: "Remote • $60,000-$75,000"
  }
];

function renderOpportunities() {
  const list = document.getElementById('opportunity-list');
  list.innerHTML = '';
  opportunities.forEach(opp => {
    list.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="opportunity-card h-100">
          <div class="opportunity-badge ${opp.badgeClass}">
            ${opp.icon}
            <span style="margin-left:8px;">${opp.type}</span>
          </div>
          <div class="opportunity-title">${opp.title}</div>
          <div class="opportunity-desc">${opp.desc}</div>
          <a class="opportunity-link" href="${opp.url}" target="_blank">${opp.url}</a>
          ${opp.remote ? `<div class="opportunity-remote">${opp.remote}</div>` : ''}
          <a href="${opp.url}" target="_blank" class="btn ${opp.btnClass}">${opp.btnText}</a>
        </div>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', renderOpportunities);