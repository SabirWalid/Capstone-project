const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Admin Registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
  try {
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed }); // <-- FIXED
    res.json({ success: true, admin: { name: admin.name, email: admin.email, _id: admin._id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ success: true, token });
});

module.exports = router;