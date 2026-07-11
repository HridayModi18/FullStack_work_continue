import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    }

    const error = searchParams.get("error");
    if (error === "unauthorized") {
      setShowError(true);
      // Automatically hide the error and hamster after 6 seconds
      setTimeout(() => {
        setShowError(false);
        setSearchParams({}); // Clear the url param
      }, 6000);
    }
  }, [searchParams, navigate, setSearchParams]);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/admin";
  };

  return (
    <div className="login-container">
      
      {/* Top Error Box */}
      <div className={`error-box ${showError ? 'show' : ''}`}>
        Unauthorized Access. Please try logging in with an Admin Email.
      </div>

      {/* Background visual elements */}
      <div className="center-glow"></div>
      <div className="grid-overlay"></div>

      <div className="mentox-3d-text">MENTOX</div>

      <div className="login-card" style={{ zIndex: 1 }}>
        <h1 className="login-title">Admin Panel</h1>
        <p className="login-subtitle">
          Sign in to manage the Bootcamp
        </p>

        <button className="login-button" onClick={handleLogin}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="Google Logo"
            className="google-icon"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
