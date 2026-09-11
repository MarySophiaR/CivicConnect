import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/citizen/Layout";
import API from "../../api/axios";
import "../../styles/complaintDetails.css";

import MapPreview from "../../components/Mappreview.jsx";

import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaTag,
  FaClipboardList,
  FaClock,
  FaMapMarkedAlt,
  FaHistory,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaHourglassEnd,
} from "react-icons/fa";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Single toggle state for the unified workflow history block */
  const [showWorkflowHistory, setShowWorkflowHistory] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await API.get(`/complaints/${id}`);
      setComplaint(response.data.complaint);
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout>
        <p>Complaint not found.</p>
      </Layout>
    );
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300?text=No+Image";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const filename = imagePath.split(/[/\\]/).pop();
    return `http://localhost:5001/uploads/${filename}`;
  };

  /* =========================================================
     EXTRACT WARD & ADDRESS FIELDS
  ========================================================= */
  const wardNumber =
    complaint.wardNumber ??
    complaint.ward_number ??
    complaint.ward ??
    complaint.address?.wardNumber ??
    complaint.address?.ward ??
    null;

  const wardText =
    wardNumber !== null && wardNumber !== undefined && String(wardNumber).trim() !== ""
      ? `Ward No. ${wardNumber}`
      : null;

  /* =========================================================
     EXTRACT COORDINATES (for map preview only)
  ========================================================= */
  const latitude =
    complaint.latitude ??
    complaint.location?.latitude ??
    complaint.location?.lat ??
    null;

  const longitude =
    complaint.longitude ??
    complaint.location?.longitude ??
    complaint.location?.lng ??
    complaint.location?.lon ??
    null;

  /* =========================================================
     FORMATTED LOCATION STRING (Full details for display)
  ========================================================= */
  const locationParts = [
    complaint.address?.area,
    wardText,
    complaint.address?.landmark,
    complaint.address?.city,
    complaint.address?.district,
    complaint.address?.state,
    complaint.address?.pincode,
  ];

  const location = locationParts
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== "")
    .map((part) => String(part).trim())
    .join(", ");

  const officer = complaint.assignedTo?.name || "Not Assigned";

  /* =========================================================
     COMBINE & NORMALIZE WORKFLOW EVENTS (Chronological sort)
  ========================================================= */
  const assignmentEvents = (complaint.assignmentHistory || []).map((item) => ({
    type: "ASSIGNMENT",
    id: item._id,
    date: new Date(item.assignedAt),
    officer: item.officer?.name || "N/A",
    level: item.level,
  }));

  const escalationEvents = (complaint.escalationHistory || []).map((item) => ({
    type: "ESCALATION",
    id: item._id,
    date: new Date(item.escalatedAt || item.createdAt || Date.now()),
    from: item.from,
    to: item.to,
    reason: item.reason,
  }));

  const combinedEvents = [...assignmentEvents, ...escalationEvents].sort(
    (a, b) => a.date - b.date
  );

  const totalEventsCount = combinedEvents.length;

  return (
    <Layout>
      <div className="complaint-details-container">
        {/* =========================================================
            BACK TO COMPLAINTS BUTTON
        ========================================================= */}
        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft size={14} /> Back to Complaints
        </button>

        <h1>Complaint Details</h1>

        <div className="details-top">
          <img
            src={getImageUrl(complaint.image)}
            alt={complaint.title}
            className="complaint-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
            }}
          />

          <div className="details-info">
            <h2>{complaint.title}</h2>
            <p className="description">{complaint.description}</p>

            <div className="info-row">
              <FaTag />
              <span>{complaint.category}</span>
            </div>

            <div className="info-row">
              <FaClipboardList />
              <span>{complaint.status}</span>
            </div>

            <div className="info-row">
              <FaUserTie />
              <span>{officer}</span>
            </div>

            <div className="info-row">
              <FaClock />
              <span>{complaint.currentLevel}</span>
            </div>

            <div className="info-row">
              <FaCalendarAlt />
              <span>{new Date(complaint.createdAt).toLocaleString()}</span>
            </div>

            {complaint.deadline && (
              <div className="info-row">
                <FaCalendarAlt />
                <span>Deadline: {new Date(complaint.deadline).toLocaleDateString()}</span>
              </div>
            )}

            <div className="info-row">
              <FaMapMarkerAlt />
              <span>{location || "Location text unavailable"}</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="section">
          <h3>
            <FaMapMarkedAlt /> Address
          </h3>

          <p><strong>Area:</strong> {complaint.address?.area || "-"}</p>
          <p><strong>Ward:</strong> {wardNumber ? `Ward No. ${wardNumber}` : "-"}</p>
          <p><strong>Landmark:</strong> {complaint.address?.landmark || "-"}</p>
          <p><strong>City:</strong> {complaint.address?.city || "-"}</p>
          <p><strong>District:</strong> {complaint.address?.district || "-"}</p>
          <p><strong>State:</strong> {complaint.address?.state || "-"}</p>
          <p><strong>Pincode:</strong> {complaint.address?.pincode || "-"}</p>

          <MapPreview
            latitude={latitude}
            longitude={longitude}
            label={
              [
                complaint.category
                  ? complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)
                  : "",
                [complaint.address?.area, complaint.address?.city].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" — ") || "Complaint location"
            }
            showNavigate={false}
          />
        </div>

        {/* =========================================================
            UNIFIED WORKFLOW HISTORY BLOCK (Assignment + Escalation)
        ========================================================= */}
        <div className="section dropdown-section">
          <div 
            className="dropdown-header" 
            onClick={() => setShowWorkflowHistory(!showWorkflowHistory)}
          >
            <div className="dropdown-title-wrapper">
              <div className="dropdown-icon-container">
                <FaHistory size={18} />
              </div>
              <div>
                <span className="workflow-subtitle">
                  Complaint Workflow
                </span>
                <h3>
                  Assignment & Escalation History
                </h3>
              </div>
            </div>

            <div className="dropdown-badge-wrapper">
              <span className="event-count-badge">
                {totalEventsCount} {totalEventsCount === 1 ? "Event" : "Events"} {showWorkflowHistory ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
              </span>
            </div>
          </div>

          {showWorkflowHistory && (
            <div className="dropdown-content">
              {totalEventsCount === 0 ? (
                <p>No workflow history found.</p>
              ) : (
                <div className="workflow-timeline">
                  {combinedEvents.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      className={`history-card ${item.type === "ESCALATION" ? "escalation-card" : "assignment-card"}`}
                    >
                      <div className="history-card-header">
                        <span className={`history-type-label ${item.type === "ESCALATION" ? "escalation-label" : "assignment-label"}`}>
                          {item.type}
                        </span>
                        <span className="history-date">
                          {item.date.toLocaleString()}
                        </span>
                      </div>

                      {item.type === "ASSIGNMENT" ? (
                        <div>
                          <p className="history-main-text">
                            Assigned to {item.level}
                          </p>
                          <p className="history-sub-text">
                            Officer: <strong>{item.officer}</strong>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="history-main-text">
                            Escalated from {item.from} to {item.to}
                          </p>
                          <p className="history-sub-text">
                            Reason: <strong>{item.reason || "N/A"}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================
            RESOLUTION BLOCK
        ========================================================= */}
        {(complaint.status === "Resolved" || complaint.resolutionRemarks || complaint.resolutionImage) && (
          <div className="section resolution-section">
            <h3>
              <FaHourglassEnd /> Resolution Details
            </h3>
            
            <p>
              <strong>Resolved At:</strong>{" "}
              {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : "N/A"}
            </p>
            
            <p>
              <strong>Resolution Remarks:</strong>{" "}
              {complaint.resolutionRemarks || "No remarks provided."}
            </p>

            {complaint.resolutionImage && (
              <div className="resolution-image-container">
                <p><strong>Resolution Evidence:</strong></p>
                <img
                  src={getImageUrl(complaint.resolutionImage)}
                  alt="Resolution Evidence"
                  className="resolution-evidence-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
                  }}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}

export default ComplaintDetails;