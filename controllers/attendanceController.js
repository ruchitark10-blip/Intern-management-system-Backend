exports.checkIn = async (req, res) => {
  try {
    const { name, email } = req.body;

    // ✅ IST DATE
    const now = new Date();

    const today = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    // ✅ IST TIME (hours)
    const hours = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false,
    });

    // 👉 Set your allowed time (example: 9 AM to 11 AM)
    if (hours < 9 || hours >= 11) {
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