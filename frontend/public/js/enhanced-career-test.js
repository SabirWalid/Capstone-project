/**
 * Enhanced Career Test System
 * This class implements an intelligent career recommendation system that:
 * 1. Matches user skills and interests to career paths
 * 2. Provides personalized learning recommendations
 * 3. Tracks user progress and history
 * 4. Offers detailed career insights and guidance
 */
class EnhancedCareerTest {
    /**
     * Initialize the career test system
     * - Sets up user context
     * - Initializes test history tracking
     * - Creates custom interests storage
     * - Configures API endpoints
     */
    constructor() {
        console.log('EnhancedCareerTest constructor called');
        // Get current user data from localStorage
        this.currentUser = this.getUserFromStorage();
        // Initialize array to store user's test history
        this.testHistory = [];
        // Create Set to store user's custom interests
        this.customInterests = new Set(); // Enables unique interest tracking
        
        // Initialize DOM elements
        this.form = document.getElementById('career-test-form');
        this.skillsInput = document.getElementById('skills');
        this.interestsContainer = document.getElementById('interests-checkboxes');
        this.progressBar = document.getElementById('form-progress');
        this.suggestionDiv = document.getElementById('career-suggestion');
        
        // Set API base URL based on current environment
        this.apiBaseUrl = window.appConfig.apiUrl;
        console.log('API Base URL:', this.apiBaseUrl);
        
        // Initialize predefined tech interests
        this.predefinedInterests = [
            'Web Development', 'Mobile Apps', 'Data Science', 'AI/Machine Learning',
            'Cybersecurity', 'Cloud Computing', 'DevOps', 'UX/UI Design',
            'Game Development', 'Blockchain', 'IoT', 'Software Architecture',
            'Digital Marketing', 'Product Management', 'Tech Writing', 'QA Testing',
            'Database Administration', 'Network Engineering', 'IT Support',
            'Business Analysis', 'Tech Sales', 'Tech Consulting', 'E-commerce',
            'FinTech', 'EdTech', 'HealthTech', 'AR/VR Development', 'Robotics'
        ];
        
        this.init();
    }

    /**
     * Determines the correct API base URL based on the environment
     * - Uses localhost:5000 for development
     * - Uses relative paths for production
     * @returns {string} The base URL for API calls
     */
    getApiBaseUrl() {
        // Get API URL from configuration
        return window.appConfig.apiUrl;
    }

    /**
     * Retrieves the current user's data from localStorage
     * @returns {Object|null} User data object or null if not logged in
     */
    getUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Initializes all components of the career test:
     * 1. Renders interest selection interface
     * 2. Sets up event handlers
     * 3. Loads user's test history
     * 4. Initializes skill autocomplete
     */
    async init() {
        console.log('Initializing Enhanced Career Test components...');
        // Create the interest selection interface
        this.renderInterestCheckboxes();
        // Set up form and interaction handlers
        this.setupEventListeners();
        // Load previous test results for the user
        this.loadUserHistory();
        // Initialize skill input suggestions
        this.setupSkillAutocomplete();
        // Initialize AI assessment
        this.initializeAIAssessment();
        console.log('Enhanced Career Test initialization complete');
    }

    /**
     * Renders the interest selection interface
     * Features:
     * - Pre-defined interest categories
     * - Custom interest input
     * - Interactive selection UI
     * - Interest grouping by category
     */
    /**
     * Initializes the AI assessment functionality
     * Sets up event handlers and UI elements for AI-powered career assessment
     */
    initializeAIAssessment() {
        // Add submit handler for AI assessment
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processAIAssessment();
        });
    }

    /**
     * Processes the career test assessment based on user input
     * Collects user data, sends to database API, and displays results
     */
    async processAIAssessment() {
        try {
            // Show loading state
            this.showLoading();
            console.log('Starting career test assessment (database-only mode)');

            // Collect form data
            const skills = this.skillsInput.value.split(',').map(s => s.trim()).filter(s => s);
            
            // Get interests from both selected interest badges and custom interests
            const selectedInterests = Array.from(this.selectedInterests || []);
            const customInterestsList = Array.from(this.customInterests || []);
            const interests = [...selectedInterests, ...customInterestsList];
            
            console.log('Selected interests:', interests);

            // Ensure we have at least one skill or interest to prevent errors
            if (skills.length === 0 && interests.length === 0) {
                this.showError('Please enter at least one skill or select an interest');
                this.hideLoading();
                return;
            }

            // Prepare assessment data
            const assessmentData = {
                userId: this.currentUser?.id,
                skills: skills.length > 0 ? skills : ['programming'],
                interests: interests.length > 0 ? interests : ['technology']
            };

            // Use primary career test endpoint
            let response = null;
            
            try {
                console.log(`Trying primary career test endpoint: ${this.apiBaseUrl}/api/career-test/test`);
                response = await fetch(`${this.apiBaseUrl}/api/career-test/test`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(assessmentData)
                });
                
                console.log(`Primary endpoint response status:`, response.status);
            } catch (fetchError) {
                console.warn(`Error with primary endpoint:`, fetchError);
            }
            
            // If primary fails, try alternate endpoint
            if (!response || !response.ok) {
                try {
                    console.log(`Trying alternate endpoint: ${this.apiBaseUrl}/api/career/test`);
                    response = await fetch(`${this.apiBaseUrl}/api/career/test`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': localStorage.getItem('token')
                        },
                        body: JSON.stringify(assessmentData)
                    });
                    
                    console.log(`Alternate endpoint response status:`, response.status);
                } catch (fetchError) {
                    console.warn(`Error with alternate endpoint:`, fetchError);
                }
            }
            
            // Try fallback API URL if all endpoints failed
            if (!response || !response.ok) {
                if (window.appConfig && typeof window.appConfig.tryNextFallback === 'function') {
                    const fallbackApiUrl = window.appConfig.tryNextFallback();
                    this.apiBaseUrl = fallbackApiUrl;
                    console.log(`Retrying with fallback API URL: ${fallbackApiUrl}`);
                    
                    try {
                        // Try both endpoints with the fallback URL
                        response = await fetch(`${fallbackApiUrl}/api/career-test/test`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-auth-token': localStorage.getItem('token')
                            },
                            body: JSON.stringify(assessmentData)
                        });
                        
                        if (!response.ok) {
                            response = await fetch(`${fallbackApiUrl}/api/career/test`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-auth-token': localStorage.getItem('token')
                                },
                                body: JSON.stringify(assessmentData)
                            });
                        }
                    } catch (fallbackError) {
                        console.warn('Fallback API URLs all failed:', fallbackError);
                    }
                }
            }

            if (!response || !response.ok) {
                console.warn(`Career Test API Error. Using local fallback mechanism.`);
                // Use local fallback
                const fallbackResult = this.getLocalFallbackResults(skills, interests);
                console.log('Using local fallback data:', fallbackResult);
                // Display results
                this.displayResults(fallbackResult);
                // Save to history locally
                this.saveHistoryLocally(fallbackResult);
                return;
            }

            const result = await response.json();
            console.log('Career test results received:', result);
            
            // Display results
            this.displayResults(result);
            
            // Save to history
            await this.saveAssessmentHistory(result);

        } catch (error) {
            console.error('Career Test Error:', error);
            this.showError('Failed to complete career test. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Displays the career test results in the UI
     * @param {Object} results - The career test results from database
     */
    displayResults(results) {
        if (!results || !results.matches || !Array.isArray(results.matches) || results.matches.length === 0) {
            this.showError('No career matches found. Please try with different skills and interests.');
            return;
        }
        
        // Sort matches by score (descending)
        const sortedMatches = [...results.matches].sort((a, b) => b.score - a.score);
        
        // Create results HTML
        let resultsHTML = `
            <div class="career-test-results">
                <h3>🎯 Recommended Career Paths</h3>
                <p class="text-muted">Based on ${results.totalCareersAnalyzed || 0} career paths analyzed</p>
                
                <div class="recommended-careers">
        `;
        
        // Add each career match
        sortedMatches.forEach(match => {
            const matchedSkills = match.matchedSkills && Array.isArray(match.matchedSkills) ? match.matchedSkills : [];
            const matchedInterests = match.matchedInterests && Array.isArray(match.matchedInterests) ? match.matchedInterests : [];
            
            resultsHTML += `
                <div class="career-match card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h4>${match.title || 'Career Path'}</h4>
                        <span class="badge bg-primary">${match.score || 0}% Match</span>
                    </div>
                    <div class="card-body">
                        <p>${match.description || 'No description available'}</p>
                        
                        <div class="matched-items mt-3">
                            <h5>Matched Skills:</h5>
                            <div class="badges">
                                ${matchedSkills.length > 0 
                                    ? matchedSkills.map(skill => `<span class="badge bg-success me-2 mb-2">${skill}</span>`).join('') 
                                    : '<span class="text-muted">No specific skills matched</span>'}
                            </div>
                            
                            <h5 class="mt-3">Matched Interests:</h5>
                            <div class="badges">
                                ${matchedInterests.length > 0
                                    ? matchedInterests.map(interest => `<span class="badge bg-info me-2 mb-2">${interest}</span>`).join('')
                                    : '<span class="text-muted">No specific interests matched</span>'}
                            </div>
                        </div>
                        
                        ${match.courses && Array.isArray(match.courses) && match.courses.length > 0 ? `
                        <div class="recommended-courses mt-4">
                            <h5>Recommended Courses:</h5>
                            <ul class="list-group">
                                ${match.courses.map(course => `
                                    <li class="list-group-item">
                                        <a href="${course.url || '#'}" class="course-link">
                                            ${course.name || 'Course'}
                                        </a>
                                        <span class="badge bg-secondary float-end">${course.level || 'Beginner'}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `
                </div>
            </div>
        `;
        
        // Update UI
        this.suggestionDiv.innerHTML = resultsHTML;
        this.suggestionDiv.style.display = 'block';
    }
    
    /**
     * Generates fallback career recommendations when all API calls fail
     * @param {Array} skills - User's skills
     * @param {Array} interests - User's interests
     * @returns {Object} Fallback results object
     */
    getLocalFallbackResults(skills, interests) {
        // Basic career paths with associated skills and interests
        const careerPaths = [
            {
                title: "Full Stack Web Developer",
                description: "Develop both client and server-side applications",
                skills: ["javascript", "html", "css", "node", "react", "angular", "vue", "express", "mongodb", "sql"],
                interests: ["web development", "programming", "software engineering", "coding", "development"],
                score: 85,
                courses: [
                    { name: "Modern JavaScript from the Beginning", url: "#", level: "Beginner" },
                    { name: "React - The Complete Guide", url: "#", level: "Intermediate" },
                    { name: "Node.js API Masterclass", url: "#", level: "Advanced" }
                ]
            },
            {
                title: "Data Scientist",
                description: "Analyze and interpret complex data to help make business decisions",
                skills: ["python", "r", "statistics", "machine learning", "sql", "tensorflow", "pytorch", "pandas", "numpy"],
                interests: ["data", "analytics", "statistics", "machine learning", "ai", "mathematics"],
                score: 80,
                courses: [
                    { name: "Python for Data Science", url: "#", level: "Beginner" },
                    { name: "Machine Learning A-Z", url: "#", level: "Intermediate" },
                    { name: "Deep Learning Specialization", url: "#", level: "Advanced" }
                ]
            },
            {
                title: "Mobile App Developer",
                description: "Create applications for mobile devices such as smartphones and tablets",
                skills: ["java", "kotlin", "swift", "flutter", "react native", "android", "ios", "mobile development"],
                interests: ["mobile development", "app development", "ui design", "user experience"],
                score: 78,
                courses: [
                    { name: "Flutter & Dart - The Complete Guide", url: "#", level: "Beginner" },
                    { name: "iOS & Swift - The Complete iOS App Development Bootcamp", url: "#", level: "Intermediate" }
                ]
            }
        ];
        
        // Calculate match scores for each career
        const matches = careerPaths.map(career => {
            let matchedSkills = [];
            let matchedInterests = [];
            
            // Find matched skills
            skills.forEach(skill => {
                const skillLower = skill.toLowerCase();
                if (career.skills.some(s => s.includes(skillLower) || skillLower.includes(s))) {
                    matchedSkills.push(skill);
                }
            });
            
            // Find matched interests
            interests.forEach(interest => {
                const interestLower = interest.toLowerCase();
                if (career.interests.some(i => i.includes(interestLower) || interestLower.includes(i))) {
                    matchedInterests.push(interest);
                }
            });
            
            // Adjust score based on matches
            let adjustedScore = career.score;
            if (matchedSkills.length > 0) {
                adjustedScore += 5;
            }
            if (matchedInterests.length > 0) {
                adjustedScore += 5;
            }
            
            return {
                title: career.title,
                description: career.description,
                score: Math.min(adjustedScore, 100),
                matchedSkills: matchedSkills,
                matchedInterests: matchedInterests,
                courses: career.courses
            };
        });
        
        // Sort by score (descending)
        matches.sort((a, b) => b.score - a.score);
        
        return {
            matches: matches,
            matchesFound: matches.length,
            totalCareersAnalyzed: careerPaths.length,
            source: 'local-fallback',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Shows loading state during AI assessment
     */
    showLoading() {
        this.progressBar.style.display = 'block';
        this.form.classList.add('loading');
    }

    /**
     * Hides loading state
     */
    hideLoading() {
        this.progressBar.style.display = 'none';
        this.form.classList.remove('loading');
    }

    /**
     * Shows error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = this.form.querySelector('.alert-danger');
        if (existingError) {
            existingError.remove();
        }
        
        // Add the new error message after the form
        this.form.parentNode.insertBefore(errorDiv, this.form.nextSibling);
        
        // Automatically remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Saves the assessment results to user history
     * @param {Object} result - The career test result to save
     */
    async saveAssessmentHistory(result) {
        // Always save locally first to ensure we have a copy
        this.saveHistoryLocally(result);
        
        // Skip API calls if no user is logged in
        if (!this.currentUser || !localStorage.getItem('token')) {
            console.log('Skipping remote history save - user not logged in');
            return;
        }
        
        try {
            // Set a timeout to abort API calls that take too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            // Try multiple endpoints for saving history
            const endpoints = [
                '/api/career/history',
                '/api/career-test/history'
            ];
            
            let success = false;
            
            for (const ep of endpoints) {
                try {
                    console.log(`Trying to save history using endpoint: ${this.apiBaseUrl}${ep}`);
                    const response = await fetch(`${this.apiBaseUrl}${ep}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            testResult: result,
                            timestamp: new Date().toISOString()
                        }),
                        signal: controller.signal
                    }).catch(error => {
                        console.warn(`Network error with endpoint ${ep}:`, error.message);
                        return null;
                    });
                    
                    if (response && response.ok) {
                        console.log(`Successfully saved history with endpoint ${ep}`);
                        success = true;
                        break;
                    }
                } catch (endpointError) {
                    console.warn(`Error saving history with endpoint ${ep}:`, endpointError);
                    // Continue to next endpoint
                }
            }
            
            clearTimeout(timeoutId); // Clear the timeout
            
            if (!success) {
                // Try with a different API URL
                if (window.appConfig && typeof window.appConfig.tryNextFallback === 'function') {
                    const fallbackApiUrl = window.appConfig.tryNextFallback();
                    this.apiBaseUrl = fallbackApiUrl;
                    
                    try {
                        // Try both valid endpoints with the fallback URL
                        for (const ep of ['/api/career/history', '/api/career-test/history']) {
                            try {
                                console.log(`Trying fallback history endpoint: ${fallbackApiUrl}${ep}`);
                                const response = await fetch(`${fallbackApiUrl}${ep}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'x-auth-token': localStorage.getItem('token')
                                    },
                                    body: JSON.stringify({
                                        testResult: result,
                                        timestamp: new Date().toISOString()
                                    })
                                });
                                
                                if (response.ok) {
                                    console.log(`Successfully saved history with fallback endpoint ${ep}`);
                                    success = true;
                                    break;
                                }
                            } catch (endpointError) {
                                console.warn(`Error with fallback endpoint ${ep}:`, endpointError);
                            }
                        }
                    } catch (fallbackError) {
                        console.warn('Failed to save history using fallback API URLs:', fallbackError);
                    }
                }
            }
            
            if (success) {
                // Reload history after successful save
                await this.loadUserHistory();
            } else {
                // Store history in local storage as last resort
                this.saveHistoryLocally(result);
            }
        } catch (error) {
            console.error('Error saving assessment history:', error);
            // Save locally as backup
            this.saveHistoryLocally(result);
        }
    }
    
    /**
     * Saves assessment history locally when API fails
     * @param {Object} result - The assessment result to save
     */
    saveHistoryLocally(result) {
        try {
            // Get existing history or initialize empty array
            const localHistory = JSON.parse(localStorage.getItem('careerAssessmentHistory') || '[]');
            
            // Add new result with timestamp
            localHistory.push({
                result: result,
                timestamp: new Date().toISOString(),
                pendingSync: true
            });
            
            // Save back to local storage
            localStorage.setItem('careerAssessmentHistory', JSON.stringify(localHistory));
            console.log('Saved assessment history locally');
        } catch (localSaveError) {
            console.error('Failed to save history locally:', localSaveError);
        }
    }

    renderInterestCheckboxes() {
        const container = document.getElementById('interests-checkboxes');
        if (!container) return;

        // Comprehensive list of career interests across various domains
        const enhancedInterestsList = [
            // Technology & Development
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
        
        // Add a style tag for interest badges
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            .interest-badge.selected {
                background-color: #007bff !important;
                color: white !important;
                border-color: #0069d9 !important;
                box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
            }
        `;
        document.head.appendChild(styleTag);

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
            element.classList.remove('bg-primary');
            element.classList.add('bg-light', 'text-dark');
        } else {
            // Select
            this.selectedInterests.add(interest);
            element.classList.add('selected', 'bg-primary', 'text-white');
            element.classList.remove('bg-light', 'text-dark');
        }
        console.log('Toggled interest:', interest, 'Selected interests:', Array.from(this.selectedInterests));
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

    /**
     * Handles the career test form submission
     * 
     * Career Matching Algorithm:
     * 1. Skills Analysis:
     *    - Exact matches: Direct skill matches (e.g., "JavaScript" = "JavaScript")
     *    - Fuzzy matches: Similar skills (e.g., "JS" ≈ "JavaScript")
     *    - Skill families: Related skills (e.g., "React" → "Frontend Development")
     * 
     * 2. Interest Mapping:
     *    - Primary interests: Direct field matches
     *    - Related interests: Connected fields
     *    - Interest weights: Higher priority to strong matches
     * 
     * 3. Career Score Calculation:
     *    - Skill match weight: 60%
     *    - Interest match weight: 40%
     *    - Confidence score: Based on data quality
     * 
     * 4. Results Processing:
     *    - Filters high-confidence matches
     *    - Ranks careers by match score
     *    - Adds learning recommendations
     * 
     * @param {Event} e - Form submission event
     */
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
            
            // Get interests from both selected interest badges and custom interests
            const selectedInterests = Array.from(this.selectedInterests || []);
            const customInterestsList = Array.from(this.customInterests || []);
            const interests = [...selectedInterests, ...customInterestsList]; // Include custom interests
            
            console.log('Skills:', skills);
            console.log('Selected interests:', selectedInterests);
            console.log('Custom interests:', customInterestsList);

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

            // Try multiple API endpoints to increase chance of success
            let response;
            let endpoint;
            const endpoints = [
                '/api/career-test/test',
                '/api/career/test'  // Alternate endpoint
            ];

            for (const ep of endpoints) {
                try {
                    console.log(`Trying endpoint: ${this.apiBaseUrl}${ep}`);
                    response = await fetch(`${this.apiBaseUrl}${ep}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                    
                    console.log(`Response from ${ep}: ${response.status}`);
                    
                    if (response.ok) {
                        endpoint = ep;
                        break; // Success, exit loop
                    }
                } catch (fetchError) {
                    console.warn(`Error with endpoint ${ep}:`, fetchError);
                }
            }

            // If all endpoints failed, try using a fallback API URL
            if (!response || !response.ok) {
                // Try fallback API URL
                if (window.appConfig && typeof window.appConfig.tryNextFallback === 'function') {
                    const fallbackApiUrl = window.appConfig.tryNextFallback();
                    this.apiBaseUrl = fallbackApiUrl;
                    console.log(`Retrying with fallback API URL: ${fallbackApiUrl}`);
                    
                    try {
                        response = await fetch(`${fallbackApiUrl}/api/career/test`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody)
                        });
                    } catch (fallbackError) {
                        console.warn('Fallback API URL also failed:', fallbackError);
                    }
                }
            }

            console.log('Final response status:', response ? response.status : 'No response');

            // If still failed, use the guaranteed matches fallback
            if (!response || !response.ok) {
                console.warn(`API Error. Using fallback mechanism.`);
                if (typeof this.getGuaranteedMatches === 'function') {
                    const data = this.getGuaranteedMatches(skills, interests);
                    console.log('Using fallback data:', data);
                    this.displayEnhancedResults(data);
                    return;
                } else {
                    throw new Error(`API request failed: ${response ? response.status : 'No connection'}`);
                }
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
            const response = await fetch(`${this.apiBaseUrl}/api/career/bookmarks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
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
            const response = await fetch(`${this.apiBaseUrl}/api/career/${careerId}`);
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
        if (!this.currentUser || !localStorage.getItem('token')) return;

        try {
            // Try multiple endpoints for loading history
            const endpoints = [
                '/api/career/history',
                '/api/career-assessment/history',
                '/api/career-test/history'
            ];
            
            let response = null;
            let data = null;
            
            for (const ep of endpoints) {
                try {
                    console.log(`Trying to load history from endpoint: ${this.apiBaseUrl}${ep}`);
                    response = await fetch(`${this.apiBaseUrl}${ep}`, {
                        headers: {
                            'x-auth-token': localStorage.getItem('token')
                        }
                    });
                    
                    if (response.ok) {
                        data = await response.json();
                        console.log(`Successfully loaded history from ${ep}`);
                        break;
                    }
                } catch (endpointError) {
                    console.warn(`Error loading history from ${ep}:`, endpointError);
                }
            }
            
            if (!data) {
                // Try with a different API URL
                if (window.appConfig && typeof window.appConfig.tryNextFallback === 'function') {
                    const fallbackApiUrl = window.appConfig.tryNextFallback();
                    this.apiBaseUrl = fallbackApiUrl;
                    
                    try {
                        response = await fetch(`${fallbackApiUrl}/api/career/history`, {
                            headers: {
                                'x-auth-token': localStorage.getItem('token')
                            }
                        });
                        
                        if (response.ok) {
                            data = await response.json();
                        }
                    } catch (fallbackError) {
                        console.warn('Failed to load history using fallback API URL:', fallbackError);
                    }
                }
            }
            
            // Set history from API response or use empty array as fallback
            this.testHistory = data?.tests || [];
            
            // Check if we have locally stored history that needs to be merged
            this.mergeLocalHistory();
        } catch (error) {
            console.error('Error loading user history:', error);
            // Load local history as fallback
            this.loadLocalHistory();
        }
    }
    
    /**
     * Loads history from local storage when API fails
     */
    loadLocalHistory() {
        try {
            const localHistory = JSON.parse(localStorage.getItem('careerAssessmentHistory') || '[]');
            if (localHistory.length > 0) {
                console.log('Loaded history from local storage:', localHistory.length, 'entries');
                // Format local history to match API format
                this.testHistory = localHistory.map(item => ({
                    testDate: item.timestamp,
                    results: item.result
                }));
            }
        } catch (localLoadError) {
            console.error('Failed to load history from local storage:', localLoadError);
            this.testHistory = [];
        }
    }
    
    /**
     * Merges local history with API history
     */
    mergeLocalHistory() {
        try {
            const localHistory = JSON.parse(localStorage.getItem('careerAssessmentHistory') || '[]');
            if (localHistory.length > 0) {
                console.log('Found', localHistory.length, 'local history entries to merge');
                
                // Only merge entries marked as pending sync
                const pendingEntries = localHistory.filter(item => item.pendingSync);
                if (pendingEntries.length === 0) return;
                
                // Add local entries to the history
                pendingEntries.forEach(item => {
                    this.testHistory.push({
                        testDate: item.timestamp,
                        results: item.result,
                        fromLocal: true
                    });
                });
                
                // Sort by date
                this.testHistory.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
                
                console.log('Merged local and API history');
                
                // Try to sync pending entries to the server
                this.syncLocalHistory(pendingEntries);
            }
        } catch (mergeError) {
            console.error('Error merging local history:', mergeError);
        }
    }
    
    /**
     * Attempts to sync local history with the server
     * @param {Array} pendingEntries - Array of pending history entries
     */
    async syncLocalHistory(pendingEntries) {
        if (!this.currentUser || pendingEntries.length === 0) return;
        
        try {
            let syncedCount = 0;
            
            for (const entry of pendingEntries) {
                try {
                    const response = await fetch(`${this.apiBaseUrl}/api/career-assessment/save-history`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            assessmentResult: entry.result,
                            timestamp: entry.timestamp
                        })
                    });
                    
                    if (response.ok) {
                        syncedCount++;
                        entry.pendingSync = false;
                    }
                } catch (syncError) {
                    console.warn('Error syncing entry:', syncError);
                }
            }
            
            if (syncedCount > 0) {
                console.log(`Successfully synced ${syncedCount} out of ${pendingEntries.length} history entries`);
                
                // Update local storage to remove synced entries
                const localHistory = JSON.parse(localStorage.getItem('careerAssessmentHistory') || '[]');
                const updatedHistory = localHistory.filter(item => item.pendingSync);
                localStorage.setItem('careerAssessmentHistory', JSON.stringify(updatedHistory));
            }
        } catch (error) {
            console.error('Error syncing local history:', error);
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

// Add showError method if not already defined
if (typeof EnhancedCareerTest.prototype.showError !== 'function') {
    /**
     * Shows error message to the user
     * @param {string} message - Error message to display
     */
    EnhancedCareerTest.prototype.showError = function(message) {
        console.error('Error:', message);
        
        // Create error alert element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = this.form ? this.form.querySelector('.alert-danger') : null;
        if (existingError) {
            existingError.remove();
        }
        
        // Add the new error message after the form
        if (this.form) {
            this.form.parentNode.insertBefore(errorDiv, this.form.nextSibling);
        } else {
            // Fallback if form not found
            const container = document.querySelector('.container') || document.body;
            container.prepend(errorDiv);
        }
        
        // Automatically remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCareerTest;
}