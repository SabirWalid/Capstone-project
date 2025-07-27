const mongoose = require('mongoose');

// Define the resource schema
const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: ['PDF', 'Video', 'Document', 'Presentation', 'Audio', 'Image', 'Link'],
        message: 'Invalid resource type'
    },
    url: {
        type: String,
        required: [true, ],
        trim: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+\..+/.test(v);
            },
            message: 'Please enter a valid URL'
        }
    },
    category: {
        type: String,
        trim: true,
        maxlength: [100, 'Category cannot be more than 100 characters'],
        default: 'General'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    downloadCount: {
        type: Number,
        default: 0,
        min: [0, 'Download count cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    fileSize: {
        type: String,
        default: null // e.g., "2.5 MB"
    },
    language: {
        type: String,
        default: 'en',
        maxlength: [10, 'Language code too long']
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', ''],
        default: ''
    },
    author: {
        type: String,
        trim: true,
        maxlength: [100, 'Author name too long']
    },
    lastAccessed: {
        type: Date,
        default: null
    },
    metadata: {
        duration: String, // for videos/audio
        pages: Number,   // for PDFs/documents
        format: String,  // file format
        quality: String  // for videos/audio
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'resources'
});

// Indexes for better query performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ type: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ isActive: 1 });

// Virtual for formatted creation date
resourceSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for age in days
resourceSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to clean up data
resourceSchema.pre('save', function(next) {
    // Clean up tags - remove empty strings and duplicates
    if (this.tags && Array.isArray(this.tags)) {
        this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
    }
    
    // Ensure URL has protocol
    if (this.url && !this.url.startsWith('http')) {
        this.url = 'https://' + this.url;
    }
    
    next();
});

// Instance method to increment download count
resourceSchema.methods.incrementDownload = function() {
    this.downloadCount += 1;
    this.lastAccessed = new Date();
    return this.save();
};

// Instance method to toggle active status
resourceSchema.methods.toggleActive = function() {
    this.isActive = !this.isActive;
    return this.save();
};

// Static method to find by type
resourceSchema.statics.findByType = function(type) {
    return this.find({ type: type, isActive: true });
};

// Static method to find popular resources
resourceSchema.statics.findPopular = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ downloadCount: -1 })
        .limit(limit);
};

// Static method to find recent resources
resourceSchema.statics.findRecent = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to search resources
resourceSchema.statics.search = function(query, options = {}) {
    const searchQuery = { isActive: true };
    
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    if (options.type) {
        searchQuery.type = options.type;
    }
    
    if (options.category) {
        searchQuery.category = new RegExp(options.category, 'i');
    }
    
    if (options.tags && options.tags.length > 0) {
        searchQuery.tags = { $in: options.tags };
    }
    
    let queryBuilder = this.find(searchQuery);
    
    // Sort options
    if (options.sort) {
        switch (options.sort) {
            case 'popular':
                queryBuilder = queryBuilder.sort({ downloadCount: -1 });
                break;
            case 'recent':
                queryBuilder = queryBuilder.sort({ createdAt: -1 });
                break;
            case 'alphabetical':
                queryBuilder = queryBuilder.sort({ title: 1 });
                break;
        }
    }

    return queryBuilder;
};

module.exports = mongoose.model('Resource', resourceSchema);