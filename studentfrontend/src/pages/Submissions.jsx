import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Users,
  Award,
  FileText,
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import PostMedia from "../components/PostMedia";
import UserDetailsModal from "../components/UserDetailsModal";
import "./Submissions.css";

const Submissions = () => {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'completed', 'missed'
  const [data, setData] = useState({
    assignments: { pending: [], completed: [], missed: [] },
    progress: { pendingCount: 0, completedCount: 0, missedCount: 0 },
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [file, setFile] = useState(null);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/submissions/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setData(res.data);
      setCurrentIndex(0); // Reset index on fetch
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentIndex(0);
    setFile(null);
    setDifficultyRating(0);
    setFeedback("");
  };

  const currentAssignments = data.assignments[activeTab] || [];
  const currentAssignment = currentAssignments[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentAssignments.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + currentAssignments.length) % currentAssignments.length,
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAssignment) return;

    if (!file && !currentAssignment.mySubmission) {
      showToast("Please select a file to submit!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("postId", currentAssignment.id);
      if (file) formData.append("pdf", file);
      if (difficultyRating > 0)
        formData.append("difficultyRating", difficultyRating);
      if (feedback) formData.append("feedback", feedback);

      await axios.post("${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/submissions", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Submission successful!", "success");
      setFile(null);
      setDifficultyRating(0);
      setFeedback("");
      fetchDashboard();
    } catch (err) {
      showToast(
        `Submission failed: ${err.response?.data?.message || err.message}`,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="submissions-loader">
        <Loader2 size={48} className="animate-spin text-accent" />
      </div>
    );
  }

  const { progress, leaderboard } = data;
  const total =
    progress.pendingCount + progress.completedCount + progress.missedCount;
  const completedPct =
    total === 0 ? 0 : (progress.completedCount / total) * 100;
  const missedPct = total === 0 ? 0 : (progress.missedCount / total) * 100;
  const p1 = `${completedPct}%`;
  const p2 = `${completedPct + missedPct}%`;

  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 1;

  const renderLeftColumn = () => {
    if (currentAssignments.length === 0) {
      return (
        <div className="empty-state">
          <FileText size={64} color="var(--text-secondary)" />
          <h3>No {activeTab} assignments found.</h3>
        </div>
      );
    }

    const isGraded = currentAssignment.mySubmission?.status === "graded";
    const canResubmit = activeTab === "completed" && !isGraded;

    return (
      <div className="assignment-viewer-wrapper">
        <div className="viewer-header">
          <h2>
            {currentAssignment.title ||
              `Assignment #${currentAssignment.assignmentId || currentAssignment.id}`}
          </h2>
          <div className="viewer-nav">
            <button onClick={handlePrev} className="nav-btn">
              <ChevronLeft size={20} />
            </button>
            <span>
              {currentIndex + 1} / {currentAssignments.length}
            </span>
            <button onClick={handleNext} className="nav-btn">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="viewer-stats">
          <div className="v-stat">
            <Users size={16} /> {currentAssignment.completionCount} Completions
          </div>
          <div className="v-stat">
            <Star size={16} fill="currentColor" color="#f59e0b" />{" "}
            {currentAssignment.averageDifficulty}/10 Avg Difficulty
          </div>
          <div className="v-stat">
            <Award size={16} color="#3b82f6" /> {currentAssignment.averageScore}
            /100 Avg Score
          </div>
          <div className="v-stat clock">
            <Clock size={16} />{" "}
            {currentAssignment.deadline
              ? new Date(currentAssignment.deadline).toLocaleDateString()
              : "No Deadline"}
          </div>
          {isGraded && (
            <div className="v-stat score">
              <Award size={16} /> Your Score:{" "}
              {currentAssignment.mySubmission.score}
            </div>
          )}
        </div>

        <div className="pdf-showcase">
          {currentAssignment.mediaUrl &&
          currentAssignment.mediaUrl.length > 0 ? (
            <PostMedia type="assignment" url={currentAssignment.mediaUrl[0]} />
          ) : (
            <div className="no-pdf-placeholder">
              No PDF attached to this assignment.
            </div>
          )}
        </div>

        {(activeTab === "pending" || canResubmit) && (
          <form className="submit-panel" onSubmit={handleSubmit}>
            <h3>{canResubmit ? "Resubmit Assignment" : "Submit Your Work"}</h3>

            <div className="submit-flex">
              <div className="file-upload-box">
                <input
                  type="file"
                  id="assignment-file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="assignment-file">
                  <UploadCloud size={24} />
                  <span>
                    {file ? file.name : "Click or Drag to Upload PDF"}
                  </span>
                </label>
              </div>

              <div className="rating-feedback-box">
                <label>Rate Difficulty (1-10)</label>
                <div className="star-rating">
                  {[...Array(10)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`star-icon ${(hoverRating || difficultyRating) > i ? "active" : ""}`}
                      onClick={() => setDifficultyRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="feedback (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit Assignment"
              )}
            </button>
          </form>
        )}
      </div>
    );
  };

  const getAvatarUrl = (name, avatar) => {
    if (avatar && avatar !== "null") return avatar;
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  return (
    <div className="submissions-page">
      <div className="capsules-wrapper">
        <button
          className={`capsule ${activeTab === "pending" ? "active pending" : ""}`}
          onClick={() => handleTabChange("pending")}
        >
          Pending ({progress.pendingCount})
        </button>
        <button
          className={`capsule ${activeTab === "completed" ? "active completed" : ""}`}
          onClick={() => handleTabChange("completed")}
        >
          Completed ({progress.completedCount})
        </button>
        <button
          className={`capsule ${activeTab === "missed" ? "active missed" : ""}`}
          onClick={() => handleTabChange("missed")}
        >
          Missed ({progress.missedCount})
        </button>
      </div>

      <div className="submissions-grid">
        <div className="col-left">{renderLeftColumn()}</div>

        <div className="col-right">
          <div className="progress-card">
            <h3>Overall Progress</h3>
            <div className="pie-chart-wrapper">
              <div
                className="pie-chart"
                style={{
                  background: `conic-gradient(#10b981 0% ${p1}, #ef4444 ${p1} ${p2}, #3b82f6 ${p2} 100%)`,
                }}
              ></div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="dot dot-completed"></span> Completed
                </div>
                <div className="legend-item">
                  <span className="dot dot-missed"></span> Missed
                </div>
                <div className="legend-item">
                  <span className="dot dot-pending"></span> Pending
                </div>
              </div>
            </div>
          </div>

          <div className="leaderboard-card">
            <h3>
              <Award
                size={20}
                color="#f59e0b"
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />{" "}
              Global Leaderboard
            </h3>
            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <p className="no-leaderboard">No scores yet. Be the first!</p>
              ) : (
                leaderboard.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className="leaderboard-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <span className="rank">#{index + 1}</span>
                    <img
                      src={getAvatarUrl(user.name, user.avatar)}
                      alt={user.name}
                      className="lb-avatar"
                    />
                    <div className="lb-info">
                      <span className="lb-name">{user.name}</span>
                      <div className="lb-bar-wrapper">
                        <div
                          className="lb-bar"
                          style={{
                            width: `${Math.max(5, (user.score / topScore) * 100)}%`,
                          }}
                        ></div>
                        <span className="lb-score">{user.score}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={`custom-toast toast-${toastType}`}
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {toastType === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Submissions;
