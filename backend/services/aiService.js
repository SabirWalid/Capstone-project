// OpenAI API completely disabled
// No need to require('openai') as we're not using it
console.log('OpenAI API completely disabled - using database and fallback modes only');
const openai = null; // Set to null so all OpenAI checks will fail properly

/**
 * Check if OpenAI API is properly configured
 * @returns {boolean} - True if OpenAI API key is configured, false otherwise
 */
function isOpenAIConfigured() {
    // To force using the fallback, we can return false here
    // This will make the application always use the database or fallback data
    // instead of attempting to use OpenAI
    return false;
    
    // The original check (commented out)
    // const configured = !!process.env.OPENAI_API_KEY && !!openai;
    // console.log(`OpenAI API is ${configured ? 'configured' : 'not configured'}`);
    // return configured;
}

/**
 * Match user skills and interests to optimal career paths
 * @param {Array} skills - User's technical skills
 * @param {Array} interests - User's interests
 * @returns {Object} - Career recommendations with detailed matching information
 */
async function matchCareersWithAI(skills, interests) {
    // Immediately force using database fallback - OpenAI API completely disabled
    console.log('OpenAI API completely disabled - using database fallbacks instead');
    return getFallbackCareerRecommendations(skills, interests);
    
    // The code below will never execute
    try {
        if (!isOpenAIConfigured()) {
            console.log('Using fallback career matching because OpenAI is not configured');
            return getFallbackCareerRecommendations(skills, interests);
        }
        
        // Double check openai client is available
        if (!openai) {
            console.log('OpenAI client is unavailable despite configuration check passing');
            return getFallbackCareerRecommendations(skills, interests);
        }

        console.log('OpenAI client is available, preparing prompt...');
        const prompt = `
Given the following skills and interests of a user, provide detailed career path recommendations in the tech industry.

User Skills: ${skills.join(', ')}
User Interests: ${interests.join(', ')}

Analyze this information and recommend the most suitable tech career paths. Provide a comprehensive analysis including:
1. Top 5 recommended career paths with match percentages
2. Detailed breakdown of skill matches for each path
3. Potential job roles and responsibilities
4. Industry outlook and growth opportunities
5. Learning path recommendations

Format the response as JSON with the following structure:
{
    "matches": [
        {
            "title": "Career Title",
            "score": 85,
            "description": "Detailed career description",
            "matchDetails": {
                "matchedSkills": [
                    {"skill": "skill1", "type": "exact", "confidence": 1.0},
                    {"skill": "skill2", "type": "related", "confidence": 0.8}
                ],
                "matchedInterests": [
                    {"interest": "interest1", "type": "exact", "confidence": 1.0}
                ]
            },
            "courses": [
                {"title": "Course 1", "difficulty": "Beginner"},
                {"title": "Course 2", "difficulty": "Intermediate"}
            ],
            "tags": ["tag1", "tag2"],
            "industry": ["Industry1", "Industry2"],
            "jobOutlook": "Excellent",
            "salaryRange": {"min": 50000, "max": 120000, "currency": "USD"}
        }
    ],
    "recommendations": {
        "nextSteps": ["step1", "step2"],
        "resources": ["resource1", "resource2"]
    },
    "analysis": {
        "matchQuality": "Excellent",
        "skillsProvided": ${skills.length},
        "interestsProvided": ${interests.length},
        "advice": "Personalized career advice based on the assessment"
    }
}`;

        console.log('Sending career matching request to OpenAI');
        
        let resultText = '';
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Using gpt-3.5-turbo instead of gpt-4 which isn't available
                messages: [
                    {
                        role: "system",
                        content: "You are an expert career counselor specializing in tech careers, with deep knowledge of job market trends, required skills, and educational pathways."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 2500
            });

            // Parse the JSON response
            resultText = completion.choices[0].message.content;
            console.log('Received response from OpenAI');
            
            // For debugging: log a sample of the response
            console.log('Sample of OpenAI response:', resultText.substring(0, 100) + '...');
        } catch (openAiRequestError) {
            console.error('OpenAI API request failed:', openAiRequestError.message);
            if (openAiRequestError.response) {
                console.error('OpenAI API response status:', openAiRequestError.response.status);
                console.error('OpenAI API response data:', openAiRequestError.response.data);
            }
            // Use fallback instead of throwing
            console.log('Falling back to local recommendations due to OpenAI API error');
            return getFallbackCareerRecommendations(skills, interests);
        }
        
        // Only try to parse if we got a response
        if (!resultText) {
            console.log('No response text received from OpenAI, using fallback');
            return getFallbackCareerRecommendations(skills, interests);
        }
        
        try {
            console.log('Attempting to parse OpenAI response as JSON');
            const result = JSON.parse(resultText);
            
            // Add timestamp and metadata
            result.timestamp = new Date().toISOString();
            result.source = 'openai';
            result.totalCareersAnalyzed = result.matches.length;
            result.matchesFound = result.matches.length;
            
            return result;
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            console.log('Response text:', resultText);
            throw new Error('Failed to parse AI response');
        }
    } catch (error) {
        console.error('AI Career Matching Error:', error);
        throw error;
    }
}

async function analyzeCareerPath(userResponses) {
    try {
        if (!isOpenAIConfigured()) {
            console.log('Using fallback career analysis because OpenAI is not configured');
            return getFallbackCareerAnalysis(userResponses);
        }
        
        const prompt = `
Based on the following user responses to a career assessment, recommend the most suitable tech career paths. Consider their skills, interests, and background:

User Background:
${JSON.stringify(userResponses, null, 2)}

Provide a detailed analysis including:
1. Top 3 recommended career paths
2. Required skills for each path
3. Learning roadmap
4. Potential job roles
5. Growth opportunities
6. Required certifications or qualifications

Format the response as JSON with the following structure:
{
    "careerPaths": [
        {
            "title": "Career Title",
            "match_percentage": 85,
            "description": "Career description",
            "required_skills": ["skill1", "skill2"],
            "learning_roadmap": ["step1", "step2"],
            "job_roles": ["role1", "role2"],
            "growth_opportunities": ["opportunity1", "opportunity2"],
            "certifications": ["cert1", "cert2"]
        }
    ],
    "general_advice": "Personalized career advice",
    "next_steps": ["step1", "step2"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a career counselor specialized in technology careers, with expertise in helping refugees and newcomers transition into tech roles."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        // Parse the JSON response
        const result = JSON.parse(completion.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('AI Career Analysis Error:', error);
        throw error;
    }
}

/**
 * Get fallback career recommendations when AI service is not available
 * @param {Array} skills - User's technical skills
 * @param {Array} interests - User's interests
 * @returns {Object} - Fallback career recommendations
 */
function getFallbackCareerRecommendations(skills, interests) {
    // Simple fallback implementation
    return {
        matches: [
            {
                title: "Software Developer",
                score: 85,
                description: "Develop applications and systems using programming languages and technologies.",
                matchDetails: {
                    matchedSkills: skills.map(skill => ({ skill, type: "exact", confidence: 1.0 })).slice(0, 3),
                    matchedInterests: interests.map(interest => ({ interest, type: "exact", confidence: 1.0 })).slice(0, 2)
                },
                courses: [
                    { title: "Introduction to Programming", difficulty: "Beginner" },
                    { title: "Advanced Software Development", difficulty: "Intermediate" }
                ],
                tags: ["software development", "coding", "programming"],
                industry: ["Technology", "Software"],
                jobOutlook: "Excellent",
                salaryRange: { min: 60000, max: 150000, currency: "USD" }
            },
            {
                title: "Data Analyst",
                score: 75,
                description: "Analyze and interpret data to help organizations make better decisions.",
                matchDetails: {
                    matchedSkills: skills.slice(0, 2).map(skill => ({ skill, type: "related", confidence: 0.8 })),
                    matchedInterests: interests.slice(0, 1).map(interest => ({ interest, type: "related", confidence: 0.9 }))
                },
                courses: [
                    { title: "Data Analysis Fundamentals", difficulty: "Beginner" },
                    { title: "SQL for Data Analysis", difficulty: "Intermediate" }
                ],
                tags: ["data analysis", "statistics", "business intelligence"],
                industry: ["Technology", "Finance", "Healthcare"],
                jobOutlook: "Good",
                salaryRange: { min: 55000, max: 120000, currency: "USD" }
            }
        ],
        recommendations: {
            nextSteps: [
                "Complete online courses in your chosen field",
                "Build a portfolio of projects",
                "Join professional networks and communities"
            ],
            resources: [
                "Online learning platforms",
                "Industry forums and communities",
                "Professional certification programs"
            ]
        },
        analysis: {
            matchQuality: "Good",
            skillsProvided: skills.length,
            interestsProvided: interests.length,
            advice: "Continue developing your skills and focus on building practical experience through projects."
        }
    };
}

/**
 * Get fallback career analysis when AI service is not available
 * @param {Object} userResponses - User's responses to career assessment questions
 * @returns {Object} - Fallback career analysis
 */
function getFallbackCareerAnalysis(userResponses) {
    const skills = userResponses.technical_skills || [];
    
    return {
        general_advice: "Based on your skills and interests, we recommend exploring these career paths. Consider focusing on continued learning and hands-on projects to build your experience.",
        careerPaths: [
            {
                title: "Web Developer",
                match_percentage: 85,
                description: "Web developers create and maintain websites and web applications using languages like HTML, CSS, and JavaScript.",
                required_skills: skills.length > 0 ? skills.slice(0, 3) : ["HTML", "CSS", "JavaScript"],
                learning_roadmap: [
                    "Learn HTML, CSS and JavaScript fundamentals",
                    "Study a frontend framework like React or Vue",
                    "Learn backend development with Node.js or similar technology",
                    "Build a portfolio of web projects"
                ],
                job_roles: [
                    "Frontend Developer",
                    "Full Stack Developer",
                    "UI Developer"
                ],
                growth_opportunities: [
                    "Senior Developer",
                    "Technical Lead",
                    "Software Architect"
                ],
                certifications: [
                    "AWS Certified Developer",
                    "Microsoft Certified: Azure Developer Associate",
                    "Professional Web Developer certification"
                ]
            },
            {
                title: "Data Analyst",
                match_percentage: 78,
                description: "Data analysts interpret data to help organizations make informed decisions and identify trends.",
                required_skills: ["SQL", "Excel", "Data Visualization", "Statistical Analysis"],
                learning_roadmap: [
                    "Learn SQL for data querying",
                    "Master Excel for data analysis",
                    "Study data visualization tools like Tableau or Power BI",
                    "Learn basic statistical concepts"
                ],
                job_roles: [
                    "Business Intelligence Analyst",
                    "Data Visualization Specialist",
                    "Financial Analyst"
                ],
                growth_opportunities: [
                    "Senior Data Analyst",
                    "Data Scientist",
                    "Analytics Manager"
                ],
                certifications: [
                    "Microsoft Certified: Data Analyst Associate",
                    "Tableau Desktop Specialist",
                    "Google Data Analytics Certificate"
                ]
            },
            {
                title: "UX/UI Designer",
                match_percentage: 72,
                description: "UX/UI designers create user-friendly interfaces and experiences for websites and applications.",
                required_skills: ["UI Design", "Wireframing", "User Research", "Prototyping"],
                learning_roadmap: [
                    "Learn design principles and color theory",
                    "Master design tools like Figma or Adobe XD",
                    "Study user research methodologies",
                    "Build a portfolio of design projects"
                ],
                job_roles: [
                    "UI Designer",
                    "UX Researcher",
                    "Interaction Designer"
                ],
                growth_opportunities: [
                    "Senior UX Designer",
                    "UX Manager",
                    "Product Designer"
                ],
                certifications: [
                    "Google UX Design Professional Certificate",
                    "Nielsen Norman Group UX Certification",
                    "Certified User Experience Professional (CUXP)"
                ]
            }
        ],
        next_steps: [
            "Choose a career path that aligns with your interests and strengths",
            "Create a learning plan focused on the required skills for that path",
            "Build projects to demonstrate your skills to potential employers",
            "Network with professionals in your chosen field",
            "Consider entry-level positions or internships to gain experience"
        ]
    };
}

module.exports = {
    analyzeCareerPath,
    matchCareersWithAI,
    isOpenAIConfigured
};
