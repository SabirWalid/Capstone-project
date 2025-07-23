const mongoose = require('mongoose');
const Career = require('./models/Career');

// Enhanced career data with skills, interests, weights, and synonyms
const enhancedCareers = [
    {
        title: "Full Stack Web Developer",
        description: "Build end-to-end web applications using modern technologies and frameworks.",
        skills: [
            { name: "JavaScript", weight: 3, synonyms: ["JS", "ECMAScript", "Node.js"] },
            { name: "HTML", weight: 2.5, synonyms: ["HTML5", "Markup"] },
            { name: "CSS", weight: 2.5, synonyms: ["CSS3", "Styling", "SASS", "SCSS"] },
            { name: "React", weight: 2.5, synonyms: ["ReactJS", "React.js"] },
            { name: "Node.js", weight: 2, synonyms: ["NodeJS", "Node"] },
            { name: "Database", weight: 2, synonyms: ["SQL", "MongoDB", "MySQL", "PostgreSQL"] },
            { name: "Git", weight: 1.5, synonyms: ["Version Control", "GitHub", "GitLab"] }
        ],
        interests: [
            { name: "Programming", weight: 3, synonyms: ["Coding", "Development", "Software"] },
            { name: "Web Development", weight: 3, synonyms: ["Web", "Frontend", "Backend"] },
            { name: "Technology", weight: 2, synonyms: ["Tech", "Innovation"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Logic", "Algorithms"] }
        ],
        courses: [
            { title: "JavaScript Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 },
            { title: "React Development", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Node.js Backend Development", difficulty: "Intermediate", duration: "5 weeks", priority: 2 },
            { title: "Database Design", difficulty: "Intermediate", duration: "3 weeks", priority: 2 },
            { title: "Full Stack Project", difficulty: "Advanced", duration: "8 weeks", priority: 1 }
        ],
        salaryRange: { min: 50000, max: 120000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Startups", "E-commerce"],
        experienceLevel: "All",
        tags: ["frontend", "backend", "javascript", "react", "node", "fullstack"]
    },
    {
        title: "Data Scientist",
        description: "Analyze complex data to help organizations make data-driven decisions.",
        skills: [
            { name: "Python", weight: 3, synonyms: ["Python Programming", "Data Analysis"] },
            { name: "Statistics", weight: 3, synonyms: ["Statistical Analysis", "Math"] },
            { name: "Machine Learning", weight: 2.5, synonyms: ["ML", "AI", "Artificial Intelligence"] },
            { name: "SQL", weight: 2.5, synonyms: ["Database", "Data Query"] },
            { name: "Data Visualization", weight: 2, synonyms: ["Visualization", "Charts", "Graphs"] },
            { name: "Excel", weight: 1.5, synonyms: ["Spreadsheets", "Microsoft Excel"] },
            { name: "R", weight: 2, synonyms: ["R Programming", "Statistical Computing"] }
        ],
        interests: [
            { name: "Data Science", weight: 3, synonyms: ["Data", "Analytics"] },
            { name: "Mathematics", weight: 2.5, synonyms: ["Math", "Statistics"] },
            { name: "Research", weight: 2, synonyms: ["Analysis", "Investigation"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Logic", "Critical Thinking"] }
        ],
        courses: [
            { title: "Python for Data Science", difficulty: "Beginner", duration: "6 weeks", priority: 3 },
            { title: "Statistics and Probability", difficulty: "Intermediate", duration: "4 weeks", priority: 3 },
            { title: "Machine Learning Fundamentals", difficulty: "Intermediate", duration: "8 weeks", priority: 2 },
            { title: "Data Visualization with Python", difficulty: "Intermediate", duration: "3 weeks", priority: 2 },
            { title: "Advanced ML Algorithms", difficulty: "Advanced", duration: "10 weeks", priority: 1 }
        ],
        salaryRange: { min: 70000, max: 150000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Finance", "Healthcare", "Consulting"],
        experienceLevel: "Mid",
        tags: ["data", "python", "machine learning", "statistics", "analytics"]
    },
    {
        title: "Digital Marketing Specialist",
        description: "Create and execute digital marketing strategies to grow businesses online.",
        skills: [
            { name: "SEO", weight: 2.5, synonyms: ["Search Engine Optimization", "Organic Search"] },
            { name: "Social Media Marketing", weight: 2.5, synonyms: ["Social Media", "SMM", "Social"] },
            { name: "Content Marketing", weight: 2, synonyms: ["Content", "Content Creation", "Blogging"] },
            { name: "Google Analytics", weight: 2, synonyms: ["Analytics", "Web Analytics", "GA"] },
            { name: "PPC", weight: 2, synonyms: ["Pay Per Click", "Google Ads", "Advertising"] },
            { name: "Email Marketing", weight: 1.5, synonyms: ["Email", "Newsletter"] },
            { name: "Copywriting", weight: 2, synonyms: ["Writing", "Content Writing"] }
        ],
        interests: [
            { name: "Marketing", weight: 3, synonyms: ["Digital Marketing", "Advertising"] },
            { name: "Creative Writing", weight: 2, synonyms: ["Writing", "Content"] },
            { name: "Social Media", weight: 2.5, synonyms: ["Social Networks", "Online Communities"] },
            { name: "Business", weight: 2, synonyms: ["Entrepreneurship", "Commerce"] }
        ],
        courses: [
            { title: "Digital Marketing Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 },
            { title: "SEO Mastery", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Social Media Marketing", difficulty: "Beginner", duration: "3 weeks", priority: 2 },
            { title: "Google Ads Certification", difficulty: "Intermediate", duration: "4 weeks", priority: 2 },
            { title: "Content Strategy", difficulty: "Advanced", duration: "6 weeks", priority: 1 }
        ],
        salaryRange: { min: 40000, max: 85000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Marketing", "E-commerce", "Technology", "Retail"],
        experienceLevel: "Entry",
        tags: ["seo", "social media", "marketing", "content", "digital"]
    },
    {
        title: "UX/UI Designer",
        description: "Design user-friendly interfaces and experiences for digital products.",
        skills: [
            { name: "UI Design", weight: 3, synonyms: ["User Interface", "Interface Design"] },
            { name: "UX Design", weight: 3, synonyms: ["User Experience", "UX Research"] },
            { name: "Figma", weight: 2.5, synonyms: ["Design Tools", "Prototyping"] },
            { name: "Adobe Creative Suite", weight: 2, synonyms: ["Photoshop", "Illustrator", "Adobe"] },
            { name: "Prototyping", weight: 2, synonyms: ["Wireframing", "Mockups"] },
            { name: "User Research", weight: 2, synonyms: ["Research", "User Testing"] },
            { name: "HTML/CSS", weight: 1.5, synonyms: ["Frontend", "Web Design"] }
        ],
        interests: [
            { name: "Design", weight: 3, synonyms: ["Visual Design", "Creative Design"] },
            { name: "User Experience", weight: 3, synonyms: ["UX", "Usability"] },
            { name: "Creative Arts", weight: 2.5, synonyms: ["Art", "Creativity"] },
            { name: "Psychology", weight: 2, synonyms: ["Human Behavior", "User Psychology"] }
        ],
        courses: [
            { title: "UX Design Fundamentals", difficulty: "Beginner", duration: "5 weeks", priority: 3 },
            { title: "UI Design Principles", difficulty: "Beginner", duration: "4 weeks", priority: 3 },
            { title: "Figma Mastery", difficulty: "Intermediate", duration: "3 weeks", priority: 2 },
            { title: "User Research Methods", difficulty: "Intermediate", duration: "4 weeks", priority: 2 },
            { title: "Advanced Prototyping", difficulty: "Advanced", duration: "6 weeks", priority: 1 }
        ],
        salaryRange: { min: 55000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Design", "E-commerce", "Startups"],
        experienceLevel: "All",
        tags: ["ux", "ui", "design", "figma", "user experience"]
    },
    {
        title: "Cybersecurity Analyst",
        description: "Protect organizations from cyber threats and security breaches.",
        skills: [
            { name: "Network Security", weight: 3, synonyms: ["Network", "Security", "Firewall"] },
            { name: "Ethical Hacking", weight: 2.5, synonyms: ["Penetration Testing", "White Hat"] },
            { name: "Risk Assessment", weight: 2.5, synonyms: ["Risk Analysis", "Security Assessment"] },
            { name: "Incident Response", weight: 2, synonyms: ["Security Response", "Forensics"] },
            { name: "Compliance", weight: 2, synonyms: ["Regulations", "Standards"] },
            { name: "Cryptography", weight: 2, synonyms: ["Encryption", "Security Protocols"] },
            { name: "Python", weight: 1.5, synonyms: ["Scripting", "Automation"] }
        ],
        interests: [
            { name: "Cybersecurity", weight: 3, synonyms: ["Security", "Information Security"] },
            { name: "Technology", weight: 2.5, synonyms: ["Tech", "IT"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Analysis", "Investigation"] },
            { name: "Ethics", weight: 2, synonyms: ["Ethical Hacking", "White Hat"] }
        ],
        courses: [
            { title: "Cybersecurity Fundamentals", difficulty: "Beginner", duration: "6 weeks", priority: 3 },
            { title: "Network Security", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Ethical Hacking", difficulty: "Advanced", duration: "8 weeks", priority: 2 },
            { title: "Incident Response", difficulty: "Intermediate", duration: "4 weeks", priority: 2 },
            { title: "Security Compliance", difficulty: "Advanced", duration: "5 weeks", priority: 1 }
        ],
        salaryRange: { min: 65000, max: 130000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Finance", "Government", "Healthcare"],
        experienceLevel: "Mid",
        tags: ["cybersecurity", "security", "ethical hacking", "network", "compliance"]
    },
    {
        title: "Product Manager",
        description: "Lead product development from conception to launch, working with cross-functional teams.",
        skills: [
            { name: "Product Strategy", weight: 3, synonyms: ["Strategy", "Product Planning"] },
            { name: "Project Management", weight: 2.5, synonyms: ["Management", "Planning", "Agile"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Metrics", "KPIs"] },
            { name: "Leadership", weight: 2.5, synonyms: ["Team Leadership", "Management"] },
            { name: "Communication", weight: 2.5, synonyms: ["Presentation", "Stakeholder Management"] },
            { name: "Market Research", weight: 2, synonyms: ["Research", "Competitive Analysis"] },
            { name: "Agile", weight: 2, synonyms: ["Scrum", "Sprint Planning"] }
        ],
        interests: [
            { name: "Product Development", weight: 3, synonyms: ["Product", "Innovation"] },
            { name: "Business Strategy", weight: 2.5, synonyms: ["Business", "Strategy"] },
            { name: "Leadership", weight: 2, synonyms: ["Management", "Team Building"] },
            { name: "Technology", weight: 2, synonyms: ["Tech", "Software"] }
        ],
        courses: [
            { title: "Product Management Fundamentals", difficulty: "Beginner", duration: "5 weeks", priority: 3 },
            { title: "Agile Product Management", difficulty: "Intermediate", duration: "4 weeks", priority: 3 },
            { title: "Data-Driven Product Decisions", difficulty: "Intermediate", duration: "3 weeks", priority: 2 },
            { title: "Product Strategy", difficulty: "Advanced", duration: "6 weeks", priority: 2 },
            { title: "Leadership for PMs", difficulty: "Advanced", duration: "4 weeks", priority: 1 }
        ],
        salaryRange: { min: 80000, max: 160000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Startups", "E-commerce"],
        experienceLevel: "Mid",
        tags: ["product management", "strategy", "agile", "leadership", "business"]
    }
];

async function seedCareerData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://techpreneurs:0YALLxdc43qDxyRn@techpreneurs.rsutrrl.mongodb.net/');
        console.log('Connected to MongoDB');

        // Clear existing career data
        await Career.deleteMany({});
        console.log('Cleared existing career data');

        // Insert enhanced career data
        const insertedCareers = await Career.insertMany(enhancedCareers);
        console.log(`Inserted ${insertedCareers.length} enhanced career records`);

        // Create relationships between related careers
        for (let i = 0; i < insertedCareers.length; i++) {
            const career = insertedCareers[i];
            const relatedCareers = [];

            // Add some logic to find related careers based on similar skills/interests
            for (let j = 0; j < insertedCareers.length; j++) {
                if (i !== j) {
                    const otherCareer = insertedCareers[j];
                    
                    // Check for skill overlap
                    const skillOverlap = career.skills.some(skill => 
                        otherCareer.skills.some(otherSkill => 
                            skill.name.toLowerCase() === otherSkill.name.toLowerCase() ||
                            skill.synonyms?.some(syn => 
                                otherSkill.synonyms?.includes(syn)
                            )
                        )
                    );

                    // Check for interest overlap
                    const interestOverlap = career.interests.some(interest => 
                        otherCareer.interests.some(otherInterest => 
                            interest.name.toLowerCase() === otherInterest.name.toLowerCase()
                        )
                    );

                    if (skillOverlap || interestOverlap) {
                        relatedCareers.push(otherCareer._id);
                    }
                }
            }

            // Update career with related careers (limit to 3)
            await Career.findByIdAndUpdate(career._id, {
                relatedCareers: relatedCareers.slice(0, 3)
            });
        }

        console.log('Updated career relationships');
        console.log('Career data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding career data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedCareerData();
}

module.exports = { seedCareerData, enhancedCareers };
