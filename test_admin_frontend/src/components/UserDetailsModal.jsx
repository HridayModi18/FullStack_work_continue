import React, { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  BookOpen,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import "./Students.css";

const UserDetailsModal = ({ user, onClose }) => {
  const [showDoubts, setShowDoubts] = useState(false);

  const getAvatarUrl = (name, avatar) => {
    if (avatar && avatar !== "null") return avatar;
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

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
            <span className="modal-email">{user.email}</span>
            <span className={`modal-badge ${user.role}`}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="modal-body-stats">
          {user.role === "student" ? (
            <>
              <div className="stat-block">
                <span className="stat-title">Roll Number</span>
                <span className="stat-number">{user.rollNo}</span>
              </div>
              <div className="stat-block">
                <span className="stat-title">Year</span>
                <span className="stat-number">{user.year}</span>
              </div>
              <div className="stat-block">
                <span className="stat-title">
                  <BookOpen size={16} /> Assignments
                </span>
                <span className="stat-number">{user.assignments}</span>
              </div>
              <div className="stat-block">
                <span className="stat-title">
                  <Calendar size={16} /> Last Active
                </span>
                <span className="stat-number">{user.lastActive}</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat-block">
                <span className="stat-title">Posts Created</span>
                <span className="stat-number">{user.postsCreated}</span>
              </div>
              <div className="stat-block">
                <span className="stat-title">Doubts Answered</span>
                <span className="stat-number">{user.doubtsAnswered}</span>
              </div>
              <div className="stat-block full-width">
                <span className="stat-title">
                  <Calendar size={16} /> Last Login
                </span>
                <span className="stat-number">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </>
          )}
        </div>

        {user.doubts && user.doubts.length > 0 && (
          <div className="doubts-section">
            <button
              className="doubts-toggle"
              onClick={() => setShowDoubts(!showDoubts)}
            >
              <div className="doubts-toggle-left">
                <HelpCircle size={18} className="doubt-icon" />
                <span>{user.role === 'admin' ? 'Answered Doubts' : 'Doubt History'} ({user.doubts.length})</span>
              </div>
              {showDoubts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showDoubts && (
              <div className="doubts-list">
                {user.doubts.map((doubt, idx) => (
                  <div key={idx} className="doubt-item">
                    <p className="doubt-q">Q: {doubt.q}</p>
                    {user.role === 'admin' && doubt.a && (
                       <p className="doubt-a"><strong>A:</strong> {doubt.a}</p>
                    )}
                    <span className={`doubt-status ${doubt.status}`}>
                      {doubt.status === "resolved" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <HelpCircle size={14} />
                      )}
                      {doubt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;
