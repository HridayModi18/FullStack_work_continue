import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  HelpCircle,
  Activity,
  Award,
  Clock,
  X,
  Loader2,
  Bell,
  MessageSquare,
  FileText,
} from "lucide-react";
import UserDetailsModal from "../components/UserDetailsModal";
import "./Dashboard.css";
import "./Submissions.css";

const RankModal = ({ onClose }) => (
  <div className="rank-modal-overlay" onClick={onClose}>
    <motion.div
      className="rank-modal"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2>
        <Award size={24} color="#f59e0b" /> Rank Tiers
      </h2>
      <button className="close-btn" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="rank-tier-list">
        <div className="rank-tier">
          <span>Novice</span>
          <span>0 - 100</span>
        </div>
        <div className="rank-tier">
          <span>Knight</span>
          <span>101 - 300</span>
        </div>
        <div className="rank-tier">
          <span>Master</span>
          <span>301 - 600</span>
        </div>
        <div className="rank-tier">
          <span>Guardian</span>
          <span>601 - 1000</span>
        </div>
        <div className="rank-tier">
          <span style={{ color: "#f59e0b" }}>Legendary</span>
          <span>1001+</span>
        </div>
      </div>
    </motion.div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRankModal, setShowRankModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/dashboard/main",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="loading-container">
        <Loader2 size={40} className="animate-spin" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const { user, progress, leaderboard, timeline } = data;
  const totalAssigned =
    progress.pendingCount + progress.completedCount + progress.missedCount;
  const p1 =
    totalAssigned > 0
      ? (progress.completedCount / totalAssigned) * 100 + "%"
      : "0%";
  const p2 =
    totalAssigned > 0
      ? ((progress.completedCount + progress.missedCount) / totalAssigned) *
          100 +
        "%"
      : "0%";

  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 1;
  const xpPercentage = Math.min((user.xp / user.nextThreshold) * 100, 100);

  const getTimelineIcon = (type) => {
    if (type === "assignment_graded") return <Award size={18} />;
    if (type === "general") return <Bell size={18} />;
    return <Activity size={18} />;
  };

  const getAvatarUrl = (name, avatarUrl) => {
    return avatarUrl && avatarUrl !== "null"
      ? avatarUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name || "User",
        )}&background=random`;
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* HERO BANNER */}
      <div className="dashboard-hero">
        <div className="hero-bg-glow"></div>
        <div className="hero-left">
          <div className="hero-avatar-wrapper">
            <img
              src={getAvatarUrl(user.name, user.avatar)}
              alt="Avatar"
              className="hero-avatar"
            />
            <div className="hero-rank-badge">
              <Award size={18} />
            </div>
          </div>
          <div className="hero-info">
            <h1>{user.name}</h1>
            <div className="student-meta">
              {user.rollNumber && (
                <div className="meta-tag">
                  <FileText size={14} /> {user.rollNumber}
                </div>
              )}
              {user.year && (
                <div className="meta-tag">
                  <Clock size={14} /> {user.year} Year
                </div>
              )}
              {user.branch && (
                <div className="meta-tag">
                  <Activity size={14} /> {user.branch}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="rank-display">
            <h2>{user.rankName}</h2>
            <HelpCircle
              size={20}
              className="info-icon"
              onClick={() => setShowRankModal(true)}
            />
          </div>
          <div className="xp-container">
            <div className="xp-label">
              <span>{user.xp} XP</span>
              <span>Next: {user.nextThreshold} XP</span>
            </div>
            <div className="xp-bar-wrapper">
              <div
                className="xp-bar"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="dashboard-grid">
        {/* PIE CHART */}
        <div className="dash-card">
          <h3>
            <Activity size={20} color="#3b82f6" /> Submissions
          </h3>
          <div className="pie-chart-wrapper">
            <div
              className="pie-chart"
              style={{
                background: `conic-gradient(#10b981 0% ${p1}, #ef4444 ${p1} ${p2}, #3b82f6 ${p2} 100%)`,
              }}
            ></div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="dot dot-completed"></span> Completed (
                {progress.completedCount})
              </div>
              <div className="legend-item">
                <span className="dot dot-missed"></span> Missed (
                {progress.missedCount})
              </div>
              <div className="legend-item">
                <span className="dot dot-pending"></span> Pending (
                {progress.pendingCount})
              </div>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="dash-card">
          <h3>
            <Clock size={20} color="#10b981" /> Recent Activity
          </h3>
          <div className="timeline-list">
            {timeline.length === 0 ? (
              <p
                style={{ color: "var(--text-secondary)", textAlign: "center" }}
              >
                No recent activity. Get coding!
              </p>
            ) : (
              timeline.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="timeline-icon">
                    {getTimelineIcon(notif.type)}
                  </div>
                  <div className="timeline-content">
                    <p>{notif.message}</p>
                    <span className="timeline-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="dash-card">
          <h3>
            <Award size={20} color="#f59e0b" /> Global Leaderboard
          </h3>
          <div className="lb-list-dash">
            {leaderboard.length === 0 ? (
              <p className="no-leaderboard">No scores yet. Be the first!</p>
            ) : (
              leaderboard.map((u, index) => (
                <motion.div
                  key={u.id}
                  className="leaderboard-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedUser(u)}
                >
                  <span className="rank">#{index + 1}</span>
                  <img
                    src={getAvatarUrl(u.name, u.avatar)}
                    alt={u.name}
                    className="lb-avatar"
                  />
                  <div className="lb-info">
                    <span className="lb-name">{u.name}</span>
                    <div className="lb-bar-wrapper">
                      <div
                        className="lb-bar"
                        style={{
                          width: `${Math.max(5, (u.score / topScore) * 100)}%`,
                        }}
                      ></div>
                      <span className="lb-score">{u.score}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRankModal && <RankModal onClose={() => setShowRankModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
