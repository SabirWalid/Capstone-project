require('dotenv').config();
console.log("Mongo URI:", process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const careerRoutes = require('./routes/career');
const moduleRoutes = require('./routes/modules');
const toolkitRoutes = require('./routes/toolkit');
const mentorshipRoutes = require('./routes/mentorship');
const opportunitiesRoutes = require('./routes/opportunities');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB local connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("Connected to local MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/toolkit', toolkitRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/admin', adminRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));