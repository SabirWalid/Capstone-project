window.appConfig = {
    apiUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://your-render-api-url.onrender.com'
};
