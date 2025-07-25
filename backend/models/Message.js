const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin', 'Mentor']
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'mentor']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Admin', 'Mentor']
  },
  type: {
    type: String,
    required: true,
    enum: ['general', 'private'],
    default: 'general'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'announcement', 'question', 'discussion', 'help']
  },
  isRead: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Admin', 'Mentor']
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Admin', 'Mentor']
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'replyUserModel'
    },
    replyUserModel: {
      type: String,
      enum: ['User', 'Admin', 'Mentor']
    },
    senderName: String,
    senderRole: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged', 'rejected'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderatedAt: {
    type: Date
  },
  flagReason: {
    type: String
  },
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    get: function() {
      return this.content;
    },
    set: function(value) {
      this.content = value;
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ type: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
