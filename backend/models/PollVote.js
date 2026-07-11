const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PollVote = sequelize.define("PollVote", {
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  optionIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = PollVote;
