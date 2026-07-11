const { Doubt, User, AuditLog, Notification } = require("../models");

exports.getAllDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "name", "email", "avatar"],
        },
        { model: User, as: "Admin", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const answered = doubts
      .filter((d) => d.status === "resolved")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const unanswered = doubts.filter((d) => d.status === "pending");

    res.json({ answered, unanswered });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching doubts", error: error.message });
  }
};

exports.answerDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const doubt = await Doubt.findByPk(id);
    if (!doubt) return res.status(404).json({ message: "Doubt not found" });

    doubt.answer = answer;
    doubt.status = "resolved";
    doubt.answeredByAdminId = req.user.id;
    await doubt.save();

    await AuditLog.create({
      action: "UPDATE",
      details: `Answered a doubt: "${doubt.question.substring(0, 50)}${doubt.question.length > 50 ? "..." : ""}"`,
      adminId: req.user.id,
    });

    const notif = await Notification.create({
      userId: doubt.studentId,
      type: "doubt_answered",
      message: `Your doubt "${doubt.question.substring(0, 30)}..." has been answered!`,
      linkUrl: `/doubts`,
    });
    
    const io = req.app.get("io");
    if (io) {
      io.emit("new_notification", { userId: doubt.studentId, notification: notif });
      io.emit("doubt_resolved", doubt);
    }

    res.json({ message: "Doubt answered successfully", doubt });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error answering doubt", error: error.message });
  }
};

exports.askDoubt = async (req, res) => {
  try {
    const { question, referencePostId, isPublic } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const doubt = await Doubt.create({
      question,
      referencePostId: referencePostId || null,
      studentId: req.user.id,
      status: "pending",
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const populatedDoubt = await Doubt.findByPk(doubt.id, {
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "name", "email", "avatar"],
        }
      ]
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_doubt", populatedDoubt);
    }

    res.status(201).json({ message: "Doubt submitted successfully", doubt: populatedDoubt });
  } catch (error) {
    res.status(500).json({ message: "Error asking doubt", error: error.message });
  }
};
