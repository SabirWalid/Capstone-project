const mongoose = require('mongoose');

const MentorBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: String,
  time: String,
  synced: { type: Boolean, default: false }
});

module.exports = mongoose.model('MentorBooking', MentorBookingSchema);