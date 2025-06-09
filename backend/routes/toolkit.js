const express = require('express');
const router = express.Router();

// Example GET route for toolkit
router.get('/', (req, res) => {
  res.json({ message: 'Toolkit route is working!' });
});

module.exports = router;