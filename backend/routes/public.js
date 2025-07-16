const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');

// Public GET: get all approved mentors
router.get('/mentors', async (req, res) => {
  const mentors = await Mentor.find({ status: 'approved' });
  res.json(mentors);
});

module.exports = router;