//connecting the models together , taaki database ko pata chale how they relate to one another

const sequelize = require("../config/db");
const User = require("./User");
const BootcampPost = require("./BootcampPost");
const Doubt = require("./Doubt");
const AuditLog = require("./AuditLog");
const AssignmentCompletion = require("./AssignmentCompletion");
const AssignmentSubmission = require("./AssignmentSubmission");
const PostComment = require("./PostComment");
const PostUpvote = require("./PostUpvote");
const Notification = require("./Notification");
const PollVote = require("./PollVote");
const SavedPost = require("./SavedPost");
const CommentUpvote = require("./CommentUpvote");

//ek bootcamp post ek hi admin post kr skta , like author of post
BootcampPost.belongsTo(User, { as: "author", foreignKey: "createdBy" });

//ek user can create many posts
User.hasMany(BootcampPost, { foreignKey: "createdBy" });

// assignment track krne ke liye (legacy)
User.hasMany(AssignmentCompletion, { foreignKey: "studentId" });
AssignmentCompletion.belongsTo(User, { foreignKey: "studentId" });

BootcampPost.hasMany(AssignmentCompletion, { foreignKey: "assignmentId" });
AssignmentCompletion.belongsTo(BootcampPost, { foreignKey: "assignmentId" });

// Assignment Submissions ke liye
User.hasMany(AssignmentSubmission, { foreignKey: "studentId" });
AssignmentSubmission.belongsTo(User, { foreignKey: "studentId" });
BootcampPost.hasMany(AssignmentSubmission, { foreignKey: "postId" });
AssignmentSubmission.belongsTo(BootcampPost, { foreignKey: "postId" });

// Post Comments
User.hasMany(PostComment, { foreignKey: "userId" });
PostComment.belongsTo(User, { foreignKey: "userId" });
BootcampPost.hasMany(PostComment, { foreignKey: "postId" });
PostComment.belongsTo(BootcampPost, { foreignKey: "postId" });

// comment thread reply
PostComment.hasMany(PostComment, { as: "replies", foreignKey: "parentId" });
PostComment.belongsTo(PostComment, { as: "parent", foreignKey: "parentId" });

// Post Upvotes
User.hasMany(PostUpvote, { foreignKey: "userId" });
PostUpvote.belongsTo(User, { foreignKey: "userId" });
BootcampPost.hasMany(PostUpvote, { foreignKey: "postId" });
PostUpvote.belongsTo(BootcampPost, { foreignKey: "postId" });

// Poll Votes
User.hasMany(PollVote, { foreignKey: "userId" });
PollVote.belongsTo(User, { foreignKey: "userId" });
BootcampPost.hasMany(PollVote, { foreignKey: "postId" });
PollVote.belongsTo(BootcampPost, { foreignKey: "postId" });

// Saved Posts
User.hasMany(SavedPost, { foreignKey: "userId" });
SavedPost.belongsTo(User, { foreignKey: "userId" });
BootcampPost.hasMany(SavedPost, { foreignKey: "postId" });
SavedPost.belongsTo(BootcampPost, { foreignKey: "postId" });

// Comment Upvotes
User.hasMany(CommentUpvote, { foreignKey: "userId" });
CommentUpvote.belongsTo(User, { foreignKey: "userId" });
PostComment.hasMany(CommentUpvote, { foreignKey: "commentId" });
CommentUpvote.belongsTo(PostComment, { foreignKey: "commentId" });

// Notifications
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

BootcampPost.hasMany(Doubt, { foreignKey: "referencePostId" });
Doubt.belongsTo(BootcampPost, {
  as: "ReferencePost",
  foreignKey: "referencePostId",
});

module.exports = {
  sequelize,
  User,
  BootcampPost,
  Doubt,
  AuditLog,
  AssignmentCompletion,
  AssignmentSubmission,
  PostComment,
  PostUpvote,
  Notification,
  PollVote,
  SavedPost,
  CommentUpvote,
};
