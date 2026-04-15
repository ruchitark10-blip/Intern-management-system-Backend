const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Intern = require("../models/Intern");

const sendEmail = require("../utils/sendEmail");

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user =
      await User.findOne({ email }) ||
      await Mentor.findOne({ email }) ||
      await Intern.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= REGISTER (optional placeholder) =================
const register = async (req, res) => {
  try {
    res.status(200).json({ message: "Register not implemented here" });
  } catch (err) {
    res.status(500).json({ message: "Register failed" });
  }
};

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user =
      await User.findOne({ email }) ||
      await Mentor.findOne({ email }) ||
      await Intern.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // save hashed token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // IMPORTANT FIX: frontend URL from env
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
      `
    );

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    console.log("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // find user in all collections
    let user =
      await User.findOne({ resetPasswordToken: hashedToken }) ||
      await Mentor.findOne({ resetPasswordToken: hashedToken }) ||
      await Intern.findOne({ resetPasswordToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // check expiry
    if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    // update password
    user.password = await bcrypt.hash(password, 10);

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.log("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= EXPORT =================
module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword
};