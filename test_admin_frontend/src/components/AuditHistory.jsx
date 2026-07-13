import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  PlusCircle,
} from "lucide-react";
import "./AuditHistory.css";

const AuditHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = selectedDate
    ? logs.filter((log) => {
        const logDate = new Date(log.createdAt).toISOString().split("T")[0];
        return logDate === selectedDate;
      })
    : logs;

  const getActionIcon = (action) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <PlusCircle size={20} className="icon-create" />;
      case "UPDATE":
        return <Edit size={20} className="icon-update" />;
      case "DELETE":
        return <Trash2 size={20} className="icon-delete" />;
      default:
        return <CheckCircle size={20} className="icon-default" />;
    }
  };

  const formatDate = (dateStr) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = selectedDate === dateStr;
      const isToday = today === dateStr;

      days.push(
        <div
          key={d}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
          onClick={() => setSelectedDate(isSelected ? "" : dateStr)}
        >
          {d}
        </div>,
      );
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div className="header-title">
          <History size={28} className="header-icon" />
          <h1>Audit Timeline</h1>
        </div>
        <p>Complete history of admin actions, ordered newest to oldest.</p>
      </div>

      <div className="audit-content">
        <div className="timeline-section">
          {loading ? (
            <div className="loading-state">Loading timeline...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              No audit logs found for this date.
            </div>
          ) : (
            <div className="timeline">
              {filteredLogs.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-marker">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="timeline-content">
                    <div className="log-header">
                      <div className="admin-info">
                        <img
                          src={
                            log.Admin?.avatar && log.Admin.avatar !== "null"
                              ? log.Admin.avatar
                              : `https://ui-avatars.com/api/?name=${log.Admin?.name || "Admin"}`
                          }
                          alt="Admin"
                          className="admin-avatar"
                        />
                        <span className="admin-name">
                          {log.Admin?.name || "Unknown Admin"}
                        </span>
                      </div>
                      <span className="log-time">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="log-details">
                      <span
                        className={`action-badge ${log.action.toLowerCase()}`}
                      >
                        {log.action}
                      </span>
                      <p>{log.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="filter-sidebar">
          <div className="calendar-card">
            <div className="calendar-header">
              <button onClick={prevMonth} className="cal-nav-btn">
                &lt;
              </button>
              <h3>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button onClick={nextMonth} className="cal-nav-btn">
                &gt;
              </button>
            </div>

            <div className="calendar-weekdays">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            <div className="calendar-grid">{renderCalendar()}</div>

            {selectedDate && (
              <div className="calendar-footer">
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedDate("")}
                >
                  Clear Filter: {new Date(selectedDate).toLocaleDateString()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditHistory;
