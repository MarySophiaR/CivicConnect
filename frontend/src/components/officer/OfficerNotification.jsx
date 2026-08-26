import { useEffect, useState, useRef } from "react";
import { Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import API from "../../api/axios";

function OfficerNotification() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  const getRolePath = (userRole) => {
    switch (userRole) {
      case "citizen":
        return "citizen";
      case "juniorEngineer":
        return "junior-engineer";
      case "assistantExecutiveEngineer":
        return "assistant-executive-engineer";
      case "executiveEngineer":
        return "executive-engineer";
      case "municipalCommissioner":
        return "municipal-commissioner";
      default:
        return null;
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await API.get("/alerts");
      const incomingAlerts = response.data.alerts || [];

      // Remove duplicate notifications matching by unique _id
      const uniqueAlerts = Array.from(
        new Map(incomingAlerts.map((item) => [item._id, item])).values()
      );

      setAlerts(uniqueAlerts);
    } catch {
      setAlerts([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  const handleAlertClick = async (alert) => {
    try {
      if (!alert.isRead) {
        await API.patch(`/alerts/${alert._id}/read`);
      }
    } catch {
      // Continue navigation.
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const rolePath = getRolePath(user.role);

    // Safely resolve complaint ID whether it's populated as an object or stored as a raw string reference
    const complaintId = typeof alert.complaint === "object" ? alert.complaint?._id : alert.complaint;

    if (rolePath && complaintId) {
      if (user.role === "citizen") {
        navigate(`/citizen/complaint/${complaintId}`);
      } else {
        navigate(`/${rolePath}/complaints/${complaintId}`);
      }
    }

    setOpen(false);
    fetchAlerts();
  };

  const getAlertMeta = (type) => {
    switch (type) {
      case "ASSIGNMENT":
        return { label: "Assignment", badgeClass: "alert-badge-blue" };
      case "MANUAL_ESCALATION":
      case "AUTO_ESCALATION":
        return {
          label: type === "AUTO_ESCALATION" ? "Auto Escalated" : "Escalated",
          badgeClass: "alert-badge-orange",
        };
      case "RESOLVED":
        return { label: "Resolved", badgeClass: "alert-badge-green" };
      case "DEADLINE_NEAR":
        return { label: "Deadline Near", badgeClass: "alert-badge-yellow" };
      case "OVERDUE":
      case "MC_ATTENTION":
        return {
          label: type === "MC_ATTENTION" ? "Commissioner Alert" : "Overdue",
          badgeClass: "alert-badge-red",
        };
      default:
        return { label: "Notification", badgeClass: "alert-badge-gray" };
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="officer-notification" ref={dropdownRef}>
      <button
        type="button"
        className="officer-notification-button"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell size={22} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="officer-notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="officer-notification-dropdown">
          <div className="officer-notification-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <span className="unread-header-badge">{unreadCount} New</span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="officer-no-notifications">No notifications</div>
          ) : (
            <div className="officer-notification-list">
              {alerts.map((alert) => {
                const meta = getAlertMeta(alert.type);

                return (
                  <button
                    key={alert._id}
                    type="button"
                    className={`officer-notification-item ${
                      alert.isRead ? "" : "unread"
                    }`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    {/* Main Content Area */}
                    <div className="officer-notification-content">
                      <div className="alert-top-row">
                        <span className={`alert-badge ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="alert-time">
                          {formatTime(alert.createdAt)}
                        </span>
                      </div>

                      {/* Title row with dot placed directly to its left inline with flex alignment */}
                      <div className="alert-title-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {!alert.isRead && (
                          <span
                            className="officer-notification-unread-dot"
                            aria-label="Unread notification"
                            style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0055A4", flexShrink: 0 }}
                          />
                        )}
                        <strong className="alert-title-text" style={{ margin: 0 }}>{alert.title}</strong>
                      </div>

                      <p className="alert-message-text">
                        {alert.message && alert.message.includes("Reason:") ? (
                          <>
                            {alert.message.split("Reason:")[0]}
                            <span className="alert-reason-block" style={{ display: "block", marginTop: "4px" }}>
                              <strong>Reason:</strong> {alert.message.split("Reason:")[1]}
                            </span>
                          </>
                        ) : alert.message && alert.message.includes("Remarks:") ? (
                          <>
                            {alert.message.split("Remarks:")[0]}
                            <span className="alert-reason-block" style={{ display: "block", marginTop: "4px" }}>
                              <strong>Remarks:</strong> {alert.message.split("Remarks:")[1]}
                            </span>
                          </>
                        ) : (
                          alert.message
                        )}
                      </p>
                    </div>

                    {/* Vertically centered right arrow */}
                    <div className="alert-right-action">
                      <ArrowRight size={18} strokeWidth={1.8} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OfficerNotification;