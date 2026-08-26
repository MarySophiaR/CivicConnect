const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getAssignedComplaints
} = require("../controllers/municipalCommissionerController");

const router = express.Router();

// ---------------------------------
// Get Complaints
// ---------------------------------

router.get(
    "/complaints",
    verifyToken,
    authorizeRoles("municipalCommissioner"),
    getAssignedComplaints
);

module.exports = router;