const { Notification } = require("../models");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ where: { id, userId } });
    if (!notification) return res.status(404).json({ message: "not found" });

    notification.isRead = true;
    await notification.save();

    res.json({ message: "read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );
    res.json({ message: "All read" });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};
