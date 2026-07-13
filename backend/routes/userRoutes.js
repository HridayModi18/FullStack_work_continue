const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/users/admins
router.get("/admins", auth, userController.getActiveAdmins);

// GET /api/users/students
router.get("/students", auth, userController.getStudents);

// GET /api/users/profile
router.get("/profile", auth, userController.getProfile);

// PUT /api/users/profile
router.put("/profile", auth, upload.single("photo"), userController.updateProfile);

// DELETE /api/users/profile
router.delete("/profile", auth, userController.deleteAccount);

// GET /api/users/dashboard/main
router.get("/dashboard/main", auth, userController.getStudentDashboard);

// GET /api/users/dashboard/stats
router.get("/dashboard/stats", auth, userController.getAdminDashboardStats);

// GET /api/users/:id
router.get("/:id", auth, userController.getUserProfile);

// GET /api/users/:id/stats
router.get("/:id/stats", auth, userController.getUserStats);

module.exports = router;
