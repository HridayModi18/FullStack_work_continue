import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  CornerDownRight,
  MoreHorizontal,
  Bookmark,
  Trash2,
  ChevronDown,
  Edit2,
} from "lucide-react";
import MediaCarousel from "../components/MediaCarousel";
import UserDetailsModal from "../components/UserDetailsModal";
import DoubtPromptWidget from "../components/DoubtPromptWidget";
import SubmissionPromptWidget from "../components/SubmissionPromptWidget";
import "./Feed.css";

const Feed = ({ savedMode = false }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'assignments', 'polls', 'media'
  const [assignmentSubFilter, setAssignmentSubFilter] = useState("assigned"); // 'assigned', 'submitted', 'missed'
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'upvotes'
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openPostMenuId, setPostMenuOpenId] = useState(null);

  const sortDropdownRef = useRef(null);
  const postMenuRef = useRef(null);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return parseJwt(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("post_upvoted", (data) => {
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id === data.postId) {
            const isMe = data.userId === parseJwt(token)?.id;
            return {
              ...p,
              upvoted: isMe ? data.isUpvoted : p.upvoted,
              PostUpvotes: p.PostUpvotes || [],
            };
          }
          return p;
        }),
      );
      fetchPosts();
    });

    newSocket.on("new_comment", (data) => {
      fetchPosts();
    });

    newSocket.on("poll_voted", (data) => {
      fetchPosts();
    });

    fetchPosts();

    return () => newSocket.close();
  }, [savedMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setIsSortDropdownOpen(false);
      }
      if (postMenuRef.current && !postMenuRef.current.contains(event.target)) {
        setPostMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildCommentTree = (comments) => {
    if (!comments) return [];

    const token = localStorage.getItem("token");
    const userId = parseJwt(token)?.id;

    const processedComments = comments.map((c) => ({
      ...c,
      upvotesCount: c.CommentUpvotes ? c.CommentUpvotes.length : 0,
      isUpvoted: c.CommentUpvotes
        ? c.CommentUpvotes.some((u) => String(u.userId) === String(userId))
        : false,
      children: [],
    }));

    const map = {};
    const roots = [];
    processedComments.forEach((c) => (map[c.id] = c));
    processedComments.forEach((c) => {
      if (c.parentId) {
        if (map[c.parentId]) {
          map[c.parentId].children.push(map[c.id]);
        }
      } else {
        roots.push(map[c.id]);
      }
    });

    const sortRecursive = (arr) => {
      arr.sort((a, b) => b.upvotesCount - a.upvotesCount);
      arr.forEach((c) => sortRecursive(c.children));
    };
    sortRecursive(roots);

    return roots;
  };

  const fetchPosts = async () => {
    try {
      const endpoint = savedMode
        ? "http://localhost:5000/api/bootcamp/saved"
        : "http://localhost:5000/api/bootcamp";
      const res = await axios.get(endpoint);
      const token = localStorage.getItem("token");
      const userId = parseJwt(token)?.id;

      const formattedPosts = res.data.map((post) => {
        const hasVotedPoll = post.PollVotes?.some(
          (vote) => vote.userId === userId,
        );
        const myPollVoteIndex = post.PollVotes?.find(
          (vote) => vote.userId === userId,
        )?.optionIndex;

        return {
          ...post,
          upvoted: post.PostUpvotes?.some((up) => up.userId === userId),
          upvotesCount: post.PostUpvotes?.length || 0,
          hasVotedPoll,
          myPollVoteIndex,
          totalPollVotes: post.PollVotes?.length || 0,
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Failed to laodposts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                upvoted: !p.upvoted,
                upvotesCount: p.upvoted
                  ? p.upvotesCount - 1
                  : p.upvotesCount + 1,
              }
            : p,
        ),
      );
      await axios.post(
        `http://localhost:5000/api/interactions/${postId}/upvote`,
      );
    } catch (error) {
      console.error("Upvote error:", error);
      fetchPosts();
    }
  };

  const handleSave = async (postId) => {
    try {
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p)),
      );
      if (savedMode) {
        setPosts((prev) => prev.filter((p) => p.id !== postId || p.isSaved));
      }
      await axios.post(`http://localhost:5000/api/interactions/${postId}/save`);
    } catch (error) {
      console.error("Save error:", error);
      fetchPosts();
    }
  };

  const handleCommentSubmit = async (postId, parentId = null) => {
    if (!commentText.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/interactions/${postId}/comment`,
        {
          content: commentText,
          parentId,
        },
      );
      setCommentText("");
    } catch (error) {
      console.error("Comment failed:", error);
    }
  };

  const handleCommentUpvote = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/interactions/comment/${commentId}/upvote`,
      );
    } catch (error) {
      console.error("Comment upvote failed:", error);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data);
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      await axios.put(
        `http://localhost:5000/api/interactions/comment/${commentId}`,
        {
          content: editCommentText,
        },
      );
      setEditingCommentId(null);
      setEditCommentText("");
      fetchPosts();
    } catch (error) {
      console.error("Edit comment failed:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/bootcamp/${postId}`);
      setPosts(posts.filter((p) => p.id !== postId));
      setPostMenuOpenId(null);
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/interactions/comment/${commentId}`,
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const [replyingToId, setReplyingToId] = useState(null);

  const renderComments = (comments, depth = 0, postId) => {
    return comments.map((comment) => (
      <div
        className={`comment-thread ${depth > 0 ? "is-reply" : ""}`}
        key={comment.id}
      >
        <div className="comment-main">
          <img
            src={
              comment.User?.avatar ||
              `https://ui-avatars.com/api/?name=${comment.User?.name || "User"}`
            }
            className="comment-avatar"
            alt="avatar"
          />
          <div className="comment-content-wrapper">
            <div className="comment-content">
              <div
                className="comment-author"
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "transparent",
                  transition: "text-decoration-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.textDecorationColor = "currentColor")
                }
                onMouseLeave={(e) =>
                  (e.target.style.textDecorationColor = "transparent")
                }
                onClick={() => handleUserClick(comment.userId)}
              >
                {comment.User?.name || "User"}
              </div>
              {editingCommentId === comment.id ? (
                <div className="comment-input-wrapper reply-input">
                  <input
                    type="text"
                    className="comment-input"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleEditCommentSubmit(comment.id);
                    }}
                    autoFocus
                  />
                  <button
                    className="post-comment-btn"
                    onClick={() => handleEditCommentSubmit(comment.id)}
                  >
                    Save
                  </button>
                  <button
                    className="reply-btn"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="comment-text">{comment.content}</p>
              )}

              <div
                className="comment-actions"
                style={{ display: "flex", gap: "8px", marginTop: "4px" }}
              >
                <button
                  className={`reply-btn ${comment.isUpvoted ? "upvoted-text" : ""}`}
                  onClick={() => handleCommentUpvote(comment.id)}
                >
                  <Heart
                    size={14}
                    fill={comment.isUpvoted ? "#ef4444" : "none"}
                    stroke={comment.isUpvoted ? "#ef4444" : "currentColor"}
                  />
                  {comment.upvotesCount > 0 ? comment.upvotesCount : "Upvote"}
                </button>
                <button
                  className="reply-btn"
                  onClick={() => setReplyingToId(comment.id)}
                >
                  <CornerDownRight size={14} /> Reply
                </button>
                {(() => {
                  const user = getLoggedInUser();
                  const isOwner =
                    user && String(comment.userId) === String(user.id);
                  const isAdmin = user && user.role === "admin";
                  if (isOwner || isAdmin) {
                    return (
                      <>
                        <button
                          className="reply-btn"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentText(comment.content);
                          }}
                          title="Edit Comment"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="reply-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete Comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {replyingToId === comment.id && (
              <div className="comment-input-wrapper reply-input">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCommentSubmit(postId, comment.id);
                      setReplyingToId(null);
                    }
                  }}
                  autoFocus
                />
                <button
                  className="post-comment-btn"
                  onClick={() => {
                    handleCommentSubmit(postId, comment.id);
                    setReplyingToId(null);
                  }}
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="nested-comments-container">
            <div className="thread-line"></div>
            <div className="nested-comments">
              {renderComments(comment.children, depth + 1, postId)}
            </div>
          </div>
        )}
      </div>
    ));
  };

  const handlePollVote = async (postId, optionIndex) => {
    try {
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                hasVotedPoll: true,
                myPollVoteIndex: optionIndex,
                totalPollVotes: p.totalPollVotes + 1,
                PollVotes: [...(p.PollVotes || []), { optionIndex }],
              }
            : p,
        ),
      );
      await axios.post(
        `http://localhost:5000/api/interactions/${postId}/vote`,
        { optionIndex },
      );
    } catch (error) {
      console.error("vote failed", error);
      fetchPosts();
    }
  };

  const filters = [
    { id: "all", label: "All Updates" },
    { id: "assignments", label: "Assignments" },
    { id: "polls", label: "Polls" },
  ];

  const assignmentFilters = [
    { id: "assigned", label: "Assigned", icon: <Clock size={14} /> },
    { id: "submitted", label: "Submitted", icon: <CheckCircle size={14} /> },
    { id: "missed", label: "Missed", icon: <XCircle size={14} /> },
  ];

  const filteredPosts = posts
    .filter((post) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "assignments") return post.type === "assignment";
      if (activeFilter === "polls") return post.type === "poll";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") {
        return (b.upvotesCount || 0) - (a.upvotesCount || 0);
      }
      // Default to recent
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="feed-container">
      <motion.div
        className="feed-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="hero-title">
          {savedMode ? (
            <>
              Your <span>Saved</span> Posts
            </>
          ) : (
            <>
              Your <span>bootcamp</span> Feed
            </>
          )}
        </h1>
        <p className="hero-subtitle">
          {savedMode
            ? "All your bookmarked content in one place"
            : "stay updated with mentox bootcamp community"}
        </p>
      </motion.div>

      <motion.div
        className="feed-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="filter-pill-container">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-pill ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
              {activeFilter === f.id && (
                <motion.div
                  layoutId="pillIndicator"
                  className="pill-indicator"
                />
              )}
            </button>
          ))}
        </div>

        <div
          className="custom-sort-dropdown"
          ref={sortDropdownRef}
          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        >
          <span className="sort-label">Sort By:</span>
          <span className="sort-value">
            {sortBy === "recent" ? "Recent" : "Top Upvoted"}
          </span>
          <ChevronDown
            size={14}
            className={`sort-dropdown-icon ${isSortDropdownOpen ? "open" : ""}`}
          />

          <AnimatePresence>
            {isSortDropdownOpen && (
              <motion.div
                className="sort-dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  className={`sort-option ${sortBy === "recent" ? "active" : ""}`}
                  onClick={() => setSortBy("recent")}
                >
                  Recent
                </div>
                <div
                  className={`sort-option ${sortBy === "upvotes" ? "active" : ""}`}
                  onClick={() => setSortBy("upvotes")}
                >
                  Top Upvoted
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {activeFilter === "assignments" && (
          <motion.div
            className="sub-filters"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
          >
            {assignmentFilters.map((sf) => (
              <button
                key={sf.id}
                className={`sub-filter-btn ${assignmentSubFilter === sf.id ? "active" : ""}`}
                onClick={() => setAssignmentSubFilter(sf.id)}
              >
                {sf.icon} {sf.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="feed-grid">
        <AnimatePresence>
          {isLoading ? (
            <div className="loading-state">
              <div className="loader-orb"></div>
              <p>loading...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              className="empty-feed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">
                <FileText size={48} />
              </div>
              <h3>No posts found</h3>
              <p>Check back later for new updates.</p>
            </motion.div>
          ) : (
            filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`post-card instagram-style type-${post.type}`}
              >
                <div className="post-header-ig">
                  <div className="author-info">
                    <img
                      src={
                        post.author?.avatar ||
                        `https://ui-avatars.com/api/?name=${post.author?.name || "Admin"}`
                      }
                      alt="author"
                      className="author-avatar"
                      onClick={() => handleUserClick(post.createdBy)}
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <h4 className="author-name">
                        {post.author?.name || "Instructor"}
                      </h4>
                      <span className="post-time">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {getLoggedInUser()?.role === "admin" && (
                    <div style={{ position: "relative" }} ref={postMenuRef}>
                      <button
                        className="icon-btn"
                        onClick={() =>
                          setPostMenuOpenId(
                            openPostMenuId === post.id ? null : post.id,
                          )
                        }
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      <AnimatePresence>
                        {openPostMenuId === post.id && (
                          <motion.div
                            className="sort-dropdown-menu"
                            style={{ top: "100%", right: 0, minWidth: "120px" }}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div
                              className="sort-option"
                              onClick={() => handleDeletePost(post.id)}
                              style={{ color: "#ef4444" }}
                            >
                              <Trash2
                                size={16}
                                style={{
                                  marginRight: "8px",
                                  display: "inline-block",
                                  verticalAlign: "middle",
                                }}
                              />
                              Delete
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {post.mediaUrl && post.mediaUrl.length > 0 && (
                  <div className="post-media-ig">
                    <MediaCarousel urls={post.mediaUrl} type={post.type} />
                  </div>
                )}

                <div className="post-actions-ig">
                  <div className="action-group-left">
                    <button
                      className={`action-btn-ig ${post.upvoted ? "upvoted" : ""}`}
                      onClick={() => handleUpvote(post.id)}
                    >
                      <Heart
                        size={24}
                        fill={post.upvoted ? "#ef4444" : "none"}
                        stroke={post.upvoted ? "#ef4444" : "currentColor"}
                      />
                    </button>
                    <button
                      className="action-btn-ig"
                      onClick={() =>
                        setExpandedPostId(
                          expandedPostId === post.id ? null : post.id,
                        )
                      }
                    >
                      <MessageCircle size={24} />
                    </button>
                  </div>
                  <button
                    className={`action-btn-ig ${post.isSaved ? "saved" : ""}`}
                    onClick={() => handleSave(post.id)}
                  >
                    <Bookmark
                      size={24}
                      fill={post.isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="post-likes">
                  {post.upvotesCount || 0} likes &bull;{" "}
                  {post.PostComments ? post.PostComments.length : 0} comments
                </div>
                <div className="post-body-ig">
                  <div className="post-body-header">
                    <span className="author-name-inline">
                      {post.author?.name || "Instructor"}
                    </span>
                    <span className="post-title-inline">{post.title}</span>
                  </div>

                  {post.description && (
                    <p className="post-description">{post.description}</p>
                  )}
                  {post.content && (
                    <p className="post-content">{post.content}</p>
                  )}

                  {post.type === "assignment" && (
                    <div className="assignment-box">
                      <div className="deadline-badge">
                        Due: {new Date(post.deadline).toLocaleDateString()}
                      </div>
                      <button className="submit-assignment-btn">
                        Submit Work
                      </button>
                    </div>
                  )}

                  {post.type === "poll" && post.pollOptions && (
                    <div className="poll-container">
                      {post.pollOptions.map((opt, idx) => {
                        const optionVotes =
                          post.PollVotes?.filter((v) => v.optionIndex === idx)
                            .length || 0;
                        const percent =
                          post.totalPollVotes > 0
                            ? Math.round(
                                (optionVotes / post.totalPollVotes) * 100,
                              )
                            : 0;

                        return (
                          <div
                            key={idx}
                            className={`poll-option ${post.hasVotedPoll ? "voted-view" : ""} ${post.myPollVoteIndex === idx ? "my-vote" : ""}`}
                            onClick={() =>
                              !post.hasVotedPoll && handlePollVote(post.id, idx)
                            }
                          >
                            {post.hasVotedPoll ? (
                              <>
                                <div
                                  className="poll-progress"
                                  style={{ width: `${percent}%` }}
                                ></div>
                                <div className="poll-option-content">
                                  <span>{opt.option || opt}</span>
                                  <span>{percent}%</span>
                                </div>
                              </>
                            ) : (
                              <div className="poll-option-content">
                                <span>{opt.option || opt}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {post.hasVotedPoll && (
                        <div className="poll-total-votes">
                          {post.totalPollVotes} votes
                        </div>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {expandedPostId === post.id && (
                      <motion.div
                        className="comments-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="comment-input-wrapper">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="comment-input"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCommentSubmit(post.id)
                            }
                          />
                          <button
                            className="post-comment-btn"
                            onClick={() => handleCommentSubmit(post.id)}
                          >
                            Post
                          </button>
                        </div>

                        <div className="comments-list">
                          {post.PostComments && post.PostComments.length > 0 ? (
                            renderComments(
                              buildCommentTree(post.PostComments),
                              0,
                              post.id,
                            )
                          ) : (
                            <div
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem",
                              }}
                            >
                              No comments yet. Be the first!
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {!savedMode && (
        <>
          <SubmissionPromptWidget 
            assignments={posts.filter(p => p.type === "assignment")} 
            onRedirect={() => setActiveFilter("assignments")} 
            currentUserId={getLoggedInUser()?.id} 
          />
          <DoubtPromptWidget />
        </>
      )}
    </div>
  );
};

export default Feed;
