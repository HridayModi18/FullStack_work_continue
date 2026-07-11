const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

//track stud sybmission for assignemnt posts
const AssignmentSubmission = sequelize.define("AssignmentSubmission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "BootcampPosts",
      key: "id",
    },
  },

  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  adminComments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficultyRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 },
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("submitted", "graded", "missed"),
    defaultValue: "submitted",
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = AssignmentSubmission;
