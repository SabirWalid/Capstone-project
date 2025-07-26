// config.js
const config = {
    apiUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://capstone-project-g2g8.onrender.com/api',
    
    // Other configuration options...
}

export default config;
