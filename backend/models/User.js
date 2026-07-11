const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  avatar: {
    type: DataTypes.STRING,
  },

  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  year: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  branch: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  linkedin: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  role: {
    type: DataTypes.ENUM("admin", "user"),
    defaultValue: "user",
  },
});

module.exports = User;
