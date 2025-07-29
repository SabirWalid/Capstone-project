/**
 * Admin Resources Management
 * This file contains functions for managing resources in the admin dashboard
 */

// Global variables
let currentResources = [];
let offlineResources = [];
const baseApiUrl = 'http://localhost:5000/api';
const productionApiUrl = 'https://sabir-techpreneurs.onrender.com/api';

/**
 * CRUD Operations for Resources
 */

// Add a new resource
async function addResource(event) {
  console.log('Add resource function called');
  event.preventDefault();
  
  const form = document.getElementById('addResourceForm');
  if (!form) {
    console.error('Add resource form not found');
    alert('Error: Resource form not found');
    return;
  }
  
  console.log('Form found, collecting data...');
  const formData = new FormData(form);
  const resourceData = Object.fromEntries(formData.entries());
  console.log('Resource data:', resourceData);
  
  // Display loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) {
    console.error('Submit button not found');
  } else {
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    submitBtn.disabled = true;
  }
  
  try {
    // Get the admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showMessage('error', 'Authentication required. Please log in again.');
      return;
    }

    // Try to submit to the server
    let response;
    try {
      response = await fetch(`${baseApiUrl}/admin/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (serverError) {
      // Try production URL
      console.log('Trying production URL...');
      response = await fetch(`${productionApiUrl}/admin/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    }

    const result = await response.json();
    
    // Add to offline cache
    saveResourceToOfflineCache(result.resource || result);
    
    // Reset form and show success message
    form.reset();
    showMessage('success', 'Resource added successfully!');
    
    // Reload resources
    fetchResourcesDirectly();
    
    // Switch to overview tab
    switchResourceTab('overview');
    
  } catch (error) {
    console.error('Error adding resource:', error);
    showMessage('error', `Failed to add resource: ${error.message}`);
    
    // Save to offline queue for sync when back online
    addToSyncQueue('add', resourceData);
    showMessage('warning', 'Resource saved locally. It will sync when you\'re back online.');
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Edit a resource
function editResource(resourceId) {
  console.log(`Editing resource with ID: ${resourceId}`);
  
  // Find the resource
  const resource = findResourceById(resourceId);
  if (!resource) {
    showMessage('error', 'Resource not found');
    return;
  }
  
  // Populate form fields
  document.getElementById('editResourceId').value = resourceId;
  document.getElementById('editTitle').value = resource.title || '';
  document.getElementById('editType').value = resource.type || '';
  document.getElementById('editDescription').value = resource.description || '';
  document.getElementById('editUrl').value = resource.url || '';
  document.getElementById('editCategory').value = resource.category || '';
  document.getElementById('editTags').value = resource.tags || '';
  
  // Show the modal
  const modal = document.getElementById('editModal');
  modal.style.display = 'block';
}

// Save the edited resource
async function saveEditedResource(event) {
  event.preventDefault();
  
  const resourceId = document.getElementById('editResourceId').value;
  const form = document.getElementById('editResourceForm');
  const formData = new FormData(form);
  const resourceData = Object.fromEntries(formData.entries());
  
  // Display loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
  submitBtn.disabled = true;
  
  try {
    // Get the admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showMessage('error', 'Authentication required. Please log in again.');
      return;
    }
    
    // Try to update on the server
    let response;
    try {
      response = await fetch(`${baseApiUrl}/admin/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (serverError) {
      // Try production URL
      console.log('Trying production URL for update...');
      response = await fetch(`${productionApiUrl}/admin/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    }

    const result = await response.json();
    
    // Update in offline cache
    updateResourceInOfflineCache(resourceId, result.resource || resourceData);
    
    // Close modal and show success message
    closeEditResourceModal();
    showMessage('success', 'Resource updated successfully!');
    
    // Reload resources
    fetchResourcesDirectly();
    
  } catch (error) {
    console.error('Error updating resource:', error);
    showMessage('error', `Failed to update resource: ${error.message}`);
    
    // Save to offline queue for sync when back online
    addToSyncQueue('update', { id: resourceId, ...resourceData });
    showMessage('warning', 'Update saved locally. It will sync when you\'re back online.');
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Close the edit resource modal
function closeEditResourceModal() {
  const modal = document.getElementById('editModal');
  modal.style.display = 'none';
}

// Delete a resource
function deleteResource(resourceId) {
  console.log(`Deleting resource with ID: ${resourceId}`);
  
  // Store the ID in the hidden field
  document.getElementById('delete-resource-id').value = resourceId;
  
  // Show the confirm delete modal
  const modal = document.getElementById('confirmDeleteModal');
  modal.style.display = 'block';
}

// Close the delete confirmation modal
function closeDeleteModal() {
  const modal = document.getElementById('confirmDeleteModal');
  modal.style.display = 'none';
}

// Confirm and execute resource deletion
async function confirmDeleteResource() {
  const resourceId = document.getElementById('delete-resource-id').value;
  
  // Display loading state
  const deleteBtn = document.querySelector('#confirmDeleteModal .btn-danger');
  const originalBtnText = deleteBtn.innerHTML;
  deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
  deleteBtn.disabled = true;
  
  try {
    // Get the admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showMessage('error', 'Authentication required. Please log in again.');
      return;
    }
    
    // Try to delete on the server
    let response;
    try {
      response = await fetch(`${baseApiUrl}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (serverError) {
      // Try production URL
      console.log('Trying production URL for delete...');
      response = await fetch(`${productionApiUrl}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    }
    
    // Remove from offline cache
    removeResourceFromOfflineCache(resourceId);
    
    // Close modal and show success message
    closeDeleteModal();
    showMessage('success', 'Resource deleted successfully!');
    
    // Reload resources
    fetchResourcesDirectly();
    
  } catch (error) {
    console.error('Error deleting resource:', error);
    showMessage('error', `Failed to delete resource: ${error.message}`);
    
    // Add to offline queue for sync when back online
    addToSyncQueue('delete', { id: resourceId });
    showMessage('warning', 'Delete operation saved locally. It will sync when you\'re back online.');
  } finally {
    // Restore button state
    deleteBtn.innerHTML = originalBtnText;
    deleteBtn.disabled = false;
  }
}

/**
 * Offline Support for Resources
 */

// Load resources from offline cache
function loadOfflineResources() {
  try {
    const cachedResources = localStorage.getItem('offlineResources');
    if (cachedResources) {
      offlineResources = JSON.parse(cachedResources);
      return offlineResources;
    }
    return [];
  } catch (error) {
    console.error('Error loading offline resources:', error);
    return [];
  }
}

// Save a resource to offline cache
function saveResourceToOfflineCache(resource) {
  try {
    // Load current cache
    const resources = loadOfflineResources();
    
    // Add or update the resource
    const index = resources.findIndex(r => r._id === resource._id);
    if (index !== -1) {
      resources[index] = {...resources[index], ...resource};
    } else {
      resources.push(resource);
    }
    
    // Save back to cache
    localStorage.setItem('offlineResources', JSON.stringify(resources));
    
    // Update the global variable
    offlineResources = resources;
    
  } catch (error) {
    console.error('Error saving resource to offline cache:', error);
  }
}

// Update a resource in offline cache
function updateResourceInOfflineCache(resourceId, updatedResource) {
  try {
    // Load current cache
    const resources = loadOfflineResources();
    
    // Find and update the resource
    const index = resources.findIndex(r => r._id === resourceId);
    if (index !== -1) {
      resources[index] = {...resources[index], ...updatedResource};
      
      // Save back to cache
      localStorage.setItem('offlineResources', JSON.stringify(resources));
      
      // Update the global variable
      offlineResources = resources;
    }
  } catch (error) {
    console.error('Error updating resource in offline cache:', error);
  }
}

// Remove a resource from offline cache
function removeResourceFromOfflineCache(resourceId) {
  try {
    // Load current cache
    let resources = loadOfflineResources();
    
    // Filter out the resource
    resources = resources.filter(r => r._id !== resourceId);
    
    // Save back to cache
    localStorage.setItem('offlineResources', JSON.stringify(resources));
    
    // Update the global variable
    offlineResources = resources;
    
  } catch (error) {
    console.error('Error removing resource from offline cache:', error);
  }
}

// Queue operations for when online
function addToSyncQueue(operation, data) {
  try {
    // Load current queue
    let syncQueue = JSON.parse(localStorage.getItem('resourceSyncQueue') || '[]');
    
    // Add operation to queue
    syncQueue.push({
      operation,
      data,
      timestamp: Date.now()
    });
    
    // Save back to storage
    localStorage.setItem('resourceSyncQueue', JSON.stringify(syncQueue));
    
  } catch (error) {
    console.error('Error adding operation to sync queue:', error);
  }
}

// Process sync queue when online
async function processSyncQueue() {
  if (!navigator.onLine) {
    console.log('Cannot process sync queue: offline');
    return;
  }
  
  try {
    // Load current queue
    const syncQueue = JSON.parse(localStorage.getItem('resourceSyncQueue') || '[]');
    if (syncQueue.length === 0) {
      return; // Nothing to process
    }
    
    console.log(`Processing ${syncQueue.length} queued resource operations`);
    
    // Get the admin token
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('Cannot process sync queue: No admin token');
      return;
    }
    
    // Process each operation
    const remainingOperations = [];
    
    for (const item of syncQueue) {
      try {
        switch (item.operation) {
          case 'add':
            await syncAddResource(item.data, token);
            break;
          case 'update':
            await syncUpdateResource(item.data.id, item.data, token);
            break;
          case 'delete':
            await syncDeleteResource(item.data.id, token);
            break;
        }
      } catch (error) {
        console.error(`Failed to sync operation:`, item, error);
        remainingOperations.push(item);
      }
    }
    
    // Save remaining operations back to queue
    localStorage.setItem('resourceSyncQueue', JSON.stringify(remainingOperations));
    
    if (remainingOperations.length === 0) {
      showMessage('success', 'All resource changes synchronized successfully!');
    } else {
      showMessage('warning', `Synchronized some changes. ${remainingOperations.length} operations pending.`);
    }
    
    // Reload resources
    fetchResourcesDirectly();
    
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
}

// Sync a resource addition
async function syncAddResource(resourceData, token) {
  let response = await fetch(`${baseApiUrl}/admin/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(resourceData)
  });
  
  if (!response.ok) {
    response = await fetch(`${productionApiUrl}/admin/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resourceData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync add operation: ${response.status}`);
    }
  }
  
  const result = await response.json();
  console.log('Successfully synced add operation:', result);
}

// Sync a resource update
async function syncUpdateResource(resourceId, resourceData, token) {
  let response = await fetch(`${baseApiUrl}/admin/resources/${resourceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(resourceData)
  });
  
  if (!response.ok) {
    response = await fetch(`${productionApiUrl}/admin/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resourceData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync update operation: ${response.status}`);
    }
  }
  
  const result = await response.json();
  console.log('Successfully synced update operation:', result);
}

// Sync a resource deletion
async function syncDeleteResource(resourceId, token) {
  let response = await fetch(`${baseApiUrl}/admin/resources/${resourceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    response = await fetch(`${productionApiUrl}/admin/resources/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync delete operation: ${response.status}`);
    }
  }
  
  console.log('Successfully synced delete operation for ID:', resourceId);
}

/**
 * Helper Functions
 */

// Find a resource by ID
function findResourceById(resourceId) {
  console.log(`Finding resource with ID: ${resourceId}`);
  
  // Check in current resources first
  if (currentResources && currentResources.length > 0) {
    console.log(`Searching in currentResources (${currentResources.length} items)`);
    const resource = currentResources.find(r => r._id === resourceId);
    if (resource) {
      console.log('Found in currentResources:', resource);
      return resource;
    }
  }
  
  // Check in window.currentResources if available (might be set by admin-dashboard.html)
  if (window.currentResources && window.currentResources.length > 0 && window.currentResources !== currentResources) {
    console.log(`Searching in window.currentResources (${window.currentResources.length} items)`);
    const resource = window.currentResources.find(r => r._id === resourceId);
    if (resource) {
      console.log('Found in window.currentResources:', resource);
      return resource;
    }
  }
  
  // Check in offline cache if not found
  if (offlineResources && offlineResources.length > 0) {
    console.log(`Searching in offlineResources (${offlineResources.length} items)`);
    const resource = offlineResources.find(r => r._id === resourceId);
    if (resource) {
      console.log('Found in offlineResources:', resource);
      return resource;
    }
  }
  
  // If still not found, try localStorage directly
  try {
    const cachedResources = JSON.parse(localStorage.getItem('offlineResources') || '[]');
    if (cachedResources.length > 0) {
      console.log(`Searching in localStorage (${cachedResources.length} items)`);
      const resource = cachedResources.find(r => r._id === resourceId);
      if (resource) {
        console.log('Found in localStorage:', resource);
        return resource;
      }
    }
  } catch (e) {
    console.error('Error searching localStorage:', e);
  }
  
  console.error(`Resource with ID ${resourceId} not found in any storage`);
  return null;
}

// Show a message to the user
function showMessage(type, message) {
  console.log(`Showing message: ${type} - ${message}`);
  
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type}`;
  messageDiv.role = 'alert';
  messageDiv.textContent = message;
  
  // Style for better visibility
  messageDiv.style.marginBottom = '20px';
  messageDiv.style.marginTop = '10px';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'btn-close';
  closeButton.setAttribute('data-bs-dismiss', 'alert');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.onclick = () => messageDiv.remove();
  messageDiv.appendChild(closeButton);
  
  // Try multiple potential containers
  // First try the resources section
  const resourcesSection = document.getElementById('resources-section');
  // Then try the add tab 
  const addTab = document.getElementById('add');
  // Then try the form itself
  const resourceForm = document.getElementById('addResourceForm');
  
  if (resourcesSection) {
    // Insert at the top of resources section
    resourcesSection.insertBefore(messageDiv, resourcesSection.firstChild);
  } else if (addTab) {
    // Insert at the top of add tab
    addTab.insertBefore(messageDiv, addTab.firstChild);
  } else if (resourceForm) {
    // Insert before the form
    resourceForm.parentNode.insertBefore(messageDiv, resourceForm);
  } else {
    // Last resort - add to body
    document.body.insertBefore(messageDiv, document.body.firstChild);
  }
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// Add offline functionality to user-facing resources
function enableOfflineResourcesForUsers() {
  // Add download buttons to resources
  const resources = document.querySelectorAll('.resource-card');
  resources.forEach(card => {
    // Skip if already has download button
    if (card.querySelector('.offline-download-btn')) return;
    
    const resourceId = card.getAttribute('data-id');
    const actionArea = card.querySelector('.card-actions') || card.querySelector('.card-footer');
    
    if (actionArea && resourceId) {
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'offline-download-btn';
      downloadBtn.innerHTML = '<i class="material-icons" style="font-size: 14px;">download</i>';
      downloadBtn.title = 'Save for offline use';
      downloadBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        downloadResourceForOffline(resourceId);
      };
      
      actionArea.appendChild(downloadBtn);
    }
  });
}

// Download a resource for offline use
async function downloadResourceForOffline(resourceId) {
  try {
    // Find the resource
    const resource = findResourceById(resourceId);
    if (!resource) {
      showMessage('error', 'Resource not found');
      return;
    }
    
    // Add to offline resources
    saveResourceToOfflineCache(resource);
    
    // Show success message
    showMessage('success', 'Resource saved for offline use');
    
    // Update UI
    const button = document.querySelector(`.resource-card[data-id="${resourceId}"] .offline-download-btn`);
    if (button) {
      button.innerHTML = '<i class="material-icons" style="font-size: 14px;">check</i>';
      button.style.background = '#4CAF50';
      button.title = 'Available offline';
      button.disabled = true;
    }
    
  } catch (error) {
    console.error('Error downloading resource for offline use:', error);
    showMessage('error', 'Failed to save resource for offline use');
  }
}

// Initialize offline functionality
function initOfflineResourcesSupport() {
  // Load offline resources
  loadOfflineResources();
  
  // Check for online/offline status
  window.addEventListener('online', () => {
    console.log('Back online - syncing resources...');
    processSyncQueue();
  });
  
  window.addEventListener('offline', () => {
    console.log('Offline - using cached resources');
    showMessage('warning', 'You are offline. Using locally saved resources.');
  });
  
  // Process sync queue if online
  if (navigator.onLine) {
    processSyncQueue();
  }
  
  // Add form submission handler for adding resources
  const addResourceForm = document.getElementById('addResourceForm');
  if (addResourceForm) {
    addResourceForm.addEventListener('submit', addResource);
  }
}

// When the document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin resources script loaded');
  
  // Initialize offline support
  initOfflineResourcesSupport();
  
  // Add form submission handler for add form
  const addResourceForm = document.getElementById('addResourceForm');
  if (addResourceForm && !addResourceForm.getAttribute('data-listeners-added')) {
    addResourceForm.addEventListener('submit', addResource);
    addResourceForm.setAttribute('data-listeners-added', 'true');
  }
  
  // Add form submission handler for edit form
  const editResourceForm = document.getElementById('editResourceForm');
  if (editResourceForm && !editResourceForm.getAttribute('data-listeners-added')) {
    editResourceForm.addEventListener('submit', saveEditedResource);
    editResourceForm.setAttribute('data-listeners-added', 'true');
  }
});
