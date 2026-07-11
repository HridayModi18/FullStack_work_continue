import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { Edit2, Save, X, Camera, Shield, MessageSquare } from "lucide-react";
import "./Profile.css";
import silhouetteImg from "../assets/silhouette.png";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", bio: "", photo: null });
  const [preview, setPreview] = useState(null);

  // Refs for GSAP
  const containerRef = useRef(null);
  const avatarSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const statsRefs = useRef([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        bio: res.data.bio || "",
        photo: null,
      });
      setPreview(res.data.avatar);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && profile) {
      // Floating animation for stats in default view
      statsRefs.current.forEach((el, index) => {
        gsap.to(el, {
          y: -10,
          duration: 2 + index * 0.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    }
  }, [loading, profile]);

  const handleEditToggle = () => {
    const willEdit = !isEditing;
    setIsEditing(willEdit);

    if (willEdit) {
      gsap.to(avatarSectionRef.current, {
        x: -150,
        scale: 0.9,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.to(statsRefs.current, { opacity: 0, duration: 0.3 });
      gsap.fromTo(
        formSectionRef.current,
        { x: 100, opacity: 0, display: "none" },
        {
          x: 0,
          opacity: 1,
          display: "block",
          duration: 0.6,
          delay: 0.2,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(formSectionRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          gsap.set(formSectionRef.current, { display: "none" });
        },
      });
      gsap.to(avatarSectionRef.current, {
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.to(statsRefs.current, { opacity: 1, duration: 0.5, delay: 0.4 });
      setFormData({ name: profile.name, bio: profile.bio || "", photo: null });
      setPreview(profile.avatar);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setProfile(res.data.admin);
      setIsEditing(false);

      gsap.to(formSectionRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          gsap.set(formSectionRef.current, { display: "none" });
        },
      });
      gsap.to(avatarSectionRef.current, {
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.to(statsRefs.current, { opacity: 1, duration: 0.5, delay: 0.4 });
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  if (loading) return <div className="profile-loading">Loading Profile...</div>;
  if (!profile)
    return <div className="profile-loading">Profile not found.</div>;

  return (
    <div className="profile-wrapper" ref={containerRef}>
      <div className="profile-container">
        <div className="profile-avatar-section" ref={avatarSectionRef}>
          <div className="avatar-wrapper">
            <img
              src={preview || silhouetteImg}
              alt="Avatar"
              className="profile-avatar-img"
            />
            {isEditing && (
              <label className="photo-upload-overlay">
                <Camera size={24} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>
            )}
          </div>
          <h2 className="profile-name-display">{profile.name}</h2>
          <p className="profile-bio-display">
            {profile.bio || "No bio added yet. Click Edit Profile to add one!"}
          </p>

          <div
            className="floating-stat top-left"
            ref={(el) => (statsRefs.current[0] = el)}
          >
            <Shield size={16} /> Admin
          </div>
          <div
            className="floating-stat top-right"
            ref={(el) => (statsRefs.current[1] = el)}
          >
            <Edit2 size={16} /> {profile.postsCreated} Posts
          </div>
          <div
            className="floating-stat top-center"
            ref={(el) => (statsRefs.current[2] = el)}
          >
            <MessageSquare size={16} /> {profile.doubtsAnswered} Doubts Solved
          </div>
        </div>

        <div
          className="profile-form-section"
          ref={formSectionRef}
          style={{ display: "none", opacity: 0 }}
        >
          <div className="form-header">
            <h3>Edit Profile</h3>
            <button className="icon-btn close" onClick={handleEditToggle}>
              <X size={20} />
            </button>
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell the students about yourself..."
              rows={4}
            ></textarea>
          </div>

          <button className="save-btn" onClick={handleSave}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {!isEditing && (
        <button className="main-edit-btn" onClick={handleEditToggle}>
          <Edit2 size={18} /> Edit Profile
        </button>
      )}
    </div>
  );
};

export default Profile;
