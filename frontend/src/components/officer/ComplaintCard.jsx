import {
  FolderOpen,
  CalendarDays,
  UserRound,
  ArrowRight,
} from "lucide-react";

import "../../styles/officerComponents.css";

function OfficerComplaintCard({
  complaint,
  onViewDetails,
}) {
  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "pending";

      case "Assigned":
        return "assigned";

      case "In Progress":
        return "in-progress";

      case "Escalated":
        return "escalated";

      case "Resolved":
        return "resolved";

      default:
        return "default";
    }
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "—";
    }

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     VIEW DETAILS
  ========================================================= */

  const handleViewDetails = () => {
    if (!complaint?._id) return;

    onViewDetails?.(complaint._id);
  };

  /* =========================================================
     CARD
  ========================================================= */

  return (
    <article className="officer-complaint-card">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="officer-complaint-card-header">

        <div className="officer-complaint-heading">

          <h3 className="officer-complaint-title">
            {complaint?.title || "Untitled Complaint"}
          </h3>

        </div>

        <span
          className={`officer-complaint-status ${getStatusClass(
            complaint?.status
          )}`}
        >
          {complaint?.status || "Unknown"}
        </span>

      </div>


      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <div className="officer-complaint-category">

        <FolderOpen
          size={18}
          strokeWidth={1.9}
          aria-hidden="true"
        />

        <span>
          {complaint?.category || "Uncategorized"}
        </span>

      </div>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {complaint?.description && (
        <p className="officer-complaint-description">
          {complaint.description}
        </p>
      )}


      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <div className="officer-complaint-info">

        {/* ---------------------------------------------------
            REPORTED ON
        --------------------------------------------------- */}

        <div className="officer-complaint-info-item">

          <CalendarDays
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div className="officer-complaint-info-content">

            <span className="officer-complaint-info-label">
              Reported On
            </span>

            <strong className="officer-complaint-info-value">
              {formatDate(complaint?.createdAt)}
            </strong>

          </div>

        </div>


        {/* ---------------------------------------------------
            ASSIGNED TO
        --------------------------------------------------- */}

        <div className="officer-complaint-info-item">

          <UserRound
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <div className="officer-complaint-info-content">

            <span className="officer-complaint-info-label">
              Assigned To
            </span>

            <strong className="officer-complaint-info-value">
              {complaint?.assignedTo?.name || "Not assigned"}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          VIEW DETAILS
      ===================================================== */}

      <div className="officer-complaint-card-footer">

        <button
          type="button"
          className="officer-complaint-view-btn"
          onClick={handleViewDetails}
          disabled={!complaint?._id}
        >
          <span>
            View Details
          </span>

          {/* <ArrowRight
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          /> */}
        </button>

      </div>

    </article>
  );
}

export default OfficerComplaintCard;