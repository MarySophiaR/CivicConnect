import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  FaArrowUp,
} from "react-icons/fa";

function ComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return `https://civicconnect-backend-8fhz.onrender.com/uploads/${filename}`;
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
     EXTRACT COORDINATES (for map preview only — does not
     affect any existing field, display, or logic above)
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

  return (
    <Layout>
      <div className="complaint-details-container">
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

          {/* Map preview — pin only, no navigate button for citizens */}
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

        <div className="section">
          <h3>
            <FaHistory /> Assignment History
          </h3>
          {!complaint.assignmentHistory || complaint.assignmentHistory.length === 0 ? (
            <p>No assignment history.</p>
          ) : (
            complaint.assignmentHistory.map((item) => (
              <div className="history-card" key={item._id}>
                <p><strong>Officer:</strong> {item.officer?.name || "N/A"}</p>
                <p><strong>Level:</strong> {item.level}</p>
                <p><strong>Assigned On:</strong> {new Date(item.assignedAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="section">
          <h3>
            <FaArrowUp /> Escalation History
          </h3>
          {!complaint.escalationHistory || complaint.escalationHistory.length === 0 ? (
            <p>No escalations.</p>
          ) : (
            complaint.escalationHistory.map((item) => (
              <div className="history-card" key={item._id}>
                <p><strong>From:</strong> {item.from}</p>
                <p><strong>To:</strong> {item.to}</p>
                <p><strong>Reason:</strong> {item.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ComplaintDetails;