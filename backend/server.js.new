require('dotenv').config();

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

// Initialize Express app
const app = express();

// CORS Configuration
const allowedOrigins = [
    'https://sabir-techpreneurs.netlify.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:3000'
];

// Add any additional origins from environment variables
if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    allowedOrigins.push(...envOrigins);
}

// Configure CORS
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Normalize the origin
        const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
        
        // Check if origin is allowed
        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/admin');
const opportunityRoutes = require('./routes/opportunities');
const courseRoutes = require('./routes/courses');
const resourceRoutes = require('./routes/resources');
const mentorRoutes = require('./routes/mentor');
const mentorAuthRoutes = require('./routes/mentorAuth');
const publicRoutes = require('./routes/public');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentor/auth', mentorAuthRoutes);
app.use('/api/public', publicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
        
        // Start server only after successful database connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
