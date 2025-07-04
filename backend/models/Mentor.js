const mongoose = require('mongoose');
const MentorSchema = new mongoose.Schema({
  name: String,
  email: String,
  bio: String,
  avatar: String,
  socialLinks: [String],
  workLinks: [String],
  calendarLink: String,
  // ...add authentication fields as needed
});

// Hash password before saving
MentorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
MentorSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model('Mentor', MentorSchema);