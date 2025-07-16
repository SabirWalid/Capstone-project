const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');

// Get all approved mentors (public)
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find({ status: 'approved' });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Optionally: get a single mentor by id
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor || mentor.status !== 'approved') {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;