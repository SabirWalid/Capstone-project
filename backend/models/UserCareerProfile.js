const mongoose = require('mongoose');

const userCareerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skills: [{
        name: String,
        proficiency: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Beginner'
        },
        experience: Number // years
    }],
    interests: [{
        name: String,
        strength: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        }
    }],
    careerTests: [{
        testDate: {
            type: Date,
            default: Date.now
        },
        results: [{
            careerPath: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Career'
            },
            score: Number,
            confidence: Number
        }],
        feedback: String
    }],
    preferences: {
        workEnvironment: [String], // Remote, Office, Hybrid
        companySize: [String], // Startup, SME, Large
        industry: [String],
        salaryExpectation: {
            min: Number,
            max: Number
        },
        location: String,
        willingToRelocate: Boolean
    },
    currentStatus: {
        employed: Boolean,
        currentRole: String,
        experienceLevel: {
            type: String,
            enum: ['Student', 'Entry', 'Mid', 'Senior', 'Executive']
        },
        lookingForChange: Boolean
    },
    completedCourses: [{
        courseId: mongoose.Schema.Types.ObjectId,
        completionDate: Date,
        certificate: String
    }],
    bookmarkedCareers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Career'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('UserCareerProfile', userCareerProfileSchema);