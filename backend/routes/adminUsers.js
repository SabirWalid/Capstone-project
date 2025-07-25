const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user');
const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');

// Get all users with analytics
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Calculate analytics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: users.length,
      active: users.filter(user => {
        const lastLogin = new Date(user.lastLogin || user.createdAt);
        return lastLogin > thirtyDaysAgo;
      }).length,
      recent: users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt > sevenDaysAgo;
      }).length,
      verified: users.filter(user => user.isVerified || user.emailVerified).length
    };

    res.json({ users, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin can modify user details)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, isVerified, status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isVerified, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (soft delete by setting status to 'inactive')
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Get dashboard analytics
router.get('/analytics/dashboard', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    const admins = await Admin.find({});
    const mentors = await Mentor.find({});

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const analytics = {
      totalUsers: users.length,
      totalAdmins: admins.length,
      totalMentors: mentors.length,
      activeUsers: users.filter(user => {
        const lastLogin = new Date(user.lastLogin || user.createdAt);
        return lastLogin > thirtyDaysAgo;
      }).length,
      usersToday: users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= todayStart;
      }).length,
      verifiedUsers: users.filter(user => user.isVerified).length
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get recent activity
router.get('/analytics/activity', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt');

    const activities = recentUsers.map(user => ({
      type: 'User Registration',
      description: `${user.name || user.email} joined the platform`,
      timestamp: user.createdAt,
      userId: user._id
    }));

    // You can add more activity types here (logins, course enrollments, etc.)

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
