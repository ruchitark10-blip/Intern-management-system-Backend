const express = require("express");
const router = express.Router();

// ✅ IMPORT CONTROLLER FUNCTIONS
const {
  checkIn,
  checkOut,
} = require("../controllers/attendanceController");

// ================= CHECK-IN =================
router.post("/check-in", checkIn);

// ================= CHECK-OUT =================
router.post("/check-out", checkOut);

// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const Attendance = require("../models/attendanceModel"); // ✅ FIXED PATH
    const data = await Attendance.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;