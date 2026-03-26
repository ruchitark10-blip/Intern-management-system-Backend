const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Intern = require("../models/Intern");
const Mentor = require("../models/Mentor");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;
    

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    let user = null;
    let role = null;

    // 1️⃣ Check User collection (admin / mentor)
    user = await User.findOne({ email });

    if (user) {
      role = user.role;
    }

    // 2️⃣ If not found check Intern collection
    if (!user) {
      user = await Intern.findOne({ email });

      if (user) {
        role = "intern";
      }
    }
     if (!user) {
  user = await Mentor.findOne({ email });

  if (user) {
    role = "mentor";
  }
}
    // 3️⃣ If still not found
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 4️⃣ Check password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 5️⃣ Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role
    });

  } catch (err) {

    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Login failed"
    });

  }
});

module.exports = router;