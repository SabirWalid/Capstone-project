const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const adminAuth = require('../middleware/adminAuth');

router.get('/resources/pending', adminAuth, async (req, res) => {
  const resources = await Resource.find({ status: 'pending' }).populate('mentor');
  res.json(resources);
});
router.put('/resources/:id/approve', adminAuth, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, { status: 'approved', adminNote: '' }, { new: true });
  res.json(resource);
});
router.put('/resources/:id/reject', adminAuth, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, { status: 'rejected', adminNote: req.body.adminNote || '' }, { new: true });
  res.json(resource);
});
router.delete('/resources/:id', adminAuth, async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
router.put('/resources/:id', adminAuth, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(resource);
});

module.exports = router;