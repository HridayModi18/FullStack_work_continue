const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const AuditLog = sequelize.define("AuditLog", {
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

User.hasMany(AuditLog, { foreignKey: "adminId" });
AuditLog.belongsTo(User, { as: "Admin", foreignKey: "adminId" });

module.exports = AuditLog;
