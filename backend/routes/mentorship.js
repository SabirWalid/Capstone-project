const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Opportunity = require('../models/Opportunity');
const mentorAuth = require('../middleware/mentorAuth'); // implement as needed

// Get mentor profile
router.get('/mentors', mentorAuth, async (req, res) => {
  const mentor = await Mentor.findById(req.mentor.id);
  res.json(mentor);
});

// Update mentor profile
router.put('/profile', mentorAuth, async (req, res) => {
  const { name, bio, avatar, socialLinks, workLinks, calendarLink } = req.body;
  const mentor = await Mentor.findByIdAndUpdate(
    req.mentor.id,
    { name, bio, avatar, socialLinks, workLinks, calendarLink },
    { new: true }
  );
  res.json(mentor);
});

// Mentor adds/edits opportunity (always status: pending)
router.post('/opportunities', mentorAuth, async (req, res) => {
  const { title, description, category, deadline, link, type } = req.body;
  const opportunity = await Opportunity.create({
    title, description, category, deadline, link, type,
    mentor: req.mentor.id,
    status: 'pending'
  });
  res.json(opportunity);
});

router.put('/opportunities/:id', mentorAuth, async (req, res) => {
  const { title, description, category, deadline, link, type } = req.body;
  const opportunity = await Opportunity.findOneAndUpdate(
    { _id: req.params.id, mentor: req.mentor.id },
    { title, description, category, deadline, link, type, status: 'pending' },
    { new: true }
  );
  res.json(opportunity);
});

// Mentor sees their own opportunities
router.get('/opportunities', mentorAuth, async (req, res) => {
  const opportunities = await Opportunity.find({ mentor: req.mentor.id });
  res.json(opportunities);
});

module.exports = router;