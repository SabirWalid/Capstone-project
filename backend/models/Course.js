const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  duration: String,
  price: Number,
  materials: [String], // file paths
  quiz: String,        // file path
  visibility: { type: String, default: 'public' },
  enrollment: { type: String, default: 'open' },
  certification: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);