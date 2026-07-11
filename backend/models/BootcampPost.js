const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); //database import krna padega jo db.js me bnaya tha

const BootcampPost = sequelize.define("BootcampPost", {
  type: {
    type: DataTypes.ENUM("photo", "video", "message", "poll", "assignment"),
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  mediaUrl: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  pollOptions: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 20,
    },
  },

  rollOutDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
});

//baad me create or fetch ke liye export kr lena
module.exports = BootcampPost;
