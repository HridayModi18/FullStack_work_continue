import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { FileText, CheckCircle, Clock, X, Award, Loader2 } from "lucide-react";
import "./Submissions.css";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Modal state
  const [score, setScore] = useState("");
  const [adminComments, setAdminComments] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  const headerRef = useRef(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        filtersRef.current,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.2, delay: 0.1, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!score || score < 0 || score > 100) {
      alert("enter between 0 to 100");
      return;
    }

    setIsGrading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/submissions/${selectedSubmission.id}/grade`,
        { score, adminComments },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSubmissions(
        submissions.map((sub) =>
          sub.id === selectedSubmission.id
            ? { ...sub, status: "graded", score, adminComments }
            : sub,
        ),
      );

      closeModal();
    } catch (error) {
      console.error("Failed to grade:", error);
      alert("Error while grading");
    } finally {
      setIsGrading(false);
    }
  };

  const openModal = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || "");
    setAdminComments(submission.adminComments || "");
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setScore("");
    setAdminComments("");
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <div className="submissions-header" ref={headerRef}>
        <h1>Assignment Submissions</h1>
        <div className="filter-group" ref={filtersRef}>
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "submitted" ? "active" : ""}`}
            onClick={() => setFilter("submitted")}
          >
            Pending Grading
          </button>
          <button
            className={`filter-btn ${filter === "graded" ? "active" : ""}`}
            onClick={() => setFilter("graded")}
          >
            Graded
          </button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
        >
          <FileText size={64} />
          <h2>No Submissions Found</h2>
          <p>There are no submissions matching your current filter.</p>
        </motion.div>
      ) : (
        <motion.div className="submissions-grid" layout>
          <AnimatePresence>
            {filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="submission-card"
              >
                <div className={`status-badge status-${submission.status}`}>
                  {submission.status}
                </div>

                <div className="student-info">
                  <img
                    src={
                      submission.User?.avatar ||
                      `https://ui-avatars.com/api/?name=${submission.User?.name || "Student"}`
                    }
                    alt="avatar"
                    className="student-avatar"
                  />
                  <div className="student-details">
                    <h3>{submission.User?.name}</h3>
                    <p>{submission.User?.email}</p>
                  </div>
                </div>

                <div className="submission-meta">
                  <h4>
                    {submission.BootcampPost?.title || "Unknown Assignment"}
                  </h4>
                  <p>
                    <Clock size={14} /> Submitted:{" "}
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  {submission.status === "graded" && (
                    <p className="mt-1 text-emerald-400 font-semibold">
                      <CheckCircle size={14} /> Score: {submission.score}/100
                    </p>
                  )}
                </div>

                <div className="action-buttons">
                  <a
                    href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${submission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-view"
                  >
                    <FileText size={18} /> View PDF
                  </a>
                  <button
                    className="btn-grade"
                    onClick={() => openModal(submission)}
                  >
                    <Award size={18} />{" "}
                    {submission.status === "graded" ? "Edit Grade" : "Grade"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains("modal-overlay")) closeModal();
            }}
          >
            <motion.div 
              className="grading-modal"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="modal-header">
                <h2>Grade Submission</h2>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleGradeSubmit} className="modal-body">
                <div className="form-group">
                  <label>Student</label>
                  <input
                    type="text"
                    value={selectedSubmission.User?.name}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score..."
                  />
                </div>
                <div className="form-group">
                  <label>Feedback for Student (Optional)</label>
                  <textarea
                    rows="4"
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    placeholder="Great job on..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="submit-grade-btn"
                  disabled={isGrading}
                >
                  {isGrading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  {isGrading ? "Saving Grade..." : "Submit Grade"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Submissions;
