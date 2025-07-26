const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function analyzeCareerPath(userResponses) {
    try {
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

module.exports = {
    analyzeCareerPath
};
