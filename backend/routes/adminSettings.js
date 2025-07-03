const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const adminAuth = require('../middleware/adminAuth');

// Get all settings
router.get('/', adminAuth, async (req, res) => {
  const settings = await Setting.find();
  res.json(settings);
});

// Update a setting
router.post('/', adminAuth, async (req, res) => {
  const { key, value } = req.body;
  const setting = await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  res.json(setting);
});

module.exports = router;