// Common helper functions
const helpers = {
    showLoading: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading-spinner"></div>';
        }
    },

    showError: (elementId, message) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    ${message}
                </div>
            `;
        }
    },

    showToast: (message, type = 'success') => {
        // Your existing showToast implementation
        const toast = document.createElement('div');
        toast.className = `toast ${type} show`;
        toast.innerHTML = `
            <div class="toast-body">
                ${message}
            </div>
        `;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Update the load functions to use the new API helper
async function loadMentors() {
    try {
        helpers.showLoading('mentorsContainer');
        const data = await api.mentors.getAll();
        // Your existing mentor display logic
        displayMentors(data);
    } catch (error) {
        helpers.showError('mentorsContainer', 'Failed to load mentors. Please try again.');
        console.error('Error loading mentors:', error);
    }
}

async function loadCourses() {
    try {
        helpers.showLoading('coursesContainer');
        const data = await api.courses.getAll();
        // Your existing course display logic
        displayCourses(data);
    } catch (error) {
        helpers.showError('coursesContainer', 'Failed to load courses. Please try again.');
        console.error('Error loading courses:', error);
    }
}

async function loadOpportunities() {
    try {
        helpers.showLoading('opportunitiesContainer');
        const data = await api.opportunities.getAll();
        // Your existing opportunities display logic
        displayOpportunities(data);
    } catch (error) {
        helpers.showError('opportunitiesContainer', 'Failed to load opportunities. Please try again.');
        console.error('Error loading opportunities:', error);
    }
}

async function loadResources() {
    try {
        helpers.showLoading('resourcesContainer');
        const data = await api.resources.getAll();
        // Your existing resources display logic
        displayResources(data);
    } catch (error) {
        helpers.showError('resourcesContainer', 'Failed to load resources. Please try again.');
        console.error('Error loading resources:', error);
    }
}
