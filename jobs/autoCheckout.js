const cron = require("node-cron");
const Attendance = require("../models/attendanceModel");

const startAutoCheckout = () => {
  cron.schedule("*/5 * * * *", async () => {
    const all = await Attendance.find({ checkOut: null });

    for (let item of all) {
      const diff = new Date() - new Date(item.checkIn);

      if (diff >= 8 * 60 * 60 * 1000) {
        item.checkOut = new Date(
          new Date(item.checkIn).getTime() + 8 * 60 * 60 * 1000
        );
        await item.save();
      }
    }
  });
};

module.exports = startAutoCheckout;