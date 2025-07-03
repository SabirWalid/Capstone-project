const express = require('express');
const router = express.Router();

// In-memory or DB storage for user progress
const userProgress = {};

router.post('/sync-progress', (req, res) => {
  const { userId, progress } = req.body;
  if (!userProgress[userId]) userProgress[userId] = [];
  progress.forEach(p => {
    const idx = userProgress[userId].findIndex(up => up.courseId === p.courseId);
    if (idx > -1) userProgress[userId][idx] = p;
    else userProgress[userId].push(p);
  });
  res.json({ success: true });
});

module.exports = router;