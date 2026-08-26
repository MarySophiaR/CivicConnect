const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const Alert = require("../models/Alert");
const {
  autoEscalateComplaint,
  createAssignmentAlert,
  createDeadlineAlert,
  createOverdueAlert,
  createMcAttentionAlert,
} = require("../services/escalationService");

const DEADLINE_NEAR_MS = 24 * 60 * 60 * 1000; // 24 hours
const EE_FOLLOW_UP_MS = 24 * 60 * 60 * 1000;  // 24 hours after EE deadline

let isEscalationJobRunning = false;

/* =========================================================
   CHECK & PROCESS WARNING ALERTS / AUTO-ESCALATIONS
========================================================= */
const processComplaintAlerts = async (complaint, now) => {
  if (!complaint || complaint.status === "Resolved") return;

  // 1. ASSIGNMENT ALERT (Only send if an assignment alert hasn't already been sent for this specific officer)
  if (complaint.assignedTo) {
    const existingAssignmentAlert = await Alert.findOne({
      complaint: complaint._id,
      recipient: complaint.assignedTo,
      type: "ASSIGNMENT",
    });

    if (!existingAssignmentAlert) {
      await createAssignmentAlert({
        complaint,
        officerId: complaint.assignedTo,
      });
    }
  }

  if (!complaint.deadline) return;

  const deadline = new Date(complaint.deadline);
  const timeUntilDeadline = deadline.getTime() - now.getTime();

  // 2. DEADLINE NEAR WARNING (SLA deadline within 24 hours)
  if (timeUntilDeadline > 0 && timeUntilDeadline <= DEADLINE_NEAR_MS) {
    await createDeadlineAlert(complaint);
    return;
  }

  // 3. DEADLINE EXPIRED
  if (timeUntilDeadline <= 0) {
    if (complaint.currentLevel === "executiveEngineer") {
      // Executive Engineer has no higher officer to auto-escalate to
      await createOverdueAlert(complaint);

      const timePassedDeadline = Math.abs(timeUntilDeadline);
      if (timePassedDeadline >= EE_FOLLOW_UP_MS) {
        // 4. EE OVERDUE > 24H -> INFORM MUNICIPAL COMMISSIONER
        await createMcAttentionAlert(complaint);
      }
    } else {
      // Auto-escalate Junior Engineer / AEE to higher officer level
      // Note: autoEscalateComplaint automatically generates AUTO_ESCALATION alert internally
      await autoEscalateComplaint(complaint, now);
    }
  }
};

/* =========================================================
   CRON SCHEDULE (Runs every 15 minutes)
========================================================= */
const escalationJob = () => {
  cron.schedule("*/15 * * * *", async () => {
    if (isEscalationJobRunning) return;

    isEscalationJobRunning = true;
    const now = new Date();

    try {
      const activeComplaints = await Complaint.find({
        status: { $ne: "Resolved" },
      });

      for (const complaint of activeComplaints) {
        try {
          await processComplaintAlerts(complaint, now);
        } catch (error) {
          // Handled silently
        }
      }
    } catch (error) {
      // Handled silently
    } finally {
      isEscalationJobRunning = false;
    }
  });
};

module.exports = escalationJob;