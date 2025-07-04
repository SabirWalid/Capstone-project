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
router.post('/register', async (req, res) => {
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

// Mentor Login
router.post('/login', async (req, res) => {
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