// Count the total number of careers in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('./models/Career');

async function countCareers() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/career-platform';
        await mongoose.connect(uri);
        
        const count = await Career.countDocuments();
        console.log(`Current database has ${count} careers`);
        
        await mongoose.connection.close();
        return count;
    } catch (error) {
        console.error('Error counting careers:', error);
        return 0;
    }
}

countCareers();
