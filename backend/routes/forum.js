const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/user');
const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');

// Get all general/public forum messages with pagination
router.get('/forum/general', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    let query = { type: 'general', isArchived: false };
    if (category && category !== 'all') {
      query.category = category;
    }

    const messages = await Message.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Message.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching forum messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get private messages (inbox) for a user
router.get('/forum/inbox/:userId/:userType', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get messages where user is sender or recipient
    const messages = await Message.find({
      type: 'private',
      $or: [
        { sender: userId, senderModel: userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor' },
        { recipient: userId, recipientModel: userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

    const total = await Message.countDocuments({
      type: 'private',
      $or: [
        { sender: userId, senderModel: userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor' },
        { recipient: userId, recipientModel: userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor' }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ error: 'Failed to fetch inbox messages' });
  }
});

// Send a new message (general or private)
router.post('/forum/message', async (req, res) => {
  try {
    const {
      senderId,
      senderType,
      senderName,
      recipientId,
      recipientType,
      type,
      subject,
      content,
      category
    } = req.body;

    if (!senderId || !senderType || !senderName || !subject || !content || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type === 'private' && (!recipientId || !recipientType)) {
      return res.status(400).json({ error: 'Recipient required for private messages' });
    }

    const senderModel = senderType === 'user' ? 'User' : senderType === 'admin' ? 'Admin' : 'Mentor';
    const recipientModel = recipientType ? (recipientType === 'user' ? 'User' : recipientType === 'admin' ? 'Admin' : 'Mentor') : null;

    const message = new Message({
      sender: senderId,
      senderModel,
      senderName,
      senderRole: senderType,
      recipient: recipientId || null,
      recipientModel,
      type,
      subject,
      content,
      category: category || 'general'
    });

    await message.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Reply to a message
router.post('/forum/reply/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { senderId, senderType, senderName, content } = req.body;

    if (!senderId || !senderType || !senderName || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const senderModel = senderType === 'user' ? 'User' : senderType === 'admin' ? 'Admin' : 'Mentor';

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.replies.push({
      sender: senderId,
      replyUserModel: senderModel,
      senderName,
      senderRole: senderType,
      content
    });

    await message.save();

    res.json({
      message: 'Reply added successfully',
      reply: message.replies[message.replies.length - 1]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Like/Unlike a message
router.post('/forum/like/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ error: 'User ID and type required' });
    }

    const userModel = userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor';

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user already liked
    const existingLike = message.likes.find(like => 
      like.user.toString() === userId && like.userModel === userModel
    );

    if (existingLike) {
      // Unlike
      message.likes = message.likes.filter(like => 
        !(like.user.toString() === userId && like.userModel === userModel)
      );
    } else {
      // Like
      message.likes.push({
        user: userId,
        userModel
      });
    }

    await message.save();

    res.json({
      message: existingLike ? 'Message unliked' : 'Message liked',
      likesCount: message.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Mark message as read
router.post('/forum/read/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ error: 'User ID and type required' });
    }

    const userModel = userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor';

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if already marked as read
    const existingRead = message.isRead.find(read => 
      read.user.toString() === userId && read.userModel === userModel
    );

    if (!existingRead) {
      message.isRead.push({
        user: userId,
        userModel
      });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get all users for private messaging
router.get('/forum/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email').lean();
    const admins = await Admin.find({}, 'name email').lean();
    const mentors = await Mentor.find({}, 'name email').lean();

    const allUsers = [
      ...users.map(user => ({ ...user, type: 'user', role: 'User' })),
      ...admins.map(admin => ({ ...admin, type: 'admin', role: 'Admin' })),
      ...mentors.map(mentor => ({ ...mentor, type: 'mentor', role: 'Mentor' }))
    ];

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get unread message count for a user
router.get('/forum/unread/:userId/:userType', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const userModel = userType === 'user' ? 'User' : userType === 'admin' ? 'Admin' : 'Mentor';

    const unreadCount = await Message.countDocuments({
      type: 'private',
      recipient: userId,
      recipientModel: userModel,
      'isRead.user': { $ne: userId }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
