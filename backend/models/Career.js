const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    skills: [{
        name: {
            type: String,
            required: true
        },
        weight: {
            type: Number,
            default: 1,
            min: 0.1,
            max: 3
        },
        synonyms: [String] // For fuzzy matching
    }],
    interests: [{
        name: {
            type: String,
            required: true
        },
        weight: {
            type: Number,
            default: 1,
            min: 0.1,
            max: 3
        },
        synonyms: [String]
    }],
    courses: [{
        title: String,
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner'
        },
        duration: String,
        priority: {
            type: Number,
            default: 1
        }
    }],
    salaryRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    jobOutlook: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Limited'],
        default: 'Good'
    },
    industry: [String],
    experienceLevel: {
        type: String,
        enum: ['Entry', 'Mid', 'Senior', 'All'],
        default: 'All'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [String],
    relatedCareers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career'
    }]
}, {
    timestamps: true
});

// Text index for search
careerSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Career', careerSchema);
