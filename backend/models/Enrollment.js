const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: String,
  time: String,
  synced: { type: Boolean, default: false }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);