const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const studentUpload = require("../middleware/studentUpload");
const submissionController = require("../controllers/submissionController");

//POST /api/submissions
router.post(
  "/",
  auth,
  studentUpload.single("pdf"),
  submissionController.submitAssignment,
);

//GET /api/submissions/dashboard
router.get("/dashboard", auth, submissionController.getDashboardData);

//GET /api/submissions
router.get("/", auth, isAdmin, submissionController.getAllSubmissions);

//PUT /api/submissions/:submissionId/grade
router.put(
  "/:submissionId/grade",
  auth,
  isAdmin,
  submissionController.gradeSubmission,
);

module.exports = router;
