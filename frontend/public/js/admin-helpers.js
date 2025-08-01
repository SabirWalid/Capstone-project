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
        displayCourses(data);
    } catch (error) {
        helpers.showError('coursesContainer', 'Failed to load courses. Please try again.');
        console.error('Error loading courses:', error);
    }
}

// Export these functions to window so they can be called globally
window.loadCourses = loadCourses;
window.loadMentors = loadMentors;
window.loadOpportunities = loadOpportunities;
window.loadResources = loadResources;

// Function to refresh dashboard data
async function refreshDashboard() {
    try {
        await Promise.all([
            loadCourses(),
            loadMentors(),
            loadOpportunities(),
            loadResources()
        ]);
        helpers.showToast('Dashboard refreshed successfully');
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        helpers.showToast('Failed to refresh dashboard', 'error');
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
    console.log('loadResources called from admin-helpers.js');
    try {
        helpers.showLoading('resourcesContainer');
        
        // Clear any previous error messages
        const resourcesContainer = document.getElementById('resources-list');
        if (resourcesContainer) {
            resourcesContainer.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><p>Loading resources...</p></div>';
        }
        
        console.log('Fetching resources data...');
        const data = await api.resources.getAll();
        console.log('Resources data received:', data);
        
        // Handle different response formats
        let resourcesArray = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            console.log('Resources is an object, checking for resources property');
            resourcesArray = data.resources || data.data || [];
        }
        
        // Display resources
        if (typeof displayResources === 'function') {
            console.log('Calling displayResources with normalized data');
            displayResources(resourcesArray);
        } else {
            console.error('displayResources function not found');
            if (resourcesContainer) {
                resourcesContainer.innerHTML = '<div class="alert alert-danger">Error: Display function not available</div>';
            }
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        
        // Try to display error in both possible containers
        ['resourcesContainer', 'resources-list'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                helpers.showError(containerId, 'Failed to load resources. Please try again. Error: ' + error.message);
            }
        });
        
        // Fall back to direct HTML error display
        const resourcesContainer = document.getElementById('resources-list');
        if (resourcesContainer) {
            resourcesContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error loading resources:</strong> ${error.message}
                    <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadResources()">Retry</button>
                </div>
            `;
        }
    }
}

// Make helpers available globally
window.helpers = helpers;

