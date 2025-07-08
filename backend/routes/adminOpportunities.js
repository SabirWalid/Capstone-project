const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const adminAuth = require('../middleware/adminAuth');

console.log("adminOpportunities.js loaded");

// Create Opportunity (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, category, deadline, link, type } = req.body;
    const opportunity = await Opportunity.create({
      title,
      description,
      category,
      deadline,
      link,
      type,
      status: 'pending' // This is important!
    });
    res.json({ success: true, opportunity });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all pending opportunities/resources
router.get('/opportunities/pending', adminAuth, async (req, res) => {
  const opps = await Opportunity.find({ status: 'pending' }).populate('mentor');
  res.json(opps);
});
router.put('/opportunities/:id/approve', adminAuth, async (req, res) => {
  const opp = await Opportunity.findByIdAndUpdate(req.params.id, { status: 'approved', adminNote: '' }, { new: true });
  res.json(opp);
});
router.put('/opportunities/:id/reject', adminAuth, async (req, res) => {
  const opp = await Opportunity.findByIdAndUpdate(req.params.id, { status: 'rejected', adminNote: req.body.adminNote || '' }, { new: true });
  res.json(opp);
});
router.delete('/opportunities/:id', adminAuth, async (req, res) => {
  await Opportunity.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
router.put('/opportunities/:id', adminAuth, async (req, res) => {
  const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(opp);
});

// Get all approved opportunities (for user site)
router.get('/', async (req, res) => {
  const approved = await Opportunity.find({ status: 'approved' });
  res.json(approved);
});

module.exports = router;