const express = require('express');
const router = express.Router();

// Example GET route for opportunities
router.get('/', (req, res) => {
  res.json({ message: 'Opportunities route is working!' });
});

module.exports = router;