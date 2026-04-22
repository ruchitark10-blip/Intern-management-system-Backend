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

    const today = formatDate(date);

    const attendance = await Attendance.findOne({ email, date: today });

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