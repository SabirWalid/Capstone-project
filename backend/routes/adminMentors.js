const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const adminAuth = require('../middleware/adminAuth');

// Get all mentors
router.get('/', adminAuth, async (req, res) => {
  const mentors = await Mentor.find();
  res.json(mentors);
});

// Verify mentor
router.post('/:id/verify', adminAuth, async (req, res) => {
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, { status: 'verified' }, { new: true });
  res.json(mentor);
});

// Delete mentor
router.delete('/:id', adminAuth, async (req, res) => {
  await Mentor.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;