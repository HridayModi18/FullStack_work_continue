import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Edit2,
  MessageSquare,
  BarChart2,
  Image as ImageIcon,
  Video,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import EditPostModal from "./EditPostModal";
import "./ManagePosts.css";

const ImageCarousel = ({ urls }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) return null;

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="carousel-container">
      <img
        src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${urls[currentIndex]}`}
        alt={`Image ${currentIndex + 1}`}
      />

      {urls.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-btn next" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>

          <div className="carousel-bullets">
            {urls.map((_, i) => (
              <span
                key={i}
                className={`bullet ${i === currentIndex ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingPost, setEditingPost] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bootcamp`);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const onUpdatePost = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this post?")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bootcamp/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(posts.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Do you have admin privileges?");
    }
  };

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((p) => {
          if (activeFilter === "media")
            return ["photo", "video", "assignment"].includes(p.type);
          return p.type === activeFilter;
        });

  const getIconForType = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare size={16} />;
      case "poll":
        return <BarChart2 size={16} />;
      case "photo":
        return <ImageIcon size={16} />;
      case "video":
        return <Video size={16} />;
      case "assignment":
        return <FileText size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getPreviewContent = (post) => {
    if (post.type === "message") {
      return <p className="card-text-content">{post.content}</p>;
    }

    if (post.type === "poll") {
      let optionsArr = post.pollOptions;
      if (typeof optionsArr === "string") {
        try {
          optionsArr = JSON.parse(optionsArr);
        } catch (e) {
          optionsArr = [];
        }
      }
      return (
        <div className="poll-preview">
          {Array.isArray(optionsArr) &&
            optionsArr.map((opt, i) => (
              <div key={i} className="poll-option-bar">
                <span>{opt}</span>
                <span style={{ opacity: 0.5 }}>0%</span>
              </div>
            ))}
        </div>
      );
    }

    let mediaUrls = [];
    if (post.mediaUrl) {
      if (typeof post.mediaUrl === "string") {
        try {
          mediaUrls = JSON.parse(post.mediaUrl);
        } catch (e) {
          mediaUrls = [post.mediaUrl];
        }
      } else if (Array.isArray(post.mediaUrl)) {
        mediaUrls = post.mediaUrl;
      }
    }

    return (
      <>
        {post.content && (
          <p className="card-text-content" style={{ marginBottom: "1rem" }}>
            {post.content}
          </p>
        )}
        {post.type === "photo" && mediaUrls.length > 0 ? (
          <div className="media-preview-box">
            <ImageCarousel urls={mediaUrls} />
          </div>
        ) : (
          <a
            href={mediaUrls[0] ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${mediaUrls[0]}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="media-preview-box"
          >
            <div className="media-icon-large">
              {post.type === "video" ? (
                <Video size={32} />
              ) : (
                <FileText size={32} />
              )}
              <span>Click to View {post.type}</span>
            </div>
          </a>
        )}
      </>
    );
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="manage-posts-container">
      <div className="manage-posts-header">
        <h1>Admin Panel</h1>
        <p>Manage and monitor all broadcasted content across the network.</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All Posts
        </button>
        <button
          className={`filter-btn ${activeFilter === "message" ? "active" : ""}`}
          onClick={() => setActiveFilter("message")}
        >
          Announcements
        </button>
        <button
          className={`filter-btn ${activeFilter === "poll" ? "active" : ""}`}
          onClick={() => setActiveFilter("poll")}
        >
          Polls
        </button>
        <button
          className={`filter-btn ${activeFilter === "media" ? "active" : ""}`}
          onClick={() => setActiveFilter("media")}
        >
          Media & Assignments
        </button>
      </div>

      {loading ? (
        <div className="loading-feed">
          <Loader2 size={48} className="animate-spin" color="#3b82f6" />
          <p>Syncing network data...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-feed">
          <div
            style={{
              padding: "2rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "50%",
            }}
          >
            <MessageSquare size={48} opacity={0.3} />
          </div>
          <h2>No transmissions found</h2>
          <p>The network is quiet. Try broadcasting a new post.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <div key={post.id} className={`post-card type-${post.type}`}>
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-type-badge">
                    {getIconForType(post.type)}
                    {post.type}
                  </div>
                  <h3 className="card-title">{post.title}</h3>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn edit-btn"
                    title="Edit Title"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Delete Post"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="card-body">{getPreviewContent(post)}</div>

              <div className="card-footer">
                {post.tags && post.tags.length > 0 && (
                  <div className="card-tags">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="card-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="card-meta">
                  <div className="author-info">
                    {post.author?.avatar && post.author.avatar !== "null" ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="author-avatar"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${post.author?.name || "Admin"}`}
                        alt={post.author?.name || "Admin"}
                        className="author-avatar"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <span>{post.author?.name?.split(" ")[0] || "Admin"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={12} />
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdate={onUpdatePost}
        />
      )}
    </div>
  );
};

export default ManagePosts;
