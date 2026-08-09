import { useEffect, useState } from "react";

import {
  X,
  ArrowUpCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import "../../styles/officerComponents.css";

function EscalateModal({
  complaint,
  isOpen,
  onClose,
  onSubmit,
}) {
  /* =========================================================
     STATE
  ========================================================= */

  const [selectedReason, setSelectedReason] = useState("");

  const [additionalNote, setAdditionalNote] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     VALID ESCALATION REASONS

     IMPORTANT:
     These codes MUST exactly match the backend
     config/escalationReasons.js
  ========================================================= */

  const escalationReasons = [
    {
      code: "SPECIALIZED_RESOURCES_REQUIRED",
      label:
        "Specialized resources or technical expertise are required.",
    },

    {
      code: "EQUIPMENT_UNAVAILABLE",
      label:
        "Required equipment or machinery is currently unavailable.",
    },

    {
      code: "INSUFFICIENT_MANPOWER",
      label:
        "Additional manpower is required to handle the complaint.",
    },

    {
      code: "SAFETY_OR_ACCESS_CONSTRAINT",
      label:
        "Safety or site-access constraints are preventing the work.",
    },

    {
      code: "WORK_REQUIRES_HIGHER_AUTHORITY",
      label:
        "The complaint requires approval or action from a higher authority.",
    },
  ];

  /* =========================================================
     RESET MODAL
  ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setAdditionalNote("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  /* =========================================================
     SAFETY CHECK
  ========================================================= */

  if (!isOpen || !complaint) {
    return null;
  }

  /* =========================================================
     CHECK DEADLINE
  ========================================================= */

  const deadline = complaint.deadline
    ? new Date(complaint.deadline)
    : null;

  const hasValidDeadline =
    deadline &&
    !Number.isNaN(deadline.getTime());

  const isBeforeDeadline = hasValidDeadline
    ? new Date() < deadline
    : false;

  /* =========================================================
     FORMAT DEADLINE
  ========================================================= */

  const formatDeadline = () => {
    if (!hasValidDeadline) {
      return "Deadline unavailable";
    }

    return deadline.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     HANDLE CLOSE
  ========================================================= */

  const handleClose = () => {
    if (submitting) {
      return;
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  /* =========================================================
     HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    /* -----------------------------------------
       PREVENT DUPLICATE SUBMISSION
    ----------------------------------------- */

    if (submitting) {
      return;
    }

    /* -----------------------------------------
       VERIFY COMPLAINT
    ----------------------------------------- */

    if (!complaint?._id) {
      setError(
        "Complaint information is unavailable."
      );

      return;
    }

    /* -----------------------------------------
       DEADLINE VALIDATION
    ----------------------------------------- */

    if (!isBeforeDeadline) {
      setError(
        "Manual escalation is no longer available because the complaint deadline has been reached."
      );

      return;
    }

    /* -----------------------------------------
       REASON VALIDATION
    ----------------------------------------- */

    if (!selectedReason) {
      setError(
        "Please select a valid reason for escalation."
      );

      return;
    }

    /* -----------------------------------------
       VERIFY REASON AGAINST ALLOWED LIST
    ----------------------------------------- */

    const validReason =
      escalationReasons.find(
        (reason) =>
          reason.code === selectedReason
      );

    if (!validReason) {
      setError(
        "Invalid escalation reason selected."
      );

      return;
    }

    /* -----------------------------------------
       VERIFY SUBMIT HANDLER
    ----------------------------------------- */

    if (typeof onSubmit !== "function") {
      setError(
        "Escalation submission handler is not available."
      );

      return;
    }

    /* -----------------------------------------
       START SUBMISSION
    ----------------------------------------- */

    setSubmitting(true);
    setError("");

    try {
      /*
       * IMPORTANT:
       *
       * Send the EXACT reason code expected
       * by the backend.
       *
       * Backend expects:
       *
       * {
       *   reasonCode: "SPECIALIZED_RESOURCES_REQUIRED",
       *   note: "..."
       * }
       */

      const escalationData = {
        reasonCode: validReason.code,

        reasonLabel: validReason.label,

        note: additionalNote.trim(),
      };

      console.log(
        "[ESCALATION MODAL] Sending escalation data:",
        escalationData
      );

      /*
       * OfficerComplaintDetails receives this
       * as its FIRST argument.
       */

      await onSubmit(escalationData);

      /*
       * If the parent successfully completed
       * the backend request, the parent will
       * close the modal.
       *
       * Stop the spinner here as a safety measure.
       */

      setSubmitting(false);
    } catch (submitError) {
      console.error(
        "[ESCALATION MODAL] Submission error:",
        submitError
      );

      setSubmitting(false);

      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Failed to submit escalation request."
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="officer-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="officer-escalate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-modal-title"
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="officer-modal-header">
          <div className="officer-modal-heading">
            <div className="officer-modal-icon">
              <ArrowUpCircle
                size={24}
                strokeWidth={2}
              />
            </div>

            <div>
              <span className="officer-modal-eyebrow">
                Complaint Escalation
              </span>

              <h2 id="escalate-modal-title">
                Request Escalation
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="officer-modal-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close escalation modal"
          >
            <X
              size={20}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* ===================================================
            COMPLAINT SUMMARY
        =================================================== */}

        <div className="officer-escalate-complaint">
          <span>Complaint</span>

          <strong>
            {complaint.title ||
              "Untitled Complaint"}
          </strong>
        </div>

        {/* ===================================================
            INFORMATION
        =================================================== */}

        <div className="officer-escalate-info">
          <AlertTriangle
            size={18}
            strokeWidth={2}
          />

          <p>
            Escalation should only be requested
            when the issue genuinely requires
            intervention from a higher level. The
            system will automatically escalate the
            complaint if the deadline is reached.
          </p>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="officer-escalate-form"
          onSubmit={handleSubmit}
        >
          {/* =================================================
              DEADLINE
          ================================================= */}

          <div className="officer-escalate-deadline">
            <span>Current Deadline</span>

            <strong>
              {formatDeadline()}
            </strong>
          </div>

          {/* =================================================
              REASON
          ================================================= */}

          <div className="officer-form-group">
            <label
              htmlFor="escalation-reason"
            >
              Reason for Escalation

              <span>*</span>
            </label>

            <select
              id="escalation-reason"
              value={selectedReason}
              onChange={(event) => {
                setSelectedReason(
                  event.target.value
                );

                setError("");
              }}
              disabled={submitting}
            >
              <option value="">
                Select a valid reason
              </option>

              {escalationReasons.map(
                (reason) => (
                  <option
                    key={reason.code}
                    value={reason.code}
                  >
                    {reason.label}
                  </option>
                )
              )}
            </select>

            <small>
              Select the reason that best
              describes why this complaint
              requires escalation.
            </small>
          </div>

          {/* =================================================
              ADDITIONAL NOTE
          ================================================= */}

          <div className="officer-form-group">
            <label
              htmlFor="escalation-note"
            >
              Additional Information

              <span className="optional-label">
                Optional
              </span>
            </label>

            <textarea
              id="escalation-note"
              value={additionalNote}
              onChange={(event) => {
                setAdditionalNote(
                  event.target.value
                );

                setError("");
              }}
              placeholder="Provide any additional information that may help the higher-level officer understand the situation..."
              rows={4}
              maxLength={500}
              disabled={submitting}
            />

            <div className="officer-textarea-footer">
              <small>
                Additional information is
                optional.
              </small>

              <span>
                {additionalNote.length}/500
              </span>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="officer-modal-error"
              role="alert"
            >
              <AlertTriangle
                size={18}
                strokeWidth={2}
              />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="officer-modal-actions">
            <button
              type="button"
              className="officer-modal-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="officer-modal-submit"
              disabled={
                submitting ||
                !isBeforeDeadline
              }
            >
              {submitting ? (
                <>
                  <span className="officer-button-spinner" />

                  Submitting...
                </>
              ) : (
                <>
                  <ArrowUpCircle
                    size={18}
                    strokeWidth={2}
                  />

                  Request Escalation
                </>
              )}
            </button>
          </div>
        </form>

        {/* ===================================================
            FOOTER NOTE
        =================================================== */}

        <div className="officer-modal-footer-note">
          <CheckCircle2
            size={16}
            strokeWidth={2}
          />

          <span>
            Your escalation request will be
            recorded in the complaint history.
          </span>
        </div>
      </div>
    </div>
  );
}

export default EscalateModal;