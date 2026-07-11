import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  HelpCircle,
  BarChart2,
  Bell,
  Menu,
  X,
  User,
  Moon,
  Sun,
  Layers,
  LogOut,
  Bookmark,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { io } from "socket.io-client";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const notificationRef = useRef(null);

  const token = localStorage.getItem("token");
  let user = null;
  try {
    if (token) user = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Token parse error", e);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  //dynamic island like iphone
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!token) return;

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    // Setup Socket
    const newSocket = io("http://localhost:5000");
    newSocket.on("new_notification", (data) => {
      if (user && String(data.userId) === String(user.id)) {
        setNotifications((prev) => [data.notification, ...prev]);
      }
    });

    return () => newSocket.close();
  }, [token, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      try {
        await axios.put(
          "http://localhost:5000/api/notifications/read-all",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("read marking error", err);
      }
    }
  };

  const navLinks = [
    { name: "Feed", path: "/feed", icon: <Home size={18} /> },
    {
      name: "My Submissions",
      path: "/submissions",
      icon: <Layers size={18} />,
    },
    { name: "Doubts", path: "/doubts", icon: <HelpCircle size={18} /> },
    { name: "Saved", path: "/saved", icon: <Bookmark size={18} /> },
    { name: "Dashboard", path: "/dashboard", icon: <BarChart2 size={18} /> },
  ];

  return (
    <motion.header
      className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="navbar-container">
        <div className="nav-brand">
          <motion.div
            className="brand-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>M E N T O X</span>
          </motion.div>
        </div>

        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {link.icon}
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="nav-active-indicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <motion.button
            className="icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          <div style={{ position: "relative" }} ref={notificationRef}>
            <motion.button
              className="icon-btn notification-btn"
              onClick={handleNotificationClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-dot">{unreadCount}</span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notifications-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">
                        You have no notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <NavLink
                          to={n.linkUrl || "#"}
                          key={n.id}
                          className={`notification-item ${!n.isRead ? "unread" : ""}`}
                          style={{ textDecoration: "none" }}
                          onClick={() => setShowNotifications(false)}
                        >
                          <p className="notification-message">{n.message}</p>
                          <span className="notification-time">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </NavLink>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink
            to="/profile"
            className="icon-btn desktop-only"
            style={{ textDecoration: "none" }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <User size={20} />
            </motion.div>
          </NavLink>

          <motion.button
            className="icon-btn desktop-only"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut size={20} color="#ef4444" />
          </motion.button>

          <button
            className="icon-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
            <NavLink
              to="/profile"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={18} />
              Profile
            </NavLink>
            <div className="mobile-nav-item" onClick={handleLogout}>
              <LogOut size={18} color="#ef4444" />
              Logout
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
