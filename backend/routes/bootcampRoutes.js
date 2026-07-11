const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const bootcampController = require("../controllers/bootcampController");

// GET /api/bootcamp
router.get("/", optionalAuth, bootcampController.getAllPosts);

// GET /api/bootcamp/saved
router.get("/saved", auth, bootcampController.getSavedPosts);

router.post("/message", auth, isAdmin, bootcampController.createMessage);

// POST /api/bootcamp/photo
router.post(
  "/photo",
  auth,
  isAdmin,
  upload.array("photo", 3), // allow up to 3 photos
  bootcampController.uploadMedia,
);

// POST /api/bootcamp/video
router.post(
  "/video",
  auth,
  isAdmin,
  upload.single("video"),
  bootcampController.uploadMedia,
);

// POST /api/bootcamp/assignment
router.post(
  "/assignment",
  auth,
  isAdmin,
  upload.single("assignment"),
  bootcampController.uploadMedia,
);

// PUT /api/bootcamp/:id
router.put(
  "/:id",
  auth,
  isAdmin,
  upload.any(),
  bootcampController.updatePost
);

// DELETE /api/bootcamp/:id
router.delete("/:id", auth, isAdmin, bootcampController.deletePost);
module.exports = router;
