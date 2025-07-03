const express = require('express');
const router = express.Router();

// In-memory notifications store (replace with DB in production)
const userNotifications = {}; // { userId: [ { message, time } ] }

// Add a notification for a user
router.post('/add', (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });
  if (!userNotifications[userId]) userNotifications[userId] = [];
  userNotifications[userId].unshift({ message, time: new Date().toLocaleString() });
  res.json({ success: true });
});

// Get notifications for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ notifications: userNotifications[userId] || [] });
});

// (Optional) Mark all as read (clear notifications)
router.post('/clear', (req, res) => {
  const { userId } = req.body;
  userNotifications[userId] = [];
  res.json({ success: true });
});

module.exports = router;