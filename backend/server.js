require('dotenv').config();

// Initial environment check
console.log('=== Server Starting ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI || !!process.env.MONGO_URI);
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
console.log('Allowed Origins:', process.env.ALLOWED_ORIGINS || 'Not set');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Configure CORS for all environments
const allowedOrigins = [
    'https://sabir-techpreneurs.netlify.app',
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://capstone-project-g2g8.onrender.com'
];

// Add any additional origins from environment variables
const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(origin => origin);
allowedOrigins.push(...envOrigins);

const corsOptions = {
    origin: function(origin, callback) {
        console.log('Request Origin:', origin);
        
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) {
            console.log('No origin specified, allowing request');
            return callback(null, true);
        }
        
        // Remove trailing slash if it exists
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        
        // Check if the origin is allowed
        const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                         allowedOrigins.includes(origin) || 
                         process.env.NODE_ENV !== 'production';
        
        if (isAllowed) {
            console.log('Origin allowed:', origin);
            callback(null, true);
        } else {
            console.log('Origin blocked:', origin);
            console.log('Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
};

const authRoutes = require('./routes/auth');
const careerRoutes = require('./routes/career');
const moduleRoutes = require('./routes/modules');
const resourcesRoutes = require('./routes/resources');
const mentorshipRoutes = require('./routes/mentorship');
const opportunitiesRoutes = require('./routes/opportunities');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');
const progressRoutes = require('./routes/progress');
const enrollmentsRoutes = require('./routes/enrollments'); // Import enrollments route
const mentorBookingsRouter = require('./routes/mentorBookings'); // Import mentor bookings route
const bodyParser = require('body-parser');
const accountRoutes = require('./routes/account'); // Import account route
const chatbotRoutes = require('./routes/chatbot'); // Import chatbot route
const adminAuthRoutes = require('./routes/adminAuth'); // Import admin authentication route
const adminCoursesRoutes = require('./routes/adminCourses'); // Import admin courses route
const adminOpportunitiesRoutes = require('./routes/adminOpportunities'); // Import admin opportunities route
const adminSettingsRoutes = require('./routes/adminSettings'); // Import admin settings route
const adminMentorsRoutes = require('./routes/adminMentors'); // Import admin mentors route
const adminUsersRoutes = require('./routes/adminUsers'); // Import admin users route
const path = require('path'); // Import path module for serving static files
const coursesRoutes = require('./routes/courses'); // Import courses route
const mentorAuthRoutes = require('./routes/mentorAuth'); // Import mentor authentication route
const mentorRoutes = require('./routes/mentor'); // Import mentor routes
const publicRoutes = require('./routes/public'); // Import public routes
const adminResourcesRoutes = require('./routes/adminResources'); // Import admin resources route
const forumRoutes = require('./routes/forum'); // Import forum routes
const adminForumRoutes = require('./routes/adminForum'); // Import admin forum routes
const syncRoutes = require('./routes/sync'); // Import sync routes for offline functionality

const app = express();

// Health check endpoint
app.get('/', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                status: dbStatus,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            },
            cors: {
                allowedOrigins: allowedOrigins
            }
        };
        
        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Test routes for debugging
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        cors: {
            allowedOrigins,
            origin: req.headers.origin,
            allowedOrigin: allowedOrigins.includes(req.headers.origin)
        }
    });
});

app.post('/api/test/auth', (req, res) => {
    console.log('Auth test received:', {
        headers: req.headers,
        body: req.body,
        method: req.method,
        origin: req.headers.origin
    });
    res.json({ 
        message: 'Auth endpoint reached',
        received: {
            headers: {
                authorization: req.headers.authorization,
                'content-type': req.headers['content-type'],
                origin: req.headers.origin
            },
            body: req.body
        }
    });
});

// Apply CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        console.log('Request Origin:', origin);
        
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) {
            console.log('No origin specified, allowing request');
            return callback(null, true);
        }
        
        // Remove trailing slash if it exists
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        
        // Check if the origin is allowed
        const isAllowed = allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin);
        
        if (isAllowed) {
            console.log('Origin allowed:', origin);
            callback(null, true);
        } else {
            console.log('Origin blocked:', origin);
            console.log('Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
}));

// Security headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }
    next();
});

// Body parsing middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Serve uploads with security headers
app.use('/uploads', (req, res, next) => {
  res.set({
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': allowedOrigins.join(',')
  });
  next();
}, express.static(path.join(__dirname, 'uploads')));

// MongoDB connection setup
const connectDB = async () => {
    try {
        // Choose URI based on environment
        const uri = process.env.NODE_ENV === 'production'
            ? process.env.MONGODB_URI_PROD
            : (process.env.MONGODB_URI || 'mongodb://localhost:27017/refugee_techpreneurs');

        console.log('Attempting to connect to MongoDB...');
        console.log('Environment:', process.env.NODE_ENV);
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log('Successfully connected to MongoDB!');
        console.log('Database connection state:', mongoose.connection.readyState);
        
        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully!');
        });

    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.error('Environment:', process.env.NODE_ENV);
        // Exit process with failure if this is the initial connection
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/admin/courses', adminCoursesRoutes); // Use admin courses route
app.use('/api/admin/opportunities', adminOpportunitiesRoutes); // Use admin opportunities route
app.use('/api/admin/settings', adminSettingsRoutes); // Use admin settings route
app.use('/api/admin/mentors', adminMentorsRoutes); // Use admin mentors route
app.use('/api/admin/users', adminUsersRoutes); // Use admin users route
// Only use /api/mentors for user-facing mentor routes, not admin
app.use('/api/admin', adminRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentsRoutes); // Use enrollments route
app.use('/api', mentorBookingsRouter); // Use mentor bookings route
app.use('/api/account', accountRoutes); // Use account route
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use('/api/chatbot', chatbotRoutes); // Use chatbot route
app.use('/api/admin', adminAuthRoutes); // Use admin authentication route
app.use('/api/courses', coursesRoutes); // Use courses route
app.use('/api/mentor', mentorAuthRoutes); // Use mentor authentication route
app.use('/api/public', publicRoutes);
// The /api/mentors route is now handled correctly.
app.use('/api/resources', resourcesRoutes); // Use resources route
app.use('/api/admin/resources', adminResourcesRoutes); // Use admin resources route
app.use('/api/admin', adminForumRoutes); // Use admin forum routes
app.use('/api', forumRoutes); // Use forum routes
app.use('/api/sync', syncRoutes); // Use sync routes for offline functionality

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));