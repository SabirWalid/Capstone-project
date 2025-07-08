const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const adminAuth = require('../middleware/adminAuth');


// Get all pending mentors
router.get('/opportunities/pending', adminAuth, async (req, res) => {
  const mentors = await Mentor.find({ status: 'pending' });
  res.json(mentors);
});

// Approve/reject/edit/delete mentor
router.put('/opportunities/:id/approve', adminAuth, async (req, res) => {
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, { status: 'approved', adminNote: '' }, { new: true });
  res.json(mentor);
});
router.put('/opportunities/:id/reject', adminAuth, async (req, res) => {
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, { status: 'rejected', adminNote: req.body.adminNote || '' }, { new: true });
  res.json(mentor);
});
router.delete('/opportunities/:id', adminAuth, async (req, res) => {
  await Mentor.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
router.put('/opportunities/:id', adminAuth, async (req, res) => {
  const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(mentor);
});

module.exports = router;