const {
  BootcampPost,
  PostUpvote,
  PostComment,
  User,
  SavedPost,
  CommentUpvote,
  sequelize,
  Notification,
} = require("../models");

exports.toggleUpvote = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await BootcampPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const existingUpvote = await PostUpvote.findOne({
      where: { postId, userId },
    });

    let isUpvoted = false;
    if (existingUpvote) {
      await existingUpvote.destroy();
    } else {
      await PostUpvote.create({ postId, userId });
      isUpvoted = true;
    }

    //socketio se har jagah update kr denge
    const io = req.app.get("io");
    if (io) {
      io.emit("post_upvoted", {
        postId: parseInt(postId, 10),
        userId,
        isUpvoted,
      });
    }

    res.json({ message: "Upvote toggled", isUpvoted });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ message: "content needed" });

    const post = await BootcampPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "not found" });

    const comment = await PostComment.create({
      postId,
      userId,
      content,
      parentId: parentId || null,
    });
    //comment logic using socketio
    const populatedComment = await PostComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ["name", "avatar"] }],
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_comment", {
        postId: parseInt(postId, 10),
        comment: populatedComment,
      });

      //notification for reply
      if (parentId) {
        const parentComment = await PostComment.findByPk(parentId);
        if (parentComment && String(parentComment.userId) !== String(userId)) {
          const userObj = await User.findByPk(userId);
          const notif = await Notification.create({
            userId: parentComment.userId,
            type: "comment_reply",
            message: `${userObj.name} replied to your comment: "${content.substring(0, 30)}${content.length > 30 ? "..." : ""}"`,
            linkUrl: `/feed`,
          });
          io.emit("new_notification", {
            userId: parentComment.userId,
            notification: notif,
          });
        }
      }
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { postId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user.id;

    if (optionIndex === undefined)
      return res.status(400).json({ message: "Option index required" });

    const post = await BootcampPost.findByPk(postId);
    if (!post || post.type !== "poll")
      return res.status(404).json({ message: "Poll not found" });

    const existingVote = await sequelize.models.PollVote.findOne({
      where: { postId, userId },
    });
    if (existingVote) {
      return res
        .status(400)
        .json({ message: "You have already voted on this poll." });
    }

    //saving vote
    await sequelize.models.PollVote.create({ postId, userId, optionIndex });

    //update vote percentage
    const io = req.app.get("io");
    if (io) {
      io.emit("poll_voted", {
        postId: parseInt(postId, 10),
        optionIndex,
      });
    }

    res.json({ message: "Voted" });
  } catch (error) {
    res.status(500).json({ message: "Error voting", error: error.message });
  }
};

exports.toggleSave = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await BootcampPost.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingSave = await SavedPost.findOne({
      where: { postId, userId },
    });

    let isSaved = false;
    if (existingSave) {
      await existingSave.destroy();
    } else {
      await SavedPost.create({ postId, userId });
      isSaved = true;
    }

    res.json({ message: "Save toggled", isSaved });
  } catch (error) {
    res.status(500).json({ message: "Error saving", error: error.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ message: "content needed" });

    const comment = await PostComment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "not found" });

    if (
      String(comment.userId) !== String(userId) &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this comment" });
    }

    comment.content = content;
    await comment.save();

    const io = req.app.get("io");
    if (io) io.emit("new_comment", {}); // triggers refresh

    res.json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error editing comment", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await PostComment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "not found" });

    if (
      String(comment.userId) !== String(userId) &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    //parent delete hua to child bhi krna padega
    const deleteChildren = async (parentId) => {
      const children = await PostComment.findAll({ where: { parentId } });
      for (let child of children) {
        await deleteChildren(child.id);
        await child.destroy();
      }
    };

    await deleteChildren(comment.id);
    await comment.destroy();

    const io = req.app.get("io");
    if (io) io.emit("new_comment", {}); // triggers refresh

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

exports.toggleCommentUpvote = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await PostComment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const existingUpvote = await CommentUpvote.findOne({
      where: { commentId, userId },
    });

    let isUpvoted = false;
    if (existingUpvote) {
      await existingUpvote.destroy();
    } else {
      await CommentUpvote.create({ commentId, userId });
      isUpvoted = true;
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("new_comment", {}); // trigger refresh of feed
    }

    res.json({ message: "Comment upvote toggled", isUpvoted });
  } catch (error) {
    res.status(500).json({ message: "error", error: error.message });
  }
};
