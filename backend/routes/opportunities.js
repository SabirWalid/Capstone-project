const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');

// Get all approved opportunities for users
router.get('/', async (req, res) => {
  try {
    const { type, search, category, location } = req.query;
    const filter = { status: 'approved' };
    
    // Apply filters
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    const opportunities = await Opportunity.find(filter)
      .populate('mentor', 'name avatar company position')
      .sort({ createdAt: -1 })
      .lean();

    // Add application counts
    const opportunitiesWithCounts = await Promise.all(opportunities.map(async (opp) => {
      const applicationCount = await Application.countDocuments({ opportunity: opp._id });
      return { ...opp, applicationCount };
    }));

    res.json({
      opportunities: opportunitiesWithCounts,
      total: opportunitiesWithCounts.length,
      filters: { type, search, category, location }
    });
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