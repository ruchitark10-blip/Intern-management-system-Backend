const Intern = require("../models/Intern");
const bcrypt = require("bcryptjs");
const sendCredentialsEmail = require("../utils/sendEmail");

// Generate random password
function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// CREATE INTERN
exports.createIntern = async (req, res) => {
  try {
    const {
      name,
      email,
      college,
      department,
      mentor,
      status = "Active",
      joinedDate
    } = req.body;

    // ✅ Validation updated to include mentorEmail
    if (!name || !email || !college || !department || !mentor || !joinedDate) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const dateObj = new Date(joinedDate);
    if (dateObj.getFullYear() !== 2026) {
      return res.status(400).json({
        message: "Joined date must be in the year 2026"
      });
    }

    const existing = await Intern.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Intern with this email already exists"
      });
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
      password: hashedPassword
    });

    // Send email
    await sendCredentialsEmail(email, plainPassword, "Intern");

    res.status(201).json({
      _id: intern._id,
      name: intern.name,
      email: intern.email,
      college: intern.college,
      department: intern.department,
      mentor: intern.mentor,
      status: intern.status,
      joinedDate: intern.joinedDate,
      password: plainPassword
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL INTERNS (Updated with Mentor Filtering)
exports.getInterns = async (req, res) => {
  try {
    const { mentorEmail } = req.query; // ✅ Get email from query params
    
    let query = {};
    
    // ✅ If mentorEmail is provided, filter the results
    if (mentorEmail) {
      query.mentorEmail = mentorEmail;
    }

    const interns = await Intern.find(query).sort({ createdAt: -1 });
    res.json(interns);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE INTERN
exports.updateIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    const { name, email, college, department, mentor, status } = req.body;

    intern.name = name ?? intern.name;
    intern.email = email ?? intern.email;
    intern.college = college ?? intern.college;
    intern.department = department ?? intern.department;
    intern.mentor = mentor ?? intern.mentor;
    //intern.mentorEmail = mentorEmail ?? intern.mentorEmail; // ✅ Support updating email
    intern.status = status ?? intern.status;

    await intern.save();
    res.json(intern);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE INTERN
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