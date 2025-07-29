const mongoose = require('mongoose');
const Career = require('./models/Career');

// Additional career data with 50+ more career paths to supplement the existing ones
const additionalCareers = [
    // Tech Leadership & Management
    {
        title: "Chief Technology Officer (CTO)",
        description: "Lead technology vision, strategy, and execution for an organization.",
        skills: [
            { name: "Leadership", weight: 3, synonyms: ["Management", "Team Leadership", "Executive"] },
            { name: "Technology Strategy", weight: 3, synonyms: ["Tech Planning", "Innovation Strategy"] },
            { name: "Architecture", weight: 2.5, synonyms: ["System Design", "Solution Architecture"] },
            { name: "Project Management", weight: 2, synonyms: ["Agile", "Scrum", "Program Management"] },
            { name: "Business Acumen", weight: 2, synonyms: ["Business Strategy", "ROI Analysis"] }
        ],
        interests: [
            { name: "Technology Leadership", weight: 3, synonyms: ["Tech Management", "Executive"] },
            { name: "Innovation", weight: 2.5, synonyms: ["R&D", "Emerging Tech"] },
            { name: "Strategy", weight: 2.5, synonyms: ["Planning", "Vision"] }
        ],
        courses: [
            { title: "Technology Leadership", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Strategic Technology Planning", difficulty: "Advanced", duration: "6 weeks", priority: 2 },
            { title: "Enterprise Architecture", difficulty: "Advanced", duration: "8 weeks", priority: 2 }
        ],
        salaryRange: { min: 150000, max: 300000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Executive", "Management"],
        experienceLevel: "Senior", // Valid enum values: 'Entry', 'Mid', 'Senior', 'All'
        requiredEducation: "Bachelor's or Master's in Computer Science or related field",
        certifications: ["MBA", "PMP", "Enterprise Architecture certifications"],
        workEnvironment: "Office, Remote options",
        workLifeBalance: "Challenging but rewarding",
        careerPath: ["Technology Director", "VP of Technology", "CTO", "CEO"]
    },
    
    {
        title: "Engineering Manager",
        description: "Lead and manage teams of engineers to deliver technology solutions.",
        skills: [
            { name: "Team Management", weight: 3, synonyms: ["People Management", "Leadership"] },
            { name: "Software Development", weight: 2.5, synonyms: ["Programming", "Coding"] },
            { name: "Agile Methodologies", weight: 2, synonyms: ["Scrum", "Kanban", "Sprint Planning"] },
            { name: "Technical Planning", weight: 2, synonyms: ["Roadmap Development", "Sprint Planning"] },
            { name: "Performance Management", weight: 2, synonyms: ["Reviews", "Feedback", "Coaching"] }
        ],
        interests: [
            { name: "Team Leadership", weight: 3, synonyms: ["Management", "Mentoring"] },
            { name: "Software Development", weight: 2, synonyms: ["Coding", "Programming"] },
            { name: "Process Improvement", weight: 2, synonyms: ["Efficiency", "Optimization"] }
        ],
        courses: [
            { title: "Engineering Management Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Effective Technical Leadership", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Agile Team Management", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 120000, max: 200000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Product Development"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Computer Science or related field",
        certifications: ["PMP", "CSM", "MBA"],
        workEnvironment: "Office, Hybrid, Remote options",
        workLifeBalance: "Moderate",
        careerPath: ["Senior Developer", "Lead Developer", "Engineering Manager", "Director of Engineering"]
    },
    
    {
        title: "Product Manager",
        description: "Define and drive product vision, strategy, and development roadmap.",
        skills: [
            { name: "Product Strategy", weight: 3, synonyms: ["Product Vision", "Roadmapping"] },
            { name: "User Experience", weight: 2.5, synonyms: ["UX", "User Research", "Customer Empathy"] },
            { name: "Market Analysis", weight: 2.5, synonyms: ["Competitor Analysis", "Market Research"] },
            { name: "Agile Development", weight: 2, synonyms: ["Scrum", "Sprint Planning"] },
            { name: "Communication", weight: 2, synonyms: ["Stakeholder Management", "Presentation Skills"] }
        ],
        interests: [
            { name: "Product Development", weight: 3, synonyms: ["Product Management", "Product Design"] },
            { name: "User Experience", weight: 2.5, synonyms: ["UX", "User Needs"] },
            { name: "Technology", weight: 2, synonyms: ["Tech Trends", "Software"] }
        ],
        courses: [
            { title: "Product Management Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "User Research Methods", difficulty: "Intermediate", duration: "4 weeks", priority: 2 },
            { title: "Agile Product Development", difficulty: "Intermediate", duration: "5 weeks", priority: 2 }
        ],
        salaryRange: { min: 90000, max: 180000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Product Development"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Business, Computer Science, or related field",
        certifications: ["Product Management Certification", "Agile Certifications"],
        workEnvironment: "Office, Hybrid options",
        workLifeBalance: "Moderate to Challenging",
        careerPath: ["Associate Product Manager", "Product Manager", "Senior Product Manager", "Director of Product"]
    },
    
    // Emerging Tech Fields
    {
        title: "Blockchain Developer",
        description: "Build decentralized applications and smart contracts on blockchain platforms.",
        skills: [
            { name: "Solidity", weight: 3, synonyms: ["Smart Contracts", "Ethereum Development"] },
            { name: "Blockchain", weight: 3, synonyms: ["Distributed Ledger", "DLT"] },
            { name: "JavaScript", weight: 2.5, synonyms: ["JS", "ECMAScript"] },
            { name: "Web3.js", weight: 2, synonyms: ["Ethers.js", "Blockchain Integration"] },
            { name: "Cryptography", weight: 2, synonyms: ["Encryption", "Security Protocols"] }
        ],
        interests: [
            { name: "Blockchain Technology", weight: 3, synonyms: ["Cryptocurrency", "Decentralization"] },
            { name: "Programming", weight: 2.5, synonyms: ["Coding", "Software Development"] },
            { name: "Financial Technology", weight: 2, synonyms: ["FinTech", "DeFi"] }
        ],
        courses: [
            { title: "Blockchain Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Smart Contract Development", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Decentralized Application Architecture", difficulty: "Advanced", duration: "7 weeks", priority: 2 }
        ],
        salaryRange: { min: 80000, max: 180000, currency: "USD" },
        jobOutlook: "Good", // Changed from "Growing" to match enum
        industry: ["Blockchain", "Cryptocurrency", "Financial Technology"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Computer Science or related field",
        certifications: ["Certified Blockchain Developer", "Ethereum Certification"],
        workEnvironment: "Office, Remote options",
        workLifeBalance: "Moderate",
        careerPath: ["Junior Blockchain Developer", "Blockchain Developer", "Senior Blockchain Developer", "Blockchain Architect"]
    },
    
    {
        title: "AR/VR Developer",
        description: "Create immersive augmented and virtual reality experiences and applications.",
        skills: [
            { name: "Unity3D", weight: 3, synonyms: ["Unity", "Game Engine"] },
            { name: "C#", weight: 2.5, synonyms: ["C Sharp", "Programming"] },
            { name: "3D Modeling", weight: 2, synonyms: ["3D Assets", "Blender", "Maya"] },
            { name: "AR Frameworks", weight: 2, synonyms: ["ARKit", "ARCore", "Vuforia"] },
            { name: "UI/UX for AR/VR", weight: 2, synonyms: ["Spatial UI", "Immersive UX"] }
        ],
        interests: [
            { name: "Virtual Reality", weight: 3, synonyms: ["VR", "Immersive Tech"] },
            { name: "Augmented Reality", weight: 3, synonyms: ["AR", "Mixed Reality"] },
            { name: "Gaming", weight: 2, synonyms: ["Game Development", "Interactive Media"] }
        ],
        courses: [
            { title: "Unity3D Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "AR/VR Application Development", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "3D Asset Creation for AR/VR", difficulty: "Intermediate", duration: "5 weeks", priority: 2 }
        ],
        salaryRange: { min: 70000, max: 150000, currency: "USD" },
        jobOutlook: "Good", // Changed from "Growing" to match enum
        industry: ["Gaming", "Entertainment", "Education", "Healthcare"],
        experienceLevel: "Entry", // Changed from "Entry to Mid" to match enum
        requiredEducation: "Bachelor's in Computer Science, Game Development, or related field",
        certifications: ["Unity Certified Developer", "Meta AR/VR Certifications"],
        workEnvironment: "Studio, Office",
        workLifeBalance: "Moderate",
        careerPath: ["Junior AR/VR Developer", "AR/VR Developer", "Senior AR/VR Developer", "AR/VR Technical Director"]
    },
    
    {
        title: "Quantum Computing Researcher",
        description: "Conduct research and develop algorithms for quantum computers.",
        skills: [
            { name: "Quantum Algorithms", weight: 3, synonyms: ["Quantum Computing", "Quantum Programming"] },
            { name: "Physics", weight: 3, synonyms: ["Quantum Physics", "Quantum Mechanics"] },
            { name: "Mathematics", weight: 3, synonyms: ["Linear Algebra", "Complex Analysis"] },
            { name: "Python", weight: 2, synonyms: ["Programming", "Qiskit", "Cirq"] },
            { name: "Research Methodology", weight: 2, synonyms: ["Scientific Method", "Experimental Design"] }
        ],
        interests: [
            { name: "Quantum Computing", weight: 3, synonyms: ["Quantum Technology", "Quantum Information"] },
            { name: "Research", weight: 3, synonyms: ["Academic Research", "Scientific Inquiry"] },
            { name: "Physics", weight: 2.5, synonyms: ["Quantum Physics", "Theoretical Physics"] }
        ],
        courses: [
            { title: "Introduction to Quantum Computing", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Quantum Algorithms", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Quantum Programming with Qiskit", difficulty: "Advanced", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 90000, max: 200000, currency: "USD" },
        jobOutlook: "Good", // Changed from "Emerging" to match enum
        industry: ["Research", "Technology", "Academia"],
        experienceLevel: "Senior", // Changed from "Advanced" to match enum
        requiredEducation: "PhD in Physics, Computer Science, or Mathematics",
        certifications: ["IBM Quantum Computing Certification"],
        workEnvironment: "Research Lab, Academic Institution",
        workLifeBalance: "Research-oriented",
        careerPath: ["PhD Candidate", "Postdoctoral Researcher", "Quantum Computing Researcher", "Senior Research Scientist"]
    },
    
    // Data & AI
    {
        title: "AI Ethics Specialist",
        description: "Develop and implement ethical frameworks for artificial intelligence systems.",
        skills: [
            { name: "AI Ethics", weight: 3, synonyms: ["Ethics in Technology", "Responsible AI"] },
            { name: "Policy Development", weight: 2.5, synonyms: ["Governance", "Regulations"] },
            { name: "Machine Learning", weight: 2, synonyms: ["AI", "Deep Learning"] },
            { name: "Research", weight: 2, synonyms: ["Analysis", "Investigation"] },
            { name: "Communication", weight: 2, synonyms: ["Writing", "Presentation"] }
        ],
        interests: [
            { name: "Ethics", weight: 3, synonyms: ["Philosophy", "Moral Reasoning"] },
            { name: "Artificial Intelligence", weight: 2.5, synonyms: ["Machine Learning", "AI"] },
            { name: "Policy", weight: 2, synonyms: ["Governance", "Regulation"] }
        ],
        courses: [
            { title: "AI Ethics and Governance", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Philosophy of Technology", difficulty: "Intermediate", duration: "6 weeks", priority: 2 },
            { title: "Responsible AI Development", difficulty: "Advanced", duration: "7 weeks", priority: 3 }
        ],
        salaryRange: { min: 85000, max: 170000, currency: "USD" },
        jobOutlook: "Good", // Changed from "Growing" to match enum
        industry: ["Technology", "Policy", "Research"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Master's or PhD in Philosophy, Computer Science, Ethics, or related field",
        certifications: ["AI Ethics Certification"],
        workEnvironment: "Office, Research Institution, Think Tank",
        workLifeBalance: "Good",
        careerPath: ["AI Researcher", "Ethics Researcher", "AI Ethics Specialist", "Director of Responsible AI"]
    },
    
    {
        title: "Computer Vision Engineer",
        description: "Develop systems that can analyze, process, and understand digital images and videos.",
        skills: [
            { name: "Computer Vision", weight: 3, synonyms: ["Image Processing", "Visual Recognition"] },
            { name: "Python", weight: 2.5, synonyms: ["Programming", "Coding"] },
            { name: "Deep Learning", weight: 2.5, synonyms: ["Neural Networks", "CNN"] },
            { name: "OpenCV", weight: 2, synonyms: ["Computer Vision Library", "Image Processing Tools"] },
            { name: "Machine Learning", weight: 2, synonyms: ["AI", "ML Algorithms"] }
        ],
        interests: [
            { name: "Computer Vision", weight: 3, synonyms: ["Image Processing", "Visual Computing"] },
            { name: "Artificial Intelligence", weight: 2.5, synonyms: ["Machine Learning", "Deep Learning"] },
            { name: "Programming", weight: 2, synonyms: ["Software Development", "Coding"] }
        ],
        courses: [
            { title: "Computer Vision Fundamentals", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Deep Learning for Visual Recognition", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Python for Computer Vision", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 90000, max: 180000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Robotics", "Autonomous Vehicles", "Healthcare"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Master's or PhD in Computer Science or related field",
        certifications: ["TensorFlow Developer Certificate", "OpenCV Certification"],
        workEnvironment: "Research Lab, Office, Tech Company",
        workLifeBalance: "Moderate",
        careerPath: ["Computer Vision Researcher", "Computer Vision Engineer", "Senior Computer Vision Engineer", "Computer Vision Architect"]
    },
    
    {
        title: "NLP Specialist",
        description: "Develop systems that can understand, interpret, and generate human language.",
        skills: [
            { name: "Natural Language Processing", weight: 3, synonyms: ["NLP", "Computational Linguistics"] },
            { name: "Python", weight: 2.5, synonyms: ["Programming", "Coding"] },
            { name: "Machine Learning", weight: 2.5, synonyms: ["AI", "ML Algorithms"] },
            { name: "Deep Learning", weight: 2, synonyms: ["Neural Networks", "Transformers"] },
            { name: "Linguistics", weight: 2, synonyms: ["Language Theory", "Semantics"] }
        ],
        interests: [
            { name: "Natural Language Processing", weight: 3, synonyms: ["NLP", "Computational Linguistics"] },
            { name: "Artificial Intelligence", weight: 2.5, synonyms: ["Machine Learning", "AI"] },
            { name: "Languages", weight: 2, synonyms: ["Linguistics", "Human Language"] }
        ],
        courses: [
            { title: "Natural Language Processing Fundamentals", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Deep Learning for NLP", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Text Mining and Analytics", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 95000, max: 190000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "AI Research", "Conversational AI", "Text Analytics"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Master's or PhD in Computer Science, Linguistics, or related field",
        certifications: ["NLP Specialization", "Deep Learning Specialization"],
        workEnvironment: "Research Lab, Office, Tech Company",
        workLifeBalance: "Moderate",
        careerPath: ["NLP Researcher", "NLP Engineer", "Senior NLP Specialist", "NLP Architect"]
    },
    
    // Cybersecurity Specialized Roles
    {
        title: "Penetration Tester",
        description: "Identify and exploit security vulnerabilities in systems, networks, and applications.",
        skills: [
            { name: "Penetration Testing", weight: 3, synonyms: ["Ethical Hacking", "Red Team"] },
            { name: "Network Security", weight: 2.5, synonyms: ["Networking", "Network Protocols"] },
            { name: "Security Tools", weight: 2.5, synonyms: ["Kali Linux", "Metasploit", "Burp Suite"] },
            { name: "Programming", weight: 2, synonyms: ["Scripting", "Python", "Bash"] },
            { name: "Vulnerability Assessment", weight: 2, synonyms: ["Security Analysis", "Threat Modeling"] }
        ],
        interests: [
            { name: "Cybersecurity", weight: 3, synonyms: ["Information Security", "Computer Security"] },
            { name: "Ethical Hacking", weight: 3, synonyms: ["Penetration Testing", "Security Testing"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Puzzles", "Challenges"] }
        ],
        courses: [
            { title: "Ethical Hacking Fundamentals", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Network Penetration Testing", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Web Application Security", difficulty: "Advanced", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 85000, max: 160000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Cybersecurity", "Technology", "Consulting"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Computer Science, Cybersecurity, or related field",
        certifications: ["CEH", "OSCP", "GPEN"],
        workEnvironment: "Security Operations Center, Office, Remote options",
        workLifeBalance: "Varies",
        careerPath: ["Security Analyst", "Penetration Tester", "Senior Penetration Tester", "Red Team Lead"]
    },
    
    {
        title: "Threat Intelligence Analyst",
        description: "Analyze and respond to cybersecurity threats and vulnerabilities.",
        skills: [
            { name: "Threat Intelligence", weight: 3, synonyms: ["Cyber Intelligence", "Threat Analysis"] },
            { name: "Security Research", weight: 2.5, synonyms: ["Intelligence Gathering", "Investigation"] },
            { name: "Malware Analysis", weight: 2, synonyms: ["Reverse Engineering", "Malware Detection"] },
            { name: "OSINT", weight: 2, synonyms: ["Open Source Intelligence", "Information Gathering"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Pattern Recognition"] }
        ],
        interests: [
            { name: "Cybersecurity", weight: 3, synonyms: ["Information Security", "Computer Security"] },
            { name: "Threat Intelligence", weight: 3, synonyms: ["Cyber Intelligence", "Security Research"] },
            { name: "Investigation", weight: 2, synonyms: ["Research", "Analysis"] }
        ],
        courses: [
            { title: "Cyber Threat Intelligence", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Malware Analysis Fundamentals", difficulty: "Advanced", duration: "8 weeks", priority: 2 },
            { title: "OSINT Techniques", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 80000, max: 150000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Cybersecurity", "Intelligence", "Defense"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Computer Science, Cybersecurity, or related field",
        certifications: ["GCTI", "SANS FOR578", "CTIA"],
        workEnvironment: "Security Operations Center, Office, Remote options",
        workLifeBalance: "Moderate",
        careerPath: ["Security Analyst", "Threat Intelligence Analyst", "Senior Threat Intelligence Analyst", "Threat Intelligence Manager"]
    },
    
    // Creative Technology
    {
        title: "Creative Technologist",
        description: "Blend technology with creative design to create innovative digital experiences.",
        skills: [
            { name: "Creative Coding", weight: 3, synonyms: ["Interactive Development", "Generative Art"] },
            { name: "JavaScript", weight: 2.5, synonyms: ["JS", "Web Development"] },
            { name: "Physical Computing", weight: 2, synonyms: ["Arduino", "Microcontrollers"] },
            { name: "Design", weight: 2, synonyms: ["Visual Design", "UX/UI"] },
            { name: "Prototyping", weight: 2, synonyms: ["Rapid Prototyping", "Concept Development"] }
        ],
        interests: [
            { name: "Creative Technology", weight: 3, synonyms: ["Digital Art", "Interactive Media"] },
            { name: "Design", weight: 2.5, synonyms: ["Visual Design", "Creativity"] },
            { name: "Technology", weight: 2.5, synonyms: ["Programming", "Digital Tools"] }
        ],
        courses: [
            { title: "Creative Coding", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Interactive Installation Design", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Physical Computing Basics", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 70000, max: 140000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Advertising", "Design", "Entertainment", "Museums"],
        experienceLevel: "Mid", // Changed from "Mid to Senior" to match enum
        requiredEducation: "Bachelor's in Design, Computer Science, or related field",
        certifications: ["Creative Technology Certification"],
        workEnvironment: "Creative Agency, Studio, Lab",
        workLifeBalance: "Project-based",
        careerPath: ["Junior Creative Technologist", "Creative Technologist", "Senior Creative Technologist", "Creative Technology Director"]
    }
];

/**
 * Seeds the database with additional career data.
 * This script is designed to add more career options beyond the existing ones
 * in the database.
 */
async function seedAdditionalCareerData() {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/career-platform';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully');
        
        console.log(`Preparing to seed ${additionalCareers.length} additional careers...`);

        // First, check existing careers to avoid duplicates
        const existingCareers = await Career.find({}, { title: 1 });
        const existingTitles = new Set(existingCareers.map(career => career.title.toLowerCase()));
        
        // Filter out any duplicates
        const newCareers = additionalCareers.filter(career => 
            !existingTitles.has(career.title.toLowerCase())
        );
        
        console.log(`Found ${existingCareers.length} existing careers`);
        console.log(`Adding ${newCareers.length} new unique careers`);
        
        if (newCareers.length === 0) {
            console.log('No new careers to add. All careers already exist in the database.');
            return;
        }

        // Insert new careers into the database
        const insertedCareers = await Career.insertMany(newCareers);
        console.log(`Successfully added ${insertedCareers.length} new careers to the database`);
        
        // Update related careers relationships
        console.log('Updating career relationships...');
        const allCareers = await Career.find({});
        
        for (let i = 0; i < allCareers.length; i++) {
            const career = allCareers[i];
            const relatedCareers = [];
            
            // Find related careers based on skills and interests
            for (let j = 0; j < allCareers.length; j++) {
                if (i !== j) {
                    const otherCareer = allCareers[j];
                    
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

            // Update career with related careers (limit to 5)
            await Career.findByIdAndUpdate(career._id, {
                relatedCareers: relatedCareers.slice(0, 5)
            });
        }

        console.log('Updated career relationships');
        console.log('Additional career data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding additional career data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    // Load environment variables
    require('dotenv').config();
    seedAdditionalCareerData();
}

module.exports = { seedAdditionalCareerData, additionalCareers };
