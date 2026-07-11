import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./Onboarding.css";

const Onboarding = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    year: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.rollNumber || !data.year) {
          setNeedsOnboarding(true);
          setFormData((prev) => ({ ...prev, name: data.name || "" }));
        } else {
          onComplete();
        }
      }
    } catch (err) {
      console.error("Error checking profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber || !formData.year) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("rollNumber", formData.rollNumber);
      submitData.append("year", formData.year);

      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.dispatchEvent(new Event("storage"));
        }
        onComplete();
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!needsOnboarding) return null;

  return (
    <div className="onboarding-overlay">
      <motion.div
        className="onboarding-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2>Welcome to the Bootcamp!</h2>
        <p>Before you begin, we need a few mandatory details.</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              value={formData.rollNumber}
              onChange={(e) =>
                setFormData({ ...formData, rollNumber: e.target.value })
              }
              required
              placeholder="e.g. 2021CS101"
            />
          </div>

          <div className="form-group">
            <label>Year of Study</label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required
              className="elegant-select"
            >
              <option value="" disabled>
                Select your year
              </option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <button type="submit" className="onboarding-btn" disabled={saving}>
            {saving ? "Saving..." : "Get Started"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
