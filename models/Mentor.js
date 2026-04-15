const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive", "Completed"], default: "Active" },

    password: { type: String, required: true },

    joinedDate: {
      type: Date,
      required: true
    },

    role: {
      type: String,
      default: "mentor"
    },

    // 🔐 ADDED (FOR FORGOT PASSWORD FEATURE)
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);