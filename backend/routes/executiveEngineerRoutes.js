const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints
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


module.exports = router;