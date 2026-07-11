const express = require("express");
const router = express.Router();
const doubtController = require("../controllers/doubtController");
const auth = require("../middleware/auth");

router.get("/", auth, doubtController.getAllDoubts);
router.post("/", auth, doubtController.askDoubt);
router.put("/:id/answer", auth, doubtController.answerDoubt);

module.exports = router;
