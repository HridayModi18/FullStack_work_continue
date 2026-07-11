import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Doubts from "./pages/Doubts";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Submissions from "./pages/Submissions";
import Onboarding from "./components/Onboarding";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {!onboardingComplete && (
        <Onboarding onComplete={() => setOnboardingComplete(true)} />
      )}
      {children}
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="app-container">
      {!isLoginPage && <Navbar />}

      <main
        className="main-content"
        style={{ paddingTop: isLoginPage ? "0" : "100px" }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Feed savedMode={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doubts"
            element={
              <ProtectedRoute>
                <Doubts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
