const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  deadline: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);