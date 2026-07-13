import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    //check if token still valid
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          // Check if they are actually an admin!
          if (data.user.role !== "admin") {
            localStorage.removeItem("token");
            navigate("/login?error=unauthorized", { replace: true });
            return;
          }

          // The token is valid AND they are an admin!
          setAdminData(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Error verifying token:", err);
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        Verifying pls waittt.....
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: "sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#111827",
          color: "white",
          padding: "2rem 1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "2rem",
            borderBottom: "1px solid #374151",
            paddingBottom: "1rem",
          }}
        >
          Admin Panel
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "2rem",
          }}
        >
          {adminData?.avatar && (
            <img
              src={adminData.avatar}
              alt="Avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
          )}
          <div>
            <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
              {adminData?.name}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
              {adminData?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "transparent",
            color: "#ef4444",
            border: "1px solid #ef4444",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
            transition: "background-color 0.2s",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ flex: 1, padding: "3rem" }}>
        <h1
          style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", color: "#111827" }}
        >
          Welcome back, {(adminData?.name || "Admin").split(" ")[0]}!
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "3rem" }}>
          Select an option to manage the bootcamp content.
        </p>

        <UploadForm />

        {/* baad me post list aur upload form daalenge */}
        <div
          style={{
            border: "2px dashed #d1d5db",
            borderRadius: "12px",
            padding: "4rem",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          Upload Forms and Content Feed will go here.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
