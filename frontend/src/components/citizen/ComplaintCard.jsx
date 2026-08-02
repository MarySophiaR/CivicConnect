import "./ComplaintCard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FiMapPin,
  FiCalendar,
  FiUser,
  FiClock,
  FiEye,
  FiEdit2,
  FiMoreVertical,
} from "react-icons/fi";

function ComplaintCard({ complaint }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Safely extract image path whether it's a string or an object
  const rawImagePath =
    typeof complaint?.image === "string"
      ? complaint.image
      : complaint?.image?.url || complaint?.image?.path || "";

  // Helper function for safe, clean image resolution
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150?text=No+Image";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Extract only the filename (handles Windows backslashes & Linux forward slashes)
    const filename = path.split(/[/\\]/).pop();
    return `http://localhost:5001/uploads/${filename}`;
  };

  const imageUrl = getImageUrl(rawImagePath);

  // Handle Date Formatting safely
  const formattedDate = complaint?.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Format Address
  const location =
    [
      complaint?.address?.area,
      complaint?.address?.city,
      complaint?.address?.district,
    ]
      .filter(Boolean)
      .join(", ") || "Location not provided";

  // Format Officer / Level Title safely
  const officer =
    typeof complaint?.currentLevel === "string"
      ? complaint.currentLevel
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (c) => c.toUpperCase())
      : "Unassigned";

  // Format Category safely
  const categoryFormatted =
    typeof complaint?.category === "string"
      ? complaint.category.charAt(0).toUpperCase() +
        complaint.category.slice(1)
      : "General";

  // Safe Status string
  const statusFormatted =
    typeof complaint?.status === "string" ? complaint.status : "Pending";
  const statusClass = statusFormatted.replace(/\s/g, "");

  return (
    <div className="complaint-card">
      {/* Complaint Image with Fallback Error Handling */}
      <img
        src={imageUrl}
        alt={complaint?.title || "Complaint image"}
        className="complaint-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found";
        }}
      />

      {/* Complaint Details */}
      <div className="complaint-details">
        {/* Title + Menu */}
        <div className="title-row">
          <h3>{complaint?.title || "Untitled Complaint"}</h3>

          <div
            className="more-options"
            ref={menuRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
          >
            <FiMoreVertical size={22} />
            {showMenu && (
              <div
                className="menu-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                {["Pending", "Assigned"].includes(complaint?.status) && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/citizen/complaint/edit/${complaint?._id}`);
                    }}
                  >
                    <FiEdit2 />
                    Edit Complaint
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/citizen/complaint/${complaint?._id}`);
                  }}
                >
                  <FiEye />
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="complaint-description">
          {complaint?.description || "No description provided."}
        </p>

        {/* Location */}
        <div className="location">
          <FiMapPin className="meta-icon" />
          <span>{location}</span>
        </div>

        {/* Category + Status */}
        <div className="badges">
          <span className="category">{categoryFormatted}</span>

          <span className={`status ${statusClass}`}>{statusFormatted}</span>
        </div>

        {/* Footer Metadata */}
        <div className="complaint-meta">
          <div className="meta-item">
            <FiCalendar className="meta-icon" />
            <span>{formattedDate}</span>
          </div>

          <div className="meta-item">
            <FiUser className="meta-icon" />
            <span>{officer}</span>
          </div>

          <div
            className={`meta-item sla ${
              (complaint?.daysLeft ?? 0) <= 0 ? "expired" : ""
            }`}
          >
            <FiClock className="meta-icon" />
            <span>
              {complaint?.daysLeft > 0
                ? `${complaint.daysLeft} day${
                    complaint.daysLeft > 1 ? "s" : ""
                  } left`
                : "SLA Expired"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintCard;