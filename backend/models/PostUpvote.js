const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostUpvote = sequelize.define(
  "PostUpvote",
  {
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
  },
  {
    //ek hi post vaar vaar nhi upvot
    indexes: [
      {
        unique: true,
        fields: ["postId", "userId"],
      },
    ],
  },
);

module.exports = PostUpvote;
