const express = require('express');
const router = express.Router();

// Dummy AI logic
router.post('/test', (req, res) => {
  const { skills, interests } = req.body;
  // Simple logic, replace with real AI or API
  if (skills.includes('coding')) {
    res.json({ path: 'Technical', suggestion: 'Web Developer' });
  } else if (interests.includes('business')) {
    res.json({ path: 'Entrepreneurial', suggestion: 'Startup Founder' });
  } else {
    res.json({ path: 'General', suggestion: 'Explore more skills' });
  }
});

module.exports = router;