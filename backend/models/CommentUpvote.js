const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CommentUpvote = sequelize.define("CommentUpvote", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "PostComments",
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = CommentUpvote;
