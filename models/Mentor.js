const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive", "Completed"], default: "Active" },

  password: { type: String, required: true }, // NEW

  joinedDate: {
    type: Date,
    required: true
  },
    // ✅ ROLE AUTO ADDED
    role: {
      type: String,
      default: "mentor"
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);