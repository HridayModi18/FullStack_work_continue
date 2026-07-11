const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const interactionController = require("../controllers/interactionController");

// POST /api/interactions/:postId/upvote
router.post("/:postId/upvote", auth, interactionController.toggleUpvote);

// POST /api/interactions/:postId/comment
router.post("/:postId/comment", auth, interactionController.addComment);

// POST /api/interactions/:postId/vote
router.post("/:postId/vote", auth, interactionController.votePoll);

// POST /api/interactions/:postId/save
router.post("/:postId/save", auth, interactionController.toggleSave);

// PUT /api/interactions/comment/:commentId
router.put("/comment/:commentId", auth, interactionController.editComment);

// DELETE /api/interactions/comment/:commentId
router.delete("/comment/:commentId", auth, interactionController.deleteComment);

// POST /api/interactions/comment/:commentId/upvote
router.post("/comment/:commentId/upvote", auth, interactionController.toggleCommentUpvote);

module.exports = router;
