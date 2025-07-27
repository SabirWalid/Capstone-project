// Admin Dashboard Patch Instructions

1. Ensure the following display functions exist in admin-dashboard.html:
   - displayCourses(courses)
   - displayOpportunities(opportunities)
   - displayMentors(mentors)
   - displayResources(resources)

2. Ensure the loadResources function in admin-dashboard.html is updated to:
```javascript
async function loadResources() {
  try {
    console.log("Loading resources from admin dashboard...");
    const loadResourcesFromHelpers = window.loadResources || window.helpers?.loadResources;
    
    if (typeof loadResourcesFromHelpers === 'function') {
      // Use the function from admin-helpers.js
      console.log("Using resources loading function from helpers");
      await loadResourcesFromHelpers();
    } else {
      console.log("Helper function not found, using direct API call for resources");
      // Fallback to direct API call if helper isn't available
      const res = await fetch('http://localhost:5000/api/admin/resources', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') }
      });
      
      if (!res.ok) {
        const error = await res.json();
        showToast('Error loading resources: ' + (error.error || res.statusText), 'error');
        return;
      }
      
      const resources = await res.json();
      console.log('Loaded resources for admin:', resources); // Debug log
      
      displayResources(resources);
    }
  } catch (error) {
    console.error('Error in loadResources:', error);
    showToast('Failed to load resources. Check console for details.', 'error');
  }
}
```

3. Verify the admin-helpers.js file has these exports:
```javascript
window.loadCourses = loadCourses;
window.loadMentors = loadMentors;
window.loadOpportunities = loadOpportunities;
window.loadResources = loadResources;
```

4. Make sure the scripts are loaded in this order:
```html
<script src="js/admin-helpers.js"></script>
<script src="js/api.js"></script>
<script src="js/admin-resources.js"></script>
```

5. Test each component by navigating to the respective section in the admin dashboard.
