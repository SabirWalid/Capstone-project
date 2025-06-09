const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['refugee', 'mentor', 'admin'], default: 'refugee' },
  profile: Object
});
module.exports = mongoose.model('User', UserSchema);