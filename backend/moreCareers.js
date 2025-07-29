const mongoose = require('mongoose');
const Career = require('./models/Career');

// More career options to add to the database
const moreCareers = [
    // Healthcare Technology
    {
        title: "Healthcare IT Specialist",
        description: "Implement and maintain technology systems for healthcare organizations.",
        skills: [
            { name: "Electronic Health Records", weight: 3, synonyms: ["EHR", "EMR", "Medical Records"] },
            { name: "Healthcare Systems", weight: 2.5, synonyms: ["Hospital Information Systems", "Clinical Systems"] },
            { name: "IT Support", weight: 2, synonyms: ["Technical Support", "Helpdesk"] },
            { name: "System Implementation", weight: 2, synonyms: ["Software Deployment", "IT Project Management"] },
            { name: "Healthcare Compliance", weight: 2, synonyms: ["HIPAA", "Regulatory Compliance"] }
        ],
        interests: [
            { name: "Healthcare Technology", weight: 3, synonyms: ["Health IT", "Medical Technology"] },
            { name: "Information Technology", weight: 2.5, synonyms: ["IT", "Computing"] },
            { name: "Healthcare", weight: 2, synonyms: ["Medical", "Clinical"] }
        ],
        courses: [
            { title: "Healthcare IT Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Electronic Health Record Management", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Healthcare Data Security", difficulty: "Advanced", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 65000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Healthcare", "Information Technology", "Health Services"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in IT, Computer Science, or Healthcare Administration",
        certifications: ["CompTIA Healthcare IT Technician", "Epic Certification", "CPHIMS"],
        workEnvironment: "Hospital, Clinic, Healthcare Organization",
        workLifeBalance: "Good",
        careerPath: ["IT Support Specialist", "Healthcare IT Specialist", "Healthcare IT Manager", "Healthcare IT Director"]
    },
    
    // Digital Marketing & SEO
    {
        title: "SEO Specialist",
        description: "Optimize websites to improve visibility in search engine results.",
        skills: [
            { name: "Search Engine Optimization", weight: 3, synonyms: ["SEO", "Keyword Research"] },
            { name: "Content Marketing", weight: 2.5, synonyms: ["Content Strategy", "Content Creation"] },
            { name: "Analytics", weight: 2.5, synonyms: ["Google Analytics", "Data Analysis", "Web Metrics"] },
            { name: "Technical SEO", weight: 2, synonyms: ["Site Structure", "Schema Markup"] },
            { name: "Link Building", weight: 2, synonyms: ["Backlinks", "Off-page SEO"] }
        ],
        interests: [
            { name: "Digital Marketing", weight: 3, synonyms: ["Online Marketing", "Internet Marketing"] },
            { name: "Search Engines", weight: 2.5, synonyms: ["Google", "Web Search"] },
            { name: "Web Analytics", weight: 2, synonyms: ["Data Analysis", "Metrics"] }
        ],
        courses: [
            { title: "SEO Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 },
            { title: "Advanced Search Engine Optimization", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Technical SEO Implementation", difficulty: "Advanced", duration: "5 weeks", priority: 2 }
        ],
        salaryRange: { min: 45000, max: 95000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Digital Marketing", "E-commerce", "Web Services"],
        experienceLevel: "Entry",
        requiredEducation: "Bachelor's in Marketing, Communications, or related field",
        certifications: ["Google Analytics Certification", "SEMrush Certification", "Moz SEO Certification"],
        workEnvironment: "Marketing Agency, In-house Marketing Team, Freelance",
        workLifeBalance: "Good",
        careerPath: ["SEO Specialist", "Senior SEO Specialist", "SEO Manager", "Digital Marketing Director"]
    },
    
    // Education Technology
    {
        title: "Instructional Designer",
        description: "Design effective learning experiences for educational programs and training.",
        skills: [
            { name: "Instructional Design", weight: 3, synonyms: ["Learning Design", "Course Development"] },
            { name: "E-Learning", weight: 2.5, synonyms: ["Online Learning", "Digital Education"] },
            { name: "Learning Management Systems", weight: 2, synonyms: ["LMS", "Canvas", "Moodle"] },
            { name: "Content Creation", weight: 2, synonyms: ["Course Content", "Educational Materials"] },
            { name: "Multimedia Design", weight: 2, synonyms: ["Video Production", "Interactive Content"] }
        ],
        interests: [
            { name: "Education", weight: 3, synonyms: ["Teaching", "Learning", "Pedagogy"] },
            { name: "Technology", weight: 2.5, synonyms: ["EdTech", "Digital Tools"] },
            { name: "Content Creation", weight: 2, synonyms: ["Design", "Development"] }
        ],
        courses: [
            { title: "Instructional Design Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "E-Learning Development", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Learning Assessment Strategies", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 60000, max: 100000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Education", "EdTech", "Corporate Training"],
        experienceLevel: "Mid",
        requiredEducation: "Master's in Instructional Design, Education, or related field",
        certifications: ["Certified Professional in Learning and Performance (CPLP)", "Quality Matters Certification"],
        workEnvironment: "Educational Institutions, Corporate Training Departments, EdTech Companies",
        workLifeBalance: "Excellent",
        careerPath: ["Junior Instructional Designer", "Instructional Designer", "Senior Instructional Designer", "Learning Experience Director"]
    },
    
    // Sustainability & Environment
    {
        title: "Sustainability Analyst",
        description: "Analyze and improve environmental sustainability of organizations and processes.",
        skills: [
            { name: "Environmental Analysis", weight: 3, synonyms: ["Environmental Assessment", "Impact Analysis"] },
            { name: "Sustainability Metrics", weight: 2.5, synonyms: ["ESG Metrics", "Carbon Accounting"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Statistical Analysis"] },
            { name: "Compliance", weight: 2, synonyms: ["Environmental Regulations", "Standards"] },
            { name: "Reporting", weight: 2, synonyms: ["Sustainability Reporting", "ESG Reporting"] }
        ],
        interests: [
            { name: "Sustainability", weight: 3, synonyms: ["Environmental Conservation", "Green Initiatives"] },
            { name: "Environmental Science", weight: 2.5, synonyms: ["Ecology", "Conservation"] },
            { name: "Corporate Social Responsibility", weight: 2, synonyms: ["CSR", "ESG"] }
        ],
        courses: [
            { title: "Sustainability Fundamentals", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Environmental Impact Assessment", difficulty: "Advanced", duration: "6 weeks", priority: 3 },
            { title: "ESG Reporting Standards", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 55000, max: 100000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Environmental Services", "Corporate Sustainability", "Consulting"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Environmental Science, Sustainability, or related field",
        certifications: ["LEED Green Associate", "Sustainability Accounting Standards Board (SASB) Certification"],
        workEnvironment: "Corporations, Consulting Firms, Government Agencies",
        workLifeBalance: "Good",
        careerPath: ["Sustainability Coordinator", "Sustainability Analyst", "Senior Sustainability Manager", "Director of Sustainability"]
    },
    
    // Content Creation
    {
        title: "Content Creator",
        description: "Create engaging digital content for various platforms and audiences.",
        skills: [
            { name: "Content Creation", weight: 3, synonyms: ["Writing", "Video Production", "Design"] },
            { name: "Social Media", weight: 2.5, synonyms: ["Instagram", "TikTok", "YouTube"] },
            { name: "Video Editing", weight: 2, synonyms: ["Adobe Premiere", "Final Cut", "Video Production"] },
            { name: "Audience Engagement", weight: 2, synonyms: ["Community Building", "Follower Growth"] },
            { name: "Brand Development", weight: 2, synonyms: ["Personal Branding", "Brand Strategy"] }
        ],
        interests: [
            { name: "Digital Content", weight: 3, synonyms: ["Media Creation", "Social Media"] },
            { name: "Creativity", weight: 2.5, synonyms: ["Creative Expression", "Artistic Work"] },
            { name: "Social Media", weight: 2, synonyms: ["Digital Platforms", "Online Communities"] }
        ],
        courses: [
            { title: "Digital Content Creation", difficulty: "Beginner", duration: "6 weeks", priority: 3 },
            { title: "Video Production and Editing", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Social Media Strategy", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 40000, max: 120000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Digital Media", "Entertainment", "Marketing"],
        experienceLevel: "Entry",
        requiredEducation: "Various backgrounds, often Bachelor's in Media, Communications, or related field",
        certifications: ["YouTube Creator Academy", "Facebook Blueprint Certification"],
        workEnvironment: "Remote, Studio, Media Companies",
        workLifeBalance: "Variable",
        careerPath: ["Content Creator", "Influencer", "Content Strategist", "Creative Director"]
    },
    
    // Biotechnology
    {
        title: "Bioinformatics Specialist",
        description: "Apply computational methods to analyze biological data and solve biological problems.",
        skills: [
            { name: "Bioinformatics", weight: 3, synonyms: ["Computational Biology", "Biostatistics"] },
            { name: "Programming", weight: 2.5, synonyms: ["Python", "R", "Perl"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Statistical Analysis", "Big Data"] },
            { name: "Genomics", weight: 2, synonyms: ["DNA Sequencing", "Genome Analysis"] },
            { name: "Research", weight: 2, synonyms: ["Scientific Research", "Literature Review"] }
        ],
        interests: [
            { name: "Bioinformatics", weight: 3, synonyms: ["Computational Biology", "Biological Data Science"] },
            { name: "Biology", weight: 2.5, synonyms: ["Life Sciences", "Molecular Biology"] },
            { name: "Data Science", weight: 2, synonyms: ["Analytics", "Computational Methods"] }
        ],
        courses: [
            { title: "Bioinformatics Fundamentals", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Genomic Data Analysis", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Programming for Biological Data", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 70000, max: 130000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Biotechnology", "Pharmaceutical", "Research"],
        experienceLevel: "Mid",
        requiredEducation: "Master's or PhD in Bioinformatics, Computational Biology, or related field",
        certifications: ["Certified Bioinformatics Professional", "Data Science Certifications"],
        workEnvironment: "Research Institutions, Biotech Companies, Pharmaceutical Companies",
        workLifeBalance: "Good",
        careerPath: ["Bioinformatics Analyst", "Bioinformatics Specialist", "Senior Bioinformatician", "Bioinformatics Director"]
    },
    
    // Financial Technology
    {
        title: "Financial Data Analyst",
        description: "Analyze financial data to provide insights and support decision-making.",
        skills: [
            { name: "Financial Analysis", weight: 3, synonyms: ["Financial Modeling", "Valuation"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Statistical Analysis", "Quantitative Analysis"] },
            { name: "SQL", weight: 2.5, synonyms: ["Database Queries", "Data Extraction"] },
            { name: "Excel", weight: 2, synonyms: ["Spreadsheets", "Financial Modeling"] },
            { name: "Visualization", weight: 2, synonyms: ["Data Visualization", "Tableau", "Power BI"] }
        ],
        interests: [
            { name: "Finance", weight: 3, synonyms: ["Financial Markets", "Investments"] },
            { name: "Data Analysis", weight: 3, synonyms: ["Analytics", "Quantitative Analysis"] },
            { name: "Business", weight: 2, synonyms: ["Economics", "Corporate Finance"] }
        ],
        courses: [
            { title: "Financial Data Analysis", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Financial Modeling", difficulty: "Advanced", duration: "6 weeks", priority: 3 },
            { title: "SQL for Financial Analysis", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 65000, max: 120000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Finance", "Banking", "Investment", "FinTech"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Finance, Economics, Statistics, or related field",
        certifications: ["CFA (Chartered Financial Analyst)", "FRM (Financial Risk Manager)"],
        workEnvironment: "Financial Institutions, Investment Firms, FinTech Companies",
        workLifeBalance: "Moderate",
        careerPath: ["Financial Analyst", "Senior Financial Analyst", "Financial Manager", "Finance Director"]
    },
    
    // Robotics
    {
        title: "Robotics Engineer",
        description: "Design, build, and maintain robots and robotic systems.",
        skills: [
            { name: "Robotics", weight: 3, synonyms: ["Robot Design", "Automation"] },
            { name: "Programming", weight: 2.5, synonyms: ["C++", "Python", "ROS"] },
            { name: "Mechanical Engineering", weight: 2.5, synonyms: ["Mechanics", "Machine Design"] },
            { name: "Electronics", weight: 2, synonyms: ["Electrical Engineering", "Circuits"] },
            { name: "Control Systems", weight: 2, synonyms: ["Feedback Control", "PID Control"] }
        ],
        interests: [
            { name: "Robotics", weight: 3, synonyms: ["Automation", "Mechatronics"] },
            { name: "Engineering", weight: 2.5, synonyms: ["Mechanical Engineering", "Design"] },
            { name: "Technology", weight: 2, synonyms: ["Innovation", "Emerging Tech"] }
        ],
        courses: [
            { title: "Introduction to Robotics", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Robot Control Systems", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Sensors and Actuators", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 75000, max: 150000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Robotics", "Manufacturing", "Automation", "Research"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's or Master's in Robotics, Mechanical Engineering, or related field",
        certifications: ["Certified Robotics Engineer", "ROS Developer Certification"],
        workEnvironment: "Research Labs, Manufacturing Facilities, Robotics Companies",
        workLifeBalance: "Good",
        careerPath: ["Junior Robotics Engineer", "Robotics Engineer", "Senior Robotics Engineer", "Robotics Team Lead"]
    },
    
    // E-commerce
    {
        title: "E-commerce Manager",
        description: "Oversee online retail operations and strategy to drive growth and profitability.",
        skills: [
            { name: "E-commerce Platforms", weight: 3, synonyms: ["Shopify", "WooCommerce", "Magento"] },
            { name: "Digital Marketing", weight: 2.5, synonyms: ["Online Marketing", "PPC", "Email Marketing"] },
            { name: "Analytics", weight: 2.5, synonyms: ["Web Analytics", "Conversion Tracking"] },
            { name: "Customer Experience", weight: 2, synonyms: ["UX", "Customer Journey"] },
            { name: "Inventory Management", weight: 2, synonyms: ["Supply Chain", "Stock Control"] }
        ],
        interests: [
            { name: "E-commerce", weight: 3, synonyms: ["Online Retail", "Digital Commerce"] },
            { name: "Business", weight: 2.5, synonyms: ["Retail", "Sales"] },
            { name: "Digital Marketing", weight: 2, synonyms: ["Online Marketing", "Web Marketing"] }
        ],
        courses: [
            { title: "E-commerce Management", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Digital Marketing for E-commerce", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "E-commerce Analytics", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 60000, max: 120000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Retail", "E-commerce", "Digital Business"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Business, Marketing, or related field",
        certifications: ["Google Analytics Certification", "Digital Marketing Certifications", "E-commerce Platform Certifications"],
        workEnvironment: "Online Retailers, E-commerce Companies, Retail Brands with Digital Presence",
        workLifeBalance: "Moderate",
        careerPath: ["E-commerce Specialist", "E-commerce Manager", "Senior E-commerce Manager", "Director of E-commerce"]
    },
    
    // Sports Technology
    {
        title: "Sports Data Analyst",
        description: "Analyze sports performance data to improve athlete and team performance.",
        skills: [
            { name: "Sports Analytics", weight: 3, synonyms: ["Performance Analysis", "Sports Statistics"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Statistical Analysis", "Data Science"] },
            { name: "Performance Tracking", weight: 2.5, synonyms: ["Athlete Monitoring", "Metrics"] },
            { name: "Visualization", weight: 2, synonyms: ["Data Visualization", "Dashboards"] },
            { name: "Programming", weight: 2, synonyms: ["Python", "R", "SQL"] }
        ],
        interests: [
            { name: "Sports", weight: 3, synonyms: ["Athletics", "Competitive Sports"] },
            { name: "Data Analysis", weight: 3, synonyms: ["Analytics", "Statistics"] },
            { name: "Performance Improvement", weight: 2, synonyms: ["Optimization", "Enhancement"] }
        ],
        courses: [
            { title: "Sports Analytics Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Performance Data Analysis", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Sports Visualization Techniques", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 50000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Sports", "Athletics", "Performance Analytics"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Sports Science, Statistics, Computer Science, or related field",
        certifications: ["Sports Analytics Certification", "Data Science Certifications"],
        workEnvironment: "Sports Teams, Athletic Organizations, Sports Technology Companies",
        workLifeBalance: "Variable (seasonal)",
        careerPath: ["Sports Analyst", "Sports Data Analyst", "Senior Performance Analyst", "Director of Sports Analytics"]
    }
];

/**
 * Seeds the database with more career data.
 * This script is designed to add even more career options
 * beyond the existing and additional ones.
 */
async function seedMoreCareerData() {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/career-platform';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully');
        
        console.log(`Preparing to seed ${moreCareers.length} more careers...`);

        // First, check existing careers to avoid duplicates
        const existingCareers = await Career.find({}, { title: 1 });
        const existingTitles = new Set(existingCareers.map(career => career.title.toLowerCase()));
        
        // Filter out any duplicates
        const newCareers = moreCareers.filter(career => 
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
        console.log('More career data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding more career data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    // Load environment variables
    require('dotenv').config();
    seedMoreCareerData();
}

module.exports = { seedMoreCareerData, moreCareers };
