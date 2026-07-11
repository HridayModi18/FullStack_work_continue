import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Search,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import UserDetailsModal from "../components/UserDetailsModal";
import "./Doubts.css";

const Doubts = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [doubts, setDoubts] = useState({ answered: [], unanswered: [] });
  const [newQuestion, setNewQuestion] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [answerInputs, setAnswerInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedDoubts, setExpandedDoubts] = useState(new Set());

  const toggleDoubt = (id) => {
    const newSet = new Set(expandedDoubts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDoubts(newSet);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const user = parseJwt(localStorage.getItem("token"));
  const isAdmin = user?.role === "admin";

  const fetchDoubts = async () => {
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doubts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoubts(res.data);
    } catch (error) {
      console.error("Error fetching doubts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();

    const newSocket = io("${import.meta.env.VITE_API_URL || "http://localhost:5000"}");
    setSocket(newSocket);

    newSocket.on("new_doubt", () => fetchDoubts());
    newSocket.on("doubt_resolved", () => fetchDoubts());

    return () => newSocket.close();
  }, []);

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await axios.post("${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doubts", {
        question: newQuestion,
        isPublic,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNewQuestion("");
      setIsPublic(true); // reset
      fetchDoubts();
    } catch (error) {
      console.error("Error asking doubt:", error);
    }
  };

  const handleAnswerDoubt = async (doubtId) => {
    const answer = answerInputs[doubtId];
    if (!answer?.trim()) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doubts/${doubtId}/answer`, {
        answer,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnswerInputs({ ...answerInputs, [doubtId]: "" });
      fetchDoubts();
    } catch (error) {
      console.error("Error answering doubt:", error);
    }
  };

  const getDisplayedDoubts = () => {
    const allDoubts = [...doubts.answered, ...doubts.unanswered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    if (activeTab === "my") {
      return allDoubts.filter((d) => d.studentId === user?.id);
    }

    return allDoubts.filter((d) => d.isPublic || d.studentId === user?.id);
  };

  const renderDoubtCard = (doubt, i) => {
    const isExpanded = expandedDoubts.has(doubt.id);
    return (
      <motion.div
        key={doubt.id}
        className={`doubt-card ${doubt.status}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: i * 0.05 }}
      >
        <div 
          className="doubt-header" 
          onClick={() => toggleDoubt(doubt.id)}
          style={{ cursor: "pointer" }}
        >
          <div
            className="student-info"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(doubt.Student);
            }}
          >
            <img
              src={
                doubt.Student?.avatar ||
                `https://ui-avatars.com/api/?name=${doubt.Student?.name || "Student"}`
              }
              alt="avatar"
              className="student-avatar"
            />
            <div className="student-meta">
              <span className="student-name">
                {doubt.Student?.name || "Unknown Student"}
              </span>
              <div className="doubt-time-privacy">
                <span className="doubt-time">
                  {new Date(doubt.createdAt).toLocaleString()}
                </span>
                {!doubt.isPublic && (
                  <Lock size={12} className="privacy-icon private" />
                )}
              </div>
            </div>
          </div>
          <div className="doubt-header-right">
            <div className={`status-badge ${doubt.status}`}>
              {doubt.status === "resolved" ? (
                <CheckCircle size={14} />
              ) : (
                <Clock size={14} />
              )}
              {doubt.status === "resolved" ? "Resolved" : "Pending"}
            </div>
            {isExpanded ? <ChevronUp size={20} className="accordion-icon" /> : <ChevronDown size={20} className="accordion-icon" />}
          </div>
        </div>

        <div className="doubt-body">
          <p className="doubt-question">{doubt.question}</p>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              className="doubt-expanded-content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              style={{ overflow: "hidden" }}
            >
              {doubt.status === "resolved" ? (
                <div className="doubt-answer-section">
                  <h4 className="doubt-answer-label">Expert Answer</h4>
                  <p className="doubt-answer">{doubt.answer}</p>
                  <span className="admin-signature">
                    Answered by {doubt.Admin?.name || "Admin"}
                  </span>
                </div>
              ) : (
                <div className="doubt-answer-section pending-msg">
                  <p className="doubt-answer" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Yet to be answered...</p>
                </div>
              )}

              {isAdmin && doubt.status === "pending" && (
                <div className="admin-reply-section">
                  <textarea
                    placeholder="Type your expertly crafted answer here..."
                    className="admin-reply-input"
                    value={answerInputs[doubt.id] || ""}
                    onChange={(e) =>
                      setAnswerInputs({ ...answerInputs, [doubt.id]: e.target.value })
                    }
                    rows={3}
                  />
                  <button
                    className="resolve-btn"
                    onClick={() => handleAnswerDoubt(doubt.id)}
                    disabled={!answerInputs[doubt.id]?.trim()}
                  >
                    <CheckCircle size={16} /> Mark as Resolved
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="doubts-container">
      <motion.div
        className="doubts-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-content">
          <MessageSquare size={40} className="hero-icon" />
          <h1>{isAdmin ? "Doubt Solver Dashboard" : "Ask mentox experts"}</h1>
          <p>
            {isAdmin
              ? "Resolve queries"
              : "Stuck on a question? Drop it and mentox experts will answer it"}
          </p>
        </div>
      </motion.div>

      <div
        className={`doubts-grid-layout ${isAdmin ? "admin-layout" : "student-layout"}`}
      >
        <div className="layout-left-column">
          {!isAdmin ? (
            <motion.div
              className="ask-doubt-section sticky"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleAskDoubt} className="ask-doubt-form">
                <textarea
                  placeholder="Describe your doubt in detail..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="doubt-input"
                  rows={5}
                />

                <div className="ask-doubt-actions">
                  <div className="privacy-toggle-wrapper" data-public={isPublic.toString()}>
                    <button
                      type="button"
                      className={`privacy-btn ${isPublic ? "active" : ""}`}
                      onClick={() => setIsPublic(true)}
                    >
                      <Globe size={16} /> Public
                    </button>
                    <button
                      type="button"
                      className={`privacy-btn ${!isPublic ? "active" : ""}`}
                      onClick={() => setIsPublic(false)}
                    >
                      <Lock size={16} /> Private
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="submit-doubt-btn"
                    disabled={!newQuestion.trim()}
                  >
                    <Send size={18} /> Submit
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="admin-column">
              <h2 className="column-heading">
                Pending Queue{" "}
                <span className="badge">{doubts.unanswered.length}</span>
              </h2>
              <div className="doubts-list">
                <AnimatePresence>
                  {doubts.unanswered.length === 0 ? (
                    <div className="empty-state inline">
                      <CheckCircle size={32} className="empty-icon" />
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    doubts.unanswered.map((d, i) => renderDoubtCard(d, i))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="layout-right-column">
          {!isAdmin ? (
            <div className="doubts-content-wrapper">
              <div className="doubts-tabs">
                <button
                  className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
                  onClick={() => setActiveTab("my")}
                >
                  My Doubts
                </button>
                <button
                  className={`tab-btn ${activeTab === "community" ? "active" : ""}`}
                  onClick={() => setActiveTab("community")}
                >
                  Community Solutions
                </button>
              </div>

              <div className="doubts-list">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div className="loading-state" exit={{ opacity: 0 }}>
                      <div className="loader-orb"></div>
                      <p>Loading doubts...</p>
                    </motion.div>
                  ) : getDisplayedDoubts().length === 0 ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CheckCircle size={48} className="empty-icon" />
                      <h3>No doubts found</h3>
                      <p>You're all done </p>
                    </motion.div>
                  ) : (
                    getDisplayedDoubts().map((d, i) => renderDoubtCard(d, i))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="admin-column">
              <h2 className="column-heading">
                Resolved History{" "}
                <span className="badge resolved-badge">
                  {doubts.answered.length}
                </span>
              </h2>
              <div className="doubts-list">
                <AnimatePresence>
                  {doubts.answered.length === 0 ? (
                    <div className="empty-state inline">
                      <Clock size={32} className="empty-icon" />
                      <p>No history yet.</p>
                    </div>
                  ) : (
                    doubts.answered.map((d, i) => renderDoubtCard(d, i))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Doubts;
