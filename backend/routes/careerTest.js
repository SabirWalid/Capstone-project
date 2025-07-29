/**
 * Career recommendation API using OpenAI and database fallbacks
 * No Python or ML model needed
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const UserCareerProfile = require('../models/UserCareerProfile');
const Career = require('../models/Career');
const aiService = require('../services/aiService');
// Using UserCareerProfile instead of a separate TestResult model
const auth = require('../middleware/auth'); // Auth middleware for protected routes

/**
 * POST /api/career-test/test
 * Get career recommendations directly from the database, bypassing OpenAI
 */
router.post('/test', async (req, res) => {
    try {
        console.log('Career test endpoint called!');
        console.log('Request body:', req.body);
        
        // Validate request body
        if (!req.body) {
            console.log('Error: Request body is missing');
            return res.status(400).json({
                error: 'Request body is required'
            });
        }
        
        const { skills, interests, userId } = req.body;
        
        // Ensure skills and interests are valid arrays
        if (!Array.isArray(skills) || !Array.isArray(interests)) {
            return res.status(400).json({
                error: 'Skills and interests must be arrays'
            });
        }
        
        // Convert empty arrays to default values to prevent errors
        const safeSkills = skills.length > 0 ? skills : ['programming'];
        const safeInterests = interests.length > 0 ? interests : ['technology'];
        
        let result = null;
        
        try {
            // Skip OpenAI and go directly to database
            console.log('Fetching career recommendations from database...');
            const dbCareers = await Career.find().limit(20).catch(err => {
                console.error('Database query error:', err);
                return [];
            });
            
            if (Array.isArray(dbCareers) && dbCareers.length > 0) {
                console.log(`Found ${dbCareers.length} careers in database, matching with user input...`);
                const recommendations = matchWithDatabaseCareers(safeSkills, safeInterests, dbCareers);
                
                result = {
                    matches: recommendations,
                    matchesFound: recommendations.length,
                    totalCareersAnalyzed: dbCareers.length,
                    source: 'database',
                    timestamp: new Date().toISOString()
                };
                
                console.log(`Database matching produced ${recommendations.length} results`);
            } else {
                // No careers in database, use fallback
                console.log('No careers found in database, using fallback logic');
                const recommendations = getFallbackRecommendations(safeSkills, safeInterests);
                
                result = {
                    matches: recommendations || [],  // Ensure we have at least an empty array
                    matchesFound: recommendations ? recommendations.length : 0,
                    totalCareersAnalyzed: 7, // Number of hardcoded careers
                    source: 'fallback',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (dbError) {
            console.error('Error getting database recommendations:', dbError);
            
            // Use fallback hardcoded recommendations as last resort
            console.log('Using fallback hardcoded career recommendations');
            const recommendations = getFallbackRecommendations(safeSkills, safeInterests);
            
            result = {
                matches: recommendations || [],  // Ensure we have at least an empty array
                matchesFound: recommendations ? recommendations.length : 0,
                totalCareersAnalyzed: 7, // Updated number of hardcoded careers
                source: 'fallback',
                timestamp: new Date().toISOString()
            };
        }
        
        // Ensure result exists and has a valid format
        if (!result) {
            result = {
                matches: [],
                matchesFound: 0,
                totalCareersAnalyzed: 0,
                source: 'error-fallback',
                timestamp: new Date().toISOString()
            };
        }

        // Make sure we have a consistent response format with all fields populated
        const response = {
            matches: Array.isArray(result.matches) ? result.matches : [],
            matchesFound: result.matchesFound || (Array.isArray(result.matches) ? result.matches.length : 0),
            totalCareersAnalyzed: result.totalCareersAnalyzed || (Array.isArray(result.matches) ? result.matches.length : 0),
            source: result.source || 'unknown',
            timestamp: result.timestamp || new Date().toISOString()
        };
        
        // Save test results if user is logged in
        if (userId) {
            try {
                await saveTestResults(userId, response);
            } catch (saveError) {
                console.error('Error saving test results:', saveError);
                // Continue to return response even if saving failed
            }
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Career test error:', error);
        res.status(500).json({
            error: 'Failed to process career test',
            message: error.message || 'Internal server error'
        });
    }
});

/**
 * Save test results to database
 */
async function saveTestResults(userId, results) {
    try {
        // Check if userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log(`Invalid ObjectId format for userId: ${userId}`);
            return; // Skip saving if userId is invalid
        }
        
        // Check if results or matches are undefined
        if (!results || !results.matches || !Array.isArray(results.matches)) {
            console.log('Invalid results format, cannot save test results');
            return; // Skip saving if results are invalid
        }
        
        // Find and update user profile with new test results
        const userProfile = await UserCareerProfile.findOneAndUpdate(
            { userId },
            {
                $push: {
                    careerTests: {
                        testDate: new Date(),
                        results: results.matches.map(match => ({
                            careerPath: match.career || match.title || 'Unknown Career',
                            score: match.score || 0,
                            confidence: match.confidence || 0
                        }))
                    }
                }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error saving test results:', error);
    }
}

/**
 * Match user skills and interests with careers from the database
 */
function matchWithDatabaseCareers(skills, interests, careers) {
    // Ensure inputs are valid arrays to prevent map() errors
    const safeSkills = Array.isArray(skills) ? skills : [];
    const safeInterests = Array.isArray(interests) ? interests : [];
    const safeCareers = Array.isArray(careers) ? careers : [];
    
    if (!skills || !interests) {
        console.warn('Missing skills or interests in matchWithDatabaseCareers');
    }
    
    if (!careers || !Array.isArray(careers) || careers.length === 0) {
        console.warn('No careers provided to matchWithDatabaseCareers');
        return []; // Return empty array if no careers to match with
    }
    
    // Convert input to lowercase for case-insensitive matching
    const userSkills = safeSkills.map(s => (s || '').toLowerCase());
    const userInterests = safeInterests.map(i => (i || '').toLowerCase());
    
    // Calculate match scores for each career
    const results = safeCareers.map(career => {
        let skillMatches = 0;
        let interestMatches = 0;
        
        // Get career skills and interests, handle different data formats
        const careerSkills = Array.isArray(career.skills) 
            ? career.skills.map(s => typeof s === 'string' ? s.toLowerCase() : '')
            : [];
            
        const careerInterests = Array.isArray(career.interests) 
            ? career.interests.map(i => typeof i === 'string' ? i.toLowerCase() : '')
            : [];
        
        // Count skill matches
        userSkills.forEach(skill => {
            if (careerSkills.some(s => s.includes(skill) || skill.includes(s))) {
                skillMatches++;
            }
        });
        
        // Count interest matches
        userInterests.forEach(interest => {
            if (careerInterests.some(i => i.includes(interest) || interest.includes(i))) {
                interestMatches++;
            }
        });
        
        // Calculate match score (0-100)
        const skillScore = userSkills.length > 0 ? (skillMatches / userSkills.length) * 100 : 0;
        const interestScore = userInterests.length > 0 ? (interestMatches / userInterests.length) * 100 : 0;
        const score = Math.round((skillScore * 0.6) + (interestScore * 0.4)); // Weight skills higher
        
        return {
            title: career.title,
            description: career.description || 'No description available',
            score: score,
            skillScore: Math.round(skillScore),
            interestScore: Math.round(interestScore),
            confidence: Math.min(career.confidence || 80, score + 10),
            matchedSkills: userSkills.filter(skill => 
                careerSkills.some(s => s.includes(skill) || skill.includes(s))
            ),
            matchedInterests: userInterests.filter(interest => 
                careerInterests.some(i => i.includes(interest) || interest.includes(i))
            ),
            courses: career.courses || [
                { name: `Introduction to ${career.title}`, url: "#", level: "Beginner" },
                { name: `Advanced ${career.title}`, url: "#", level: "Intermediate" }
            ]
        };
    });
    
    // Sort by score (descending) and return top matches
    return results
        .sort((a, b) => b.score - a.score)
        .filter(result => result.score > 20); // Only include somewhat relevant matches
}

/**
 * Provides fallback recommendations when both OpenAI and database fail
 * Uses a simple keyword matching approach with hardcoded career data
 */
function getFallbackRecommendations(skills, interests) {
    // Basic career paths with associated skills and interests
    const careerPaths = [
        {
            title: "Full Stack Web Developer",
            description: "Develop both client and server-side applications",
            skills: ["javascript", "html", "css", "node", "react", "angular", "vue", "express", "mongodb", "sql"],
            interests: ["web development", "programming", "software engineering", "coding", "development"],
            confidence: 85
        },
        {
            title: "Data Scientist",
            description: "Analyze and interpret complex data to help make business decisions",
            skills: ["python", "r", "statistics", "machine learning", "sql", "tensorflow", "pytorch", "pandas", "numpy"],
            interests: ["data", "analytics", "statistics", "machine learning", "ai", "mathematics"],
            confidence: 80
        },
        {
            title: "Mobile App Developer",
            description: "Create applications for mobile devices such as smartphones and tablets",
            skills: ["java", "kotlin", "swift", "flutter", "react native", "android", "ios", "mobile development"],
            interests: ["mobile development", "app development", "ui design", "user experience"],
            confidence: 78
        },
        {
            title: "UI/UX Designer",
            description: "Design user interfaces and improve user experiences for websites and applications",
            skills: ["figma", "sketch", "adobe xd", "photoshop", "illustrator", "wireframing", "prototyping"],
            interests: ["design", "user experience", "ui design", "graphic design", "visual design"],
            confidence: 75
        },
        {
            title: "DevOps Engineer",
            description: "Implement and maintain development infrastructure and processes",
            skills: ["docker", "kubernetes", "jenkins", "aws", "azure", "gcp", "linux", "bash", "terraform"],
            interests: ["devops", "infrastructure", "cloud computing", "automation", "ci/cd"],
            confidence: 82
        },
        {
            title: "Cybersecurity Specialist",
            description: "Protect systems, networks, and data from cyber threats",
            skills: ["network security", "penetration testing", "ethical hacking", "encryption", "firewall", "security audit"],
            interests: ["security", "cybersecurity", "hacking", "networking", "privacy", "cryptography"],
            confidence: 84
        },
        {
            title: "AI/Machine Learning Engineer",
            description: "Build and deploy machine learning models and AI solutions",
            skills: ["python", "tensorflow", "pytorch", "scikit-learn", "deep learning", "nlp", "computer vision"],
            interests: ["ai", "machine learning", "data science", "algorithms", "neural networks", "research"],
            confidence: 83
        }
    ];

    // Use the existing matchWithDatabaseCareers function to avoid duplicating code
    return matchWithDatabaseCareers(skills, interests, careerPaths);
}

/**
 * POST /api/career-test/history
 * Save career test history for a user
 * Protected by auth middleware
 */
router.post('/history', auth, async (req, res) => {
    try {
        const { testResult, timestamp } = req.body;
        const userId = req.user.id;
        
        // Validate input
        if (!testResult || !userId) {
            return res.status(400).json({
                error: 'Missing required data'
            });
        }
        
        // Save the test result to the user's profile
        const savedProfile = await UserCareerProfile.findOneAndUpdate(
            { userId },
            {
                $push: {
                    careerTests: {
                        testDate: timestamp || new Date(),
                        results: Array.isArray(testResult.matches) 
                            ? testResult.matches.map(match => ({
                                careerPath: match.title || match.career || 'Unknown Career',
                                score: match.score || 0,
                                confidence: match.confidence || 0
                            }))
                            : []
                    }
                }
            },
            { upsert: true, new: true }
        );
        
        return res.json({
            success: true,
            message: 'Career test history saved successfully'
        });
    } catch (error) {
        console.error('Error saving career test history:', error);
        return res.status(500).json({
            error: 'Failed to save test history',
            message: 'An error occurred while saving test results'
        });
    }
});

module.exports = router;
