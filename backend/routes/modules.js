const express = require('express');
const router = express.Router();

// Example GET route for modules
router.get('/', (req, res) => {
  res.json({ message: 'Modules route is working!' });
});

module.exports = router;