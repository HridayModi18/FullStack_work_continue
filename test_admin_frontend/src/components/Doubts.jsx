import React, { useState, useEffect } from "react";
import axios from "axios";
import { HelpCircle, CheckCircle, MessageSquare, Send } from "lucide-react";
import "./Doubts.css";

const Doubts = () => {
  const [activeTab, setActiveTab] = useState("unanswered");
  const [doubts, setDoubts] = useState({ answered: [], unanswered: [] });
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    fetchDoubts();
  }, []);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/doubts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoubts(res.data);
    } catch (err) {
      console.error("Failed to fetch doubts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyText((prev) => ({ ...prev, [id]: text }));
  };

  const submitAnswer = async (id) => {
    const text = replyText[id];
    if (!text || text.trim() === "") return;

    try {
      setSubmitting(id);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/doubts/${id}/answer`,
        { answer: text },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setReplyText((prev) => ({ ...prev, [id]: "" }));
      fetchDoubts();
    } catch (err) {
      console.error("Error answering doubt", err);
    } finally {
      setSubmitting(null);
    }
  };

  const getAvatarUrl = (name, avatar) => {
    if (avatar && avatar !== "null") return avatar;
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  return (
    <div className="doubts-container">
      <div className="doubts-header">
        <h1>Solve Doubts</h1>
        <p>Help students by resolving their questions and unblocking them.</p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "unanswered" ? "active" : ""}`}
            onClick={() => setActiveTab("unanswered")}
          >
            <HelpCircle size={18} />
            Unanswered ({doubts.unanswered.length})
          </button>
          <button
            className={`tab ${activeTab === "answered" ? "active" : ""}`}
            onClick={() => setActiveTab("answered")}
          >
            <CheckCircle size={18} />
            Answered ({doubts.answered.length})
          </button>
        </div>
      </div>

      <div className="doubts-content">
        {loading ? (
          <div className="loading-state">Loading doubts...</div>
        ) : activeTab === "unanswered" ? (
          <div className="doubts-grid">
            {doubts.unanswered.length === 0 ? (
              <div className="empty-state">Hooray! No pending doubts.</div>
            ) : (
              doubts.unanswered.map((doubt) => (
                <div key={doubt.id} className="doubt-card unanswered">
                  <div className="doubt-card-header">
                    <img
                      src={getAvatarUrl(
                        doubt.Student.name,
                        doubt.Student.avatar,
                      )}
                      alt="Student"
                    />
                    <div className="student-info">
                      <h4>{doubt.Student.name}</h4>
                      <span>{new Date(doubt.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="doubt-question">
                    <h3>{doubt.question}</h3>
                  </div>
                  <div className="doubt-reply-box">
                    <textarea
                      placeholder="Write your answer here..."
                      value={replyText[doubt.id] || ""}
                      onChange={(e) =>
                        handleReplyChange(doubt.id, e.target.value)
                      }
                    ></textarea>
                    <button
                      className="submit-reply-btn"
                      disabled={
                        submitting === doubt.id || !replyText[doubt.id]?.trim()
                      }
                      onClick={() => submitAnswer(doubt.id)}
                    >
                      {submitting === doubt.id ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send size={16} /> Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="doubts-grid">
            {doubts.answered.length === 0 ? (
              <div className="empty-state">No answered doubts yet.</div>
            ) : (
              doubts.answered.map((doubt) => (
                <div key={doubt.id} className="doubt-card answered">
                  <div className="doubt-card-header">
                    <img
                      src={getAvatarUrl(
                        doubt.Student.name,
                        doubt.Student.avatar,
                      )}
                      alt="Student"
                    />
                    <div className="student-info">
                      <h4>{doubt.Student.name}</h4>
                      <span>
                        Asked on{" "}
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="resolved-badge">
                      <CheckCircle size={14} /> Resolved
                    </div>
                  </div>
                  <div className="doubt-question">
                    <h3>{doubt.question}</h3>
                  </div>
                  <div className="doubt-answer-display">
                    <div className="answer-header">
                      <MessageSquare size={16} className="answer-icon" />
                      <span>
                        Answered by{" "}
                        <strong>{doubt.Admin?.name || "Admin"}</strong>
                      </span>
                    </div>
                    <p>{doubt.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doubts;
