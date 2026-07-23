const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints,
    startWork,
    resolveComplaint
} = require("../controllers/executiveEngineerController");

const router = express.Router();

// ---------------------------------
// View Assigned Complaints
// ---------------------------------
router.get(
    "/assigned-complaints",
    verifyToken,
    authorizeRoles("executiveEngineer"),
    getAssignedComplaints
);

// ---------------------------------
// Start Work
// ---------------------------------
router.put(
    "/start-work/:id",
    verifyToken,
    authorizeRoles("executiveEngineer"),
    startWork
);

// ---------------------------------
// Resolve Complaint
// ---------------------------------
router.put(
    "/resolve/:id",
    verifyToken,
    authorizeRoles("executiveEngineer"),
    resolveComplaint
);

module.exports = router;