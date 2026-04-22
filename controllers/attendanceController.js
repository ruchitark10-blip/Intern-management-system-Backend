const Attendance = require("../models/attendanceModel");

// ===================== FORMAT DATE SAFE =====================
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ===================== CHECK IN =====================
exports.checkIn = async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const today = formatDate(date);
    const now = new Date();
    const hour = now.getHours();

    // ✅ ONLY 9 AM - 10 AM
    if (hour < 9 || hour >= 10) {
      return res.status(400).json({
        message: "Punch In allowed only between 9 AM to 10 AM",
      });
    }

    const exist = await Attendance.findOne({ email, date: today });

    if (exist) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    await Attendance.create({
      name,
      email,
      date: today,
      checkIn: now,
    });

    res.json({ message: "Check-in successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== CHECK OUT =====================
exports.checkOut = async (req, res) => {
  try {
    const { email, date } = req.body;

    const today = formatDate(date);

    const attendance = await Attendance.findOne({ email, date: today });

    if (!attendance) {
      return res.status(404).json({ message: "No check-in found" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const now = new Date();

    // ===================== 8 HOUR RULE =====================
    const checkInTime = new Date(attendance.checkIn);
    const diffHours = (now - checkInTime) / (1000 * 60 * 60);

    if (diffHours < 8) {
      const remaining = (8 - diffHours).toFixed(2);

      return res.status(400).json({
        message: `Punch Out allowed after ${remaining} hours`,
      });
    }

    // ❌ NO AUTO LOGIC — ONLY MANUAL SAVE
    attendance.checkOut = now;
    await attendance.save();

    res.json({
      message: "Check-out successful",
      checkOutTime: now,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};