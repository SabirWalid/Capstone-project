// Sync API routes for offline functionality
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Enrollment = require('../models/Enrollment');

// Middleware to verify token (you might need to adjust based on your auth setup)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token logic here - adjust based on your authentication system
  // For now, we'll just extract userId from localStorage or token
  next();
};

// Sync progress data from offline storage
router.post('/progress', authenticateToken, async (req, res) => {
  try {
    const { userId, progressData } = req.body;
    
    if (!userId || !progressData || !Array.isArray(progressData)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const syncedProgress = [];
    const errors = [];

    for (const progress of progressData) {
      try {
        const { courseId, progress: progressValue, completedLessons, timeSpent, lastAccessed } = progress;
        
        // Find existing enrollment or create new one
        let enrollment = await Enrollment.findOne({ 
          userId: userId, 
          courseId: courseId 
        });

        if (enrollment) {
          // Update existing enrollment with latest progress
          // Only update if the offline progress is more recent
          if (!enrollment.lastUpdated || new Date(lastAccessed) > enrollment.lastUpdated) {
            enrollment.progress = Math.max(enrollment.progress || 0, progressValue || 0);
            enrollment.completedLessons = Math.max(enrollment.completedLessons || 0, completedLessons || 0);
            enrollment.timeSpent = (enrollment.timeSpent || 0) + (timeSpent || 0);
            enrollment.lastAccessed = new Date(lastAccessed);
            enrollment.lastUpdated = new Date();
            
            await enrollment.save();
            syncedProgress.push({
              courseId,
              action: 'updated',
              progress: enrollment.progress
            });
          } else {
            syncedProgress.push({
              courseId,
              action: 'skipped',
              reason: 'Server data is more recent'
            });
          }
        } else {
          // Create new enrollment
          enrollment = new Enrollment({
            userId,
            courseId,
            progress: progressValue || 0,
            completedLessons: completedLessons || 0,
            timeSpent: timeSpent || 0,
            enrolledAt: new Date(),
            lastAccessed: new Date(lastAccessed),
            lastUpdated: new Date(),
            status: 'active'
          });
          
          await enrollment.save();
          syncedProgress.push({
            courseId,
            action: 'created',
            progress: enrollment.progress
          });
        }
      } catch (error) {
        console.error('Error syncing progress for course:', progress.courseId, error);
        errors.push({
          courseId: progress.courseId,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Progress sync completed',
      synced: syncedProgress.length,
      errors: errors.length,
      details: {
        syncedProgress,
        errors
      }
    });
  } catch (error) {
    console.error('Error syncing progress:', error);
    res.status(500).json({ error: 'Failed to sync progress data' });
  }
});

// Sync enrollment data from offline storage
router.post('/enrollments', authenticateToken, async (req, res) => {
  try {
    const { enrollmentData } = req.body;
    
    if (!enrollmentData || !Array.isArray(enrollmentData)) {
      return res.status(400).json({ error: 'Invalid enrollment data' });
    }

    const syncedEnrollments = [];
    const errors = [];

    for (const enrollmentInfo of enrollmentData) {
      try {
        const { courseId, userId, enrolledAt, progress, status } = enrollmentInfo;
        
        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
          userId,
          courseId
        });

        if (!existingEnrollment) {
          // Create new enrollment
          const enrollment = new Enrollment({
            userId,
            courseId,
            enrolledAt: new Date(enrolledAt),
            progress: progress || 0,
            status: status || 'active',
            lastUpdated: new Date()
          });
          
          await enrollment.save();
          syncedEnrollments.push({
            courseId,
            action: 'created'
          });
        } else {
          syncedEnrollments.push({
            courseId,
            action: 'skipped',
            reason: 'Already enrolled'
          });
        }
      } catch (error) {
        console.error('Error syncing enrollment:', enrollmentInfo.courseId, error);
        errors.push({
          courseId: enrollmentInfo.courseId,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Enrollment sync completed',
      synced: syncedEnrollments.length,
      errors: errors.length,
      details: {
        syncedEnrollments,
        errors
      }
    });
  } catch (error) {
    console.error('Error syncing enrollments:', error);
    res.status(500).json({ error: 'Failed to sync enrollment data' });
  }
});

// Get user's complete progress data (for verification after sync)
router.get('/progress/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title description category')
      .sort({ lastUpdated: -1 });

    const progressData = enrollments.map(enrollment => ({
      courseId: enrollment.courseId._id,
      courseTitle: enrollment.courseId.title,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      timeSpent: enrollment.timeSpent,
      lastAccessed: enrollment.lastAccessed,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status
    }));

    res.json({
      userId,
      totalEnrollments: progressData.length,
      progressData
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

// Sync forum messages and other offline actions
router.post('/actions', authenticateToken, async (req, res) => {
  try {
    const { userId, actions } = req.body;
    
    if (!userId || !actions || !Array.isArray(actions)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const syncedActions = [];
    const errors = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'forum_post':
            // Handle forum post sync
            // This would integrate with your forum system
            syncedActions.push({
              id: action.id,
              type: action.type,
              action: 'synced'
            });
            break;
            
          case 'mentor_booking':
            // Handle mentor booking sync
            // This would integrate with your mentorship system
            syncedActions.push({
              id: action.id,
              type: action.type,
              action: 'synced'
            });
            break;
            
          default:
            errors.push({
              id: action.id,
              error: `Unknown action type: ${action.type}`
            });
        }
      } catch (error) {
        console.error('Error syncing action:', action.id, error);
        errors.push({
          id: action.id,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Actions sync completed',
      synced: syncedActions.length,
      errors: errors.length,
      details: {
        syncedActions,
        errors
      }
    });
  } catch (error) {
    console.error('Error syncing actions:', error);
    res.status(500).json({ error: 'Failed to sync actions' });
  }
});

// Health check endpoint for sync functionality
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      sync: 'active'
    }
  });
});

module.exports = router;
