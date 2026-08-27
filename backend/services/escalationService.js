const User = require("../models/User");
const Alert = require("../models/Alert");
const WORKFLOW = require("../config/workflowConfig");

// =========================================================
// HELPER: NORMALIZE MUNICIPALITY
// =========================================================
const normalizeMunicipality = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

// =========================================================
// HELPER: FIND MUNICIPAL COMMISSIONER
// =========================================================
const findMunicipalCommissioner = async (municipality) => {
  const normalized = normalizeMunicipality(municipality);
  if (!normalized) return null;

  return User.findOne({
    role: "municipalCommissioner",
    isActive: true,
    municipalities: {
      $in: [new RegExp(`^${normalized}$`, "i")],
    },
  }).select("_id name email role municipalities");
};

// =========================================================
// AUTOMATIC SLA ESCALATION (CRON DRIVEN)
// =========================================================
const autoEscalateComplaint = async (complaint, now = new Date()) => {
  const Complaint = require("../models/Complaint");

  if (!complaint || complaint.status === "Resolved") {
    return null;
  }

  const currentLevel = complaint.currentLevel;
  const currentWorkflow = WORKFLOW[currentLevel];

  if (!currentWorkflow || !currentWorkflow.next) {
    return null;
  }

  const nextLevel = currentWorkflow.next;

  // Find least loaded officer for next level
  const officers = await User.find({
    role: nextLevel,
    isActive: true,
    municipalities: {
      $in: [new RegExp(`^${normalizeMunicipality(complaint.municipality)}$`, "i")],
    },
    wardNumbers: complaint.wardNumber,
  }).select("_id name");

  if (!officers.length) {
    console.error(`[AUTO ESCALATION FAILED] No officer for ${nextLevel} in ward ${complaint.wardNumber}`);
    return null;
  }

  // Pick least loaded officer
  const officerLoads = await Promise.all(
    officers.map(async (officer) => {
      const activeCount = await Complaint.countDocuments({
        assignedTo: officer._id,
        status: { $ne: "Resolved" },
      });
      return { officer, activeCount };
    })
  );

  officerLoads.sort((a, b) => a.activeCount - b.activeCount);
  const selectedOfficer = officerLoads[0].officer;

  // End current assignment
  const currentAssignment = complaint.assignmentHistory[complaint.assignmentHistory.length - 1];
  if (currentAssignment) {
    currentAssignment.endedAt = now;
    currentAssignment.endReason = "auto_escalation";
    currentAssignment.resolved = false;
  }

  // Push escalation history
  complaint.escalationHistory.push({
    from: currentLevel,
    to: nextLevel,
    reason: "SLA Deadline Expired",
    note: "System auto-escalated complaint due to overdue deadline.",
    escalatedAt: now,
    type: "auto",
  });

  const nextSlaDays = Number(WORKFLOW[nextLevel]?.slaDays || 3);
  const newDeadline = new Date(now);
  newDeadline.setDate(newDeadline.getDate() + nextSlaDays);

  complaint.currentLevel = nextLevel;
  complaint.assignedTo = selectedOfficer._id;
  complaint.status = "Assigned";
  complaint.deadline = newDeadline;

  complaint.assignmentHistory.push({
    officer: selectedOfficer._id,
    level: nextLevel,
    assignedAt: now,
    startedAt: null,
    resolvedAt: null,
    endedAt: null,
    endReason: null,
    resolved: false,
  });

  await complaint.save();

  // Create Auto Escalation Alert for newly assigned officer
  await createAutoEscalationAlert({
    complaint,
    toOfficer: selectedOfficer._id,
    fromLevel: currentLevel,
    toLevel: nextLevel,
  });

  return complaint;
};

// =========================================================
// ALERT: ASSIGNMENT (Restricted to JE level only)
// =========================================================
const createAssignmentAlert = async ({ complaint, officerId }) => {
  if (!complaint || !officerId) return null;

  // If currentLevel is empty/undefined on a new complaint, default to "je"
  const level = (complaint.currentLevel || "je").trim().toLowerCase();
  const isJELevel = level === "je" || level === "juniorengineer" || level === "junior engineer";

  if (!isJELevel) {
    return null;
  }

  // Prevent creating duplicate assignment alerts
  const existingAlert = await Alert.findOne({
    recipient: officerId,
    complaint: complaint._id,
    type: "ASSIGNMENT",
  });

  if (existingAlert) return existingAlert;

  return Alert.create({
    recipient: officerId,
    complaint: complaint._id,
    type: "ASSIGNMENT",
    title: "New Complaint Assigned",
    message: `You have been assigned to complaint "${complaint.title}".`,
  });
};

// =========================================================
// ALERT: MANUAL ESCALATION
// =========================================================
const createManualEscalationAlert = async ({ complaint, fromOfficer, toOfficer, reason, note }) => {
  if (!complaint || !toOfficer) return null;

  // Prevent duplicate active assignment alert if an escalation alert is being created
  await Alert.deleteMany({
    recipient: toOfficer,
    complaint: complaint._id,
    type: "ASSIGNMENT",
  });

  return Alert.create({
    recipient: toOfficer,
    complaint: complaint._id,
    type: "MANUAL_ESCALATION",
    title: "Complaint Escalated To You",
    message: `Complaint "${complaint.title}" has been manually escalated to you. Reason: ${reason || "Not specified"}.`,
    escalationAt: new Date(),
  });
};

// =========================================================
// ALERT: AUTO ESCALATION
// =========================================================
const createAutoEscalationAlert = async ({ complaint, toOfficer, fromLevel, toLevel }) => {
  if (!complaint || !toOfficer) return null;

  // Prevent duplicate active assignment alert if an auto-escalation alert is being created
  await Alert.deleteMany({
    recipient: toOfficer,
    complaint: complaint._id,
    type: "ASSIGNMENT",
  });

  return Alert.create({
    recipient: toOfficer,
    complaint: complaint._id,
    type: "AUTO_ESCALATION",
    title: "SLA Auto-Escalation Notice",
    message: `Complaint "${complaint.title}" was auto-escalated from ${fromLevel} to ${toLevel} due to SLA breach.`,
    escalationAt: new Date(),
  });
};

// =========================================================
// ALERT: RESOLVED
// =========================================================
const createResolvedAlert = async ({ complaint, resolvedBy, remarks }) => {
  if (!complaint) return null;

  const recipientId = complaint.reportedBy || complaint.userId;
  if (!recipientId) return null;

  return Alert.create({
    recipient: recipientId,
    complaint: complaint._id,
    type: "RESOLVED",
    title: "Complaint Resolved",
    message: `Your complaint "${complaint.title}" has been marked as resolved. Remarks: ${remarks || "Resolved successfully."}`,
    link: `/citizen/complaint/${complaint._id}`,
  });
};

// =========================================================
// WARNING 1: CREATE DEADLINE NEAR ALERT (24h remaining)
// =========================================================
const createDeadlineAlert = async (complaint) => {
  if (!complaint || !complaint.assignedTo) return null;

  const existingAlert = await Alert.findOne({
    complaint: complaint._id,
    recipient: complaint.assignedTo,
    type: "DEADLINE_NEAR",
  });

  if (existingAlert) return existingAlert;

  return Alert.create({
    recipient: complaint.assignedTo,
    complaint: complaint._id,
    type: "DEADLINE_NEAR",
    title: "Deadline Approaching",
    message: `Warning: Less than 24 hours remaining to resolve complaint "${complaint.title}".`,
  });
};

// =========================================================
// WARNING 2: CREATE OVERDUE ALERT FOR EXECUTIVE ENGINEER
// =========================================================
const createOverdueAlert = async (complaint) => {
  if (!complaint || !complaint.assignedTo) return null;

  const existingAlert = await Alert.findOne({
    complaint: complaint._id,
    recipient: complaint.assignedTo,
    type: "OVERDUE",
  });

  if (existingAlert) return existingAlert;

  return Alert.create({
    recipient: complaint.assignedTo,
    complaint: complaint._id,
    type: "OVERDUE",
    title: "Complaint Overdue",
    message: `Urgent: SLA deadline for complaint "${complaint.title}" has passed and requires immediate action.`,
    escalationAt: new Date(),
  });
};

// =========================================================
// WARNING 3: CREATE MUNICIPAL COMMISSIONER ATTENTION ALERT
// =========================================================
const createMcAttentionAlert = async (complaint) => {
  if (!complaint) return null;

  const mc = await findMunicipalCommissioner(complaint.municipality);
  if (!mc) return null;

  const existingAlert = await Alert.findOne({
    complaint: complaint._id,
    recipient: mc._id,
    type: "MC_ATTENTION",
  });

  if (existingAlert) return existingAlert;

  return Alert.create({
    recipient: mc._id,
    complaint: complaint._id,
    type: "MC_ATTENTION",
    title: "Administrative Attention Required",
    message: `Administrative Alert: Complaint "${complaint.title}" in Ward ${complaint.ward} (Executive Engineer level) is overdue by over 24 hours.`,
    escalationAt: new Date(),
  });
};

module.exports = {
  autoEscalateComplaint,
  createAssignmentAlert,
  createManualEscalationAlert,
  createAutoEscalationAlert,
  createResolvedAlert,
  createDeadlineAlert,
  createOverdueAlert,
  createMcAttentionAlert,
};