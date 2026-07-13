import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

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
      {/* Sleek Sidebar Navigation */}
      <Sidebar adminData={adminData} />

      {/* Main Content Area where tabs render */}
      <main className="admin-content">
        <Outlet context={{ adminData }} />
      </main>
    </div>
  );
};

export default AdminLayout;
