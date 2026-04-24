const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendanceByEmail,
} = require("../controllers/attendanceController");

// routes
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/:email", getAttendanceByEmail);

module.exports = router;