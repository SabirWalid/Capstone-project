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

        // Save the assessment results to user's profile
        const userProfile = await UserCareerProfile.findOneAndUpdate(
            { userId: req.user.id },
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
        const userProfile = await UserCareerProfile.findOne({ userId: req.user.id });
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

module.exports = router;
