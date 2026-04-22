const Attendance = require("../models/attendanceModel");

// ===================== FORMAT DATE SAFE =====================
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ===================== CHECK IN (9 AM - 10 AM ONLY) =====================
exports.checkIn = async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const today = formatDate(date);
    const now = new Date();

    const hour = now.getHours();

    // ❌ NOT allowed outside 9–10 AM
    if (hour < 9 || hour >= 10) {
      return res.status(400).json({
        message: "Punch In allowed only between 9 AM to 10 AM",
      });
    }

    const existing = await Attendance.findOne({ email, date: today });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const newAttendance = await Attendance.create({
      name,
      email,
      date: today,
      checkIn: now,
    });

    res.json({
      message: "Check-in successful",
      data: newAttendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== CHECK OUT (AFTER 8 HOURS ONLY) =====================
exports.checkOut = async (req, res) => {
  try {
    const { email, date } = req.body;

    const today = formatDate(date);

    const attendance = await Attendance.findOne({ email, date: today });

    if (!attendance) {
      return res.status(404).json({
        message: "No check-in found for today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        message: "Check-in missing",
      });
    }

    const now = new Date();
    const checkInTime = new Date(attendance.checkIn);

    const diffMs = now - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    // ❌ must complete 8 hours
    if (diffHours < 8) {
      const remaining = (8 - diffHours).toFixed(2);

      return res.status(400).json({
        message: `You can punch out after ${remaining} hours`,
      });
    }

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

// ===================== GET ATTENDANCE BY EMAIL =====================
exports.getAttendanceByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const data = await Attendance.find({ email }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET ALL ATTENDANCE =====================
exports.getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find().sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};