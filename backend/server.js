require('dotenv').config();

// Force port to be 5000 regardless of environment variables
process.env.PORT = '5000';

// Initial environment check
console.log('=== Server Starting ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI || !!process.env.MONGO_URI);
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
console.log('Allowed Origins:', process.env.ALLOWED_ORIGINS || 'Not set');

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');

// Initialize Express app
const app = express();

// Basic security middleware
app.use(helmet({
    contentSecurityPolicy: false, // We'll configure this separately
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// CORS Configuration
const allowedOrigins = [
    'https://sabir-techpreneurs.netlify.app',
    'https://capstone-project-g2g8.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://localhost:5500',
    'http://localhost'
];

// Add any additional origins from environment variables
if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',')
        .map(origin => origin.trim())
        .filter(origin => {
            try {
                // Validate that each origin is a valid URL
                new URL(origin);
                return true;
            } catch (e) {
                console.warn(`Invalid origin in ALLOWED_ORIGINS: ${origin}`);
                return false;
            }
        });
    allowedOrigins.push(...envOrigins);
}

// Configure CORS
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // For development environment
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Otherwise, reject the request
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin'
    ]
};

app.use(cors(corsOptions));

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Body parser configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS error handling
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        console.error('CORS Error:', {
            origin: req.headers.origin,
            method: req.method,
            path: req.path,
            headers: req.headers
        });
        res.status(403).json({
            error: 'CORS Error',
            message: 'This origin is not allowed to access the resource',
            allowedOrigins: allowedOrigins,
            yourOrigin: req.headers.origin
        });
    } else {
        next(err);
    }
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/admin');
const opportunityRoutes = require('./routes/opportunities');
const courseRoutes = require('./routes/courses');
const adminCourseRoutes = require('./routes/adminCourses');
const resourceRoutes = require('./routes/resources');
const mentorRoutes = require('./routes/mentor');
const mentorAuthRoutes = require('./routes/mentorAuth');
const publicRoutes = require('./routes/public');
const adminResourceRoutes = require('./routes/adminResources');
const adminMentorRoutes = require('./routes/adminMentors');
const adminForumRoutes = require('./routes/adminForum');
const adminOpportunityRoutes = require('./routes/adminOpportunities');
const careerAssessmentRoutes = require('./routes/careerAssessment');
const careerTestRoutes = require('./routes/careerTest');
const careerRoutes = require('./routes/career');
const apiRoutes = require('./routes/api');      // General API fallback routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/courses', courseRoutes);          // Public course routes
app.use('/api/admin/courses', adminCourseRoutes); // Admin course routes
app.use('/api/resources', resourceRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentor/auth', mentorAuthRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/admin/resources', adminResourceRoutes);
app.use('/api/admin/mentors', adminMentorRoutes);
app.use('/api/admin/forum', adminForumRoutes);
app.use('/api/admin/opportunities', adminOpportunityRoutes);
app.use('/api/career-assessment', careerAssessmentRoutes);
app.use('/api/career-test', careerTestRoutes);
app.use('/api/career', careerRoutes);

// Add forwarding route for compatibility
const careerTestForwardedRoutes = require('./routes/careerTestForwarded');
app.use('/api/career', careerTestForwardedRoutes);
app.use('/api', apiRoutes);                     // General API routes for fallback

// Error handling middleware
app.use((err, req, res, next) => {
    // Log the full error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body
    });

    // Handle path-to-regexp errors
    if (err.message && err.message.includes('Missing parameter name')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Route Configuration',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Server configuration error'
        });
    }

    // Handle other errors
    res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB
let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

// If MongoDB URI is not provided in env vars, use a fallback for development
if (!mongoURI) {
    console.warn('No MongoDB URI found in environment variables, using fallback connection string');
    // Use a default local MongoDB connection
    mongoURI = 'mongodb://localhost:27017/techpreneursdb';
}

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
        
        // Start server only after successful database connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`OpenAI API is completely disabled - using database fallbacks only`);
            console.log(`API endpoints available at: http://localhost:${PORT}/api/`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Starting server without database - using local fallbacks only');
        
        // Start server anyway to allow frontend testing with local fallbacks
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (WITHOUT DATABASE)`);
            console.log(`Using local fallback data only - some features will be limited`);
        });
    });

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
