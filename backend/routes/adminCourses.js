const express = require('express');
const router = express.Router();
const multer = require('multer');
const Course = require('../models/Course');
const adminAuth = require('../middleware/adminAuth');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'courses');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Get all courses (for admin panel)
router.get('/', adminAuth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all courses
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a course
router.post('/', adminAuth, upload.fields([
  { name: 'materials', maxCount: 1000 },
  { name: 'quiz', maxCount: 10 }
]), async (req, res) => {
  try {
    const materials = (req.files['materials'] || []).map(f => '/uploads/courses/' + f.filename);
    const quiz = req.files['quiz'] ? '/uploads/courses/' + req.files['quiz'][0].filename : null;
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      price: req.body.price,
      materials,
      quiz,
      visibility: req.body.visibility,
      enrollment: req.body.enrollment,
      certification: req.body.certification
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a course
router.put('/:id', adminAuth, upload.fields([
  { name: 'materials', maxCount: 10 },
  { name: 'quiz', maxCount: 1 }
]), async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      price: req.body.price,
      visibility: req.body.visibility,
      enrollment: req.body.enrollment,
      certification: req.body.certification
    };
    if (req.files['materials']) {
      update.materials = req.files['materials'].map(f => '/uploads/courses/' + f.filename);
    }
    if (req.files['quiz']) {
      update.quiz = '/uploads/courses/' + req.files['quiz'][0].filename;
    }
    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a course
router.delete('/:id', adminAuth, async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;