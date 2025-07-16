const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String,
  avatar: String,         // URL of the profile picture
  readMoreLink: String,   // URL for more info
  calendarLink: String,   // booking link
  status: { type: String, default: 'approved' },
  tags: [String],
  title: String
});


// Hash password before saving
MentorSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Password comparison method
MentorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Mentor', MentorSchema);
