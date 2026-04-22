const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
} = require("../controllers/attendanceController");

const Attendance = require("../models/attendanceModel");

// check-in
router.post("/check-in", checkIn);

// check-out
router.post("/check-out", checkOut);

// 🔥 IMPORTANT: only return user data (FIX FOR YOUR BUG)
router.get("/:email", async (req, res) => {
  try {
    const data = await Attendance.find({
      email: req.params.email,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;