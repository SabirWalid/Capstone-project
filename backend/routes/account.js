const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get user profile (for demo, userId from query)
router.get('/profile', async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, user });
});

// Update user profile (with optional profile picture)
router.post('/profile', upload.single('profilePicture'), async (req, res) => {
  const { userId, name, email, phone, timeZone, language, links } = req.body;
  let update = { name, email, phone, timeZone, language };
  if (links) {
    if (typeof links === 'string') {
      update.links = links.split(',').map(l => l.trim()).filter(Boolean);
    } else {
      update.links = Array.isArray(links) ? links : [links];
    }
  }
  if (req.file) update.profilePicture = '/uploads/' + req.file.filename;
  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;