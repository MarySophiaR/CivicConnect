import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardList,
  CalendarDays,
  UserRound,
  Layers3,
  Users,
  MapPin,
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import OfficerLayout from "../../components/officer/OfficerLayout";
import ComplaintActions from "../../components/officer/ComplaintActions";
import AssignmentHistory from "../../components/officer/AssignmentHistory";
import EscalateModal from "../../components/officer/EscalateModal";
import ResolveModal from "../../components/officer/ResolveModal";

import API from "../../api/axios";

import "../../styles/officerComplaintDetails.css";
import "../../styles/officerComponents.css";

function OfficerComplaintDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
  );

  /* =========================================================
     STATE
  ========================================================= */

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] = useState("");

  const [actionError, setActionError] = useState("");

  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  /* =========================================================
     SUCCESS TOAST
  ========================================================= */

  const [successToast, setSuccessToast] = useState("");

  const showSuccessToast = (message) => {
    setSuccessToast(message);

    setTimeout(() => {
      setSuccessToast("");
    }, 3500);
  };

  /* =========================================================
     FETCH COMPLAINT
  ========================================================= */

  const fetchComplaint = async (showPageLoading = false) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      setFetchError("");

      const response = await API.get(`/complaints/${id}`);

      const fetchedComplaint = response.data?.complaint || response.data;

      if (!fetchedComplaint?._id) {
        throw new Error("Complaint details could not be found.");
      }

      setComplaint(fetchedComplaint);
    } catch (error) {
      console.error(
        "Fetch complaint details error:",
        error.response?.data || error.message,
      );

      setComplaint(null);

      setFetchError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load complaint details.",
      );
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  /* =========================================================
     INITIAL FETCH
  ========================================================= */

  useEffect(() => {
    if (!id) {
      setFetchError("Complaint ID is missing.");

      setLoading(false);

      return;
    }

    fetchComplaint(true);
  }, [id]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

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
     FORMAT DATE + TIME
  ========================================================= */

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "—";
    }

    return formattedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
     CATEGORY CLASS
  ========================================================= */

  const getCategoryClass = (category) => {
    switch (category?.toLowerCase()) {
      case "pothole":
        return "officer-category-pothole";

      case "drainage":
        return "officer-category-drainage";

      case "garbage":
        return "officer-category-garbage";

      case "streetlight":
        return "officer-category-streetlight";

      default:
        return "officer-category-default";
    }
  };

  /* =========================================================
     FORMAT LEVEL
  ========================================================= */

  const formatLevel = (level) => {
    if (!level) {
      return "—";
    }

    switch (level) {
      case "juniorEngineer":
        return "Junior Engineer";

      case "assistantExecutiveEngineer":
        return "Assistant Executive Engineer";

      case "executiveEngineer":
        return "Executive Engineer";

      case "municipalCommissioner":
        return "Municipal Commissioner";

      default:
        return level;
    }
  };

  /* =========================================================
     ESCALATION ELIGIBILITY

     Only JE and AEE can manually escalate.

     JE  -> AEE
     AEE -> EE
     EE  -> NO ESCALATION
     MC  -> NO ESCALATION
  ========================================================= */

  const canEscalate =
    complaint?.currentLevel === "juniorEngineer" ||
    complaint?.currentLevel === "assistantExecutiveEngineer";

  /* =========================================================
     FORMAT ADDRESS
  ========================================================= */

  const formatAddress = (address) => {
    if (!address) {
      return "";
    }

    if (typeof address === "string") {
      return address;
    }

    const parts = [
      address.area,
      address.landmark,
      address.city,
      address.district,
      address.state,
      address.pincode,
    ].filter(
      (part) =>
        part !== undefined && part !== null && String(part).trim() !== "",
    );

    return parts.join(", ");
  };

  /* =========================================================
     ACTION: START WORK
  ========================================================= */

  const handleStartWork = async () => {
    if (!complaint?._id) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const response = await API.post(`/complaints/${complaint._id}/start`);

      console.log("Start Work Response:", response.data);

      await fetchComplaint(false);
    } catch (error) {
      console.error(
        "Start Complaint Work Error:",
        error.response?.data || error.message,
      );

      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Failed to start complaint work.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     ACTION: OPEN RESOLVE MODAL
  ========================================================= */

  const handleResolve = () => {
    if (!complaint?._id) {
      return;
    }

    setActionError("");
    setShowResolveModal(true);
  };

  /* =========================================================
     ACTION: OPEN ESCALATION MODAL
  ========================================================= */

  const handleEscalate = () => {
    if (!complaint?._id) {
      return;
    }

    if (!canEscalate) {
      setActionError("Escalation is not available for this complaint level.");

      return;
    }

    setActionError("");
    setShowEscalateModal(true);
  };

  /* =========================================================
     ACTION: RESOLVE SUBMIT
  ========================================================= */

  const handleResolveSubmit = async (resolutionData) => {
    if (!complaint?._id) {
      return;
    }

    const resolutionRemarks =
      resolutionData?.resolutionRemarks || resolutionData?.resolution || "";

    if (typeof resolutionRemarks !== "string" || !resolutionRemarks.trim()) {
      setActionError("Please provide resolution details.");

      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const response = await API.post(`/complaints/${complaint._id}/resolve`, {
        resolutionRemarks: resolutionRemarks.trim(),
      });

      console.log("Resolve Complaint Response:", response.data);

      setShowResolveModal(false);

      await fetchComplaint(false);
    } catch (error) {
      console.error(
        "Resolve Complaint Error:",
        error.response?.data || error.message,
      );

      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Failed to resolve complaint.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     ACTION: ESCALATE SUBMIT
  ========================================================= */

  const handleEscalationSubmit = async (escalationData) => {
    if (!complaint?._id) {
      throw new Error("Complaint information is unavailable.");
    }

    if (!canEscalate) {
      const message = "Escalation is not available for this complaint level.";

      setActionError(message);

      throw new Error(message);
    }

    /* -----------------------------------------
         VALIDATE ESCALATION DATA
      ----------------------------------------- */

    const reasonCode = escalationData?.reasonCode;

    if (typeof reasonCode !== "string" || !reasonCode.trim()) {
      throw new Error("Please select a valid escalation reason.");
    }

    try {
      setActionLoading(true);
      setActionError("");

      const response = await API.post(`/complaints/${complaint._id}/escalate`, {
        reasonCode: reasonCode.trim(),

        note:
          typeof escalationData?.note === "string"
            ? escalationData.note.trim()
            : "",
      });

      showSuccessToast("Complaint Escalated");

      setShowEscalateModal(false);

      await fetchComplaint(false);

      return response.data;
    } catch (error) {
      console.error(
        "[ESCALATION] Failed:",
        error.response?.data || error.message,
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to escalate complaint.";

      setActionError(message);

      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     CLOSE RESOLVE MODAL
  ========================================================= */

  const closeResolveModal = () => {
    if (actionLoading) {
      return;
    }

    setShowResolveModal(false);
  };

  /* =========================================================
     CLOSE ESCALATION MODAL
  ========================================================= */

  const closeEscalateModal = () => {
    if (actionLoading) {
      return;
    }

    setShowEscalateModal(false);
  };

  /* =========================================================
     GO BACK
  ========================================================= */

  const handleBack = () => {
    navigate(-1);
  };

  /* =========================================================
     SUCCESS TOAST COMPONENT
  ========================================================= */

  const successToastElement = successToast && (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minWidth: "260px",
        maxWidth: "calc(100vw - 48px)",
        padding: "14px 18px",
        background: "#ffffff",
        border: "1px solid #bbf7d0",
        borderLeft: "4px solid #16a34a",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        color: "#166534",
        fontSize: "14px",
        fontWeight: 650,
        boxSizing: "border-box",
      }}
    >
      <CheckCircle2
        size={20}
        strokeWidth={2.2}
        color="#16a34a"
        style={{
          flexShrink: 0,
        }}
      />

      <span>{successToast}</span>
    </div>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <OfficerLayout>
        {successToastElement}

        <div className="officer-detail-loading">
          <div className="officer-loading-spinner" />

          <p>Loading complaint details...</p>
        </div>
      </OfficerLayout>
    );
  }

  /* =========================================================
     FETCH ERROR
  ========================================================= */

  if (fetchError || !complaint) {
    return (
      <OfficerLayout>
        {successToastElement}

        <div className="officer-page-container">
          <div className="officer-detail-error-page">
            <div className="officer-detail-error-icon">
              <AlertCircle size={32} strokeWidth={1.8} />
            </div>

            <h2>Complaint Not Found</h2>

            <p>{fetchError || "The requested complaint could not be found."}</p>

            <button
              type="button"
              className="officer-back-button"
              onClick={handleBack}
            >
              <ArrowLeft size={18} strokeWidth={2} />
              Back to Complaints
            </button>
          </div>
        </div>
      </OfficerLayout>
    );
  }

  /* =========================================================
     LOCATION AVAILABILITY
  ========================================================= */

  const hasLatitude =
    complaint.latitude !== null && complaint.latitude !== undefined;

  const hasLongitude =
    complaint.longitude !== null && complaint.longitude !== undefined;

  const hasLocation = Boolean(complaint.address) || hasLatitude || hasLongitude;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <OfficerLayout>
      {successToastElement}

      <div className="officer-page-container">
        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          type="button"
          className="officer-detail-back-button"
          onClick={handleBack}
        >
          <ArrowLeft size={18} strokeWidth={2} />

          <span>Back to Complaints</span>
        </button>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="officer-detail-page-header">
          <div className="officer-detail-heading">
            <div className="officer-detail-heading-icon">
              <ClipboardList size={28} strokeWidth={2} />
            </div>

            <div>
              <span className="officer-detail-eyebrow">Complaint Details</span>

              <h1>{complaint.title || "Untitled Complaint"}</h1>
            </div>
          </div>

          <span
            className={`officer-complaint-status ${getStatusClass(
              complaint.status,
            )}`}
          >
            {complaint.status || "Unknown"}
          </span>
        </header>

        {/* =====================================================
            ACTION ERROR
        ===================================================== */}

        {actionError && (
          <div className="officer-actions-warning" role="alert">
            <AlertCircle size={18} strokeWidth={2} />

            <p>{actionError}</p>

            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================================
            MAIN DETAILS CARD
        ===================================================== */}

        <section className="officer-detail-main-card">
          {/* ===================================================
              COMPLAINT DESCRIPTION
          =================================================== */}

          <div className="officer-detail-description-section">
            <h2>Complaint Description</h2>

            <p>{complaint.description || "No description provided."}</p>
          </div>

          {/* ===================================================
              INFORMATION GRID
          =================================================== */}

          <div className="officer-detail-info-grid">
            {/* CATEGORY */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <Layers3 size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Category</span>

                <strong
                  className={`officer-detail-category ${getCategoryClass(
                    complaint.category,
                  )}`}
                >
                  {complaint.category || "—"}
                </strong>
              </div>
            </div>

            {/* REPORTED BY */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <UserRound size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Reported By</span>

                <strong>{complaint.reportedBy?.name || "Unknown"}</strong>
              </div>
            </div>

            {/* REPORTED DATE */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <CalendarDays size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Reported On</span>

                <strong>{formatDate(complaint.createdAt)}</strong>
              </div>
            </div>

            {/* ASSIGNED OFFICER */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <UserRound size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Assigned To</span>

                <strong>{complaint.assignedTo?.name || "Not assigned"}</strong>
              </div>
            </div>

            {/* CURRENT LEVEL */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <Layers3 size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Current Level</span>

                <strong>{formatLevel(complaint.currentLevel)}</strong>
              </div>
            </div>

            {/* COMMUNITY SUPPORT */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <Users size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Community Support</span>

                <strong>{complaint.supportCount || 0}</strong>
              </div>
            </div>
          </div>

          {/* ===================================================
              LOCATION
          =================================================== */}

          {hasLocation && (
            <div className="officer-detail-location-section">
              <div className="officer-detail-section-heading">
                <MapPin size={21} strokeWidth={1.9} />

                <h2>Location</h2>
              </div>

              {complaint.address && (
                <p className="officer-detail-address">
                  {formatAddress(complaint.address)}
                </p>
              )}

              {(hasLatitude || hasLongitude) && (
                <div className="officer-detail-coordinates">
                  <span>Latitude: {complaint.latitude ?? "—"}</span>

                  <span>Longitude: {complaint.longitude ?? "—"}</span>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              LAST UPDATED
              ===================================================== */}

          <div className="officer-detail-timestamps">
            <div>
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>Last Updated</span>

                <strong>{formatDateTime(complaint.updatedAt)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ASSIGNMENT + ESCALATION HISTORY
        ===================================================== */}

        <AssignmentHistory complaint={complaint} />

        {/* =====================================================
            MANAGE COMPLAINT
        ===================================================== */}

        <ComplaintActions
          complaint={complaint}
          user={currentUser}
          onStartWork={handleStartWork}
          onResolve={handleResolve}
          onEscalate={canEscalate ? handleEscalate : undefined}
          actionLoading={actionLoading}
        />

        {/* =====================================================
            RESOLVE MODAL
        ===================================================== */}

        <ResolveModal
          complaint={complaint}
          isOpen={showResolveModal}
          onClose={closeResolveModal}
          onConfirm={handleResolveSubmit}
          loading={actionLoading}
        />

        {/* =====================================================
            ESCALATION MODAL
        ===================================================== */}

        {canEscalate && (
          <EscalateModal
            complaint={complaint}
            isOpen={showEscalateModal}
            onClose={closeEscalateModal}
            onSubmit={handleEscalationSubmit}
            loading={actionLoading}
          />
        )}
      </div>
    </OfficerLayout>
  );
}

export default OfficerComplaintDetails;
