const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const UserCareerProfile = require('../models/UserCareerProfile');
const { analyzeCareerPath } = require('../services/aiService');
const auth = require('../middleware/auth');

// AI-powered career assessment endpoint
router.post('/ai-assessment', auth, async (req, res) => {
    try {
        const {
            technicalSkills,
            interests,
            background,
            workStyle,
            goals,
            constraints,
            educationLevel,
            englishProficiency,
            previousExperience
        } = req.body;

        // Format user responses for AI analysis
        const userResponses = {
            technical_skills: technicalSkills || [],
            interests: interests || [],
            background: background || '',
            work_style: workStyle || '',
            career_goals: goals || '',
            constraints: constraints || '',
            education: educationLevel || '',
            english_level: englishProficiency || '',
            experience: previousExperience || ''
        };

        // Get AI career analysis
        const aiAnalysis = await analyzeCareerPath(userResponses);

        // Check if userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const userId = req.user.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        // Save the assessment results to user's profile
        const userProfile = await UserCareerProfile.findOneAndUpdate(
            { userId },
            {
                $set: {
                    assessmentResults: aiAnalysis,
                    lastAssessmentDate: new Date(),
                    userResponses
                }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: aiAnalysis,
            message: 'Career assessment completed successfully'
        });
    } catch (error) {
        console.error('Career Assessment Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing career assessment',
            details: error.message
        });
    }
});

// Get user's career assessment history
router.get('/assessment-history', auth, async (req, res) => {
    try {
        // Check if userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const userId = req.user.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }
        
        const userProfile = await UserCareerProfile.findOne({ userId });
        if (!userProfile) {
            return res.json({
                success: true,
                data: null,
                message: 'No assessment history found'
            });
        }

        res.json({
            success: true,
            data: {
                lastAssessment: userProfile.assessmentResults,
                lastAssessmentDate: userProfile.lastAssessmentDate,
                userResponses: userProfile.userResponses
            }
        });
    } catch (error) {
        console.error('Assessment History Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching assessment history',
            details: error.message
        });
    }
});

// Save assessment history
router.post('/save-history', auth, async (req, res) => {
    try {
        const { assessmentResult, timestamp } = req.body;
        
        if (!assessmentResult) {
            return res.status(400).json({
                success: false,
                error: 'Assessment result is required'
            });
        }
        
        // Check if userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        const userId = req.user.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }
        
        // Find and update user profile with new assessment history
        const userProfile = await UserCareerProfile.findOneAndUpdate(
            { userId },
            {
                $push: {
                    careerTests: {
                        testDate: timestamp || new Date(),
                        results: Array.isArray(assessmentResult) 
                            ? assessmentResult 
                            : [assessmentResult],
                        feedback: ''
                    }
                }
            },
            { upsert: true, new: true }
        );
        
        res.json({
            success: true,
            message: 'Assessment history saved successfully'
        });
    } catch (error) {
        console.error('Save Assessment History Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error saving assessment history',
            details: error.message
        });
    }
});

module.exports = router;