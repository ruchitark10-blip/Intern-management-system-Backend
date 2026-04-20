const Attendance = require("../models/attendanceModel");

exports.checkIn = async (req, res) => {
  try {
    const { name, email } = req.body;

    // ✅ IST DATE (FINAL FIX)
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

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