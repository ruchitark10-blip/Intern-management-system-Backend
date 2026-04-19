const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  checkIn: Date,
});

// ✅ ONLY VALID RULE
attendanceSchema.index({ email: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);