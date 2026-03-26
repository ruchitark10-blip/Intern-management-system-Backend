const mongoose = require("mongoose");

/**
 * Task Schema
 * Handles the storage of tasks assigned by mentors to specific interns.
 * Date format is strictly kept as DD-MM-YYYY for frontend display consistency.
 */
const taskSchema = new mongoose.Schema({
  internId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Intern", 
    required: [true, "Intern ID is required to assign a task"] 
  },
  taskName: { 
    type: String, 
    required: [true, "Task title is required"],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "Task description is required"] 
  },
  assignDate: { 
    type: String, 
    required: [true, "Assignment date is required"] 
    // Format: DD-MM-YYYY
  },
  deadline: { 
    type: String, 
    required: [true, "Deadline date is required"] 
    // Format: DD-MM-YYYY
  },
  status: { 
    type: String, 
    enum: ["Pending", "Active", "Completed", "Expired", "Reviewing"],
    default: "Pending" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Automatically creates 'updatedAt' fields
});

// Export the model
module.exports = mongoose.model("Task", taskSchema);