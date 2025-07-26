// config.js
const config = {
    apiUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://capstone-project-g2g8.onrender.com/api',
    
    // Request configuration
    fetchOptions: {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
};

// Prevent accidental modifications
Object.freeze(config);

export default config;
