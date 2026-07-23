const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const validateComplaint = require("../middleware/validateComplaint");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    getComplaintDetails
} = require("../controllers/complaintController");

const router = express.Router();

// ---------------------------------
// Create Complaint
// ---------------------------------
router.post(
    "/create",
    verifyToken,
    upload.single("image"),
    validateComplaint,
    createComplaint
);

// ---------------------------------
// Get My Complaints
// ---------------------------------
router.get(
    "/",
    verifyToken,
    getMyComplaints
);

// Get all complaints
router.get(
    "/all",
    verifyToken,
    authorizeRoles(
        "juniorEngineer",
        "assistantExecutiveEngineer",
        "executiveEngineer",
        "municipalCommissioner"
    ),
    getAllComplaints
);

// ---------------------------------
// Get Complaint Details
// ---------------------------------
router.get(
    "/:id",
    verifyToken,
    getComplaintDetails
);

module.exports = router;