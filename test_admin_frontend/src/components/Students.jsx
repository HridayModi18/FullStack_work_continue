import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Users, Shield, Eye, GraduationCap } from "lucide-react";
import UserDetailsModal from "./UserDetailsModal";
import "./Students.css";

// 20 Dummy data , ill take real data jab mere student wala frontend ban jaayega
const MOCK_STUDENTS = [
  {
    id: "s1",
    name: "Rahul Sharma",
    email: "rahul.s@example.com",
    avatar: null,
    rollNo: "CSE-101",
    year: "3rd",
    assignments: 5,
    lastActive: "2 hours ago",
    doubts: [
      { q: "How to deploy React app?", status: "resolved" },
      { q: "Node.js connection refused error", status: "pending" },
    ],
  },
  {
    id: "s2",
    name: "Priya Patel",
    email: "priya.p@example.com",
    avatar: null,
    rollNo: "CSE-102",
    year: "2nd",
    assignments: 2,
    lastActive: "1 day ago",
    doubts: [{ q: "What is CORS?", status: "resolved" }],
  },
  {
    id: "s3",
    name: "Aditya Kumar",
    email: "aditya.k@example.com",
    avatar: null,
    rollNo: "ECE-201",
    year: "4th",
    assignments: 8,
    lastActive: "Just now",
    doubts: [],
  },
  {
    id: "s4",
    name: "Sneha Gupta",
    email: "sneha.g@example.com",
    avatar: null,
    rollNo: "ECE-305",
    year: "1st",
    assignments: 1,
    lastActive: "5 hours ago",
    doubts: [{ q: "How to install Vite?", status: "resolved" }],
  },
  {
    id: "s5",
    name: "Rohan Desai",
    email: "rohan.d@example.com",
    avatar: null,
    rollNo: "CSE-105",
    year: "3rd",
    assignments: 4,
    lastActive: "10 mins ago",
    doubts: [],
  },
  {
    id: "s6",
    name: "Aadya Sharma",
    email: "aadya@gmail.com",
    avatar: null,
    rollNo: "CSE-106",
    year: "2nd",
    assignments: 3,
    lastActive: "3 days ago",
    doubts: [
      { q: "SQL injection prevention?", status: "resolved" },
      { q: "Explain JWT", status: "resolved" },
    ],
  },
  {
    id: "s8",
    name: "Aadya Sharma",
    email: "aadya@example.com",
    avatar: null,
    rollNo: "ECE-006",
    year: "3rd",
    assignments: 9,
    lastActive: "2 days ago",
    doubts: [{ q: "how to train a unet model", status: "pending" }],
  },
  {
    id: "s8",
    name: "Neha Reddy",
    email: "neha.r@example.com",
    avatar: null,
    rollNo: "CCE-208",
    year: "3rd",
    assignments: 6,
    lastActive: "1 week ago",
    doubts: [{ q: "How to write tests?", status: "pending" }],
  },
  {
    id: "s9",
    name: "Vikram Joshi",
    email: "vikram.j@example.com",
    avatar: null,
    rollNo: "CSE-109",
    year: "1st",
    assignments: 0,
    lastActive: "2 hours ago",
    doubts: [],
  },
  {
    id: "s10",
    name: "Pooja Iyer",
    email: "pooja.i@example.com",
    avatar: null,
    rollNo: "ECE-310",
    year: "2nd",
    assignments: 2,
    lastActive: "1 day ago",
    doubts: [{ q: "CSS grid vs flexbox?", status: "resolved" }],
  },
  {
    id: "s11",
    name: "Amit Mishra",
    email: "amit.m@example.com",
    avatar: null,
    rollNo: "CSE-111",
    year: "4th",
    assignments: 7,
    lastActive: "5 mins ago",
    doubts: [],
  },
  {
    id: "s12",
    name: "Megha Nair",
    email: "megha.n@example.com",
    avatar: null,
    rollNo: "ECE-212",
    year: "3rd",
    assignments: 4,
    lastActive: "1 hour ago",
    doubts: [{ q: "React useEffect dependencies?", status: "resolved" }],
  },
  {
    id: "s13",
    name: "Ravi Teja",
    email: "ravi.t@example.com",
    avatar: null,
    rollNo: "CSE-113",
    year: "1st",
    assignments: 1,
    lastActive: "4 days ago",
    doubts: [],
  },
  {
    id: "s14",
    name: "Shruti Bhat",
    email: "shruti.b@example.com",
    avatar: null,
    rollNo: "ECE-314",
    year: "2nd",
    assignments: 3,
    lastActive: "2 hours ago",
    doubts: [{ q: "How to deploy to Vercel?", status: "pending" }],
  },
  {
    id: "s15",
    name: "Nikhil Saxena",
    email: "nikhil.s@example.com",
    avatar: null,
    rollNo: "CSE-115",
    year: "3rd",
    assignments: 5,
    lastActive: "Just now",
    doubts: [],
  },
  {
    id: "s16",
    name: "Kavita Menon",
    email: "kavita.m@example.com",
    avatar: null,
    rollNo: "CCE-216",
    year: "4th",
    assignments: 10,
    lastActive: "30 mins ago",
    doubts: [{ q: "Advanced TypeScript patterns?", status: "resolved" }],
  },
  {
    id: "s17",
    name: "Siddharth Rao",
    email: "siddharth.r@example.com",
    avatar: null,
    rollNo: "CSE-117",
    year: "2nd",
    assignments: 2,
    lastActive: "1 day ago",
    doubts: [],
  },
  {
    id: "s18",
    name: "Aisha Khan",
    email: "aisha.k@example.com",
    avatar: null,
    rollNo: "ECE-318",
    year: "3rd",
    assignments: 6,
    lastActive: "12 hours ago",
    doubts: [{ q: "Redux toolkit setup?", status: "resolved" }],
  },
  {
    id: "s19",
    name: "Varun Das",
    email: "varun.d@example.com",
    avatar: null,
    rollNo: "CSE-119",
    year: "1st",
    assignments: 0,
    lastActive: "Just now",
    doubts: [],
  },
  {
    id: "s20",
    name: "Simran Kaur",
    email: "simran.k@example.com",
    avatar: null,
    rollNo: "CCE-220",
    year: "4th",
    assignments: 8,
    lastActive: "2 days ago",
    doubts: [
      { q: "System design basics?", status: "resolved" },
      { q: "Dockerizing Node app?", status: "resolved" },
    ],
  },
];

const Students = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [admins, setAdmins] = useState([]);
  const [realStudents, setRealStudents] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Setup socket connection
    const newSocket = io(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}`);
    setSocket(newSocket);

    newSocket.on("student_updated", () => {
      fetchStudents();
    });

    fetchStudents();

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (activeTab === "admins" && admins.length === 0) {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRealStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const getAvatarUrl = (name, avatar) => {
    if (avatar && avatar !== "null") return avatar;
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  const combinedStudents = [...realStudents.map(rs => ({
    id: rs.id,
    name: rs.name,
    email: rs.email,
    avatar: rs.avatar,
    rollNo: rs.rollNumber || "N/A",
    year: rs.year || "N/A",
    assignments: 0,
    lastActive: rs.lastLogin ? new Date(rs.lastLogin).toLocaleDateString() : "Never",
    doubts: []
  })), ...MOCK_STUDENTS];

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>student directory</h1>
        <p>Manage and view details for all students and admins</p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <GraduationCap size={18} />
            Students ({combinedStudents.length})
          </button>
          <button
            className={`tab ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => setActiveTab("admins")}
          >
            <Shield size={18} />
            Active Admins {admins.length > 0 && `(${admins.length})`}
          </button>
        </div>
      </div>

      <div className="users-content">
        {activeTab === "students" && (
          <div className="users-grid">
            {combinedStudents.map((student) => (
              <div key={student.id} className="user-card">
                <div className="user-card-header">
                  <img
                    src={getAvatarUrl(student.name, student.avatar)}
                    alt={student.name}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3>{student.name}</h3>
                    <span className="user-email">{student.email}</span>
                  </div>
                </div>
                <div className="user-card-stats">
                  <div className="stat">
                    <span className="stat-label">Roll No</span>
                    <span className="stat-value">{student.rollNo}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Year</span>
                    <span className="stat-value">{student.year}</span>
                  </div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() =>
                    setSelectedUser({ ...student, role: "student" })
                  }
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "admins" && (
          <div className="users-grid">
            {loadingAdmins ? (
              <div className="loading-state">Loading....</div>
            ) : admins.length === 0 ? (
              <div className="empty-state">No active admins found.</div>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="user-card admin-card">
                  <div className="user-card-header">
                    <img
                      src={getAvatarUrl(admin.name, admin.avatar)}
                      alt={admin.name}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <h3>{admin.name}</h3>
                      <span className="user-email">{admin.email}</span>
                      <span className="admin-badge">Admin</span>
                    </div>
                  </div>
                  <div className="user-card-stats">
                    <div className="stat">
                      <span className="stat-label">Posts</span>
                      <span className="stat-value">{admin.postsCreated}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Doubts solved</span>
                      <span className="stat-value">{admin.doubtsAnswered}</span>
                    </div>
                  </div>
                  <button
                    className="view-details-btn"
                    onClick={() => setSelectedUser({ ...admin, role: "admin" })}
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}
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

export default Students;
