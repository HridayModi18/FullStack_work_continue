const { User, BootcampPost, Doubt } = require("../models");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

exports.getActiveAdmins = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);

    const admins = await User.findAll({
      where: {
        role: "admin",
        lastLogin: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      attributes: ["id", "name", "email", "avatar", "lastLogin"],
      include: [
        {
          model: BootcampPost,
          attributes: ["id"],
        },
        {
          model: Doubt,
          as: "AnsweredDoubts",
          attributes: ["id", "question", "answer", "status", "updatedAt"],
        },
      ],
    });

    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
      lastLogin: admin.lastLogin,
      postsCreated: admin.BootcampPosts ? admin.BootcampPosts.length : 0,
      doubtsAnswered: admin.AnsweredDoubts ? admin.AnsweredDoubts.length : 0,
      doubts: admin.AnsweredDoubts
        ? admin.AnsweredDoubts.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
          ).map((d) => ({
            q: d.question,
            a: d.answer,
            status: d.status,
          }))
        : [],
    }));

    res.json(formattedAdmins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { AssignmentSubmission } = require("../models");

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "name",
        "email",
        "avatar",
        "role",
        "rollNumber",
        "year",
        "lastLogin",
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    let assignmentsCount = 0;
    if (user.role === "user") {
      assignmentsCount = await AssignmentSubmission.count({
        where: { studentId: id },
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      rollNo: user.rollNumber || "N/A",
      year: user.year || "N/A",
      assignments: assignmentsCount,
      lastActive: user.lastLogin
        ? new Date(user.lastLogin).toLocaleString()
        : "Never",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await User.findByPk(req.user.id, {
      include: [
        { model: BootcampPost, attributes: ["id"] },
        { model: Doubt, as: "AnsweredDoubts", attributes: ["id"] },
      ],
    });

    if (!admin) return res.status(404).json({ message: "Profile not found" });

    res.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
      rollNumber: admin.rollNumber,
      year: admin.year,
      bio: admin.bio,
      postsCreated: admin.BootcampPosts ? admin.BootcampPosts.length : 0,
      doubtsAnswered: admin.AnsweredDoubts ? admin.AnsweredDoubts.length : 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, rollNumber, year } = req.body;
    const admin = await User.findByPk(req.user.id);

    if (!admin) return res.status(404).json({ message: "Profile not found" });

    if (name) admin.name = name;
    if (rollNumber) admin.rollNumber = rollNumber;
    if (year) admin.year = year;
    if (bio !== undefined) admin.bio = bio; // Allow empty

    if (req.file) {
      admin.avatar = `http://localhost:5000/uploads/photos/${req.file.filename}`;
    }

    await admin.save();

    // Emit a socket event so the admin dashboard updates in real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("student_updated");
    }

    // Generate new token with updated user details
    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
    };

    const newToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "24h",
      },
    );

    res.json({
      message: "Profile updated successfully",
      token: newToken,
      admin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

// GET /api/users/:id/stats
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { AssignmentSubmission } = require("../models");
    const assignmentsCompleted = await AssignmentSubmission.count({
      where: {
        studentId: id,
        status: ["submitted", "graded"],
      },
    });

    res.json({
      rollNo: user.rollNumber,
      assignments: assignmentsCompleted,
      lastActive: user.updatedAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user stats", error: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: "user" },
      attributes: [
        "id",
        "name",
        "email",
        "avatar",
        "rollNumber",
        "year",
        "lastLogin",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(students);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching students", error: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "avatar", "rollNumber", "year", "branch"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      AssignmentSubmission,
      BootcampPost,
      Notification,
    } = require("../models");

    const allSubmissions = await AssignmentSubmission.findAll({
      attributes: ["studentId", "postId", "score", "status"],
    });

    const userScores = {};
    allSubmissions.forEach((sub) => {
      if (sub.status === "graded" && sub.score != null) {
        if (!userScores[sub.studentId]) {
          userScores[sub.studentId] = { totalScore: 0 };
        }
        userScores[sub.studentId].totalScore += sub.score;
      }
    });

    const userIds = Object.keys(userScores);
    const usersWithScores = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "avatar"],
    });

    let leaderboard = usersWithScores
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        score: userScores[u.id].totalScore,
      }))
      .sort((a, b) => b.score - a.score);

    const myScore = userScores[userId] ? userScores[userId].totalScore : 0;
    const myRank =
      leaderboard.findIndex((u) => u.id === userId) + 1 ||
      leaderboard.length + 1;

    let rankName = "Novice";
    let nextThreshold = 100;
    if (myScore > 1000) {
      rankName = "Legendary";
      nextThreshold = 99999;
    } else if (myScore > 600) {
      rankName = "Guardian";
      nextThreshold = 1000;
    } else if (myScore > 300) {
      rankName = "Master";
      nextThreshold = 600;
    } else if (myScore > 100) {
      rankName = "Knight";
      nextThreshold = 300;
    }

    const xp = myScore;

    const assignments = await BootcampPost.findAll({
      where: { type: "assignment" },
    });
    let pendingCount = 0;
    let completedCount = 0;
    let missedCount = 0;

    assignments.forEach((post) => {
      const mySub = allSubmissions.find(
        (s) => s.postId === post.id && s.studentId === userId,
      );
      if (!mySub) {
        if (post.deadline && new Date() > new Date(post.deadline))
          missedCount++;
        else pendingCount++;
      } else {
        if (mySub.status === "missed") missedCount++;
        else completedCount++;
      }
    });

    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      user: {
        ...user.toJSON(),
        score: myScore,
        globalRank: myRank,
        rankName,
        xp,
        nextThreshold,
      },
      progress: { pendingCount, completedCount, missedCount },
      leaderboard,
      timeline: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Error:", error: error.message });
  }
};
