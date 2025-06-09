const express = require('express');
const router = express.Router();

// Example GET route for mentorship
router.get('/', (req, res) => {
  res.json({ message: 'Mentorship route is working!' });
});

module.exports = router;