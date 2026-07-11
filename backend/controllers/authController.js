const jwt = require("jsonwebtoken");

// ─── Admin Callback ───
// Only admins land here. Non-admins get bounced with an error.
exports.adminCallback = (req, res) => {
  const adminUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5173";
  if (!req.user) {
    return res.redirect(`${adminUrl}/login?error=unauthorized`);
  }

  // Enforce: only admin role can use the admin panel
  if (req.user.role !== "admin") {
    return res.redirect(`${adminUrl}/login?error=unauthorized`);
  }

  const token = jwt.sign(
    { id: req.user.id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  res.redirect(`${adminUrl}/login?token=${token}`);
};

// ─── Student Callback ───
// Any authenticated Google user can be a student.
// Their User record is created by passport.js strategy (in config/passport.js),
// so they automatically appear in the admin's student list.
exports.studentCallback = (req, res) => {
  const studentUrl = process.env.FRONTEND_STUDENT_URL || "http://localhost:5174";
  if (!req.user) {
    return res.redirect(`${studentUrl}/login?error=unauthorized`);
  }

  const token = jwt.sign(
    { id: req.user.id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  res.redirect(`${studentUrl}/login?token=${token}`);
};

// ─── Token verification ───
exports.getMe = async (req, res) => {
  try {
    const { User } = require("../models");
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "You are authenticated",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};
