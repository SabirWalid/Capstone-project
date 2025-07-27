const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Security middleware
module.exports = function(app) {
    // Apply basic security headers only in production
    if (process.env.NODE_ENV === 'production') {
        // Apply rate limiting
        app.use('/api/', limiter);
        
        // Basic security headers
        app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: { policy: "cross-origin" },
            crossOriginOpenerPolicy: { policy: "unsafe-none" }
        }));
    }
    
    // Everything else is temporarily disabled for debugging
};
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", process.env.NODE_ENV === 'development' ? '*' : 'https://*.onrender.com'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
            upgradeInsecureRequests: []
        },
    }));
};
