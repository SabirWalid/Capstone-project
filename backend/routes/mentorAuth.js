const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mentor = require('../models/Mentor');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const cors = require('cors');


// Middleware to enable CORS
router.use(cors());


// Mentor Registration
router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await Mentor.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const mentor = new Mentor({ name, email, password });
    await mentor.save();
    res.json({ message: 'Mentor registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active mentors
router.get('/mentors', async (req, res) => {
  try {
    const { expertise, availability, search } = req.query;
    const filter = { status: 'active' };

    // Apply filters
    if (expertise) {
      filter.expertise = { $in: expertise.split(',') };
    }
    if (availability) {
      filter.availability = availability;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { expertise: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await Mentor.find(filter)
      .select('name avatar bio expertise availability rating company position socialLinks')
      .sort({ rating: -1 })
      .lean();

    // Get mentorship stats for each mentor
    const mentorsWithStats = await Promise.all(mentors.map(async (mentor) => {
      const menteeCount = await MentorBooking.countDocuments({ 
        mentor: mentor._id,
        status: 'completed'
      });
      const reviewCount = await Review.countDocuments({ mentor: mentor._id });
      
      return {
        ...mentor,
        stats: {
          menteeCount,
          reviewCount
        }
      };
    }));

    res.json({
      mentors: mentorsWithStats,
      total: mentorsWithStats.length,
      filters: { expertise, availability, search }
    });
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Mentor Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const mentor = await Mentor.findOne({ email });
    if (!mentor) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await mentor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: mentor._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.json({ token, mentor: { id: mentor._id, name: mentor.name, email: mentor.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;