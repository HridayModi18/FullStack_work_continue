import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // We move the auth verification logic here so it protects the entire layout
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role !== "admin") {
            localStorage.removeItem("token");
            navigate("/login?error=unauthorized", { replace: true });
            return;
          }
          setAdminData(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (!adminData) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        Loading Admin panel...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile top bar with hamburger */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="mobile-logo">M E N T O X</span>
      </div>

      {/* Sleek Sidebar Navigation */}
      <Sidebar
        adminData={adminData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area where tabs render */}
      <main className="admin-content">
        <Outlet context={{ adminData }} />
      </main>
    </div>
  );
};

export default AdminLayout;
