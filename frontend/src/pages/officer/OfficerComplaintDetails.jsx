import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  UserRound,
  Layers3,
  Users,
  MapPin,
  Clock3,
  AlertCircle,
  Image as ImageIcon,
  ClipboardList
} from "lucide-react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import OfficerLayout from "../../components/officer/OfficerLayout";
import ComplaintActions from "../../components/officer/ComplaintActions";
import AssignmentHistory from "../../components/officer/AssignmentHistory";
import EscalateModal from "../../components/officer/EscalateModal";
import ResolveModal from "../../components/officer/ResolveModal";
import MapPreview from "../../components/Mappreview.jsx";

import API from "../../api/axios";

import "../../styles/officerComplaintDetails.css";
import "../../styles/officerComponents.css";

function OfficerComplaintDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  /* =========================================================
     CURRENT USER
  ========================================================= */

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

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
     ROLE ROUTE MAPPER HELPER
  ========================================================= */

  const getComplaintsRouteByRole = (role) => {
    switch (role) {
      case "juniorEngineer":
        return "/junior-engineer/complaints";
      case "assistantExecutiveEngineer":
        return "/assistant-executive-engineer/complaints";
      case "executiveEngineer":
        return "/executive-engineer/complaints";
      case "municipalCommissioner":
        return "/municipal-commissioner/complaints";
      default:
        return "/complaints";
    }
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

      const fetchedComplaint =
        response.data?.complaint ||
        response.data?.data?.complaint ||
        response.data?.data ||
        response.data;

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
     COMPLAINT IMAGE URL
  ========================================================= */

  const complaintImageUrl = complaint?.image
    ? complaint.image.startsWith("http://") ||
      complaint.image.startsWith("https://")
      ? complaint.image
      : `http://localhost:5001/uploads/${complaint.image.split(/[/\\]/).pop()}`
    : "";

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
     DISPLAY NAME HELPER
  ========================================================= */

  const getDisplayName = (person) => {
    if (!person) {
      return "";
    }

    if (typeof person === "string") {
      return person;
    }

    if (typeof person === "object") {
      return (
        person.name || person.fullName || person.username || person.email || ""
      );
    }

    return "";
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    if (!status) {
      return "default";
    }

    const normalizedStatus = String(status).trim().toLowerCase();

    switch (normalizedStatus) {
      case "pending":
        return "pending";

      case "assigned":
        return "assigned";

      case "in progress":
      case "in-progress":
      case "in_progress":
        return "in-progress";

      case "escalated":
        return "escalated";

      case "resolved":
        return "resolved";

      default:
        return "default";
    }
  };

  /* =========================================================
     STATUS DISPLAY
  ========================================================= */

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "in-progress") {
      return "In Progress";
    }

    return status;
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
      case "junior_engineer":
      case "Junior Engineer":
        return "Junior Engineer";

      case "assistantExecutiveEngineer":
      case "assistant_executive_engineer":
      case "Assistant Executive Engineer":
        return "Assistant Executive Engineer";

      case "executiveEngineer":
      case "executive_engineer":
      case "Executive Engineer":
        return "Executive Engineer";

      case "municipalCommissioner":
      case "municipal_commissioner":
      case "Municipal Commissioner":
        return "Municipal Commissioner";

      default:
        return level;
    }
  };

  /* =========================================================
     CURRENT LEVEL
  ========================================================= */

  const getCurrentLevel =
    complaint?.currentLevel || complaint?.current_level || "";

  /* =========================================================
     ESCALATION ELIGIBILITY
  ========================================================= */

  const canEscalate =
    getCurrentLevel === "juniorEngineer" ||
    getCurrentLevel === "assistantExecutiveEngineer";

  /* =========================================================
     LOCATION & WARD VALUES
  ========================================================= */

  const latitude =
    complaint?.latitude ??
    complaint?.location?.latitude ??
    complaint?.location?.lat ??
    null;

  const longitude =
    complaint?.longitude ??
    complaint?.location?.longitude ??
    complaint?.location?.lng ??
    complaint?.location?.lon ??
    null;

  const wardNumber =
    complaint?.wardNumber ??
    complaint?.ward_number ??
    complaint?.ward ??
    complaint?.location?.wardNumber ??
    complaint?.location?.ward ??
    null;

  const rawAddress =
    complaint?.address ||
    complaint?.location?.address ||
    complaint?.location?.formattedAddress ||
    "";

  /* =========================================================
     FORMAT ADDRESS (INCLUDES WARD NUMBER AFTER AREA)
  ========================================================= */

  const formatAddressWithWard = (address, ward) => {
    const wardText =
      ward !== null && ward !== undefined && String(ward).trim() !== ""
        ? `Ward No. ${ward}`
        : null;

    if (!address) {
      return wardText || "";
    }

    if (typeof address === "string") {
      const trimmed = address.trim();

      if (!wardText) {
        return trimmed;
      }

      const firstCommaIndex = trimmed.indexOf(",");

      if (firstCommaIndex !== -1) {
        return `${trimmed.slice(0, firstCommaIndex)}, ${wardText}${trimmed.slice(firstCommaIndex)}`;
      }

      return `${trimmed}, ${wardText}`;
    }

    if (typeof address !== "object") {
      return wardText || "";
    }

    // All available address fields included: area, landmark, city, district, state, pincode
    const parts = [
      address.area,
      wardText,
      address.landmark,
      address.city,
      address.district,
      address.state,
      address.pincode,
    ].filter(
      (part) =>
        part !== undefined && part !== null && String(part).trim() !== "",
    );

    return [...new Set(parts.map((part) => String(part).trim()))].join(", ");
  };

  const formattedAddressString = formatAddressWithWard(rawAddress, wardNumber);

  const hasLatitude =
    latitude !== null && latitude !== undefined && latitude !== "";

  const hasLongitude =
    longitude !== null && longitude !== undefined && longitude !== "";

  const hasLocation =
    Boolean(formattedAddressString) || hasLatitude || hasLongitude;

  /* =========================================================
     COMMUNITY SUPPORT
  ========================================================= */

  const supportCount =
    complaint?.supportCount ??
    complaint?.support_count ??
    complaint?.supports ??
    complaint?.supportersCount ??
    (Array.isArray(complaint?.supporters) ? complaint.supporters.length : 0);

  /* =========================================================
     REPORTED BY
  ========================================================= */

  const reportedByName =
    getDisplayName(complaint?.reportedBy) ||
    getDisplayName(complaint?.reported_by) ||
    "Unknown";

  /* =========================================================
     ASSIGNED TO
  ========================================================= */

  const assignedToName =
    getDisplayName(complaint?.assignedTo) ||
    getDisplayName(complaint?.assigned_to) ||
    "Not assigned";

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

      await API.post(`/complaints/${complaint._id}/start`);

      await fetchComplaint(false);

      toast.success("Complaint work started");
    } catch (error) {
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

      // ---------------------------------------------------------
      // Send as FormData so the evidence image travels along with
      // the resolution remarks in the same multipart request.
      //
      // IMPORTANT: do NOT manually set a Content-Type header here.
      // FormData needs the browser to generate the header itself,
      // since it must include a unique boundary string that only
      // the browser knows (based on the actual body it builds).
      // Setting "multipart/form-data" manually, without that
      // boundary, breaks file parsing on the backend silently —
      // text fields can still get through while the file is lost,
      // which is exactly the bug that caused resolution images to
      // never reach the server. Let axios/the browser set this
      // header automatically by omitting the headers option below.
      // ---------------------------------------------------------

      const formData = new FormData();
      formData.append("resolutionRemarks", resolutionRemarks.trim());

      if (resolutionData?.resolutionImage) {
        formData.append("resolutionImage", resolutionData.resolutionImage);
      }

      await API.post(`/complaints/${complaint._id}/resolve`, formData);

      setShowResolveModal(false);

      await fetchComplaint(false);

      toast.success("Complaint resolved");
    } catch (error) {
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

      toast.success("Complaint Escalated");

      setShowEscalateModal(false);

      const targetRoute = getComplaintsRouteByRole(currentUser?.role);
      navigate(targetRoute, { replace: true });

      return response.data;
    } catch (error) {
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
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <OfficerLayout>
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
              Back to Dashboard
            </button>
          </div>
        </div>
      </OfficerLayout>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <OfficerLayout>
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

        <header className="officer-detail-page-header">
          {/* Top Row: Section Heading & Status Badge */}
          <div className="officer-detail-header-top">
            <div className="officer-detail-eyebrow">
              <span className="officer-detail-heading-icon">
                <ClipboardList />
              </span>
              <span>Complaint Details</span>
            </div>

            <span
              className={`officer-complaint-status ${getStatusClass(complaint.status)}`}
            >
              {formatStatus(complaint.status)}
            </span>
          </div>

          {/* Bottom Content Area: Image (Left) & Text Details (Right) */}
          <div className="officer-detail-content-grid">
            {/* Static Image */}
            <div className="officer-detail-image-container">
              {complaintImageUrl ? (
                <img
                  src={complaintImageUrl}
                  alt={complaint.title || "Complaint"}
                  className="officer-detail-complaint-image"
                  onError={(event) => {
                    console.error(
                      "Complaint image failed to load:",
                      complaintImageUrl,
                    );
                    event.currentTarget.style.display = "none";
                    const fallback =
                      event.currentTarget.parentElement?.querySelector(
                        ".officer-detail-image-fallback",
                      );
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className="officer-detail-image-fallback"
                style={{ display: complaintImageUrl ? "none" : "flex" }}
              >
                <ImageIcon size={30} strokeWidth={1.7} />
              </div>
            </div>

            {/* Text Details */}
            <div className="officer-detail-info-group">
              <div className="officer-detail-field">
                <span className="heading">Complaint Title</span>
                <h1>{complaint.title || "Untitled Complaint"}</h1>
              </div>

              <div className="officer-detail-field">
                <span className="heading">Complaint Description</span>
                <p>{complaint.description || "No description provided."}</p>
              </div>
            </div>
          </div>
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

                <strong>{reportedByName}</strong>
              </div>
            </div>

            {/* REPORTED DATE */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <CalendarDays size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Reported On</span>

                <strong>
                  {formatDate(complaint.createdAt || complaint.created_at)}
                </strong>
              </div>
            </div>

            {/* ASSIGNED OFFICER */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <UserRound size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Assigned To</span>

                <strong>{assignedToName}</strong>
              </div>
            </div>

            {/* CURRENT LEVEL */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <Layers3 size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Current Level</span>

                <strong>{formatLevel(getCurrentLevel)}</strong>
              </div>
            </div>

            {/* COMMUNITY SUPPORT */}

            <div className="officer-detail-info-item">
              <div className="officer-detail-info-icon">
                <Users size={20} strokeWidth={1.9} />
              </div>

              <div>
                <span>Community Support</span>

                <strong>{supportCount || 0}</strong>
              </div>
            </div>
          </div>

          {/* ===================================================
              LOCATION
          ================================================    */}

          {hasLocation && (
            <div className="officer-detail-location-section">
              <div className="officer-detail-section-heading">
                <MapPin size={21} strokeWidth={1.9} />

                <h2>Location</h2>
              </div>

              {formattedAddressString && (
                <p className="officer-detail-address">
                  {formattedAddressString}
                </p>
              )}

              {(hasLatitude || hasLongitude) && (
                <div className="officer-detail-coordinates">
                  <span>Latitude: {latitude ?? "—"}</span>

                  <span>Longitude: {longitude ?? "—"}</span>
                </div>
              )}

              {/* Map preview + Navigate button (officer needs to reach the site) */}
              <MapPreview
                latitude={latitude}
                longitude={longitude}
                label={
                  [
                    complaint.category
                      ? complaint.category.charAt(0).toUpperCase() +
                        complaint.category.slice(1)
                      : "",
                    [rawAddress?.area, rawAddress?.city]
                      .filter(Boolean)
                      .join(", "),
                  ]
                    .filter(Boolean)
                    .join(" — ") || "Complaint location"
                }
                showNavigate={true}
              />
            </div>
          )}

          {/* ===================================================
              LAST UPDATED
          ================================================    */}

          <div className="officer-detail-timestamps">
            <div>
              <Clock3 size={18} strokeWidth={1.8} />

              <div>
                <span>Last Updated</span>

                <strong>
                  {formatDateTime(complaint.updatedAt || complaint.updated_at)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ASSIGNMENT + ESCALATION HISTORY
        ================================================    */}

        <AssignmentHistory complaint={complaint} />

        {/* =====================================================
            MANAGE COMPLAINT
        ================================================    */}

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
        ================================================    */}

        <ResolveModal
          complaint={complaint}
          isOpen={showResolveModal}
          onClose={closeResolveModal}
          onConfirm={handleResolveSubmit}
          loading={actionLoading}
        />

        {/* =====================================================
            ESCALATION MODAL
        ================================================    */}

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