const mongoose = require("mongoose");

const internSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    college: { type: String, required: true },
    department: { type: String, required: true },
    mentor: { type: String, required: true },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed"],
      default: "Active",
    },

    password: { type: String, required: true },

    role: {
      type: String,
      default: "intern",
    },

    joinedDate: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      enum: [3, 6],
      required: true,
      default: 3,
    },

    // ✅ ADD THIS (CERTIFICATE SYSTEM)
    certificate: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Intern", internSchema);