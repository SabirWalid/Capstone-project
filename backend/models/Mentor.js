const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Mentor', MentorSchema);