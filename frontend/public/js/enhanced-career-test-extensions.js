/**
 * Enhanced Career Test - Extension Functions
 * This file contains additional functions for the EnhancedCareerTest class
 * to improve career test matching and recommendations.
 */

// Add these functions to the EnhancedCareerTest class

/**
 * Saves a career to the user's bookmarks
 * @param {string} careerId - The ID of the career to save
 */
EnhancedCareerTest.prototype.saveCareer = async function(careerId) {
    try {
        console.log('Saving career to bookmarks:', careerId);
        
        // Skip if no user or career ID
        if (!this.currentUser?.id || !careerId) {
            console.log('Missing user ID or career ID, skipping bookmark');
            return false;
        }
        
        const response = await fetch(`${this.apiBaseUrl}/api/career/bookmarks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') || 'dummy-token'
            },
            body: JSON.stringify({
                careerId: careerId
            })
        });
        
        if (response.ok) {
            console.log('Successfully bookmarked career');
            this.showSuccess('Career saved to your bookmarks');
            return true;
        } else {
            console.error('Error bookmarking career:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error saving career bookmark:', error);
        return false;
    }
};

/**
 * Shows a success message to the user
 * @param {string} message - Success message to display
 */
EnhancedCareerTest.prototype.showSuccess = function(message) {
    // Remove any existing success messages
    const existingSuccess = document.querySelector('.career-test-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success career-test-success';
    successDiv.innerHTML = `
        <i class="bi bi-check-circle-fill me-2"></i>
        ${message}
        <button type="button" class="btn-close float-end" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to form
    this.form.prepend(successDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.classList.add('fade');
            setTimeout(() => successDiv.remove(), 500);
        }
    }, 5000);
};

/**
 * Sets up event listeners for career test result interactions
 */
EnhancedCareerTest.prototype.setupResultEventListeners = function() {
    console.log('Setting up result event listeners');
    
    // Remove any existing click handler to prevent duplicates
    if (this.resultClickHandler) {
        this.suggestionDiv.removeEventListener('click', this.resultClickHandler);
    }
    
    // Store the handler function so we can remove it later if needed
    this.resultClickHandler = async (e) => {
        // Save career button
        if (e.target.classList.contains('save-career') || 
            e.target.parentElement.classList.contains('save-career')) {
            
            const button = e.target.classList.contains('save-career') ? 
                e.target : e.target.parentElement;
            const careerId = button.getAttribute('data-career-id');
            
            if (careerId) {
                await this.saveCareer(careerId);
                button.innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Saved';
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
                button.disabled = true;
            }
        }
        
        // View courses button
        if (e.target.classList.contains('view-courses') || 
            e.target.parentElement.classList.contains('view-courses')) {
            
            const button = e.target.classList.contains('view-courses') ? 
                e.target : e.target.parentElement;
            const careerTitle = button.getAttribute('data-career');
            
            if (careerTitle) {
                // Navigate to courses page with career filter
                window.location.href = `courses.html?career=${encodeURIComponent(careerTitle)}`;
            }
        }
        
        // Retry test button
        if (e.target.classList.contains('retry-test') || 
            e.target.parentElement.classList.contains('retry-test')) {
            
            // Clear form and results
            this.skillsInput.value = '';
            this.suggestionDiv.innerHTML = '';
            this.suggestionDiv.style.display = 'none';
            
            // Reset interest selection
            document.querySelectorAll('.interest-badge.selected').forEach(badge => {
                badge.classList.remove('selected');
            });
            
            // Scroll to form
            this.form.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Add the click handler
    this.suggestionDiv.addEventListener('click', this.resultClickHandler);
};

/**
 * Ultimate fallback function that always returns career matches even if all APIs fail
 * This guarantees users will always get some career recommendations
 * @param {Array} skills - User's skills
 * @param {Array} interests - User's interests
 */
EnhancedCareerTest.prototype.getGuaranteedMatches = function(skills = [], interests = []) {
    console.log('Using guaranteed fallback matching system');
    
    // Ensure we have arrays to work with
    const userSkills = Array.isArray(skills) ? skills : [];
    const userInterests = Array.isArray(interests) ? interests : [];
    
    // Always include these common tech career paths
    const fallbackCareers = [
        {
            title: "Web Development",
            description: "Create and maintain websites and web applications using technologies like HTML, CSS, JavaScript, and various frameworks.",
            skills: ["javascript", "html", "css", "react", "angular", "vue", "node", "php", "web"],
            interests: ["web", "programming", "development", "design", "frontend", "backend"],
            match_percentage: 0,
            courses: ["HTML & CSS Fundamentals", "JavaScript Essentials", "React Development"]
        },
        {
            title: "Data Science",
            description: "Analyze complex data to find patterns and insights that drive business decisions and innovations.",
            skills: ["python", "r", "sql", "statistics", "machine learning", "data", "analysis"],
            interests: ["data", "analysis", "mathematics", "research", "ai", "science"],
            match_percentage: 0,
            courses: ["Python for Data Science", "Statistical Analysis", "Machine Learning Fundamentals"]
        },
        {
            title: "Mobile App Development",
            description: "Design and build applications for mobile devices across iOS and Android platforms.",
            skills: ["swift", "kotlin", "java", "react native", "flutter", "mobile", "ios", "android"],
            interests: ["mobile", "apps", "development", "design", "user experience"],
            match_percentage: 0,
            courses: ["Mobile UI/UX Design", "iOS Development with Swift", "Android Development"]
        },
        {
            title: "Cybersecurity",
            description: "Protect systems, networks, and data from digital attacks and security breaches.",
            skills: ["security", "networking", "linux", "encryption", "pentesting", "infosec", "firewall"],
            interests: ["security", "privacy", "hacking", "protection", "networking"],
            match_percentage: 0,
            courses: ["Network Security Fundamentals", "Ethical Hacking", "Security Analysis"]
        },
        {
            title: "Cloud Engineering",
            description: "Design, implement, and manage cloud infrastructure and services.",
            skills: ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "cloud"],
            interests: ["cloud", "infrastructure", "scaling", "devops", "reliability"],
            match_percentage: 0,
            courses: ["AWS Solutions Architect", "Cloud Infrastructure Management", "DevOps Practices"]
        }
    ];
    
    // Calculate match scores for each career
    const scoredCareers = fallbackCareers.map(career => {
        let score = 0;
        const totalFactors = Math.max(1, userSkills.length + userInterests.length);
        
        // Match skills (case-insensitive partial matching)
        userSkills.forEach(skill => {
            const skillLower = skill.toLowerCase().trim();
            career.skills.forEach(careerSkill => {
                if (skillLower.includes(careerSkill) || careerSkill.includes(skillLower)) {
                    score += 1;
                }
            });
        });
        
        // Match interests (case-insensitive partial matching)
        userInterests.forEach(interest => {
            const interestLower = interest.toLowerCase().trim();
            career.interests.forEach(careerInterest => {
                if (interestLower.includes(careerInterest) || careerInterest.includes(interestLower)) {
                    score += 1;
                }
            });
        });
        
        // Calculate percentage
        const matchPercent = Math.round((score / totalFactors) * 100);
        
        // Set minimum percentage to 30% to ensure all careers are viable options
        const finalMatchPercent = Math.max(30, matchPercent);
        
        return {
            title: career.title,
            description: career.description,
            match_percentage: finalMatchPercent,
            confidence: Math.round(finalMatchPercent * 0.8),
            required_skills: career.skills.slice(0, 5),
            all_skills: career.skills,
            learning_roadmap: career.courses,
            job_roles: [`${career.title} Specialist`, `${career.title} Consultant`, `Senior ${career.title}`],
            growth_opportunities: [`Senior ${career.title}`, `${career.title} Manager`, `Lead ${career.title}`],
            industry: ['Technology', 'Digital'],
            salary_range: {
                min: 60000,
                max: 120000,
                currency: '$'
            },
            job_outlook: 'Positive'
        };
    });
    
    // Sort by match percentage (highest first)
    const sortedCareers = scoredCareers.sort((a, b) => b.match_percentage - a.match_percentage);
    
    // Prepare the result structure
    return {
        data: {
            careerPaths: sortedCareers,
            source: 'guaranteed-fallback',
            timestamp: new Date().toISOString(),
            totalCareersAnalyzed: fallbackCareers.length,
            matchesFound: sortedCareers.length,
            analysis: {
                matchQuality: 'Basic',
                skillsProvided: userSkills.length,
                interestsProvided: userInterests.length,
                advice: 'These careers are common paths in the technology sector that may match your skills and interests.'
            }
        }
    };
};

// Call this function during initialization
const originalInit = EnhancedCareerTest.prototype.init;
EnhancedCareerTest.prototype.init = async function() {
    await originalInit.call(this);
    this.setupResultEventListeners();
};
