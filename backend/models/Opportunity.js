const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  deadline: String,
  link: String,
  type: { type: String, enum: ['Scholarship', 'Job', 'Funding'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);