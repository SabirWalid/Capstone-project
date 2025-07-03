const express = require('express');
const router = express.Router();
const MentorBooking = require('../models/MentorBooking');

// Sync mentor bookings
router.post('/sync-mentor-bookings', async (req, res) => {
  const { bookings } = req.body;
  if (!Array.isArray(bookings)) return res.status(400).json({ success: false, error: 'Invalid bookings array' });
  try {
    for (const b of bookings) {
      // Avoid duplicates by name and time
      const exists = await MentorBooking.findOne({ name: b.name, time: b.time });
      if (!exists) {
        await MentorBooking.create(b);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all mentor bookings
router.get('/mentor-bookings', async (req, res) => {
  const all = await MentorBooking.find();
  res.json(all);
});

module.exports = router;