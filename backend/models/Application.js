const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    coverLetter: {
        type: String,
        required: [true, 'Cover letter is required'],
        maxlength: [2000, 'Cover letter cannot be more than 2000 characters']
    },
    resume: {
        type: String,  // URL to the uploaded resume file
        required: [true, 'Resume is required']
    },
    additionalDocuments: [{
        name: String,
        url: String
    }],
    submissionDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewDate: Date,
    feedback: {
        type: String,
        maxlength: [1000, 'Feedback cannot be more than 1000 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Middleware to update lastUpdated timestamp
applicationSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Virtual for time since submission
applicationSchema.virtual('timeSinceSubmission').get(function() {
    return new Date() - this.submissionDate;
});

// Compound index to prevent multiple applications to the same opportunity
applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

// Static method to check if user has already applied
applicationSchema.statics.hasApplied = async function(opportunityId, applicantId) {
    const application = await this.findOne({ opportunity: opportunityId, applicant: applicantId });
    return !!application;
};

// Method to withdraw application
applicationSchema.methods.withdraw = function() {
    this.status = 'withdrawn';
    this.lastUpdated = new Date();
    return this.save();
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
