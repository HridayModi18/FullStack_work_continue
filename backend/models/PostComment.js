const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

//comments on a post
const PostComment = sequelize.define("PostComment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "BootcampPosts",
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  //if a comment thread
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "PostComments",
      key: "id",
    },
  },
});

module.exports = PostComment;
