const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints,
    startWork,
    resolveComplaint,
    escalateComplaint
} = require("../controllers/juniorEngineerController");

const router = express.Router();

// ---------------------------------
// View Assigned Complaints
// ---------------------------------
router.get(
    "/assigned-complaints",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    getAssignedComplaints
);

// ---------------------------------
// Start Work
// ---------------------------------
router.put(
    "/start-work/:id",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    startWork
);

// ---------------------------------
// Resolve Complaint
// ---------------------------------
router.put(
    "/resolve/:id",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    resolveComplaint
);

// ---------------------------------
// Escalate Complaint
// ---------------------------------
router.put(
    "/escalate/:id",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    escalateComplaint
);

module.exports = router;