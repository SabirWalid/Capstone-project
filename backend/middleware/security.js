const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Security middleware
module.exports = function(app) {
    // Apply rate limiting
    app.use('/api/', limiter);

    // Security headers
    app.use(helmet());
    
    // XSS Protection
    app.use(helmet.xssFilter());
    
    // Prevent click-jacking
    app.use(helmet.frameguard({ action: 'deny' }));
    
    // Hide powered by express
    app.use(helmet.hidePoweredBy());
    
    // Prevent MIME type sniffing
    app.use(helmet.noSniff());
    
    // Content Security Policy
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.your-backend.com'],
            fontSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    }));
};
