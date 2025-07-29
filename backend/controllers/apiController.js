/**
 * API Controller
 * 
 * Handles various API endpoints and provides fallbacks when needed
 */
const Career = require('../models/Career');
const UserCareerProfile = require('../models/UserCareerProfile');

// Get career paths - used as a fallback endpoint
exports.getCareerPaths = async (req, res) => {
    try {
        const careers = await Career.find();
        
        if (!careers || careers.length === 0) {
            // Return fallback data if no careers found in database
            return res.json({
                source: 'fallback',
                careers: getFallbackCareerPaths()
            });
        }
        
        res.json({
            source: 'database',
            careers
        });
    } catch (error) {
        console.error('Error fetching career paths:', error);
        // Return fallback data on error
        res.status(500).json({
            source: 'error-fallback',
            error: 'Failed to fetch career paths',
            careers: getFallbackCareerPaths()
        });
    }
};

// Get user's career profile
exports.getUserCareerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const profile = await UserCareerProfile.findOne({ user: userId });
        
        if (!profile) {
            return res.status(404).json({
                message: 'No career profile found for this user',
                hasProfile: false
            });
        }
        
        res.json({
            hasProfile: true,
            profile
        });
    } catch (error) {
        console.error('Error fetching user career profile:', error);
        res.status(500).json({
            error: 'Failed to fetch career profile',
            message: 'Please try again later'
        });
    }
};

// Update or create user's career profile
exports.updateUserCareerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { skills, interests, careerMatches } = req.body;
        
        // Validate required fields
        if (!skills || !interests) {
            return res.status(400).json({
                error: 'Skills and interests are required'
            });
        }
        
        // Find existing profile or create new one
        let profile = await UserCareerProfile.findOne({ user: userId });
        
        if (profile) {
            // Update existing profile
            profile.skills = skills;
            profile.interests = interests;
            profile.careerMatches = careerMatches || profile.careerMatches;
            await profile.save();
        } else {
            // Create new profile
            profile = new UserCareerProfile({
                user: userId,
                skills,
                interests,
                careerMatches: careerMatches || []
            });
            await profile.save();
        }
        
        res.json({
            message: 'Career profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating user career profile:', error);
        res.status(500).json({
            error: 'Failed to update career profile',
            message: 'Please try again later'
        });
    }
};

// Get recommendations based on user input - fallback API endpoint
exports.getRecommendations = async (req, res) => {
    try {
        const { skills, interests } = req.body;
        
        // Validate required fields
        if (!skills || !interests) {
            return res.status(400).json({
                error: 'Skills and interests are required'
            });
        }
        
        // Get matches
        const matches = await getCareerMatches(skills, interests);
        
        res.json({
            matches,
            source: 'api-controller'
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            error: 'Failed to generate recommendations',
            message: 'Please try again later'
        });
    }
};

// Helper function to get career matches
async function getCareerMatches(skills, interests) {
    try {
        // First try to match with database careers
        const careers = await Career.find();
        
        if (careers && careers.length > 0) {
            return matchWithCareers(skills, interests, careers);
        }
        
        // Fallback to hardcoded matches if no careers in database
        return getFallbackMatches(skills, interests);
    } catch (error) {
        console.error('Error in getCareerMatches:', error);
        // Fallback on error
        return getFallbackMatches(skills, interests);
    }
}

// Match user input with careers
function matchWithCareers(skills, interests, careers) {
    // Convert input to lowercase for case-insensitive matching
    const userSkills = skills.map(s => s.toLowerCase());
    const userInterests = interests.map(i => i.toLowerCase());
    
    // Calculate match scores for each career
    return careers.map(career => {
        const careerSkills = career.skills.map(s => s.toLowerCase());
        const careerInterests = career.interests.map(i => i.toLowerCase());
        
        // Count matches
        let skillMatches = 0;
        let interestMatches = 0;
        
        userSkills.forEach(skill => {
            if (careerSkills.some(s => s.includes(skill) || skill.includes(s))) {
                skillMatches++;
            }
        });
        
        userInterests.forEach(interest => {
            if (careerInterests.some(i => i.includes(interest) || interest.includes(i))) {
                interestMatches++;
            }
        });
        
        // Calculate score
        const skillScore = userSkills.length > 0 ? (skillMatches / userSkills.length) * 100 : 0;
        const interestScore = userInterests.length > 0 ? (interestMatches / userInterests.length) * 100 : 0;
        const score = Math.round((skillScore * 0.6) + (interestScore * 0.4)); // Weight skills higher
        
        return {
            title: career.title,
            description: career.description,
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
            courses: career.courses || []
        };
    })
    .sort((a, b) => b.score - a.score)
    .filter(result => result.score > 20); // Only include somewhat relevant matches
}

// Fallback matches for when database fails
function getFallbackMatches(skills, interests) {
    const fallbackCareers = getFallbackCareerPaths();
    return matchWithCareers(skills, interests, fallbackCareers);
}

// Fallback career paths
function getFallbackCareerPaths() {
    return [
        {
            title: "Full Stack Web Developer",
            description: "Develop both client and server-side applications",
            skills: ["javascript", "html", "css", "node", "react", "angular", "vue", "express", "mongodb", "sql"],
            interests: ["web development", "programming", "software engineering", "coding", "development"],
            confidence: 85,
            courses: [
                { name: "Introduction to Web Development", url: "#", level: "Beginner" },
                { name: "Advanced JavaScript Frameworks", url: "#", level: "Intermediate" }
            ]
        },
        {
            title: "Data Scientist",
            description: "Analyze and interpret complex data to help make business decisions",
            skills: ["python", "r", "statistics", "machine learning", "sql", "tensorflow", "pytorch", "pandas", "numpy"],
            interests: ["data", "analytics", "statistics", "machine learning", "ai", "mathematics"],
            confidence: 80,
            courses: [
                { name: "Python for Data Science", url: "#", level: "Beginner" },
                { name: "Machine Learning Fundamentals", url: "#", level: "Intermediate" }
            ]
        },
        {
            title: "Mobile App Developer",
            description: "Create applications for mobile devices such as smartphones and tablets",
            skills: ["java", "kotlin", "swift", "flutter", "react native", "android", "ios", "mobile development"],
            interests: ["mobile development", "app development", "ui design", "user experience"],
            confidence: 78,
            courses: [
                { name: "Introduction to Mobile Development", url: "#", level: "Beginner" },
                { name: "Advanced App Architecture", url: "#", level: "Intermediate" }
            ]
        },
        {
            title: "UI/UX Designer",
            description: "Design user interfaces and improve user experiences for websites and applications",
            skills: ["figma", "sketch", "adobe xd", "photoshop", "illustrator", "wireframing", "prototyping"],
            interests: ["design", "user experience", "ui design", "graphic design", "visual design"],
            confidence: 75,
            courses: [
                { name: "UI Design Principles", url: "#", level: "Beginner" },
                { name: "Advanced UX Research", url: "#", level: "Intermediate" }
            ]
        },
        {
            title: "DevOps Engineer",
            description: "Implement and maintain development infrastructure and processes",
            skills: ["docker", "kubernetes", "jenkins", "aws", "azure", "gcp", "linux", "bash", "terraform"],
            interests: ["devops", "infrastructure", "cloud computing", "automation", "ci/cd"],
            confidence: 82,
            courses: [
                { name: "Introduction to DevOps", url: "#", level: "Beginner" },
                { name: "Container Orchestration with Kubernetes", url: "#", level: "Intermediate" }
            ]
        }
    ];
}
