const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');

// Get all approved opportunities for users
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { status: 'approved' };
    if (type) filter.type = type;
    
    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ 
      _id: req.params.id, 
      status: 'approved' 
    });
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;