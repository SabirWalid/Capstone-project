const mongoose = require('mongoose');
const Career = require('./models/Career');

// Expanded career data with 50+ diverse career paths
const expandedCareers = [
    // Technology & Software
    {
        title: "Full Stack Web Developer",
        description: "Build end-to-end web applications using modern technologies and frameworks.",
        skills: [
            { name: "JavaScript", weight: 3, synonyms: ["JS", "ECMAScript", "Node.js"] },
            { name: "HTML", weight: 2.5, synonyms: ["HTML5", "Markup"] },
            { name: "CSS", weight: 2.5, synonyms: ["CSS3", "Styling", "SASS", "SCSS"] },
            { name: "React", weight: 2.5, synonyms: ["ReactJS", "React.js"] },
            { name: "Node.js", weight: 2, synonyms: ["NodeJS", "Node"] },
            { name: "Database", weight: 2, synonyms: ["SQL", "MongoDB", "MySQL", "PostgreSQL"] }
        ],
        interests: [
            { name: "Programming", weight: 3, synonyms: ["Coding", "Development", "Software"] },
            { name: "Web Development", weight: 3, synonyms: ["Web", "Frontend", "Backend"] },
            { name: "Technology", weight: 2, synonyms: ["Tech", "Innovation"] }
        ],
        courses: [
            { title: "JavaScript Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 },
            { title: "React Development", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 50000, max: 120000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Startups"],
        experienceLevel: "All",
        tags: ["frontend", "backend", "javascript", "react", "fullstack"]
    },
    {
        title: "Data Scientist",
        description: "Analyze complex data to help organizations make data-driven decisions.",
        skills: [
            { name: "Python", weight: 3, synonyms: ["Python Programming"] },
            { name: "Statistics", weight: 3, synonyms: ["Statistical Analysis", "Math"] },
            { name: "Machine Learning", weight: 2.5, synonyms: ["ML", "AI"] },
            { name: "SQL", weight: 2.5, synonyms: ["Database", "Data Query"] },
            { name: "R", weight: 2, synonyms: ["R Programming"] }
        ],
        interests: [
            { name: "Data Science", weight: 3, synonyms: ["Data", "Analytics"] },
            { name: "Mathematics", weight: 2.5, synonyms: ["Math", "Statistics"] },
            { name: "Research", weight: 2, synonyms: ["Analysis"] }
        ],
        courses: [
            { title: "Python for Data Science", difficulty: "Beginner", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 70000, max: 150000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Finance", "Healthcare"],
        experienceLevel: "Mid",
        tags: ["data", "python", "machine learning", "analytics"]
    },
    {
        title: "DevOps Engineer",
        description: "Streamline software development and deployment processes through automation.",
        skills: [
            { name: "Docker", weight: 3, synonyms: ["Containerization"] },
            { name: "Kubernetes", weight: 2.5, synonyms: ["K8s", "Container Orchestration"] },
            { name: "AWS", weight: 2.5, synonyms: ["Amazon Web Services", "Cloud"] },
            { name: "Linux", weight: 2, synonyms: ["Unix", "Command Line"] },
            { name: "CI/CD", weight: 2.5, synonyms: ["Jenkins", "GitLab CI"] }
        ],
        interests: [
            { name: "Cloud Computing", weight: 3, synonyms: ["Cloud", "Infrastructure"] },
            { name: "Automation", weight: 2.5, synonyms: ["Scripting", "DevOps"] },
            { name: "System Administration", weight: 2, synonyms: ["SysAdmin", "Operations"] }
        ],
        courses: [
            { title: "Docker Fundamentals", difficulty: "Intermediate", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 75000, max: 140000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Cloud", "Enterprise"],
        experienceLevel: "Mid",
        tags: ["devops", "cloud", "docker", "automation"]
    },
    {
        title: "Mobile App Developer",
        description: "Create mobile applications for iOS and Android platforms.",
        skills: [
            { name: "Swift", weight: 2.5, synonyms: ["iOS Development"] },
            { name: "Kotlin", weight: 2.5, synonyms: ["Android Development"] },
            { name: "React Native", weight: 2, synonyms: ["Cross-platform"] },
            { name: "Flutter", weight: 2, synonyms: ["Dart", "Cross-platform"] },
            { name: "Mobile UI/UX", weight: 2, synonyms: ["Mobile Design"] }
        ],
        interests: [
            { name: "Mobile Development", weight: 3, synonyms: ["Mobile", "Apps"] },
            { name: "User Experience", weight: 2, synonyms: ["UX", "UI"] },
            { name: "Technology", weight: 2, synonyms: ["Tech", "Programming"] }
        ],
        courses: [
            { title: "iOS Development with Swift", difficulty: "Intermediate", duration: "8 weeks", priority: 3 }
        ],
        salaryRange: { min: 60000, max: 130000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Mobile", "Gaming"],
        experienceLevel: "All",
        tags: ["mobile", "ios", "android", "apps"]
    },
    {
        title: "Cybersecurity Analyst",
        description: "Protect organizations from cyber threats and security breaches.",
        skills: [
            { name: "Network Security", weight: 3, synonyms: ["Security", "Firewall"] },
            { name: "Ethical Hacking", weight: 2.5, synonyms: ["Penetration Testing"] },
            { name: "Risk Assessment", weight: 2.5, synonyms: ["Security Assessment"] },
            { name: "Incident Response", weight: 2, synonyms: ["Security Response"] },
            { name: "Cryptography", weight: 2, synonyms: ["Encryption"] }
        ],
        interests: [
            { name: "Cybersecurity", weight: 3, synonyms: ["Security", "Information Security"] },
            { name: "Technology", weight: 2.5, synonyms: ["Tech", "IT"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Analysis"] }
        ],
        courses: [
            { title: "Cybersecurity Fundamentals", difficulty: "Beginner", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 65000, max: 130000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Finance", "Government"],
        experienceLevel: "Mid",
        tags: ["cybersecurity", "security", "ethical hacking"]
    },

    // Design & Creative
    {
        title: "UX/UI Designer",
        description: "Design user-friendly interfaces and experiences for digital products.",
        skills: [
            { name: "Figma", weight: 3, synonyms: ["Design Tools", "Prototyping"] },
            { name: "Adobe XD", weight: 2.5, synonyms: ["Adobe Experience Design"] },
            { name: "User Research", weight: 2.5, synonyms: ["Research", "User Testing"] },
            { name: "Wireframing", weight: 2, synonyms: ["Prototyping", "Mockups"] },
            { name: "Design Systems", weight: 2, synonyms: ["UI Libraries"] }
        ],
        interests: [
            { name: "Design", weight: 3, synonyms: ["Visual Design", "UI/UX"] },
            { name: "User Experience", weight: 3, synonyms: ["UX", "Usability"] },
            { name: "Creative Arts", weight: 2, synonyms: ["Art", "Creativity"] }
        ],
        courses: [
            { title: "UX Design Fundamentals", difficulty: "Beginner", duration: "5 weeks", priority: 3 }
        ],
        salaryRange: { min: 55000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Design", "E-commerce"],
        experienceLevel: "All",
        tags: ["ux", "ui", "design", "figma"]
    },
    {
        title: "Graphic Designer",
        description: "Create visual content for print and digital media.",
        skills: [
            { name: "Adobe Photoshop", weight: 3, synonyms: ["Photoshop", "Image Editing"] },
            { name: "Adobe Illustrator", weight: 3, synonyms: ["Illustrator", "Vector Graphics"] },
            { name: "Typography", weight: 2.5, synonyms: ["Font Design", "Text Design"] },
            { name: "Brand Design", weight: 2, synonyms: ["Branding", "Logo Design"] },
            { name: "Print Design", weight: 2, synonyms: ["Layout Design"] }
        ],
        interests: [
            { name: "Graphic Design", weight: 3, synonyms: ["Visual Design", "Design"] },
            { name: "Creative Arts", weight: 2.5, synonyms: ["Art", "Creativity"] },
            { name: "Visual Communication", weight: 2, synonyms: ["Communication Design"] }
        ],
        courses: [
            { title: "Graphic Design Basics", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 40000, max: 75000, currency: "USD" },
        jobOutlook: "Fair",
        industry: ["Design", "Marketing", "Media"],
        experienceLevel: "All",
        tags: ["graphic design", "photoshop", "illustrator"]
    },
    {
        title: "Video Editor",
        description: "Edit and produce video content for various media platforms.",
        skills: [
            { name: "Adobe Premiere Pro", weight: 3, synonyms: ["Premiere", "Video Editing"] },
            { name: "After Effects", weight: 2.5, synonyms: ["Motion Graphics", "VFX"] },
            { name: "Final Cut Pro", weight: 2, synonyms: ["Final Cut"] },
            { name: "Color Grading", weight: 2, synonyms: ["Color Correction"] },
            { name: "Audio Editing", weight: 1.5, synonyms: ["Sound Design"] }
        ],
        interests: [
            { name: "Video Production", weight: 3, synonyms: ["Video", "Film"] },
            { name: "Creative Arts", weight: 2.5, synonyms: ["Creativity", "Art"] },
            { name: "Storytelling", weight: 2, synonyms: ["Narrative", "Content"] }
        ],
        courses: [
            { title: "Video Editing with Premiere Pro", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 35000, max: 80000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Media", "Entertainment", "Marketing"],
        experienceLevel: "All",
        tags: ["video editing", "premiere pro", "after effects"]
    },

    // Business & Management
    {
        title: "Product Manager",
        description: "Lead product development from conception to launch.",
        skills: [
            { name: "Product Strategy", weight: 3, synonyms: ["Strategy", "Product Planning"] },
            { name: "Agile", weight: 2.5, synonyms: ["Scrum", "Sprint Planning"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Metrics"] },
            { name: "Leadership", weight: 2.5, synonyms: ["Team Leadership"] },
            { name: "Market Research", weight: 2, synonyms: ["Research"] }
        ],
        interests: [
            { name: "Product Development", weight: 3, synonyms: ["Product", "Innovation"] },
            { name: "Business Strategy", weight: 2.5, synonyms: ["Business", "Strategy"] },
            { name: "Leadership", weight: 2, synonyms: ["Management"] }
        ],
        courses: [
            { title: "Product Management Fundamentals", difficulty: "Beginner", duration: "5 weeks", priority: 3 }
        ],
        salaryRange: { min: 80000, max: 160000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Technology", "Software", "Startups"],
        experienceLevel: "Mid",
        tags: ["product management", "strategy", "agile"]
    },
    {
        title: "Digital Marketing Manager",
        description: "Develop and execute digital marketing strategies.",
        skills: [
            { name: "SEO", weight: 2.5, synonyms: ["Search Engine Optimization"] },
            { name: "Google Ads", weight: 2.5, synonyms: ["PPC", "Pay Per Click"] },
            { name: "Social Media Marketing", weight: 2.5, synonyms: ["Social Media", "SMM"] },
            { name: "Content Marketing", weight: 2, synonyms: ["Content Strategy"] },
            { name: "Email Marketing", weight: 2, synonyms: ["Email Campaigns"] }
        ],
        interests: [
            { name: "Digital Marketing", weight: 3, synonyms: ["Marketing", "Online Marketing"] },
            { name: "Social Media", weight: 2.5, synonyms: ["Social Networks"] },
            { name: "Business", weight: 2, synonyms: ["Commerce", "Sales"] }
        ],
        courses: [
            { title: "Digital Marketing Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 45000, max: 85000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Marketing", "E-commerce", "Technology"],
        experienceLevel: "All",
        tags: ["digital marketing", "seo", "social media"]
    },
    {
        title: "Business Analyst",
        description: "Analyze business processes and recommend improvements.",
        skills: [
            { name: "Data Analysis", weight: 3, synonyms: ["Analytics", "Business Intelligence"] },
            { name: "Excel", weight: 2.5, synonyms: ["Spreadsheets", "Microsoft Excel"] },
            { name: "SQL", weight: 2, synonyms: ["Database Queries"] },
            { name: "Process Mapping", weight: 2, synonyms: ["Business Process"] },
            { name: "Requirements Gathering", weight: 2.5, synonyms: ["Analysis"] }
        ],
        interests: [
            { name: "Business Analysis", weight: 3, synonyms: ["Business", "Analysis"] },
            { name: "Problem Solving", weight: 2.5, synonyms: ["Logic", "Critical Thinking"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Data", "Analytics"] }
        ],
        courses: [
            { title: "Business Analysis Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 55000, max: 95000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Business", "Finance", "Technology"],
        experienceLevel: "All",
        tags: ["business analysis", "data analysis", "excel"]
    },

    // Healthcare & Life Sciences
    {
        title: "Health Informatics Specialist",
        description: "Manage healthcare data and technology systems.",
        skills: [
            { name: "Healthcare Systems", weight: 3, synonyms: ["EMR", "EHR", "Medical Records"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Healthcare Analytics"] },
            { name: "HIPAA Compliance", weight: 2.5, synonyms: ["Healthcare Privacy"] },
            { name: "Database Management", weight: 2, synonyms: ["SQL", "Database"] },
            { name: "Healthcare Workflow", weight: 2, synonyms: ["Clinical Processes"] }
        ],
        interests: [
            { name: "Healthcare", weight: 3, synonyms: ["Medical", "Health"] },
            { name: "Technology", weight: 2.5, synonyms: ["IT", "Systems"] },
            { name: "Data Management", weight: 2, synonyms: ["Data", "Information"] }
        ],
        courses: [
            { title: "Healthcare Informatics Basics", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 60000, max: 100000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Healthcare", "Technology", "Government"],
        experienceLevel: "Mid",
        tags: ["health informatics", "healthcare", "data"]
    },
    {
        title: "Biomedical Engineer",
        description: "Design and develop medical devices and equipment.",
        skills: [
            { name: "Biomedical Engineering", weight: 3, synonyms: ["Medical Engineering"] },
            { name: "CAD Software", weight: 2.5, synonyms: ["SolidWorks", "AutoCAD"] },
            { name: "Medical Device Design", weight: 2.5, synonyms: ["Device Development"] },
            { name: "FDA Regulations", weight: 2, synonyms: ["Medical Regulations"] },
            { name: "MATLAB", weight: 2, synonyms: ["Technical Computing"] }
        ],
        interests: [
            { name: "Engineering", weight: 3, synonyms: ["Technical Design"] },
            { name: "Healthcare", weight: 2.5, synonyms: ["Medical", "Health"] },
            { name: "Innovation", weight: 2, synonyms: ["Technology", "Research"] }
        ],
        courses: [
            { title: "Biomedical Engineering Fundamentals", difficulty: "Advanced", duration: "12 weeks", priority: 3 }
        ],
        salaryRange: { min: 65000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Healthcare", "Medical Devices", "Research"],
        experienceLevel: "Mid",
        tags: ["biomedical engineering", "medical devices", "cad"]
    },

    // Education & Training
    {
        title: "Instructional Designer",
        description: "Design educational curricula and training programs.",
        skills: [
            { name: "Learning Design", weight: 3, synonyms: ["Curriculum Design", "Educational Design"] },
            { name: "E-Learning Tools", weight: 2.5, synonyms: ["LMS", "Online Learning"] },
            { name: "Adult Learning Theory", weight: 2.5, synonyms: ["Pedagogy", "Learning Theory"] },
            { name: "Content Development", weight: 2, synonyms: ["Course Creation"] },
            { name: "Assessment Design", weight: 2, synonyms: ["Evaluation", "Testing"] }
        ],
        interests: [
            { name: "Education", weight: 3, synonyms: ["Teaching", "Learning"] },
            { name: "Training", weight: 2.5, synonyms: ["Professional Development"] },
            { name: "Content Creation", weight: 2, synonyms: ["Writing", "Development"] }
        ],
        courses: [
            { title: "Instructional Design Principles", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 50000, max: 85000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Education", "Corporate Training", "E-Learning"],
        experienceLevel: "All",
        tags: ["instructional design", "education", "training"]
    },
    {
        title: "Technical Writer",
        description: "Create documentation and instructional materials for technical products.",
        skills: [
            { name: "Technical Writing", weight: 3, synonyms: ["Documentation", "Writing"] },
            { name: "Content Management", weight: 2.5, synonyms: ["CMS", "Documentation Tools"] },
            { name: "API Documentation", weight: 2, synonyms: ["Developer Documentation"] },
            { name: "User Manuals", weight: 2, synonyms: ["Instructions", "Guides"] },
            { name: "Markdown", weight: 1.5, synonyms: ["Documentation Markup"] }
        ],
        interests: [
            { name: "Technical Writing", weight: 3, synonyms: ["Writing", "Documentation"] },
            { name: "Technology", weight: 2.5, synonyms: ["Tech", "Software"] },
            { name: "Communication", weight: 2, synonyms: ["Clear Communication"] }
        ],
        courses: [
            { title: "Technical Writing Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 45000, max: 80000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Software", "Documentation"],
        experienceLevel: "All",
        tags: ["technical writing", "documentation", "content"]
    },

    // Finance & Accounting
    {
        title: "Financial Analyst",
        description: "Analyze financial data to support business decisions.",
        skills: [
            { name: "Financial Modeling", weight: 3, synonyms: ["Excel Modeling", "Financial Analysis"] },
            { name: "Excel", weight: 2.5, synonyms: ["Spreadsheets", "Advanced Excel"] },
            { name: "Financial Reporting", weight: 2.5, synonyms: ["Reports", "Financial Statements"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Analytics", "Statistics"] },
            { name: "PowerBI", weight: 2, synonyms: ["Business Intelligence", "BI"] }
        ],
        interests: [
            { name: "Finance", weight: 3, synonyms: ["Financial Analysis", "Money"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Analytics", "Numbers"] },
            { name: "Business", weight: 2, synonyms: ["Corporate", "Investment"] }
        ],
        courses: [
            { title: "Financial Analysis Fundamentals", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 55000, max: 95000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Finance", "Banking", "Investment"],
        experienceLevel: "All",
        tags: ["financial analysis", "excel", "modeling"]
    },
    {
        title: "Blockchain Developer",
        description: "Develop decentralized applications and blockchain solutions.",
        skills: [
            { name: "Solidity", weight: 3, synonyms: ["Smart Contracts", "Ethereum"] },
            { name: "Blockchain", weight: 3, synonyms: ["Distributed Ledger", "Cryptocurrency"] },
            { name: "Web3", weight: 2.5, synonyms: ["Decentralized Web", "DApps"] },
            { name: "JavaScript", weight: 2, synonyms: ["JS", "Node.js"] },
            { name: "Cryptography", weight: 2, synonyms: ["Encryption", "Security"] }
        ],
        interests: [
            { name: "Blockchain", weight: 3, synonyms: ["Cryptocurrency", "Decentralization"] },
            { name: "Programming", weight: 2.5, synonyms: ["Coding", "Development"] },
            { name: "Finance", weight: 2, synonyms: ["FinTech", "Digital Currency"] }
        ],
        courses: [
            { title: "Blockchain Development with Solidity", difficulty: "Advanced", duration: "10 weeks", priority: 3 }
        ],
        salaryRange: { min: 80000, max: 150000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["Blockchain", "FinTech", "Technology"],
        experienceLevel: "Mid",
        tags: ["blockchain", "solidity", "cryptocurrency"]
    },

    // Sales & Customer Service
    {
        title: "Sales Representative",
        description: "Sell products or services to customers and businesses.",
        skills: [
            { name: "Sales Techniques", weight: 3, synonyms: ["Selling", "Sales Process"] },
            { name: "Customer Relationship Management", weight: 2.5, synonyms: ["CRM", "Customer Relations"] },
            { name: "Negotiation", weight: 2.5, synonyms: ["Deal Making", "Persuasion"] },
            { name: "Communication", weight: 2.5, synonyms: ["Interpersonal Skills"] },
            { name: "Lead Generation", weight: 2, synonyms: ["Prospecting", "Business Development"] }
        ],
        interests: [
            { name: "Sales", weight: 3, synonyms: ["Selling", "Business Development"] },
            { name: "Customer Service", weight: 2.5, synonyms: ["Customer Relations", "Support"] },
            { name: "Business", weight: 2, synonyms: ["Commerce", "Revenue"] }
        ],
        courses: [
            { title: "Sales Fundamentals", difficulty: "Beginner", duration: "3 weeks", priority: 3 }
        ],
        salaryRange: { min: 35000, max: 100000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Sales", "Retail", "B2B"],
        experienceLevel: "All",
        tags: ["sales", "customer service", "crm"]
    },
    {
        title: "Customer Success Manager",
        description: "Ensure customer satisfaction and drive product adoption.",
        skills: [
            { name: "Customer Success", weight: 3, synonyms: ["Customer Management", "Account Management"] },
            { name: "Communication", weight: 2.5, synonyms: ["Interpersonal Skills", "Client Relations"] },
            { name: "Problem Solving", weight: 2.5, synonyms: ["Issue Resolution", "Critical Thinking"] },
            { name: "CRM Software", weight: 2, synonyms: ["Salesforce", "HubSpot"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Customer Analytics", "Metrics"] }
        ],
        interests: [
            { name: "Customer Service", weight: 3, synonyms: ["Customer Relations", "Support"] },
            { name: "Business", weight: 2.5, synonyms: ["Account Management", "Revenue"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Issue Resolution"] }
        ],
        courses: [
            { title: "Customer Success Management", difficulty: "Intermediate", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 50000, max: 90000, currency: "USD" },
        jobOutlook: "Excellent",
        industry: ["SaaS", "Technology", "Business Services"],
        experienceLevel: "All",
        tags: ["customer success", "account management", "saas"]
    },

    // Creative & Media
    {
        title: "Social Media Manager",
        description: "Manage and grow brand presence across social media platforms.",
        skills: [
            { name: "Social Media Strategy", weight: 3, synonyms: ["Social Strategy", "Content Strategy"] },
            { name: "Content Creation", weight: 2.5, synonyms: ["Content Development", "Creative Content"] },
            { name: "Community Management", weight: 2.5, synonyms: ["Community Building", "Engagement"] },
            { name: "Analytics", weight: 2, synonyms: ["Social Media Analytics", "Metrics"] },
            { name: "Graphic Design", weight: 2, synonyms: ["Visual Content", "Design"] }
        ],
        interests: [
            { name: "Social Media", weight: 3, synonyms: ["Social Networks", "Online Communities"] },
            { name: "Marketing", weight: 2.5, synonyms: ["Digital Marketing", "Brand Building"] },
            { name: "Creative Arts", weight: 2, synonyms: ["Creativity", "Content Creation"] }
        ],
        courses: [
            { title: "Social Media Marketing", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 40000, max: 70000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Marketing", "Social Media", "Digital"],
        experienceLevel: "All",
        tags: ["social media", "marketing", "content creation"]
    },
    {
        title: "Content Creator",
        description: "Produce engaging content for various digital platforms.",
        skills: [
            { name: "Content Writing", weight: 3, synonyms: ["Writing", "Copywriting"] },
            { name: "Video Production", weight: 2.5, synonyms: ["Video Creation", "Filming"] },
            { name: "Photography", weight: 2, synonyms: ["Photo Editing", "Visual Content"] },
            { name: "SEO", weight: 2, synonyms: ["Search Optimization", "Content SEO"] },
            { name: "Social Media", weight: 2, synonyms: ["Platform Management"] }
        ],
        interests: [
            { name: "Content Creation", weight: 3, synonyms: ["Creative Writing", "Media Production"] },
            { name: "Creative Arts", weight: 2.5, synonyms: ["Art", "Creativity"] },
            { name: "Digital Media", weight: 2, synonyms: ["Online Content", "Digital"] }
        ],
        courses: [
            { title: "Content Creation Mastery", difficulty: "Beginner", duration: "5 weeks", priority: 3 }
        ],
        salaryRange: { min: 35000, max: 75000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Media", "Marketing", "Entertainment"],
        experienceLevel: "All",
        tags: ["content creation", "writing", "video"]
    },

    // Operations & Logistics
    {
        title: "Supply Chain Analyst",
        description: "Optimize supply chain operations and logistics processes.",
        skills: [
            { name: "Supply Chain Management", weight: 3, synonyms: ["Logistics", "Operations"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Analytics", "Business Intelligence"] },
            { name: "Excel", weight: 2.5, synonyms: ["Spreadsheet Analysis", "Data Modeling"] },
            { name: "Inventory Management", weight: 2, synonyms: ["Stock Management", "Warehouse"] },
            { name: "Process Improvement", weight: 2, synonyms: ["Optimization", "Lean"] }
        ],
        interests: [
            { name: "Supply Chain", weight: 3, synonyms: ["Logistics", "Operations"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Analytics", "Problem Solving"] },
            { name: "Business Operations", weight: 2, synonyms: ["Operations", "Management"] }
        ],
        courses: [
            { title: "Supply Chain Management Basics", difficulty: "Intermediate", duration: "6 weeks", priority: 3 }
        ],
        salaryRange: { min: 50000, max: 85000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Manufacturing", "Retail", "Logistics"],
        experienceLevel: "All",
        tags: ["supply chain", "logistics", "operations"]
    },
    {
        title: "Project Manager",
        description: "Plan, execute, and deliver projects on time and within budget.",
        skills: [
            { name: "Project Management", weight: 3, synonyms: ["PM", "Project Planning"] },
            { name: "Agile", weight: 2.5, synonyms: ["Scrum", "Kanban"] },
            { name: "Leadership", weight: 2.5, synonyms: ["Team Management", "People Management"] },
            { name: "Risk Management", weight: 2, synonyms: ["Risk Assessment", "Mitigation"] },
            { name: "Stakeholder Management", weight: 2, synonyms: ["Communication", "Coordination"] }
        ],
        interests: [
            { name: "Project Management", weight: 3, synonyms: ["Planning", "Organization"] },
            { name: "Leadership", weight: 2.5, synonyms: ["Management", "Team Building"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Critical Thinking", "Analysis"] }
        ],
        courses: [
            { title: "Project Management Fundamentals", difficulty: "Beginner", duration: "5 weeks", priority: 3 }
        ],
        salaryRange: { min: 60000, max: 110000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Construction", "Business"],
        experienceLevel: "Mid",
        tags: ["project management", "agile", "leadership"]
    },

    // Research & Development
    {
        title: "Research Scientist",
        description: "Conduct scientific research and develop new technologies.",
        skills: [
            { name: "Research Methodology", weight: 3, synonyms: ["Scientific Method", "Research Design"] },
            { name: "Data Analysis", weight: 2.5, synonyms: ["Statistical Analysis", "Analytics"] },
            { name: "Scientific Writing", weight: 2.5, synonyms: ["Research Papers", "Publications"] },
            { name: "Laboratory Skills", weight: 2, synonyms: ["Lab Techniques", "Experimentation"] },
            { name: "Statistical Software", weight: 2, synonyms: ["SPSS", "R", "SAS"] }
        ],
        interests: [
            { name: "Research", weight: 3, synonyms: ["Scientific Research", "Investigation"] },
            { name: "Science", weight: 2.5, synonyms: ["Scientific Discovery", "Innovation"] },
            { name: "Data Analysis", weight: 2, synonyms: ["Statistics", "Analytics"] }
        ],
        courses: [
            { title: "Research Methods in Science", difficulty: "Advanced", duration: "8 weeks", priority: 3 }
        ],
        salaryRange: { min: 60000, max: 120000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Research", "Pharmaceuticals", "Academia"],
        experienceLevel: "Senior",
        tags: ["research", "science", "data analysis"]
    },
    {
        title: "Quality Assurance Engineer",
        description: "Test software and systems to ensure quality and reliability.",
        skills: [
            { name: "Software Testing", weight: 3, synonyms: ["QA Testing", "Quality Testing"] },
            { name: "Test Automation", weight: 2.5, synonyms: ["Automation Testing", "Selenium"] },
            { name: "Bug Tracking", weight: 2, synonyms: ["Defect Management", "JIRA"] },
            { name: "Test Planning", weight: 2, synonyms: ["Test Strategy", "Test Design"] },
            { name: "API Testing", weight: 2, synonyms: ["Service Testing", "Integration Testing"] }
        ],
        interests: [
            { name: "Quality Assurance", weight: 3, synonyms: ["QA", "Testing"] },
            { name: "Technology", weight: 2.5, synonyms: ["Software", "Systems"] },
            { name: "Problem Solving", weight: 2, synonyms: ["Debugging", "Analysis"] }
        ],
        courses: [
            { title: "Software Testing Fundamentals", difficulty: "Beginner", duration: "4 weeks", priority: 3 }
        ],
        salaryRange: { min: 50000, max: 90000, currency: "USD" },
        jobOutlook: "Good",
        industry: ["Technology", "Software", "Quality"],
        experienceLevel: "All",
        tags: ["qa", "testing", "software quality"]
    }
];

async function seedExpandedCareerData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://techpreneurs:0YALLxdc43qDxyRn@techpreneurs.rsutrrl.mongodb.net/');
        console.log('Connected to MongoDB');

        // Clear existing career data
        await Career.deleteMany({});
        console.log('Cleared existing career data');

        // Insert expanded career data
        const insertedCareers = await Career.insertMany(expandedCareers);
        console.log(`Inserted ${insertedCareers.length} expanded career records`);

        // Create relationships between related careers
        for (let i = 0; i < insertedCareers.length; i++) {
            const career = insertedCareers[i];
            const relatedCareers = [];

            // Add logic to find related careers based on similar skills/interests
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

            // Update career with related careers (limit to 4)
            await Career.findByIdAndUpdate(career._id, {
                relatedCareers: relatedCareers.slice(0, 4)
            });
        }

        console.log('Updated career relationships');
        console.log('Expanded career data seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding expanded career data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedExpandedCareerData();
}

module.exports = { seedExpandedCareerData, expandedCareers };
