const express = require("express");
const router = express.Router();

const { checkIn } = require("../controllers/attendanceController");
const Attendance = require("../models/attendanceModel");

// check-in only
router.post("/check-in", checkIn);

// get all attendance
router.get("/", async (req, res) => {
  const data = await Attendance.find();
  res.json(data);
});

module.exports = router;