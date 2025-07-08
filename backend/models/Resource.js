const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: String
});
module.exports = mongoose.model('Resource', ResourceSchema);