const { AuditLog, User } = require('../models');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'Admin', attributes: ['name', 'avatar'] }]
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};
