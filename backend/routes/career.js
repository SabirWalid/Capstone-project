const express = require('express');
const router = express.Router();

// Career mapping array
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

// Matching logic
router.post('/test', (req, res) => {
  const { skills = [], interests = [] } = req.body;
  // Normalizing input for case-insensitive matching
  const userSkills = skills.map(s => s.trim().toLowerCase());
  const userInterests = interests.map(i => i.trim().toLowerCase());

  // Score each career path
  const results = careerMapping.map(career => {
    const skillMatches = career.skills.filter(skill => userSkills.includes(skill.toLowerCase())).length;
    const interestMatches = career.interests.filter(interest => userInterests.includes(interest.toLowerCase())).length;
    const score = skillMatches + interestMatches;
    return { ...career, score };
  });

  // Sort by score, highest first
  results.sort((a, b) => b.score - a.score);

  // Return top 3 matches with score > 0
  const topMatches = results.filter(r => r.score > 0).slice(0, 3);

  if (topMatches.length > 0) {
    res.json({ matches: topMatches });
  } else {
    res.json({ matches: [] });
  }
});

module.exports = router;