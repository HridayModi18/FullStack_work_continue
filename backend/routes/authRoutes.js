const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

const ADMIN_CALLBACK = "http://localhost:5000/auth/google/callback/admin";
const STUDENT_CALLBACK = "http://localhost:5000/auth/google/callback/student";

// ─── Admin Google Login ───
router.get("/google/admin", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    callbackURL: ADMIN_CALLBACK,
  })(req, res, next);
});

// ─── Student Google Login ───
router.get("/google/student", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    callbackURL: STUDENT_CALLBACK,
  })(req, res, next);
});

// ─── Admin Callback ───
router.get(
  "/google/callback/admin",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=unauthorized",
    callbackURL: ADMIN_CALLBACK,
  }),
  authController.adminCallback,
);

// ─── Student Callback ───
router.get(
  "/google/callback/student",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5174/login?error=unauthorized",
    callbackURL: STUDENT_CALLBACK,
  }),
  authController.studentCallback,
);

// ─── Token verification ───
router.get("/me", auth, authController.getMe);

module.exports = router;
