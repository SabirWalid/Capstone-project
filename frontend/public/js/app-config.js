window.appConfig = {
    // Always use port 5000 for the API in development
    apiUrl: function() {
        // If we're on a local development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Using local API on port 5000');
            return 'http://localhost:5000';
        }
        
        // For production environments, use the deployed API URL
        return 'https://capstone-project-g2g8.onrender.com';
    }(),  // Execute the function immediately to get the URL
    
    // Fallback URLs to try if the main one fails - prioritize port 5000
    fallbackApiUrls: [
        'http://localhost:5000',      // Primary local API URL
        'http://127.0.0.1:5000',      // Alternative local API URL
        window.location.origin,       // Current origin as fallback
        'https://capstone-project-g2g8.onrender.com' // Production URL as last resort
    ],
    
    // Try next fallback URL in case of API failure
    tryNextFallback: function() {
        // Move current API URL to the end of the fallback list
        const currentUrl = this.apiUrl;
        this.fallbackApiUrls = this.fallbackApiUrls.filter(url => url !== currentUrl);
        this.fallbackApiUrls.push(currentUrl);
        
        // Set the next fallback URL as the active one
        this.apiUrl = this.fallbackApiUrls[0];
        console.log('Switched API URL to fallback:', this.apiUrl);
        
        return this.apiUrl;
    }
};