const Intern = require("../models/Intern");
const bcrypt = require("bcryptjs");
const sendCredentialsEmail = require("../utils/sendEmail");

// Generate random password
function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/* =========================
   CREATE INTERN
========================= */
exports.createIntern = async (req, res) => {
  try {
    const {
      name,
      email,
      college,
      department,
      mentor,
      status = "Active",
      joinedDate,
      duration,
    } = req.body;

    if (!name || !email || !college || !department || !mentor || !joinedDate || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (![3, 6].includes(Number(duration))) {
      return res.status(400).json({ message: "Duration must be 3 or 6 months" });
    }

    const dateObj = new Date(joinedDate);
    if (dateObj.getFullYear() !== 2026) {
      return res.status(400).json({
        message: "Joined date must be in the year 2026",
      });
    }

    const existing = await Intern.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Intern already exists" });
    }

    const plainPassword = generatePassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const intern = await Intern.create({
      name,
      email,
      college,
      department,
      mentor,
      status,
      joinedDate: dateObj,
      duration: Number(duration),
      password: hashedPassword,

      // default certificate = false (not needed here but explicit)
      certificate: false,
    });

    await sendCredentialsEmail(email, plainPassword, "Intern");

    res.status(201).json(intern);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL INTERNS
========================= */
exports.getInterns = async (req, res) => {
  try {
    const interns = await Intern.find().sort({ createdAt: -1 });
    res.json(interns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE INTERN
========================= */
exports.updateIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const {
      name,
      email,
      college,
      department,
      mentor,
      status,
      duration,
      certificate, // ✅ NEW FIELD
    } = req.body;

    if (name) intern.name = name;
    if (email) intern.email = email;
    if (college) intern.college = college;
    if (department) intern.department = department;
    if (mentor) intern.mentor = mentor;
    if (status) intern.status = status;

    if (duration !== undefined) {
      const d = Number(duration);
      if ([3, 6].includes(d)) {
        intern.duration = d;
      }
    }

    // ✅ CERTIFICATE APPROVAL LOGIC
    if (certificate !== undefined) {
      intern.certificate = Boolean(certificate);
    }

    await intern.save();
    res.json(intern);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE INTERN
========================= */
exports.deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findByIdAndDelete(req.params.id);

    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.json({ message: "Intern deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};