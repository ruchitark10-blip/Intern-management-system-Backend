const Attendance = require("../models/attendanceModel");

// ================= FORMAT DATE =================
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

// ================= GET IST HOUR =================
const getISTHour = () => {
  return parseInt(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
};

// ================= CHECK IN =================
exports.checkIn = async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const today = formatDate(date);
    const now = new Date(); // ✅ store UTC
    const hour = getISTHour(); // ✅ IST check

    if (hour < 9 || hour >= 10) {
      return res.status(400).json({
        message: "Check-in allowed only between 9 AM to 10 AM",
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

// ================= CHECK OUT =================
exports.checkOut = async (req, res) => {
  try {
    const { email, date } = req.body;

    const today = formatDate(date);
    const attendance = await Attendance.findOne({ email, date: today });

    if (!attendance) {
      return res.status(404).json({
        message: "No check-in found",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out",
      });
    }

    const now = new Date();
    const hour = getISTHour();

    if (hour < 18 || hour >= 19) {
      return res.status(400).json({
        message: "Check-out allowed only between 6 PM to 7 PM",
      });
    }

    attendance.checkOut = now;
    await attendance.save();

    res.json({
      message: "Check-out successful",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET BY EMAIL =================
exports.getAttendanceByEmail = async (req, res) => {
  try {
    const data = await Attendance.find({ email: req.params.email }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};