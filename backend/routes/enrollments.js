const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');

// Sync enrollments
router.post('/sync-enrollments', async (req, res) => {
  const { enrollments } = req.body;
  if (!Array.isArray(enrollments)) return res.status(400).json({ success: false, error: 'Invalid enrollments array' });
  try {
    for (const e of enrollments) {
      // Avoid duplicates by title and time
      const exists = await Enrollment.findOne({ title: e.title, time: e.time });
      if (!exists) {
        await Enrollment.create(e);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all enrollments
router.get('/', async (req, res) => {
  const all = await Enrollment.find();
  res.json(all);
});

module.exports = router;