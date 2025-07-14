const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Opportunity = require('../models/Opportunity');

// Example GET route for admin
router.get('/', (req, res) => {
  res.json({ message: 'Admin route is working!' });
});

router.post("/opportunities", adminAuth, async (req, res) => {
  const opportunity = new Opportunity({
    ...req.body,
    status: "approved" // Admin-created opps are auto-approved
  });
  await opportunity.save();
  res.json(opportunity);
});

// Get pending mentor opportunities
router.get("/mentors/opportunities/pending", adminAuth, async (req, res) => {
  const opps = await Opportunity.find({ status: "pending" }).populate("mentor");
  res.json(opps);
});

// Get pending mentor resources
router.get("/mentors/resources/pending", adminAuth, async (req, res) => {
  const resources = await Resource.find({ status: "pending" }).populate("mentor");
  res.json(resources);
});

// Returns all mentors for admin
router.get('/', adminAuth, async (req, res) => {
  const mentors = await Mentor.find();
  res.json(mentors);
});

module.exports = router;