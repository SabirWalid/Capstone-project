// Enhanced Career Test Frontend
class EnhancedCareerTest {
    constructor() {
        console.log('EnhancedCareerTest constructor called');
        this.currentUser = this.getUserFromStorage();
        this.testHistory = [];
        this.customInterests = new Set(); // Initialize custom interests
        console.log('Current user:', this.currentUser);
        
        // Set API base URL based on current environment
        this.apiBaseUrl = this.getApiBaseUrl();
        console.log('API Base URL:', this.apiBaseUrl);
        
        this.init();
    }

    getApiBaseUrl() {
        // If we're on Live Server (port 5500), point to backend server
        if (window.location.port === '5500' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        // If we're on the backend server, use relative paths
        return '';
    }

    getUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    async init() {
        console.log('Initializing Enhanced Career Test components...');
        this.renderInterestCheckboxes();
        this.setupEventListeners();
        this.loadUserHistory();
        this.setupSkillAutocomplete();
        console.log('Enhanced Career Test initialization complete');
    }

    renderInterestCheckboxes() {
        const container = document.getElementById('interests-checkboxes');
        if (!container) return;

        const enhancedInterestsList = [
            "Programming", "Web Development", "Data Science", "Machine Learning", "AI", 
            "Cybersecurity", "Mobile Development", "Game Development", "DevOps", "Cloud Computing",
            "UI/UX Design", "Graphic Design", "Product Design", "Visual Design", "Creative Arts",
            "Digital Marketing", "SEO", "Social Media Marketing", "Content Marketing", "Email Marketing",
            "Business Strategy", "Entrepreneurship", "Project Management", "Product Management", "Leadership",
            "Data Analysis", "Statistics", "Research", "Mathematics", "Finance",
            "Writing", "Content Creation", "Copywriting", "Technical Writing", "Journalism",
            "Education", "Training", "Mentoring", "Community Building", "Social Impact",
            "Healthcare", "Mental Health", "Wellness", "Fitness", "Nutrition",
            "Music", "Video Production", "Photography", "Animation", "Film Making",
            "Sales", "Customer Service", "Public Relations", "Consulting", "Human Resources",
            "Architecture", "Engineering", "Manufacturing", "Supply Chain", "Logistics",
            "Law", "Compliance", "Risk Management", "Quality Assurance", "Testing",
            "Blockchain", "Cryptocurrency", "FinTech", "Biomedical Engineering", "Environmental Science",
            "Robotics", "3D Modeling", "Game Design", "Virtual Reality", "Augmented Reality"
        ];

        // Create the clickable interest badges
        const interestsHTML = enhancedInterestsList.map(interest =>
            `<span class="interest-badge badge bg-light text-dark border me-2 mb-2" 
                   data-interest="${interest}" 
                   style="cursor: pointer; transition: all 0.3s ease;"
                   onclick="careerTest.toggleInterest('${interest}', this)">
                ${interest}
            </span>`
        ).join('');

        // Add custom interest input section
        const customInterestHTML = `
            <div class="mt-3 p-3 border rounded bg-light">
                <h6 class="mb-2">
                    <i class="bi bi-plus-circle"></i> Add Custom Interests
                </h6>
                <div class="input-group">
                    <input type="text" 
                           class="form-control" 
                           id="custom-interest-input" 
                           placeholder="e.g. Space Technology, Sustainable Energy, Food Science..."
                           list="interest-suggestions">
                    <button class="btn btn-outline-primary" type="button" id="add-interest-btn">
                        <i class="bi bi-plus"></i> Add
                    </button>
                </div>
                <div class="form-text">Can't find your interest? Add it here! We'll include it in your career matching.</div>
                <div id="custom-interests-display" class="mt-2"></div>
                
                <!-- Datalist for suggestions -->
                <datalist id="interest-suggestions">
                    <option value="Space Technology">
                    <option value="Renewable Energy">
                    <option value="Sustainable Development">
                    <option value="Food Science">
                    <option value="Biotechnology">
                    <option value="Nanotechnology">
                    <option value="Quantum Computing">
                    <option value="Internet of Things">
                    <option value="Smart Cities">
                    <option value="Digital Art">
                    <option value="Podcasting">
                    <option value="E-sports">
                    <option value="Climate Change">
                    <option value="Mental Health Advocacy">
                    <option value="Social Justice">
                    <option value="Cultural Preservation">
                    <option value="Language Learning">
                    <option value="Travel Technology">
                    <option value="Pet Care Technology">
                    <option value="Fashion Technology">
                </datalist>
            </div>
        `;

        container.innerHTML = interestsHTML + customInterestHTML;

        // Setup custom interest functionality
        this.setupCustomInterests();
        
        // Initialize selected interests tracking
        this.selectedInterests = new Set();
    }

    toggleInterest(interest, element) {
        if (this.selectedInterests.has(interest)) {
            // Deselect
            this.selectedInterests.delete(interest);
            element.classList.remove('selected');
            element.classList.add('bg-light', 'text-dark');
        } else {
            // Select
            this.selectedInterests.add(interest);
            element.classList.add('selected');
            element.classList.remove('bg-light', 'text-dark');
        }
        this.updateInterestCounter();
    }

    setupCustomInterests() {
        const addBtn = document.getElementById('add-interest-btn');
        const input = document.getElementById('custom-interest-input');
        const display = document.getElementById('custom-interests-display');

        if (!addBtn || !input || !display) return;

        // Store custom interests
        this.customInterests = new Set();

        // Add interest function
        const addInterest = () => {
            const interest = input.value.trim();
            if (interest && !this.customInterests.has(interest)) {
                this.customInterests.add(interest);
                this.renderCustomInterests();
                input.value = '';
                this.updateInterestCounter();
            }
        };

        // Event listeners
        addBtn.addEventListener('click', addInterest);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
            }
        });

        // Auto-suggestion on input
        input.addEventListener('input', () => {
            this.showInterestSuggestions(input.value);
        });
    }

    renderCustomInterests() {
        const display = document.getElementById('custom-interests-display');
        if (!display) return;

        if (this.customInterests.size === 0) {
            display.innerHTML = '';
            return;
        }

        display.innerHTML = `
            <div class="mt-2">
                <small class="text-muted">Your custom interests:</small><br>
                ${Array.from(this.customInterests).map(interest => `
                    <span class="badge me-1 mb-1" style="background-color: var(--tertiary-accent); color: white;">
                        ${interest}
                        <button type="button" class="btn-close btn-close-white ms-1" 
                                onclick="careerTest.removeCustomInterest('${interest}')" 
                                style="font-size: 0.6em;">
                        </button>
                    </span>
                `).join('')}
            </div>
        `;
    }

    removeCustomInterest(interest) {
        this.customInterests.delete(interest);
        this.renderCustomInterests();
        this.updateInterestCounter();
    }

    showInterestSuggestions(inputValue) {
        // This could be expanded to show dynamic suggestions
        // based on the input value in the future
    }

    setupSkillAutocomplete() {
        const skillsInput = document.getElementById('skills');
        if (!skillsInput) return;

        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Node.js', 'SQL', 'Git',
            'Photoshop', 'Illustrator', 'Figma', 'Adobe Creative Suite', 'AutoCAD', 'Sketch',
            'Excel', 'PowerPoint', 'Google Analytics', 'Salesforce', 'HubSpot', 'WordPress',
            'Project Management', 'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
            'Data Analysis', 'Machine Learning', 'Statistics', 'Research', 'Critical Thinking',
            'SEO', 'Social Media', 'Content Writing', 'Marketing', 'Sales', 'Customer Service',
            'Public Speaking', 'Presentation', 'Negotiation', 'Time Management', 'Organization'
        ];

        // Create datalist for autocomplete
        const datalist = document.createElement('datalist');
        datalist.id = 'skills-suggestions';
        datalist.innerHTML = commonSkills.map(skill => `<option value="${skill}">`).join('');
        skillsInput.setAttribute('list', 'skills-suggestions');
        skillsInput.parentNode.appendChild(datalist);

        // Add placeholder with examples
        skillsInput.placeholder = 'e.g. JavaScript, Python, Leadership, Design...';
    }

    setupEventListeners() {
        const form = document.getElementById('career-test-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Add real-time skill validation
        const skillsInput = document.getElementById('skills');
        if (skillsInput) {
            skillsInput.addEventListener('blur', () => this.validateSkills());
        }

        // Initialize interest counter
        this.updateInterestCounter();

        // Add history toggle button
        this.addHistoryButton();
    }

    validateSkills() {
        const skillsInput = document.getElementById('skills');
        const skills = skillsInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const feedback = document.getElementById('skills-feedback') || this.createSkillsFeedback();
        
        if (skills.length === 0) {
            feedback.textContent = 'Please enter at least one skill';
            feedback.className = 'text-warning small';
        } else if (skills.length < 3) {
            feedback.textContent = `Good! Consider adding ${3 - skills.length} more skill(s) for better matches`;
            feedback.className = 'text-info small';
        } else {
            feedback.textContent = `Great! ${skills.length} skills will help find accurate matches`;
            feedback.className = 'text-success small';
        }
    }

    createSkillsFeedback() {
        const feedback = document.createElement('div');
        feedback.id = 'skills-feedback';
        feedback.className = 'small text-muted mt-1';
        document.getElementById('skills').parentNode.appendChild(feedback);
        return feedback;
    }

    updateInterestCounter() {
        const counter = document.getElementById('interest-counter') || this.createInterestCounter();
        
        const selectedCount = this.selectedInterests ? this.selectedInterests.size : 0;
        const customCount = this.customInterests ? this.customInterests.size : 0;
        const totalCount = selectedCount + customCount;
        
        const countText = totalCount === 1 ? 'interest' : 'interests';
        const breakdown = customCount > 0 ? 
            ` (${selectedCount} selected + ${customCount} custom)` : '';
        
        counter.textContent = `${totalCount} ${countText} selected${breakdown}`;
        
        if (totalCount === 0) {
            counter.className = 'small text-warning';
        } else if (totalCount < 5) {
            counter.className = 'small text-info';
        } else {
            counter.className = 'small text-success';
        }
    }

    createInterestCounter() {
        const counter = document.createElement('div');
        counter.id = 'interest-counter';
        counter.className = 'small text-muted mt-2';
        document.getElementById('interests-checkboxes').parentNode.appendChild(counter);
        return counter;
    }

    addHistoryButton() {
        if (!this.currentUser) return;

        const form = document.getElementById('career-test-form');
        const historyBtn = document.createElement('button');
        historyBtn.type = 'button';
        historyBtn.className = 'btn btn-outline-secondary me-2';
        historyBtn.innerHTML = 'View Test History';
        historyBtn.onclick = () => this.toggleHistory();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.parentNode.insertBefore(historyBtn, submitBtn);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted - Enhanced Career Test');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = 'Analyzing...';
            submitBtn.disabled = true;

            const skills = document.getElementById('skills').value
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            const interests = Array.from(this.selectedInterests || [])
                .concat(Array.from(this.customInterests || [])); // Include custom interests

            console.log('Skills:', skills);
            console.log('Interests:', interests);

            if (skills.length === 0 && interests.length === 0) {
                throw new Error('Please provide at least one skill or interest');
            }

            const requestBody = {
                skills,
                interests,
                userId: this.currentUser?._id,
                saveResults: !!this.currentUser
            };

            console.log('Sending request:', requestBody);

            const response = await fetch(`${this.apiBaseUrl}/api/career/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            this.displayEnhancedResults(data);
            
            // Update history if user is logged in
            if (this.currentUser) {
                await this.loadUserHistory();
            }

        } catch (error) {
            console.error('Career test error:', error);
            this.displayError(error.message);
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    displayEnhancedResults(data) {
        const container = document.getElementById('career-suggestion');
        
        if (!data.matches || data.matches.length === 0) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <h5>No Strong Matches Found</h5>
                    <p>Don't worry! Here are some suggestions:</p>
                    <ul>
                        <li>Try adding more specific skills or interests</li>
                        <li>Consider related skills you might have</li>
                        <li>Explore our course catalog to develop new skills</li>
                    </ul>
                    <p class="mb-0">Analyzed ${data.totalCareersAnalyzed || 0} career paths</p>
                </div>
            `;
            return;
        }

        const resultsHTML = `
            <div class="card mt-4">
                <div class="card-header" style="background-color: var(--tertiary-accent); color: white;">
                    <h4 class="mb-0">Your Career Match Results</h4>
                    <small>Found ${data.matchesFound} matches from ${data.totalCareersAnalyzed} career paths</small>
                </div>
                <div class="card-body">
                    ${data.matches.map((match, index) => this.renderCareerMatch(match, index)).join('')}
                    
                    <div class="mt-4 p-3 rounded" style="background-color: var(--primary-bg);">
                        <h6>Next Steps:</h6>
                        <ul class="mb-0">
                            <li>Start with the highest-scored career path</li>
                            <li>Enroll in recommended beginner courses</li>
                            <li>Connect with mentors in your chosen field</li>
                            <li>Explore related career opportunities</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = resultsHTML;
        this.addResultInteractions();
    }

    renderCareerMatch(match, index) {
        const confidenceColor = match.confidence >= 80 ? 'success' : 
                               match.confidence >= 60 ? 'warning' : 'info';
        
        const salaryInfo = match.salaryRange ? 
            `<small class="text-muted">Salary: $${match.salaryRange.min?.toLocaleString()} - $${match.salaryRange.max?.toLocaleString()} ${match.salaryRange.currency}</small>` : '';

        return `
            <div class="career-match-card border rounded p-3 mb-3 ${index === 0 ? 'border-success' : ''}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="mb-1" style="color: var(--secondary-bg);">
                        ${match.title}
                        ${index === 0 ? '<span class="badge ms-2" style="background-color: var(--tertiary-accent); color: white;">Best Match</span>' : ''}
                    </h5>
                    <div class="text-end">
                        <div class="badge bg-${confidenceColor} fs-6">${match.score}% Match</div>
                        <div class="small text-muted">Confidence: ${match.confidence}%</div>
                    </div>
                </div>
                
                <p class="text-muted mb-2">${match.description}</p>
                ${salaryInfo}
                
                <div class="row mt-3">
                    <div class="col-md-6">
                        <h6>Matched Skills:</h6>
                        <div class="matched-skills">
                            ${match.matchedSkills.map(skill => 
                                `<span class="badge me-1 mb-1" style="background-color: var(--secondary-bg); color: white;" title="${skill.type} match (${Math.round(skill.confidence * 100)}%)">${skill.skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Matched Interests:</h6>
                        <div class="matched-interests">
                            ${match.matchedInterests.map(interest => 
                                `<span class="badge me-1 mb-1" style="background-color: var(--tertiary-accent); color: white;" title="${interest.type} match (${Math.round(interest.confidence * 100)}%)">${interest.interest}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6>Recommended Learning Path:</h6>
                    <div class="course-recommendations">
                        ${match.courses.map(course => `
                            <div class="course-item d-flex justify-content-between align-items-center p-2 border rounded mb-1">
                                <div>
                                    <strong>${course.title}</strong>
                                    <span class="badge bg-secondary ms-2">${course.difficulty}</span>
                                </div>
                                <small class="text-muted">${course.duration}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm" style="background-color: var(--tertiary-accent); color: white;" onclick="careerTest.bookmarkCareer('${match.career}')">
                        Bookmark
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="careerTest.viewCareerDetails('${match.career}')">
                        View Details
                    </button>
                    <button class="btn btn-sm" style="background-color: var(--secondary-bg); color: white;" onclick="careerTest.startLearningPath('${match.career}')">
                        Start Learning
                    </button>
                </div>
            </div>
        `;
    }

    addResultInteractions() {
        // Add smooth scrolling to results
        document.getElementById('career-suggestion').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    async bookmarkCareer(careerId) {
        if (!this.currentUser) {
            alert('Please log in to bookmark careers');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/career/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: this.currentUser._id, 
                    careerId 
                })
            });

            const data = await response.json();
            if (data.success) {
                this.showToast('Career bookmarked successfully!');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            this.showToast('Failed to bookmark career', 'error');
        }
    }

    async viewCareerDetails(careerId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/career/career/${careerId}`);
            const career = await response.json();
            
            // Create modal to show career details
            this.showCareerModal(career);
        } catch (error) {
            console.error('Error fetching career details:', error);
        }
    }

    showCareerModal(career) {
        const modalHTML = `
            <div class="modal fade" id="careerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${career.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${career.description}</p>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Required Skills:</h6>
                                    ${career.skills.map(skill => 
                                        `<span class="badge bg-primary me-1">${skill.name}</span>`
                                    ).join('')}
                                </div>
                                <div class="col-md-6">
                                    <h6>Key Interests:</h6>
                                    ${career.interests.map(interest => 
                                        `<span class="badge bg-info me-1">${interest.name}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <h6>Job Outlook: <span class="badge bg-success">${career.jobOutlook}</span></h6>
                                <h6>Industries: ${career.industry.join(', ')}</h6>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="careerTest.startLearningPath('${career._id}')">Start Learning Path</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('careerModal');
        if (existingModal) existingModal.remove();

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('careerModal'));
        modal.show();
    }

    startLearningPath(careerId) {
        // Redirect to courses page with career filter
        window.location.href = `courses.html?career=${careerId}`;
    }

    async loadUserHistory() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/career/history/${this.currentUser._id}`);
            const data = await response.json();
            this.testHistory = data.tests || [];
        } catch (error) {
            console.error('Error loading user history:', error);
        }
    }

    toggleHistory() {
        const historyContainer = document.getElementById('test-history') || this.createHistoryContainer();
        
        if (historyContainer.style.display === 'none') {
            this.renderHistory();
            historyContainer.style.display = 'block';
        } else {
            historyContainer.style.display = 'none';
        }
    }

    createHistoryContainer() {
        const container = document.createElement('div');
        container.id = 'test-history';
        container.className = 'mt-4';
        container.style.display = 'none';
        document.getElementById('career-test-form').parentNode.appendChild(container);
        return container;
    }

    renderHistory() {
        const container = document.getElementById('test-history');
        
        if (this.testHistory.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <h5>Test History</h5>
                    <p>No previous tests found. Take your first career test above!</p>
                </div>
            `;
            return;
        }

        const historyHTML = `
            <div class="card">
                <div class="card-header" style="background-color: var(--tertiary-accent); color: white;">
                    <h5>Your Career Test History</h5>
                </div>
                <div class="card-body">
                    ${this.testHistory.map((test, index) => `
                        <div class="test-history-item p-3 border rounded mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6>Test #${this.testHistory.length - index}</h6>
                                <small class="text-muted">${new Date(test.testDate).toLocaleDateString()}</small>
                            </div>
                            <div class="top-results">
                                ${test.results.slice(0, 3).map(result => `
                                    <span class="badge me-2" style="background-color: var(--secondary-bg); color: white;">${result.careerPath.title || 'Career'} (${result.score}%)</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = historyHTML;
    }

    displayError(message) {
        const container = document.getElementById('career-suggestion');
        container.innerHTML = `
            <div class="alert alert-danger">
                <h5>Error</h5>
                <p>${message}</p>
                <button class="btn btn-outline-danger" onclick="location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }

    showToast(message, type = 'success') {
        const toastHTML = `
            <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();

        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1100';
        document.body.appendChild(container);
        return container;
    }
}

// Initialize enhanced career test
let careerTest;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Career Test...');
    try {
        careerTest = new EnhancedCareerTest();
        console.log('Enhanced Career Test initialized successfully');
    } catch (error) {
        console.error('Error initializing Enhanced Career Test:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCareerTest;
}
