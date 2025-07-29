/**
 * This file adds the same test route to the /api/career path 
 * to match frontend expectations
 */
const express = require('express');
const router = express.Router();
const careerTestRouter = require('./careerTest'); // Import the career test router

// Forward /test requests to the careerTest router's /test endpoint
router.post('/test', (req, res, next) => {
    console.log('Career test route forwarded from /api/career/test');
    careerTestRouter.handle(req, res, next);
});

// Forward /history requests to the careerTest router's /history endpoint
router.post('/history', (req, res, next) => {
    console.log('Career history route forwarded from /api/career/history');
    careerTestRouter.handle(req, res, next);
});

module.exports = router;
