const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all public courses
router.get('/', async (req, res) => {
  try {
    // Only show courses with visibility 'public'
    const courses = await Course.find({ visibility: 'public' });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single course by ID (optional)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.visibility !== 'public') {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;