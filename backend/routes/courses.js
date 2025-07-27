const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// --- ADMIN ROUTES ---
// These should be protected by admin auth middleware in production

// Get all courses (admin)
router.get('/admin', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// Get a single course by ID (must be after /admin to avoid conflict)
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

// Get a single course by ID (admin)
router.get('/admin/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new course (admin)
router.post('/admin', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a course (admin)
router.put('/admin/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a course (admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;