require('dotenv').config();
console.log("Mongo URI:", process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
const path = require('path'); // Import path module for serving static files
const coursesRoutes = require('./routes/courses'); // Import courses route
const mentorAuthRoutes = require('./routes/mentorAuth'); // Import mentor authentication route
const mentorRoutes = require('./routes/mentor'); // Import mentor routes
const publicRoutes = require('./routes/public'); // Import public routes
const adminResourcesRoutes = require('./routes/adminResources'); // Import admin resources route
const forumRoutes = require('./routes/forum'); // Import forum routes

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads directory

// MongoDB local connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("Connected to local MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

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
app.use('/api', forumRoutes); // Use forum routes

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));