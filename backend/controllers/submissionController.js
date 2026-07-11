const {
  AssignmentSubmission,
  BootcampPost,
  User,
  Notification,
  AuditLog,
} = require("../models");

//handle the srtudent assignment submission
exports.submitAssignment = async (req, res) => {
  try {
    const { postId, difficultyRating, feedback } = req.body;
    const studentId = req.user.id; //auth middleware

    if (!req.file) {
      return res.status(400).json({
        message:
          "error while uploading , upload while make sure that file is less than 5mb and uploaded",
      });
    }

    const fileUrl = `/studentuploads/${req.file.filename}`;

    //post must exist and be an assignment type
    const post = await BootcampPost.findByPk(postId);
    if (!post || post.type !== "assignment") {
      return res.status(404).json({ message: "Assignment not found." });
    }

    //duplicate submission not allowed
    const existingSubmission = await AssignmentSubmission.findOne({
      where: { postId, studentId },
    });

    let submission;

    if (existingSubmission) {
      if (existingSubmission.status === "graded") {
        return res.status(400).json({
          message:
            "You cannot resubmit an assignment that has already been graded.",
        });
      }
      if (post.deadline && new Date() > new Date(post.deadline)) {
        return res.status(400).json({
          message:
            "The deadline for this assignment has passed. Resubmissions are closed.",
        });
      }

      //update with latest submitted
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.status = "submitted";
      existingSubmission.submittedAt = new Date();
      if (difficultyRating)
        existingSubmission.difficultyRating = parseInt(difficultyRating, 10);
      if (feedback) existingSubmission.feedback = feedback;
      await existingSubmission.save();
      submission = existingSubmission;
    } else {
      submission = await AssignmentSubmission.create({
        studentId,
        postId,
        fileUrl,
        status: "submitted",
        difficultyRating: difficultyRating
          ? parseInt(difficultyRating, 10)
          : null,
        feedback: feedback || null,
      });
    }

    res.status(201).json({ message: "submitted", submission });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};

//admin controller to see all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const { postId, status } = req.query;
    const whereClause = {};
    if (postId) whereClause.postId = postId;
    if (status) whereClause.status = status;

    const submissions = await AssignmentSubmission.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ["name", "email", "avatar"] },
        {
          model: BootcampPost,
          attributes: ["title", "assignmentId", "deadline"],
        },
      ],
      order: [["submittedAt", "DESC"]], //newest first
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "eror", error: error.message });
  }
};

//grading by admin
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, adminComments } = req.body;
    const adminId = req.user.id;

    const submission = await AssignmentSubmission.findByPk(submissionId, {
      include: [{ model: BootcampPost }], //toget post info
    });

    if (!submission) {
      return res.status(404).json({ message: "not found submission" });
    }
    //grading
    submission.score = score;
    submission.adminComments = adminComments;
    submission.status = "graded";
    submission.gradedAt = new Date();
    await submission.save();

    //submission
    await AuditLog.create({
      action: "UPDATE",
      details: `Graded submission ID ${submissionId} with score ${score}`,
      adminId,
    });

    //give notification
    const notif = await Notification.create({
      userId: submission.studentId,
      type: "assignment_graded",
      message: `Your assignment "${submission.BootcampPost.title}" has been graded! you have scored: ${score}`,
      linkUrl: `/dashboard`,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_notification", {
        userId: submission.studentId,
        notification: notif,
      });
    }

    res.json({ message: "graded", submission });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};

// GET /api/submissions/dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;

    const assignments = await BootcampPost.findAll({
      where: { type: "assignment" },
      order: [["rollOutDate", "DESC"]],
    });

    const allSubmissions = await AssignmentSubmission.findAll({
      attributes: [
        "studentId",
        "postId",
        "score",
        "difficultyRating",
        "status",
      ],
    });

    const assignmentStats = {};
    assignments.forEach((a) => {
      assignmentStats[a.id] = {
        completionCount: 0,
        totalDifficulty: 0,
        difficultyCount: 0,
        totalScore: 0,
        scoreCount: 0,
      };
    });

    const userScores = {};
    allSubmissions.forEach((sub) => {
      if (sub.status === "submitted" || sub.status === "graded") {
        if (assignmentStats[sub.postId]) {
          assignmentStats[sub.postId].completionCount += 1;
          if (sub.difficultyRating) {
            assignmentStats[sub.postId].totalDifficulty += sub.difficultyRating;
            assignmentStats[sub.postId].difficultyCount += 1;
          }
        }
      }

      if (sub.status === "graded" && sub.score != null) {
        if (assignmentStats[sub.postId]) {
          assignmentStats[sub.postId].totalScore += sub.score;
          assignmentStats[sub.postId].scoreCount += 1;
        }
        if (!userScores[sub.studentId]) {
          userScores[sub.studentId] = { totalScore: 0 };
        }
        userScores[sub.studentId].totalScore += sub.score;
      }
    });

    const userIds = Object.keys(userScores);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "avatar"],
    });

    let leaderboard = users
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        score: userScores[u.id].totalScore,
      }))
      .sort((a, b) => b.score - a.score);

    const pending = [];
    const completed = [];
    const missed = [];

    assignments.forEach((post) => {
      const mySub = allSubmissions.find(
        (s) => s.postId === post.id && s.studentId === studentId,
      );

      const stats = assignmentStats[post.id];
      const avgDifficulty =
        stats.difficultyCount > 0
          ? (stats.totalDifficulty / stats.difficultyCount).toFixed(1)
          : 0;
      const avgScore = 
        stats.scoreCount > 0 
          ? (stats.totalScore / stats.scoreCount).toFixed(1) 
          : 0;

      const enrichedPost = {
        ...post.toJSON(),
        completionCount: stats.completionCount,
        averageDifficulty: avgDifficulty,
        averageScore: avgScore,
        mySubmission: mySub ? mySub.toJSON() : null,
      };

      if (!mySub) {
        if (post.deadline && new Date() > new Date(post.deadline)) {
          missed.push(enrichedPost);
        } else {
          pending.push(enrichedPost);
        }
      } else {
        if (mySub.status === "missed") {
          missed.push(enrichedPost);
        } else {
          completed.push(enrichedPost);
        }
      }
    });

    res.json({
      assignments: { pending, completed, missed },
      progress: {
        pendingCount: pending.length,
        completedCount: completed.length,
        missedCount: missed.length,
      },
      leaderboard,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({
      message: "error",
      error: error.message,
    });
  }
};
