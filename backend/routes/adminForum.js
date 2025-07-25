const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Message = require('../models/Message');
const User = require('../models/user');
const Admin = require('../models/Admin');

// Get forum statistics for admin dashboard
router.get('/forum/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [
      totalMessages,
      todayMessages,
      activeUsers,
      unreadMessages
    ] = await Promise.all([
      Message.countDocuments({ type: 'general' }),
      Message.countDocuments({ 
        type: 'general',
        createdAt: { $gte: todayStart }
      }),
      Message.distinct('sender', {
        type: 'general',
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      }).then(users => users.length),
      Message.countDocuments({ 
        type: 'general',
        status: { $in: ['pending', 'flagged'] }
      })
    ]);

    res.json({
      totalMessages,
      todayMessages,
      activeUsers,
      unreadMessages
    });
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    res.status(500).json({ error: 'Failed to fetch forum statistics' });
  }
});

// Get all forum messages for admin moderation
router.get('/forum/messages', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // pending, approved, flagged

    let query = { type: 'general' };
    if (status && status !== 'all') {
      query.status = status;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching forum messages:', error);
    res.status(500).json({ error: 'Failed to fetch forum messages' });
  }
});

// Approve a message
router.put('/forum/messages/:messageId/approve', adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { 
        status: 'approved',
        moderatedBy: req.admin.id,
        moderatedAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message approved successfully', data: message });
  } catch (error) {
    console.error('Error approving message:', error);
    res.status(500).json({ error: 'Failed to approve message' });
  }
});

// Flag a message
router.put('/forum/messages/:messageId/flag', adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { 
        status: 'flagged',
        moderatedBy: req.admin.id,
        moderatedAt: new Date(),
        flagReason: req.body.reason || 'Flagged by admin'
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message flagged successfully', data: message });
  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({ error: 'Failed to flag message' });
  }
});

// Delete a message
router.delete('/forum/messages/:messageId', adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Send broadcast message to all users
router.post('/forum/broadcast', adminAuth, async (req, res) => {
  try {
    const { message, type = 'announcement' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Get admin details
    const admin = await Admin.findById(req.admin.id).select('name email');
    const adminName = admin ? admin.name : 'Admin';

    // Create a broadcast message in the forum
    const broadcastMessage = new Message({
      subject: 'Admin Announcement',
      content: message.trim(),
      message: message.trim(), // For backward compatibility
      type: 'general',
      category: 'announcement',
      sender: req.admin.id,
      senderModel: 'Admin',
      senderName: adminName,
      senderRole: 'admin',
      status: 'approved',
      isPinned: true,
      isAnnouncement: true,
      createdAt: new Date()
    });

    await broadcastMessage.save();

    // Populate sender information for response
    await broadcastMessage.populate('sender', 'name email');

    res.json({ 
      message: 'Broadcast sent successfully',
      data: broadcastMessage
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// Mark all messages as read/processed
router.post('/forum/mark-all-read', adminAuth, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        type: 'general',
        status: 'pending'
      },
      { 
        status: 'approved',
        moderatedBy: req.admin.id,
        moderatedAt: new Date()
      }
    );

    res.json({ message: 'All pending messages marked as approved' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get forum analytics
router.get('/forum/analytics', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Message trends over the last 30 days
    const messageTrends = await Message.aggregate([
      {
        $match: {
          type: 'general',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Top active users
    const topUsers = await Message.aggregate([
      {
        $match: {
          type: 'general',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$sender',
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { messageCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.json({
      messageTrends,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching forum analytics:', error);
    res.status(500).json({ error: 'Failed to fetch forum analytics' });
  }
});

module.exports = router;
