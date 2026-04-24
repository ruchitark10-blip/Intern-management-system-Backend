const Attendance = require("../models/attendanceModel");

// ===================== FORMAT DATE =====================
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// ===================== FIXED IST TIME =====================
const getISTTime = () => {
  const now = new Date();

  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;

  return new Date(now.getTime() + istOffset);
};

// ===================== CHECK IN (9–10 AM) =====================
exports.checkIn = async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const today = formatDate(date);
    const now = getISTTime();
    const hour = now.getHours();

    // 🔍 DEBUG (check in terminal)
    console.log("Server Time:", new Date());
    console.log("IST Time:", now);
    console.log("Hour:", hour);

    // ✅ Only between 9:00–9:59 AM
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

// ===================== CHECK OUT (6–7 PM) =====================
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

    const now = getISTTime();
    const hour = now.getHours();

    // 🔍 DEBUG
    console.log("IST Time:", now);
    console.log("Hour:", hour);

    // ✅ Only between 6:00–6:59 PM
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

// ===================== GET ATTENDANCE =====================
exports.getAttendanceByEmail = async (req, res) => {
  try {
    const data = await Attendance.find({
      email: req.params.email,
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};