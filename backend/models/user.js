const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['refugee', 'mentor', 'admin'], default: 'refugee' },
  profile: Object,
  links: [String], // Array of links
  phone: String,
  timeZone: String,
  language: String,
  profilePicture: String
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);