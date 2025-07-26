const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hash, role });
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', {
      email: req.body.email,
      hasPassword: !!req.body.password,
      body: req.body
    });

    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        success: false
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({
        error: 'Invalid credentials',
        success: false
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({
        error: 'Invalid credentials',
        success: false
      });
    }

    // Success - create user object without sensitive data
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
});

module.exports = router;