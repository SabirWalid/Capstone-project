/**
 * Quick Seed Script for Career Database
 * This script provides an easy way to seed the database with:
 * 1. Original career data (50+ careers) from expandedCareerData.js
 * 2. Additional career data (more careers) from additionalCareers.js
 * 
 * Usage: 
 * - To run both: node quickSeed.js all
 * - To run only expanded careers: node quickSeed.js expanded
 * - To run only additional careers: node quickSeed.js additional
 */

// Load environment variables
require('dotenv').config();

const { seedExpandedCareerData } = require('./expandedCareerData');
const { seedAdditionalCareerData } = require('./additionalCareers');
const { seedMoreCareerData } = require('./moreCareers');
const { seedFinalCareerData } = require('./finalCareers');
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

async function run() {
    const args = process.argv.slice(2);
    const mode = args[0] || 'all';
    
    console.log('=== Career Database Quick Seed ===');
    
    // Count current careers before seeding
    const beforeCount = await countCareers();
    
    switch(mode.toLowerCase()) {
        case 'expanded':
            console.log('Seeding expanded career data only...');
            await seedExpandedCareerData();
            break;
            
        case 'additional':
            console.log('Seeding additional career data only...');
            await seedAdditionalCareerData();
            break;
            
        case 'more':
            console.log('Seeding more career data only...');
            await seedMoreCareerData();
            break;
            
        case 'final':
            console.log('Seeding final career data only...');
            await seedFinalCareerData();
            break;
            
        case 'all':
        default:
            console.log('Seeding all career data...');
            console.log('Step 1: Seeding expanded career data');
            await seedExpandedCareerData();
            console.log('Step 2: Seeding additional career data');
            await seedAdditionalCareerData();
            console.log('Step 3: Seeding more career data');
            await seedMoreCareerData();
            console.log('Step 4: Seeding final career data');
            await seedFinalCareerData();
            break;
    }
    
    // Count careers after seeding to show difference
    const afterCount = await countCareers();
    console.log(`Career database seeding complete!`);
    console.log(`Added ${afterCount - beforeCount} new careers`);
    console.log(`Total careers in database: ${afterCount}`);
}

run().catch(console.error);
