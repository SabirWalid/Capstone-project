// Helper for client-side validation
function validateResourceForm(form) {
  const name = form.querySelector('[name="name"]').value.trim();
  const link = form.querySelector('[name="link"]').value.trim();
  if (!name) {
    alert("Resource name is required.");
    return false;
  }
  if (!link || !/^https?:\/\/.+/.test(link)) {
    alert("Valid resource link is required.");
    return false;
  }
  return true;
}

class AdminResourceManager {
    constructor() {
        this.resources = [];
        this.filteredResources = [];
        this.stats = {
            totalResources: 0,
            totalDownloads: 0,
            resourcesThisMonth: 0,
            popularType: 'N/A'
        };
        this.currentEditId = null;
    }

    async init() {
        try {
            this.setupTabNavigation();
            this.setupEventListeners();
            await this.loadResources();
            await this.loadStats();
            this.renderOverview();
            this.renderManageResources();
        } catch (error) {
            console.error('Error initializing AdminResourceManager:', error);
            this.showNotification('Failed to initialize admin panel', 'error');
        }
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                contents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
                
                // Load data based on active tab
                if (targetTab === 'overview') {
                    this.loadStats();
                } else if (targetTab === 'manage') {
                    this.renderManageResources();
                }
            });
        });
    }

    setupEventListeners() {
        // Add resource form
        const addForm = document.getElementById('addResourceForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddResource(e));
        }

        // Edit resource form
        const editForm = document.getElementById('editResourceForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditResource(e));
        }

        // Search and filter for manage tab
        const searchInput = document.getElementById('manageSearchInput');
        const typeFilter = document.getElementById('manageTypeFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterResources(e.target.value, typeFilter ? typeFilter.value : '');
            });
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterResources(searchInput ? searchInput.value : '', e.target.value);
            });
        }

        // Modal close events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
            }
        });

        // Click outside modal to close
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.closeEditModal();
                }
            });
        }
    }

    async loadResources() {
        try {
            // Use absolute URL for API to avoid frontend/backend mismatch
            const response = await fetch('http://localhost:5000/api/admin/resources');
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to load resources:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Fix: Use data.resources if present, fallback to array
            if (Array.isArray(data)) {
                this.resources = data;
            } else if (Array.isArray(data.resources)) {
                this.resources = data.resources;
            } else {
                this.resources = [];
            }
            this.filteredResources = [...this.resources];
            console.log('Resources loaded:', this.resources.length);
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = [];
            this.filteredResources = [];
            this.showNotification('Failed to load resources', 'error');
        }
    }

    async loadStats() {
        // Calculate stats from loaded resources instead of API call
        if (!Array.isArray(this.resources)) {
            this.resources = [];
        }

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Calculate stats from resources data
        this.stats = {
            totalResources: this.resources.length,
            totalDownloads: this.resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
            resourcesThisMonth: this.resources.filter(r => 
                r.createdAt && new Date(r.createdAt) >= thisMonth
            ).length,
            popularType: this.getMostPopularType()
        };
        
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const elements = {
            'totalResources': this.stats.totalResources || 0,
            'totalDownloads': this.stats.totalDownloads || 0,
            'resourcesThisMonth': this.stats.resourcesThisMonth || 0,
            'popularType': this.stats.popularType || 'N/A'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    renderOverview() {
        const container = document.getElementById('recentResourcesContainer');
        if (!container) return;

        // Ensure resources is an array
        if (!Array.isArray(this.resources)) {
            this.resources = [];
        }

        const recentResources = this.resources
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        if (recentResources.length === 0) {
            container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No resources found</p>';
            return;
        }

        const tableHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Downloads</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentResources.map(resource => `
                        <tr>
                            <td>
                                <strong>${this.escapeHtml(resource.title || 'Untitled')}</strong>
                                <br>
                                <small style="color: #666;">${this.escapeHtml((resource.description || '').substring(0, 100))}${resource.description && resource.description.length > 100 ? '...' : ''}</small>
                            </td>
                            <td><span class="resource-type" style="font-size: 0.9em;">${resource.type || 'Unknown'}</span></td>
                            <td>${resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Unknown'}</td>
                            <td>${resource.downloadCount || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    renderManageResources() {
        const container = document.getElementById('manageResourcesContainer');
        if (!container) return;

        // Ensure filteredResources is an array
        if (!Array.isArray(this.filteredResources)) {
            this.filteredResources = [];
        }

        if (this.filteredResources.length === 0) {
            container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No resources found</p>';
            return;
        }

        const tableHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Downloads</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.filteredResources.map(resource => `
                        <tr>
                            <td>
                                <strong>${this.escapeHtml(resource.title || 'Untitled')}</strong>
                                <br>
                                <small style="color: #666;">${this.escapeHtml((resource.description || '').substring(0, 80))}${resource.description && resource.description.length > 80 ? '...' : ''}</small>
                            </td>
                            <td><span class="resource-type" style="font-size: 0.9em;">${resource.type || 'Unknown'}</span></td>
                            <td>${resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Unknown'}</td>
                            <td>${resource.downloadCount || 0}</td>
                            <td>
                                <div class="resource-actions">
                                    <button class="action-btn edit-btn" onclick="adminManager.editResource('${resource._id}')">
                                        ✏️
                                    </button>
                                    <button class="action-btn delete-btn" onclick="adminManager.deleteResource('${resource._id}')">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    filterResources(searchTerm = '', typeFilter = '') {
        if (!Array.isArray(this.resources)) {
            this.resources = [];
        }

        this.filteredResources = this.resources.filter(resource => {
            const title = resource.title || '';
            const description = resource.description || '';
            const type = resource.type || '';
            
            const matchesSearch = !searchTerm || 
                title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = !typeFilter || type === typeFilter;
            
            return matchesSearch && matchesType;
        });

        this.renderManageResources();
    }

    async handleAddResource(event) {
        event.preventDefault();
        const loading = document.getElementById('addFormLoading');
        if (loading) loading.classList.add('active');

        const formData = new FormData(event.target);
        // Ensure correct field names for backend
        const resourceData = {
            title: formData.get('title') || '',
            type: formData.get('type') || '',
            description: formData.get('description') || '',
            url: formData.get('url') || '',
            category: formData.get('category') || '',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
        };

        try {
            const response = await fetch('http://localhost:5000/api/admin/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                },
                body: JSON.stringify(resourceData)
            });

            if (!response.ok) {
                // Try to parse error as JSON, fallback to text
                let errorMsg = 'Failed to add resource';
                let errorBody = null;
                try {
                    errorBody = await response.clone().json();
                    errorMsg = errorBody.message || errorMsg;
                } catch (e) {
                    try {
                        errorBody = await response.text();
                        errorMsg = errorBody || errorMsg;
                    } catch (e2) {}
                }
                throw new Error(errorMsg);
            }

            await this.loadResources();
            await this.loadStats();
            this.renderOverview();
            this.renderManageResources();
            event.target.reset();
            this.showNotification('Resource added successfully!', 'success');
        } catch (error) {
            console.error('Error adding resource:', error);
            this.showNotification(error.message, 'error');
        } finally {
            if (loading) loading.classList.remove('active');
        }
    }

    async editResource(resourceId) {
        if (!Array.isArray(this.resources)) {
            this.showNotification('Resources not loaded', 'error');
            return;
        }

        const resource = this.resources.find(r => r._id === resourceId);
        if (!resource) {
            this.showNotification('Resource not found', 'error');
            return;
        }

        this.currentEditId = resourceId;
        
        // Populate form with safe fallbacks
        const fields = {
            'editResourceId': resource._id || '',
            'editTitle': resource.title || '',
            'editType': resource.type || '',
            'editDescription': resource.description || '',
            'editUrl': resource.url || '',
            'editCategory': resource.category || '',
            'editTags': resource.tags ? resource.tags.join(', ') : ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });

        // Show modal
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    async handleEditResource(event) {
        event.preventDefault();
        
        const loading = document.getElementById('editFormLoading');
        if (loading) loading.classList.add('active');

        const formData = new FormData(event.target);
        const resourceData = Object.fromEntries(formData.entries());

        // Process tags
        if (resourceData.tags) {
            resourceData.tags = resourceData.tags.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/resources/${this.currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                },
                body: JSON.stringify(resourceData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update resource');
            }

            await this.loadResources();
            this.renderOverview();
            this.renderManageResources();
            
            this.closeEditModal();
            this.showNotification('Resource updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating resource:', error);
            this.showNotification(error.message, 'error');
        } finally {
            if (loading) loading.classList.remove('active');
        }
    }

    async deleteResource(resourceId) {
        if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/resources/${resourceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete resource');
            }

            await this.loadResources();
            await this.loadStats();
            this.renderOverview();
            this.renderManageResources();
            
            this.showNotification('Resource deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting resource:', error);
            this.showNotification(error.message, 'error');
        }
    }

    closeEditModal() {
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditId = null;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        // Add animation styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    getMostPopularType() {
        if (!Array.isArray(this.resources) || this.resources.length === 0) {
            return 'N/A';
        }

        const typeCounts = {};
        this.resources.forEach(resource => {
            const type = resource.type || 'Unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const mostPopular = Object.entries(typeCounts)
            .reduce((a, b) => typeCounts[a[0]] > typeCounts[b[0]] ? a : b);
        
        return mostPopular ? mostPopular[0] : 'N/A';
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Public method to refresh all data
    async refresh() {
        try {
            await this.loadResources();
            await this.loadStats();
            this.renderOverview();
            this.renderManageResources();
            this.showNotification('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Failed to refresh data', 'error');
        }
    }
}

// Global functions for onclick handlers and backward compatibility
window.closeEditModal = function() {
    if (window.adminManager) {
        window.adminManager.closeEditModal();
    }
};

// Initialize the admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already initialized
    if (!window.adminManager) {
        window.adminManager = new AdminResourceManager();
        window.adminManager.init().catch(error => {
            console.error('Failed to initialize admin manager:', error);
        });
    }
});
// ...existing code...

// Expose adminManager globally for debugging
window.getAdminManager = () => window.adminManager;