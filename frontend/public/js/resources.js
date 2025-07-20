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
        this.init();
    }

    async init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        await this.loadResources();
        await this.loadStats();
        this.renderOverview();
        this.renderManageResources();
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
        addForm.addEventListener('submit', (e) => this.handleAddResource(e));

        // Edit resource form
        const editForm = document.getElementById('editResourceForm');
        editForm.addEventListener('submit', (e) => this.handleEditResource(e));

        // Search and filter for manage tab
        const searchInput = document.getElementById('manageSearchInput');
        const typeFilter = document.getElementById('manageTypeFilter');
        
        searchInput.addEventListener('input', (e) => {
            this.filterResources(e.target.value, typeFilter.value);
        });
        
        typeFilter.addEventListener('change', (e) => {
            this.filterResources(searchInput.value, e.target.value);
        });

        // Modal close events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
            }
        });

        // Click outside modal to close
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeEditModal();
            }
        });
    }

    async loadResources() {
        try {
            const response = await fetch('/api/admin/resources');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.resources = await response.json();
            this.filteredResources = [...this.resources];
        } catch (error) {
            console.error('Error loading resources:', error);
            this.showNotification('Failed to load resources', 'error');
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.stats = await response.json();
            this.updateStatsDisplay();
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showNotification('Failed to load statistics', 'error');
        }
    }

    updateStatsDisplay() {
        document.getElementById('totalResources').textContent = this.stats.totalResources || 0;
        document.getElementById('totalDownloads').textContent = this.stats.totalDownloads || 0;
        document.getElementById('resourcesThisMonth').textContent = this.stats.resourcesThisMonth || 0;
        document.getElementById('popularType').textContent = this.stats.popularType || 'N/A';
    }

    renderOverview() {
        const container = document.getElementById('recentResourcesContainer');
        const recentResources = this.resources
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
                                <strong>${this.escapeHtml(resource.title)}</strong>
                                <br>
                                <small style="color: #666;">${this.escapeHtml(resource.description.substring(0, 100))}...</small>
                            </td>
                            <td><span class="resource-type" style="font-size: 0.9em;">${resource.type}</span></td>
                            <td>${new Date(resource.createdAt).toLocaleDateString()}</td>
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
                                <strong>${this.escapeHtml(resource.title)}</strong>
                                <br>
                                <small style="color: #666;">${this.escapeHtml(resource.description.substring(0, 80))}...</small>
                            </td>
                            <td><span class="resource-type" style="font-size: 0.9em;">${resource.type}</span></td>
                            <td>${new Date(resource.createdAt).toLocaleDateString()}</td>
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
        this.filteredResources = this.resources.filter(resource => {
            const matchesSearch = !searchTerm || 
                resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = !typeFilter || resource.type === typeFilter;
            
            return matchesSearch && matchesType;
        });

        this.renderManageResources();
    }

    async handleAddResource(event) {
        event.preventDefault();
        
        const loading = document.getElementById('addFormLoading');
        loading.classList.add('active');

        const formData = new FormData(event.target);
        const resourceData = Object.fromEntries(formData.entries());

        // Process tags
        if (resourceData.tags) {
            resourceData.tags = resourceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        try {
            const response = await fetch('/api/admin/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resourceData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add resource');
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
            loading.classList.remove('active');
        }
    }

    async editResource(resourceId) {
        const resource = this.resources.find(r => r._id === resourceId);
        if (!resource) {
            this.showNotification('Resource not found', 'error');
            return;
        }

        this.currentEditId = resourceId;
        
        // Populate form
        document.getElementById('editResourceId').value = resource._id;
        document.getElementById('editTitle').value = resource.title;
        document.getElementById('editType').value = resource.type;
        document.getElementById('editDescription').value = resource.description;
        document.getElementById('editUrl').value = resource.url;
        document.getElementById('editCategory').value = resource.category || '';
        document.getElementById('editTags').value = resource.tags ? resource.tags.join(', ') : '';

        // Show modal
        document.getElementById('editModal').classList.add('active');
    }

    async handleEditResource(event) {
        event.preventDefault();
        
        const loading = document.getElementById('editFormLoading');
        loading.classList.add('active');

        const formData = new FormData(event.target);
        const resourceData = Object.fromEntries(formData.entries());

        // Process tags
        if (resourceData.tags) {
            resourceData.tags = resourceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        try {
            const response = await fetch(`/api/admin/resources/${this.currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
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
            loading.classList.remove('active');
        }
    }

    async deleteResource(resourceId) {
        if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/resources/${resourceId}`, {
                method: 'DELETE'
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
        document.getElementById('editModal').classList.remove('active');
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

        // Add animation styles
        const style = document.createElement('style');
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

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Public method to refresh all data
    async refresh() {
        await this.loadResources();
        await this.loadStats();
        this.renderOverview();
        this.renderManageResources();
        this.showNotification('Data refreshed successfully!', 'success');
    }
}

// Global functions for onclick handlers
window.closeEditModal = function() {
    if (window.adminManager) {
        window.adminManager.closeEditModal();
    }
};

// Initialize the admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminResourceManager();
});