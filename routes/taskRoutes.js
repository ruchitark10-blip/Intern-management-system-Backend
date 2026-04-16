const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// 1. CREATE
router.post("/", async (req, res) => {
  try {
    const { internId, taskName, description, assignDate, deadline } = req.body;

    const newTask = new Task({
      internId,
      taskName,
      description,
      assignDate,
      deadline,
      status: "Pending",
    });

    await newTask.save();
    res.status(201).json({ message: "Task assigned successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: Could not save task" });
  }
});

// 2. GET ALL TASKS (Mentor/Admin)
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("internId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// ✅ 3. GET TASKS FOR SPECIFIC INTERN (🔥 IMPORTANT FIX)
router.get("/intern/:internId", async (req, res) => {
  try {
    const tasks = await Task.find({
      internId: req.params.internId,
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching intern tasks" });
  }
});


// 4. UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { status, deadline } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (deadline) updateData.deadline = deadline;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error: Could not update task" });
  }
});

// 5. DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: Could not delete task" });
  }
});

module.exports = router;