const mongoose = require('mongoose');
const Career = require('./models/Career');

// Final set of career options to add to the database
const finalCareers = [
    // Event Technology
    {
        title: "Virtual Event Producer",
        description: "Plan and execute virtual events, webinars, and online conferences.",
        skills: [
            { name: "Virtual Event Platforms", weight: 3, synonyms: ["Zoom", "Hopin", "WebEx"] },
            { name: "Event Management", weight: 2.5, synonyms: ["Event Planning", "Event Production"] },
            { name: "Live Streaming", weight: 2.5, synonyms: ["Video Streaming", "Broadcast"] },
            { name: "Project Management", weight: 2, synonyms: ["Planning", "Coordination"] },
            { name: "Digital Marketing", weight: 2, synonyms: ["Event Promotion", "Online Marketing"] }
        ],
        interests: [
            { name: "Event Planning", weight: 3, synonyms: ["Event Management", "Event Production"] },
            { name: "Technology", weight: 2.5, synonyms: ["Digital Tools", "Event Tech"] },
            { name: "Communications", weight: 2, synonyms: ["Public Speaking", "Presentation"] }
        ],
        courses: [
            { title: "Virtual Event Management", difficulty: "Intermediate", duration: "5 weeks", priority: 3 },
            { title: "Live Streaming Production", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Digital Event Marketing", difficulty: "Intermediate", duration: "4 weeks", priority: 2 }
        ],
        salaryRange: { min: 50000, max: 90000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Events", "Marketing", "Digital Media"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Communications, Marketing, or related field",
        certifications: ["Virtual Event Professional Certification", "Digital Event Strategist"],
        workEnvironment: "Event Management Companies, Marketing Agencies, Corporate Events Teams",
        workLifeBalance: "Variable (event-based)",
        careerPath: ["Event Coordinator", "Virtual Event Producer", "Senior Event Producer", "Event Director"]
    },
    
    // Legal Technology
    {
        title: "Legal Tech Specialist",
        description: "Implement and manage technology solutions for legal practices and departments.",
        skills: [
            { name: "Legal Technology", weight: 3, synonyms: ["LegalTech", "Legal Software"] },
            { name: "Document Management", weight: 2.5, synonyms: ["Document Automation", "E-Discovery"] },
            { name: "Contract Analysis", weight: 2.5, synonyms: ["Contract Review", "Legal Analysis"] },
            { name: "Legal Process Management", weight: 2, synonyms: ["Workflow Automation", "Process Improvement"] },
            { name: "IT Support", weight: 2, synonyms: ["Technical Support", "System Administration"] }
        ],
        interests: [
            { name: "Legal Technology", weight: 3, synonyms: ["LegalTech", "Legal Innovation"] },
            { name: "Law", weight: 2.5, synonyms: ["Legal Practice", "Legal Services"] },
            { name: "Technology", weight: 2, synonyms: ["IT", "Software"] }
        ],
        courses: [
            { title: "Legal Technology Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "E-Discovery and Legal Analytics", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Legal Process Automation", difficulty: "Intermediate", duration: "5 weeks", priority: 2 }
        ],
        salaryRange: { min: 65000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Legal", "LegalTech", "Law Firms"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Law, IT, or related field",
        certifications: ["E-Discovery Certification", "Legal Technology Core Competencies Certification"],
        workEnvironment: "Law Firms, Legal Departments, LegalTech Companies",
        workLifeBalance: "Good",
        careerPath: ["Legal Tech Support", "Legal Tech Specialist", "Legal Tech Manager", "Director of Legal Operations"]
    },
    
    // Transportation & Logistics
    {
        title: "Supply Chain Analyst",
        description: "Analyze and optimize supply chain operations for efficiency and cost-effectiveness.",
        skills: [
            { name: "Supply Chain Analysis", weight: 3, synonyms: ["Logistics Analysis", "Supply Chain Management"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Analytics", "Statistical Analysis"] },
            { name: "Inventory Management", weight: 2.5, synonyms: ["Stock Control", "Inventory Optimization"] },
            { name: "Process Improvement", weight: 2, synonyms: ["Optimization", "Lean Six Sigma"] },
            { name: "ERP Systems", weight: 2, synonyms: ["SAP", "Oracle", "Supply Chain Software"] }
        ],
        interests: [
            { name: "Supply Chain", weight: 3, synonyms: ["Logistics", "Operations"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Analytics", "Business Intelligence"] },
            { name: "Business Operations", weight: 2, synonyms: ["Process Management", "Optimization"] }
        ],
        courses: [
            { title: "Supply Chain Analytics", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Inventory Optimization", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Logistics Network Design", difficulty: "Advanced", duration: "8 weeks", priority: 2 }
        ],
        salaryRange: { min: 60000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Logistics", "Supply Chain", "Manufacturing", "Retail"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Supply Chain Management, Business, or related field",
        certifications: ["CSCP (Certified Supply Chain Professional)", "CPIM (Certified in Production and Inventory Management)"],
        workEnvironment: "Corporate Offices, Distribution Centers, Manufacturing Facilities",
        workLifeBalance: "Good",
        careerPath: ["Supply Chain Analyst", "Senior Supply Chain Analyst", "Supply Chain Manager", "Director of Supply Chain"]
    },
    
    // Gaming Industry
    {
        title: "Game Producer",
        description: "Oversee game development projects from concept to completion.",
        skills: [
            { name: "Game Production", weight: 3, synonyms: ["Project Management", "Game Development"] },
            { name: "Team Management", weight: 2.5, synonyms: ["Leadership", "Coordination"] },
            { name: "Game Development", weight: 2.5, synonyms: ["Game Design", "Game Programming"] },
            { name: "Scheduling", weight: 2, synonyms: ["Timeline Management", "Milestone Planning"] },
            { name: "Budget Management", weight: 2, synonyms: ["Financial Planning", "Resource Allocation"] }
        ],
        interests: [
            { name: "Video Games", weight: 3, synonyms: ["Gaming", "Game Development"] },
            { name: "Project Management", weight: 2.5, synonyms: ["Production", "Coordination"] },
            { name: "Creative Media", weight: 2, synonyms: ["Entertainment", "Interactive Media"] }
        ],
        courses: [
            { title: "Game Production Management", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Game Development Process", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Team Leadership for Creative Projects", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 70000, max: 140000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Gaming", "Entertainment", "Software Development"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Game Design, Computer Science, or related field",
        certifications: ["PMP (Project Management Professional)", "Agile Certifications"],
        workEnvironment: "Game Studios, Game Development Companies",
        workLifeBalance: "Variable (project-based)",
        careerPath: ["Assistant Producer", "Associate Producer", "Game Producer", "Senior Producer", "Executive Producer"]
    },
    
    // Renewable Energy
    {
        title: "Renewable Energy Technician",
        description: "Install, maintain, and repair renewable energy systems like solar panels and wind turbines.",
        skills: [
            { name: "Renewable Energy Systems", weight: 3, synonyms: ["Solar", "Wind", "Clean Energy"] },
            { name: "Electrical Systems", weight: 2.5, synonyms: ["Electrical Installation", "Wiring"] },
            { name: "Maintenance", weight: 2.5, synonyms: ["Repairs", "System Upkeep"] },
            { name: "Troubleshooting", weight: 2, synonyms: ["Diagnostics", "Problem Solving"] },
            { name: "Safety Protocols", weight: 2, synonyms: ["Safety Standards", "Occupational Safety"] }
        ],
        interests: [
            { name: "Renewable Energy", weight: 3, synonyms: ["Clean Energy", "Sustainable Energy"] },
            { name: "Technical Work", weight: 2.5, synonyms: ["Hands-on Work", "Field Work"] },
            { name: "Environmental Conservation", weight: 2, synonyms: ["Sustainability", "Green Technology"] }
        ],
        courses: [
            { title: "Solar PV Installation", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "Wind Turbine Technology", difficulty: "Intermediate", duration: "10 weeks", priority: 3 },
            { title: "Electrical Systems for Renewable Energy", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 45000, max: 80000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Renewable Energy", "Solar", "Wind", "Green Technology"],
        experienceLevel: "Entry",
        requiredEducation: "Associate's Degree or Technical Certification in Renewable Energy or related field",
        certifications: ["NABCEP (North American Board of Certified Energy Practitioners)", "Wind Turbine Technician Certification"],
        workEnvironment: "Field Work, Installation Sites, Maintenance Facilities",
        workLifeBalance: "Good",
        careerPath: ["Apprentice Technician", "Renewable Energy Technician", "Senior Technician", "Installation Team Lead"]
    },
    
    // Space Technology
    {
        title: "Spacecraft Systems Engineer",
        description: "Design and develop systems for spacecraft and satellites.",
        skills: [
            { name: "Spacecraft Systems", weight: 3, synonyms: ["Satellite Systems", "Space Systems"] },
            { name: "Aerospace Engineering", weight: 2.5, synonyms: ["Aeronautical Engineering", "Space Engineering"] },
            { name: "Systems Integration", weight: 2.5, synonyms: ["System Architecture", "Systems Design"] },
            { name: "Testing", weight: 2, synonyms: ["Validation", "Verification"] },
            { name: "Technical Documentation", weight: 2, synonyms: ["Documentation", "Technical Writing"] }
        ],
        interests: [
            { name: "Space Technology", weight: 3, synonyms: ["Aerospace", "Astronautics"] },
            { name: "Engineering", weight: 2.5, synonyms: ["Technical Design", "Systems Engineering"] },
            { name: "Science", weight: 2, synonyms: ["Physics", "Astronomy"] }
        ],
        courses: [
            { title: "Spacecraft Systems Engineering", difficulty: "Advanced", duration: "12 weeks", priority: 3 },
            { title: "Orbital Mechanics", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Space Environment and Effects", difficulty: "Advanced", duration: "8 weeks", priority: 2 }
        ],
        salaryRange: { min: 85000, max: 160000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Aerospace", "Space Technology", "Defense", "Research"],
        experienceLevel: "Senior",
        requiredEducation: "Master's or PhD in Aerospace Engineering, Mechanical Engineering, or related field",
        certifications: ["Systems Engineering Certification", "Aerospace Engineering Professional"],
        workEnvironment: "Aerospace Companies, Space Agencies, Research Institutions",
        workLifeBalance: "Moderate",
        careerPath: ["Junior Systems Engineer", "Spacecraft Systems Engineer", "Senior Systems Engineer", "Lead Systems Architect"]
    },
    
    // Agriculture Technology
    {
        title: "Precision Agriculture Specialist",
        description: "Apply technology and data to optimize agricultural operations and crop yields.",
        skills: [
            { name: "Precision Agriculture", weight: 3, synonyms: ["Precision Farming", "Smart Farming"] },
            { name: "Agricultural Technology", weight: 2.5, synonyms: ["AgTech", "Farming Technology"] },
            { name: "GIS", weight: 2.5, synonyms: ["Geographic Information Systems", "Spatial Analysis"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Statistical Analysis"] },
            { name: "Remote Sensing", weight: 2, synonyms: ["Satellite Imagery", "Drone Mapping"] }
        ],
        interests: [
            { name: "Agriculture", weight: 3, synonyms: ["Farming", "Crop Production"] },
            { name: "Technology", weight: 2.5, synonyms: ["AgTech", "Digital Solutions"] },
            { name: "Environmental Science", weight: 2, synonyms: ["Ecology", "Sustainable Practices"] }
        ],
        courses: [
            { title: "Precision Agriculture Fundamentals", difficulty: "Intermediate", duration: "8 weeks", priority: 3 },
            { title: "GIS for Agriculture", difficulty: "Intermediate", duration: "6 weeks", priority: 3 },
            { title: "Agricultural Data Analytics", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 55000, max: 95000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Agriculture", "AgTech", "Farming", "Environmental Services"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's in Agriculture, Environmental Science, or related field",
        certifications: ["Certified Crop Adviser", "Precision Agriculture Specialist Certification"],
        workEnvironment: "Agricultural Companies, Farms, Research Institutions",
        workLifeBalance: "Seasonal",
        careerPath: ["Agricultural Technician", "Precision Agriculture Specialist", "Senior Agricultural Analyst", "Agricultural Technology Manager"]
    },
    
    // 3D Printing & Manufacturing
    {
        title: "Additive Manufacturing Engineer",
        description: "Design and develop products and processes using 3D printing and additive manufacturing technologies.",
        skills: [
            { name: "3D Printing", weight: 3, synonyms: ["Additive Manufacturing", "AM"] },
            { name: "CAD", weight: 2.5, synonyms: ["Computer-Aided Design", "3D Modeling"] },
            { name: "Materials Science", weight: 2.5, synonyms: ["Material Properties", "Material Testing"] },
            { name: "Process Optimization", weight: 2, synonyms: ["Process Improvement", "Manufacturing Efficiency"] },
            { name: "Quality Control", weight: 2, synonyms: ["Quality Assurance", "Inspection"] }
        ],
        interests: [
            { name: "Additive Manufacturing", weight: 3, synonyms: ["3D Printing", "Rapid Prototyping"] },
            { name: "Engineering", weight: 2.5, synonyms: ["Design", "Manufacturing"] },
            { name: "Technology", weight: 2, synonyms: ["Innovation", "Advanced Manufacturing"] }
        ],
        courses: [
            { title: "Additive Manufacturing Technologies", difficulty: "Advanced", duration: "10 weeks", priority: 3 },
            { title: "Design for Additive Manufacturing", difficulty: "Advanced", duration: "8 weeks", priority: 3 },
            { title: "Materials for 3D Printing", difficulty: "Intermediate", duration: "6 weeks", priority: 2 }
        ],
        salaryRange: { min: 70000, max: 130000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Manufacturing", "Engineering", "Product Development", "Research"],
        experienceLevel: "Mid",
        requiredEducation: "Bachelor's or Master's in Mechanical Engineering, Materials Science, or related field",
        certifications: ["Additive Manufacturing Certification", "3D Printing Professional"],
        workEnvironment: "Manufacturing Facilities, Engineering Firms, Research Labs",
        workLifeBalance: "Good",
        careerPath: ["Manufacturing Engineer", "Additive Manufacturing Engineer", "Senior AM Engineer", "AM Technical Lead"]
    }
];

/**
 * Seeds the database with the final set of career data.
 * This script is designed to add the last batch of career options
 * to reach 50+ total careers.
 */
async function seedFinalCareerData() {
    try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/career-platform';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully');
        
        console.log(`Preparing to seed ${finalCareers.length} final careers...`);

        // First, check existing careers to avoid duplicates
        const existingCareers = await Career.find({}, { title: 1 });
        const existingTitles = new Set(existingCareers.map(career => career.title.toLowerCase()));
        
        // Filter out any duplicates
        const newCareers = finalCareers.filter(career => 
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
        console.log('Final career data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding final career data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    // Load environment variables
    require('dotenv').config();
    seedFinalCareerData();
}

module.exports = { seedFinalCareerData, finalCareers };
