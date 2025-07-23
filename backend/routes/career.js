const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const UserCareerProfile = require('../models/UserCareerProfile');

// Fuzzy matching utilities
const stringSimilarity = require('string-similarity');

// Enhanced matching algorithm with fuzzy matching and weighted scoring
async function calculateCareerMatch(userSkills, userInterests, career) {
    let skillScore = 0;
    let interestScore = 0;
    let matchedSkills = [];
    let matchedInterests = [];

    // Calculate skill matches with fuzzy matching
    for (const userSkill of userSkills) {
        const userSkillLower = userSkill.toLowerCase().trim();
        
        for (const careerSkill of career.skills) {
            const careerSkillLower = careerSkill.name.toLowerCase();
            
            // Exact match
            if (userSkillLower === careerSkillLower) {
                skillScore += careerSkill.weight * 2;
                matchedSkills.push({ skill: careerSkill.name, type: 'exact', confidence: 1.0 });
                continue;
            }
            
            // Check synonyms
            const synonymMatch = careerSkill.synonyms?.some(synonym => 
                synonym.toLowerCase() === userSkillLower
            );
            if (synonymMatch) {
                skillScore += careerSkill.weight * 1.8;
                matchedSkills.push({ skill: careerSkill.name, type: 'synonym', confidence: 0.9 });
                continue;
            }
            
            // Fuzzy matching
            const similarity = stringSimilarity.compareTwoStrings(userSkillLower, careerSkillLower);
            if (similarity >= 0.7) {
                skillScore += careerSkill.weight * similarity * 1.5;
                matchedSkills.push({ skill: careerSkill.name, type: 'fuzzy', confidence: similarity });
            }
        }
    }

    // Calculate interest matches with fuzzy matching
    for (const userInterest of userInterests) {
        const userInterestLower = userInterest.toLowerCase().trim();
        
        for (const careerInterest of career.interests) {
            const careerInterestLower = careerInterest.name.toLowerCase();
            
            // Exact match
            if (userInterestLower === careerInterestLower) {
                interestScore += careerInterest.weight * 2;
                matchedInterests.push({ interest: careerInterest.name, type: 'exact', confidence: 1.0 });
                continue;
            }
            
            // Check synonyms
            const synonymMatch = careerInterest.synonyms?.some(synonym => 
                synonym.toLowerCase() === userInterestLower
            );
            if (synonymMatch) {
                interestScore += careerInterest.weight * 1.8;
                matchedInterests.push({ interest: careerInterest.name, type: 'synonym', confidence: 0.9 });
                continue;
            }
            
            // Fuzzy matching
            const similarity = stringSimilarity.compareTwoStrings(userInterestLower, careerInterestLower);
            if (similarity >= 0.7) {
                interestScore += careerInterest.weight * similarity * 1.5;
                matchedInterests.push({ interest: careerInterest.name, type: 'fuzzy', confidence: similarity });
            }
        }
    }

    // Calculate composite score with different weights for skills vs interests
    const totalScore = (skillScore * 0.7) + (interestScore * 0.3);
    const maxPossibleScore = (career.skills.reduce((sum, skill) => sum + skill.weight, 0) * 2 * 0.7) + 
                            (career.interests.reduce((sum, interest) => sum + interest.weight, 0) * 2 * 0.3);
    
    const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
        career: career._id,
        title: career.title,
        description: career.description,
        score: Math.round(normalizedScore * 100) / 100,
        skillScore: Math.round(skillScore * 100) / 100,
        interestScore: Math.round(interestScore * 100) / 100,
        matchedSkills,
        matchedInterests,
        courses: career.courses.sort((a, b) => (b.priority || 1) - (a.priority || 1)),
        salaryRange: career.salaryRange,
        jobOutlook: career.jobOutlook,
        industry: career.industry,
        confidence: Math.min(95, Math.max(10, normalizedScore))
    };
}

// Enhanced career test endpoint
router.post('/test', async (req, res) => {
    try {
        const { skills = [], interests = [], userId, saveResults = false } = req.body;
        
        // Normalize input
        const userSkills = skills.map(s => s.trim()).filter(s => s.length > 0);
        const userInterests = interests.map(i => i.trim()).filter(i => i.length > 0);

        if (userSkills.length === 0 && userInterests.length === 0) {
            return res.status(400).json({ 
                error: 'Please provide at least one skill or interest' 
            });
        }

        // Get all active careers from database
        const careers = await Career.find({ isActive: true });
        
        if (careers.length === 0) {
            return res.status(500).json({ 
                error: 'No career paths available. Please contact administrator.' 
            });
        }

        // Calculate matches for all careers
        const matches = [];
        for (const career of careers) {
            const match = await calculateCareerMatch(userSkills, userInterests, career);
            if (match.score > 5) { // Only include matches with score > 5%
                matches.push(match);
            }
        }

        // Sort by score (highest first)
        matches.sort((a, b) => b.score - a.score);

        // Get top 5 matches
        const topMatches = matches.slice(0, 5);

        // Save results to user profile if requested
        if (saveResults && userId) {
            try {
                let userProfile = await UserCareerProfile.findOne({ userId });
                if (!userProfile) {
                    userProfile = new UserCareerProfile({ userId });
                }

                // Update skills and interests
                userProfile.skills = userSkills.map(skill => ({ name: skill }));
                userProfile.interests = userInterests.map(interest => ({ name: interest }));

                // Add test results
                userProfile.careerTests.push({
                    results: topMatches.map(match => ({
                        careerPath: match.career,
                        score: match.score,
                        confidence: match.confidence
                    }))
                });

                await userProfile.save();
            } catch (profileError) {
                console.error('Error saving user profile:', profileError);
                // Don't fail the request if profile save fails
            }
        }

        res.json({ 
            matches: topMatches,
            totalCareersAnalyzed: careers.length,
            matchesFound: matches.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Career test error:', error);
        res.status(500).json({ 
            error: 'Failed to process career test. Please try again.' 
        });
    }
});

// Get user's career test history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await UserCareerProfile.findOne({ userId })
            .populate('careerTests.results.careerPath')
            .populate('bookmarkedCareers');

        if (!userProfile) {
            return res.json({ tests: [], bookmarkedCareers: [] });
        }

        res.json({
            tests: userProfile.careerTests,
            bookmarkedCareers: userProfile.bookmarkedCareers,
            currentSkills: userProfile.skills,
            currentInterests: userProfile.interests
        });
    } catch (error) {
        console.error('Error fetching user career history:', error);
        res.status(500).json({ error: 'Failed to fetch career history' });
    }
});

// Bookmark a career
router.post('/bookmark', async (req, res) => {
    try {
        const { userId, careerId } = req.body;

        let userProfile = await UserCareerProfile.findOne({ userId });
        if (!userProfile) {
            userProfile = new UserCareerProfile({ userId });
        }

        if (!userProfile.bookmarkedCareers.includes(careerId)) {
            userProfile.bookmarkedCareers.push(careerId);
            await userProfile.save();
        }

        res.json({ success: true, message: 'Career bookmarked successfully' });
    } catch (error) {
        console.error('Error bookmarking career:', error);
        res.status(500).json({ error: 'Failed to bookmark career' });
    }
});

// Get detailed career information
router.get('/career/:id', async (req, res) => {
    try {
        const career = await Career.findById(req.params.id)
            .populate('relatedCareers');

        if (!career) {
            return res.status(404).json({ error: 'Career not found' });
        }

        res.json(career);
    } catch (error) {
        console.error('Error fetching career details:', error);
        res.status(500).json({ error: 'Failed to fetch career details' });
    }
});

// Get personalized recommendations based on user profile
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userProfile = await UserCareerProfile.findOne({ userId });

        if (!userProfile || userProfile.careerTests.length === 0) {
            return res.json({ recommendations: [] });
        }

        // Get latest test results
        const latestTest = userProfile.careerTests[userProfile.careerTests.length - 1];
        const topCareerIds = latestTest.results
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(result => result.careerPath);

        const careers = await Career.find({ _id: { $in: topCareerIds } })
            .populate('relatedCareers');

        res.json({ 
            recommendations: careers,
            lastTestDate: latestTest.testDate
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Career mapping array (keeping for backward compatibility)
const careerMapping = [
  {
    path: "Startup Founder",
    skills: ["Leadership", "Business", "Strategy", "entrepreneurship"],
    interests: ["Business", "Entrepreneurship", "Innovation"],
    courses: ["Startup Basics", "Business Strategy", "Entrepreneurship 101"]
  },
  {
    path: "Web Developer",
    skills: ["HTML", "CSS", "JavaScript", "coding"],
    interests: ["Web", "Design", "Programming"],
    courses: ["Intro to HTML", "JavaScript Basics", "Responsive Web Design"]
  },
  {
    path: "Data Analyst",
    skills: ["Excel", "Python", "Statistics", "analysis"],
    interests: ["Data", "Analysis", "Numbers"],
    courses: ["Python for Data Analysis", "Statistics 101", "Excel Mastery"]
  },
  {
    path: "Graphic Designer",
    skills: ["Photoshop", "Illustrator", "Creativity", "design"],
    interests: ["Design", "Art", "Creativity"],
    courses: ["Graphic Design Basics", "Photoshop Essentials", "Illustrator for Beginners"]
  },
  {
    path: "Mobile App Developer",
    skills: ["Java", "Kotlin", "Flutter", "mobile"],
    interests: ["Mobile", "Programming", "Apps"],
    courses: ["Intro to Android", "Flutter Development", "Mobile UI/UX"]
  },
  {
    path: "Digital Marketer",
    skills: ["SEO", "Content Writing", "Social Media", "marketing"],
    interests: ["Marketing", "Social Media", "Writing"],
    courses: ["Digital Marketing 101", "SEO Basics", "Content Creation"]
  },
  {
    path: "Startup Founder",
    skills: ["Leadership", "Business", "Strategy"],
    interests: ["Business", "Entrepreneurship", "Innovation"],
    courses: ["Startup Basics", "Business Strategy", "Entrepreneurship 101"]
  },
  {
    path: "AI/ML Engineer",
    skills: ["Python", "Machine Learning", "Data Analysis"],
    interests: ["AI", "Technology", "Innovation"],
    courses: ["Machine Learning Basics", "Deep Learning with TensorFlow", "Data Science Foundations"]
  },
  {
    path: "Cybersecurity Specialist",
    skills: ["Network Security", "Ethical Hacking", "Risk Management"],
    interests: ["Cybersecurity", "Technology", "Ethics"],
    courses: ["Cybersecurity Fundamentals", "Ethical Hacking 101", "Risk Management Strategies"]
  },
  {
    path: "Product Manager",
    skills: ["Project Management", "Leadership", "Communication", "Business", "Strategy", "Planning"],
    interests: ["Product Development", "Business", "Innovation"],
    courses: ["Product Management Basics", "Agile Methodologies", "Business Strategy"]
  }
];

module.exports = router;