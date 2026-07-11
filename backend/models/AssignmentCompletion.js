const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssignmentCompletion = sequelize.define('AssignmentCompletion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Refers to the User model
      key: 'id',
    }
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'BootcampPosts', // Refers to the BootcampPost model
      key: 'id',
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = AssignmentCompletion;
