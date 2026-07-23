const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints,
    startWork,
    resolveComplaint,
    escalateComplaint
} = require("../controllers/assistantExecutiveEngineerController");

const router = express.Router();

// ---------------------------------
// View Assigned Complaints
// ---------------------------------
router.get(
    "/assigned-complaints",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    getAssignedComplaints
);

// ---------------------------------
// Start Work
// ---------------------------------
router.put(
    "/start-work/:id",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    startWork
);

// ---------------------------------
// Resolve Complaint
// ---------------------------------
router.put(
    "/resolve/:id",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    resolveComplaint
);

// ---------------------------------
// Escalate Complaint
// ---------------------------------
router.put(
    "/escalate/:id",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    escalateComplaint
);

module.exports = router;