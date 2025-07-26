/**
 * Career recommendation API using ML model
 */
const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Initialize Python ML process
let pythonProcess = null;

function initializeMlModel() {
    const modelScript = path.join(__dirname, '../ml/career_model.py');
    pythonProcess = spawn('python', [modelScript]);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log('ML Model output:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error('ML Model error:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
        console.log('ML Model process exited with code:', code);
    });
}

// Initialize ML model when server starts
initializeMlModel();

/**
 * POST /api/career/test
 * Get career recommendations using ML model
 */
router.post('/test', async (req, res) => {
    try {
        const { skills, interests, userId } = req.body;
        
        if (!skills || !interests) {
            return res.status(400).json({
                error: 'Skills and interests are required'
            });
        }
        
        // Send data to Python ML process
        pythonProcess.stdin.write(JSON.stringify({
            skills,
            interests,
            userId
        }) + '\n');
        
        // Get recommendations from ML model
        const recommendations = await new Promise((resolve, reject) => {
            pythonProcess.stdout.once('data', (data) => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
            
            // Set timeout for ML processing
            setTimeout(() => {
                reject(new Error('ML processing timeout'));
            }, 10000);
        });
        
        // Add metadata
        const response = {
            matches: recommendations,
            matchesFound: recommendations.length,
            totalCareersAnalyzed: recommendations.length + 10, // Example
            timestamp: new Date()
        };
        
        // Save test results if user is logged in
        if (userId) {
            await saveTestResults(userId, response);
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Career test error:', error);
        res.status(500).json({
            error: 'Failed to process career test'
        });
    }
});

/**
 * Save test results to database
 */
async function saveTestResults(userId, results) {
    try {
        const test = new TestResult({
            userId,
            results: results.matches,
            timestamp: new Date()
        });
        await test.save();
    } catch (error) {
        console.error('Error saving test results:', error);
    }
}

module.exports = router;
