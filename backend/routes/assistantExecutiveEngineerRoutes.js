const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints
} = require("../controllers/assistantExecutiveEngineerController");

const router = express.Router();

// ---------------------------------
// View Assigned Complaints
// ---------------------------------
router.get(
    "/complaints",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    getAssignedComplaints
);


module.exports = router;