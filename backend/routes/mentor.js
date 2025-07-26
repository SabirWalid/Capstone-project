const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const MentorBooking = require('../models/MentorBooking');
const Review = require('../models/Review');

// Get all approved mentors (public)
router.get('/', async (req, res) => {
  try {
    const { expertise, availability, search, sort = 'rating' } = req.query;
    const filter = { status: 'approved' };

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

    // Sort options
    const sortOptions = {};
    switch (sort) {
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'experience':
        sortOptions.yearsOfExperience = -1;
        break;
      case 'availability':
        sortOptions.availabilityScore = -1;
        break;
      default:
        sortOptions.rating = -1;
    }

    const mentors = await Mentor.find(filter)
      .select('name avatar bio expertise availability rating company position socialLinks languages timezone')
      .sort(sortOptions);

    // Enhance mentor data with stats
    const mentorsWithStats = await Promise.all(mentors.map(async (mentor) => {
      const [bookings, reviews] = await Promise.all([
        MentorBooking.countDocuments({ mentor: mentor._id, status: 'completed' }),
        Review.find({ mentor: mentor._id }).select('rating comment')
      ]);

      const mentorObj = mentor.toObject();
      return {
        ...mentorObj,
        stats: {
          totalMentees: bookings,
          reviews: reviews.length,
          averageRating: reviews.reduce((acc, rev) => acc + rev.rating, 0) / (reviews.length || 1)
        }
      };
    }));

    res.json({
      success: true,
      data: mentorsWithStats,
      total: mentorsWithStats.length,
      filters: { expertise, availability, search, sort }
    });
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Optionally: get a single mentor by id
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor || mentor.status !== 'approved') {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;