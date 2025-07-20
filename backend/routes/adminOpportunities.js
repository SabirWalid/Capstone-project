const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const adminAuth = require('../middleware/adminAuth');

console.log("adminOpportunities.js loaded");

// Create Opportunity (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Creating opportunity:', req.body);
    const { title, description, category, deadline, link, type } = req.body;
    
    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Title, description, and type are required' });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      category,
      deadline,
      link,
      type,
      status: 'approved' // Set to approved by default for admin-created opportunities
    });
    
    console.log('Opportunity created:', opportunity);
    res.json({ success: true, opportunity });
  } catch (err) {
    console.error('Error creating opportunity:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get ALL opportunities for admin (including filter)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    console.log('Fetching opportunities with filter:', filter);
    
    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${opportunities.length} opportunities`);
    res.json(opportunities);
  } catch (err) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single opportunity
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Opportunity
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Opportunity
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approval routes (for future use)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    );
    res.json(opp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(
      req.params.id, 
      { status: 'rejected', adminNote: req.body.adminNote || '' }, 
      { new: true }
    );
    res.json(opp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;