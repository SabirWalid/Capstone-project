const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const adminAuth = require('../middleware/adminAuth');

// Create Opportunity (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, category, deadline, link, type } = req.body;
    const opportunity = await Opportunity.create({ title, description, category, deadline, link, type });
    res.json({ success: true, opportunity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Opportunities (with optional type filter)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const opportunities = await Opportunity.find(filter).sort({ deadline: 1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Not found' });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Opportunity (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, category, deadline, link, type } = req.body;
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { title, description, category, deadline, link, type },
      { new: true }
    );
    res.json({ success: true, opportunity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Opportunity (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pending opportunities
router.get('/pending', adminAuth, async (req, res) => {
  const pending = await Opportunity.find({ status: 'pending' }).populate('mentor');
  res.json(pending);
});

// Approve opportunity
router.put('/:id/approve', adminAuth, async (req, res) => {
  const opp = await Opportunity.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  res.json(opp);
});

// Reject opportunity
router.put('/:id/reject', adminAuth, async (req, res) => {
  const opp = await Opportunity.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  res.json(opp);
});
// Delete opportunity
router.delete('/:id', adminAuth, async (req, res) => {
  await Opportunity.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get all approved opportunities (for user site)
router.get('/', async (req, res) => {
  const approved = await Opportunity.find({ status: 'approved' });
  res.json(approved);
});

module.exports = router;