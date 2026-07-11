import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Save, Upload, User as UserIcon } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    rollNumber: "",
    year: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          rollNumber: data.rollNumber || "",
          year: data.year || "",
          bio: data.bio || "",
          avatar: data.avatar || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("rollNumber", profile.rollNumber);
      formData.append("year", profile.year);
      formData.append("bio", profile.bio);
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setMessage("Profile updated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage("update failed");
      }
    } catch (err) {
      setMessage("Error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to completely delete your account? This cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Failed to delete account");
      }
    } catch (err) {
      alert("Error deleting account");
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <motion.div
      className="profile-page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" />
          ) : (
            <UserIcon size={48} color="#a1a1aa" />
          )}
        </div>
        <div className="profile-title-area">
          <h2>{profile.name || "Student"}</h2>
          <p>{profile.email}</p>
        </div>
      </div>

      <div className="profile-form-card">
        <h3>Edit Profile</h3>

        {message && (
          <div
            className={`profile-message ${message.includes("success") ? "success" : "error"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              value={profile.rollNumber}
              onChange={(e) =>
                setProfile({ ...profile, rollNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <select
              value={profile.year}
              onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              required
              className="elegant-select"
            >
              <option value="" disabled>Select your year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <div className="file-input-wrapper">
              <Upload size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
              <span>
                {photoFile ? photoFile.name : "Choose a new photo..."}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="profile-danger-zone">
        <h3>Danger Zone</h3>
        <p>
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button onClick={handleDelete} className="delete-btn">
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;
