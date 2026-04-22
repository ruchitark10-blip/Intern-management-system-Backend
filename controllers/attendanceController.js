const Attendance = require("../models/attendanceModel");

// ===================== CHECK IN =====================
exports.checkIn = async (req, res) => {
  try {
    const { name, email, date } = req.body;

    const today = date;

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
      checkIn: new Date(),
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

    const attendance = await Attendance.findOne({ email, date });

    if (!attendance) {
      return res.status(404).json({ message: "No check-in found" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const now = new Date();
    const hour = now.getHours();

    // allow only 5–7 PM
    if (hour < 17 || hour > 19) {
      return res.status(400).json({
        message: "Check-out allowed only between 5 PM and 7 PM",
      });
    }

    attendance.checkOut = now;
    await attendance.save();

    res.json({ message: "Check-out successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};