import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import labubuImg from "../assets/labubu.png";
import {
  Download,
  ExternalLink,
  ArrowRight,
  Check,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";
import PostMedia from "./PostMedia";
import "./SubmissionPromptWidget.css";

const SubmissionPromptWidget = ({
  assignments = [],
  currentUserId,
}) => {
  const [isPeeling, setIsPeeling] = useState(false);
  const [peelAction, setPeelAction] = useState(null);
  const [pdfModalUrl, setPdfModalUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pdfModalUrl) {
      document.body.classList.add("hide-navbar-global");
    } else {
      document.body.classList.remove("hide-navbar-global");
    }
    return () => document.body.classList.remove("hide-navbar-global");
  }, [pdfModalUrl]);

  const handleAction = (action, payload) => {
    setIsPeeling(true);
    setPeelAction(action);
    setTimeout(() => {
      setIsPeeling(false);
      if (action === "redirect") {
        navigate("/submissions");
      } else if (action === "open") {
        setPdfModalUrl(payload);
      }
    }, 1500);
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "Assignment.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (assignments.length === 0) return null;

  return (
    <>
      <motion.div
        className="submission-widget-container"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 100, damping: 15 }}
      >
        <img
          src={labubuImg}
          alt="Labubu Mascot"
          className="sub-labubu-mascot"
        />

        <div className="submission-prompt-box">
          <h3 className="submission-widget-title">Active Assignments</h3>
          <div className="assignments-scroll-list">
            {assignments.map((assignment, index) => {
              const isSubmitted = assignment.AssignmentSubmissions?.some(
                (sub) =>
                  sub.studentId === currentUserId && sub.status === "submitted",
              );
              const rawUrl = assignment.mediaUrl && assignment.mediaUrl.length > 0 ? assignment.mediaUrl[0] : null;
              const pdfUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `http://localhost:5000${rawUrl}`) : null;

              return (
                <div key={assignment.id} className="assignment-mini-wrapper">
                  <div className="assignment-mini-card">
                    <div className="assignment-mini-header">
                      <span className="assignment-mini-title">
                        {assignment.title ||
                          `Assignment #${assignment.assignmentId || assignment.id}`}
                      </span>
                      <span className={`mini-status-badge ${isSubmitted ? 'submitted' : 'pending'}`}>
                        {isSubmitted ? <Check size={12} /> : <AlertTriangle size={12} />}
                        {isSubmitted ? "COMPLETED" : "PENDING"}
                      </span>
                    </div>

                    <div className="assignment-mini-bottom">
                      <div className="assignment-mini-meta">
                        Due:{" "}
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </div>
                      <div className="assignment-mini-actions">
                        {pdfUrl ? (
                          <>
                            <button className="mini-action-btn" title="Download PDF" onClick={() => handleDownload(pdfUrl)}>
                              <Download size={14} />
                            </button>
                            <button className="mini-action-btn" title="Open PDF" onClick={() => handleAction("open", rawUrl)}>
                              <ExternalLink size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="no-pdf-text" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginRight: '8px' }}>No PDF</span>
                        )}
                        <button
                          className="mini-action-btn primary"
                          title="Go to Submissions"
                          onClick={() => handleAction("redirect")}
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < assignments.length - 1 && (
                    <div className="modern-dotted-divider" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isPeeling && (
          <motion.div
            className="peel-overlay"
            initial={{ clipPath: "circle(0% at 5% 95%)" }}
            animate={{ clipPath: "circle(150% at 5% 95%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.64, 0, 0.1, 1] }}
          >
            <motion.div
              className="peel-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <FileText size={64} color="white" />
              <h2>
                {peelAction === "redirect"
                  ? "Taking you to Submissions..."
                  : "Opening Assignment..."}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pdfModalUrl && (
          <motion.div
            className="pdf-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pdf-modal-container">
              <button className="pdf-close-btn" onClick={() => setPdfModalUrl(null)}>
                <X size={24} />
              </button>
              <div className="overlay-postmedia-wrapper">
                <PostMedia type="assignment" url={pdfModalUrl} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SubmissionPromptWidget;
