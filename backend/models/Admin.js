// filepath: Capstone-project/backend/models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Optional field for admin name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Should be hashed!
});

module.exports = mongoose.model('Admin', AdminSchema);