import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Calendar,
  BookOpen,
} from "lucide-react";
import "./UserDetailsModal.css";

const UserDetailsModal = ({ user, onClose }) => {
  const getAvatarUrl = (name, avatar) => {
    if (avatar && avatar !== "null") return avatar;
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`http://localhost:5000/api/users/${user.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };
    if (user && user.id) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content user-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header-profile">
          <img
            src={getAvatarUrl(user.name, user.avatar)}
            alt={user.name}
            className="modal-avatar"
          />
          <div className="modal-user-info">
            <h2>{user.name}</h2>
          </div>
        </div>

        <div className="modal-body-stats" style={{ gridTemplateColumns: '1fr', padding: '1.5rem 2rem 2rem 2rem' }}>
          <div className="stat-block">
            <span className="stat-title">Roll Number</span>
            <span className="stat-number">{stats?.rollNo || user.rollNo || "N/A"}</span>
          </div>
          <div className="stat-block">
            <span className="stat-title">
              <BookOpen size={16} /> Assignments
            </span>
            <span className="stat-number">{stats?.assignments !== undefined ? stats.assignments : (user.assignments !== undefined ? user.assignments : "N/A")}</span>
          </div>
          <div className="stat-block">
            <span className="stat-title">
              <Calendar size={16} /> Last Active
            </span>
            <span className="stat-number">{stats?.lastActive ? new Date(stats.lastActive).toLocaleDateString() : (user.lastActive || "N/A")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
