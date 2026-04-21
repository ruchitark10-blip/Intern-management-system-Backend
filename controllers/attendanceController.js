const Attendance = require("../models/attendanceModel");

// ================= CHECK-IN =================
exports.checkIn = async (req, res) => {
  try {
    const { name, email } = req.body;

    const now = new Date();

    const today = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const hour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      })
    );

    // ✅ 9 AM – 11 AM
    if (hour < 9 || hour >= 11) {
      return res.status(400).json({
        message: "Attendance allowed only between 9 AM to 11 AM",
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

// ================= CHECK-OUT =================
exports.checkOut = async (req, res) => {
  try {
    const { email } = req.body;

    const now = new Date();

    const today = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const hour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      })
    );

    // ✅ 5 PM – 7 PM
    if (hour < 17 || hour >= 19) {
      return res.status(400).json({
        message: "Check-out allowed only between 5 PM and 7 PM",
      });
    }

    const record = await Attendance.findOne({ email, date: today });

    if (!record) {
      return res.status(400).json({
        message: "You must check-in first",
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        message: "Already checked out",
      });
    }

    record.checkOut = now;
    await record.save();

    res.json({ message: "Check-out successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL =================
exports.getAttendance = async (req, res) => {
  try {
    const data = await Attendance.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};