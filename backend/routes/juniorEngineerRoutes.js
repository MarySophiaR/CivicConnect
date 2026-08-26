const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints
} = require("../controllers/juniorEngineerController");

const router = express.Router();

// ---------------------------------
// View Assigned Complaints
// ---------------------------------
router.get(
    "/complaints",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    getAssignedComplaints
);


module.exports = router;