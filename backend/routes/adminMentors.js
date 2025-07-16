const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create mentor with file upload
router.post('/', adminAuth, upload.single('avatar'), async (req, res) => {
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);
  try {
    const mentor = new Mentor({
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      readMoreLink: req.body.readMoreLink,
      calendarLink: req.body.calendarLink,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      avatar: req.file ? `/uploads/${req.file.filename}` : undefined,
      status: 'approved'
    });
    await mentor.save();
    res.json({ success: true, mentor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit mentor
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, mentor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all approved mentors
router.get('/', adminAuth, async (req, res) => {
  const mentors = await Mentor.find({});
  console.log('ALL mentors:', mentors);
  res.json(mentors);
});


module.exports = router;