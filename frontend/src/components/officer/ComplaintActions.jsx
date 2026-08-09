import {
  Play,
  CheckCircle2,
  ArrowUpCircle,
  Clock3,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import "../../styles/officerComponents.css";

function ComplaintActions({
  complaint,
  user,
  onStartWork,
  onResolve,
  onEscalate,
  actionLoading = false,
}) {
  if (!complaint) return null;

  const status = complaint.status || "Unknown";
  const isResolved = status === "Resolved";

  // =====================================================
  // CURRENT LEVEL / LOGGED-IN ROLE
  // =====================================================

  /*
   * IMPORTANT:
   * The complaint's currentLevel tells us where the complaint
   * currently is in the workflow.
   *
   * The logged-in user's role tells us who is viewing it.
   *
   * Therefore, MC detection MUST use user.role.
   */

  const userRole = String(user?.role || "").trim();

  const complaintLevel = String(
    complaint.currentLevel || ""
  ).trim();

  const assignedRole = String(
    complaint.assignedTo?.role || ""
  ).trim();

  // =====================================================
  // ROLE CHECKS
  // =====================================================

  const isMC =
    userRole === "municipalCommissioner";

  const isEE =
    complaintLevel === "executiveEngineer" ||
    assignedRole === "executiveEngineer";

  const isJE =
    complaintLevel === "juniorEngineer" ||
    assignedRole === "juniorEngineer";

  const isAEE =
    complaintLevel === "assistantExecutiveEngineer" ||
    assignedRole === "assistantExecutiveEngineer";

  /*
   * Only JE and AEE can manually escalate.
   *
   * JE  -> AEE
   * AEE -> EE
   * EE  -> NO
   * MC  -> NO
   */
  const canManuallyEscalate =
    (isJE || isAEE) && !isMC;

  // =====================================================
  // ASSIGNMENT HISTORY
  // =====================================================

  const assignmentHistory = Array.isArray(
    complaint.assignmentHistory
  )
    ? complaint.assignmentHistory
    : [];

  const currentAssignment =
    assignmentHistory.length > 0
      ? assignmentHistory[
          assignmentHistory.length - 1
        ]
      : null;

  // =====================================================
  // ESCALATION HISTORY
  // =====================================================

  const escalationHistory = Array.isArray(
    complaint.escalationHistory
  )
    ? complaint.escalationHistory
    : [];

  const lastEscalation =
    escalationHistory.length > 0
      ? escalationHistory[
          escalationHistory.length - 1
        ]
      : null;

  // =====================================================
  // DEADLINE & DATES
  // =====================================================

  const deadline = complaint.deadline
    ? new Date(complaint.deadline)
    : null;

  const now = new Date();

  const hasValidDeadline =
    deadline &&
    !Number.isNaN(deadline.getTime());

  const isBeforeDeadline =
    hasValidDeadline && now < deadline;

  const isDeadlinePassed =
    hasValidDeadline && now >= deadline;

  const resolvedDate = complaint.resolvedAt
    ? new Date(complaint.resolvedAt)
    : complaint.updatedAt
    ? new Date(complaint.updatedAt)
    : null;

  const escalationDate =
    lastEscalation?.escalatedAt
      ? new Date(lastEscalation.escalatedAt)
      : null;

  const formatDateTime = (date) => {
    if (!date) {
      return "Date not available";
    }

    const value =
      date instanceof Date
        ? date
        : new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Date not available";
    }

    return value.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // TIME REMAINING
  // =====================================================

  const getTimeRemaining = () => {
    if (!hasValidDeadline) {
      return null;
    }

    const difference =
      deadline.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        expired: true,
        urgent: true,
        text: "Deadline reached",
      };
    }

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const days = Math.floor(
      minutes / (60 * 24)
    );

    const hours = Math.floor(
      (minutes % (60 * 24)) / 60
    );

    const remainingMinutes = minutes % 60;

    if (days > 0) {
      return {
        expired: false,
        urgent: days <= 1,
        text:
          `${days} day${
            days !== 1 ? "s" : ""
          } ` +
          `${hours} hour${
            hours !== 1 ? "s" : ""
          } remaining`,
      };
    }

    if (hours > 0) {
      return {
        expired: false,
        urgent: true,
        text:
          `${hours} hour${
            hours !== 1 ? "s" : ""
          } ` +
          `${remainingMinutes} minute${
            remainingMinutes !== 1 ? "s" : ""
          } remaining`,
      };
    }

    return {
      expired: false,
      urgent: true,
      text:
        `${remainingMinutes} minute${
          remainingMinutes !== 1 ? "s" : ""
        } remaining`,
    };
  };

  const timeRemaining =
    getTimeRemaining();

  // =====================================================
  // ACTION AVAILABILITY
  // =====================================================

  const canStartWork =
    !isMC && status === "Assigned";

  // MC can NEVER resolve
  const canResolve =
    !isMC && status === "In Progress";

  // Only JE + AEE can manually escalate
  // EE + MC cannot escalate
  const canEscalate =
    !isMC &&
    canManuallyEscalate &&
    (status === "Assigned" ||
      status === "In Progress") &&
    isBeforeDeadline;

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleStartWork = () => {
    if (!canStartWork || actionLoading) {
      return;
    }

    if (typeof onStartWork === "function") {
      onStartWork(complaint);
    }
  };

  const handleResolve = () => {
    if (!canResolve || actionLoading) {
      return;
    }

    if (typeof onResolve === "function") {
      onResolve(complaint);
    }
  };

  const handleEscalate = () => {
    if (!canEscalate || actionLoading) {
      return;
    }

    if (typeof onEscalate === "function") {
      onEscalate(complaint);
    }
  };
  

  // =====================================================
  // ESCALATION INFORMATION
  // =====================================================

  const escalationType =
    lastEscalation?.type === "automatic"
      ? "Automatic Escalation"
      : "Manual Escalation";

  const wasEscalated =
    currentAssignment?.endReason ===
      "manual_escalation" ||
    currentAssignment?.endReason ===
      "automatic_escalation";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="officer-actions-card">
      <div className="officer-actions-header">
        <div>
          <span className="officer-actions-eyebrow">
            Complaint Actions
          </span>

          <h2>Manage Complaint</h2>
        </div>
      </div>

      {/* RESOLVED VIEW */}

      {isResolved && (
        <div className="officer-actions-deadline">
          <div className="officer-actions-deadline-icon">
            <CheckCircle2 size={20} />
          </div>

          <div className="officer-actions-deadline-content">
            <span>Resolved At</span>

            <strong>
              {resolvedDate
                ? formatDateTime(
                    resolvedDate
                  )
                : "Resolution time not available"}
            </strong>

            <span className="officer-resolution-note-label">
              Resolution Note
            </span>

            <p className="officer-resolution-note">
              {complaint.resolutionRemarks?.trim()
                ? complaint.resolutionRemarks
                : "No resolution note provided."}
            </p>
          </div>
        </div>
      )}

      {/* ESCALATED VIEW */}

      {!isResolved &&
        wasEscalated && (
          <div className="officer-actions-deadline">
            <div className="officer-actions-deadline-icon">
              <ArrowUpRight size={20} />
            </div>

            <div className="officer-actions-deadline-content">
              <span>
                Complaint Escalated
              </span>

              <strong>
                {escalationDate
                  ? `Escalated at ${formatDateTime(
                      escalationDate
                    )}`
                  : "Escalation time not available"}
              </strong>

              <small>
                {escalationType}
              </small>

              {lastEscalation?.reason && (
                <small>
                  Reason:{" "}
                  {lastEscalation.reason}
                </small>
              )}
            </div>
          </div>
        )}

      {/* ACTIVE DEADLINE */}

      {!isResolved &&
        !wasEscalated && (
          <>
            <div className="officer-actions-deadline">
              <div className="officer-actions-deadline-icon">
                {timeRemaining?.urgent ? (
                  <AlertTriangle size={20} />
                ) : (
                  <Clock3 size={20} />
                )}
              </div>

              <div className="officer-actions-deadline-content">
                <span>
                  Complaint Deadline
                </span>

                <strong>
                  {hasValidDeadline
                    ? formatDateTime(
                        deadline
                      )
                    : "Deadline not available"}
                </strong>

                {timeRemaining && (
                  <small
                    className={
                      timeRemaining.expired
                        ? "officer-deadline-expired"
                        : timeRemaining.urgent
                        ? "officer-deadline-urgent"
                        : ""
                    }
                  >
                    {timeRemaining.text}
                  </small>
                )}
              </div>
            </div>

            {/* DEADLINE WARNING */}

            {isBeforeDeadline &&
              timeRemaining?.urgent && (
                <div className="officer-actions-warning">
                  <AlertTriangle size={18} />

                  <p>
                    The complaint deadline is approaching.
                    Please complete the work or use the
                    available escalation option if required.
                  </p>
                </div>
              )}

            {/* DEADLINE PASSED */}

            {isDeadlinePassed && (
              <div className="officer-actions-expired">
                <Clock3 size={18} />

                <p>
                  The complaint deadline has been reached.
                  Automatic escalation will be handled by
                  the system according to the workflow.
                </p>
              </div>
            )}
          </>
        )}

      {/* ACTION BUTTONS */}

      {!isResolved &&
        !wasEscalated && (
          <div className="officer-actions-buttons">

            {/* START WORK */}

            {canStartWork && (
              <button
                type="button"
                className="officer-action-button officer-action-start"
                onClick={handleStartWork}
                disabled={actionLoading}
              >
                <Play
                  size={18}
                  fill="currentColor"
                />

                <span>
                  {actionLoading
                    ? "Starting..."
                    : "Start Work"}
                </span>
              </button>
            )}

            {/* RESOLVE */}

            {canResolve && (
              <button
                type="button"
                className="officer-action-button officer-action-resolve"
                onClick={handleResolve}
                disabled={actionLoading}
              >
                <CheckCircle2 size={18} />

                <span>
                  Resolve Complaint
                </span>
              </button>
            )}

            {/* MANUAL ESCALATION */}

            {canEscalate && (
              <button
                type="button"
                className="officer-action-button officer-action-escalate"
                onClick={handleEscalate}
                disabled={actionLoading}
              >
                <ArrowUpCircle size={18} />

                <span>
                  Request Escalation
                </span>
              </button>
            )}
          </div>
        )}

      {/* WORKFLOW TRACKER */}

      <div className="officer-actions-workflow">
        <div className="officer-actions-workflow-title">
          <span>
            Current Workflow
          </span>
        </div>

        <div className="officer-actions-workflow-steps">

          {/* ASSIGNED */}

          <div
            className={
              status === "Assigned"
                ? "officer-workflow-step active"
                : status === "In Progress" ||
                  status === "Resolved"
                ? "officer-workflow-step completed"
                : "officer-workflow-step"
            }
          >
            <span className="officer-workflow-dot" />

            <div>
              <strong>
                Assigned
              </strong>

              <small>
                Complaint assigned to officer
              </small>
            </div>
          </div>

          {/* IN PROGRESS */}

          <div
            className={
              status === "In Progress"
                ? "officer-workflow-step active"
                : status === "Resolved"
                ? "officer-workflow-step completed"
                : "officer-workflow-step"
            }
          >
            <span className="officer-workflow-dot" />

            <div>
              <strong>
                In Progress
              </strong>

              <small>
                Officer has started working
              </small>
            </div>
          </div>

          {/* RESOLVED */}

          <div
            className={
              status === "Resolved"
                ? "officer-workflow-step completed"
                : "officer-workflow-step"
            }
          >
            <span className="officer-workflow-dot" />

            <div>
              <strong>
                Resolved
              </strong>

              <small>
                Complaint successfully resolved
              </small>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ComplaintActions;