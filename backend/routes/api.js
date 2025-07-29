/**
 * API routes for general API access
 * These routes serve as fallbacks for other more specific routes
 */
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

// Get career paths - public route
router.get('/career-paths', apiController.getCareerPaths);

// Get career recommendations - public route
router.post('/recommendations', apiController.getRecommendations);

// User-specific routes (require auth)
router.get('/user/career-profile', auth, apiController.getUserCareerProfile);
router.post('/user/career-profile', auth, apiController.updateUserCareerProfile);

module.exports = router;
