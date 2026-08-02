const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const {
  uploadDisk,
  uploadMemory,
} = require("../config/multer");
const validateComplaint = require("../middleware/validateComplaint");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  predictComplaint,
  createComplaint,
  updateComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintDetails,
  getDashboardStats,
} = require("../controllers/complaintController");

const router = express.Router();

// =================================
// PREDICT COMPLAINT
// =================================
// Image is kept only in RAM.
// It is sent to the Flask ML service.
// It is NOT saved in uploads.
router.post(
  "/predict",
  verifyToken,
  uploadMemory.single("image"),
  predictComplaint
);

// =================================
// CREATE COMPLAINT
// =================================
// Image is permanently saved in uploads
// only when a NEW complaint is created.
router.post(
  "/create",
  verifyToken,
  uploadDisk.single("image"),
  validateComplaint,
  createComplaint
);

// =================================
// UPDATE / EDIT COMPLAINT
// =================================
// Citizen can edit only their own
// Pending / Assigned complaint.
//
// Currently updates:
// - title
// - description
//
// PUT example:
// /api/complaints/:id
router.put(
  "/:id",
  verifyToken,
  updateComplaint
);

// =================================
// DASHBOARD STATISTICS
// =================================
router.get(
  "/dashboard",
  verifyToken,
  getDashboardStats
);

// =================================
// GET ALL COMPLAINTS
// =================================
// Only officers can access this.
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

// =================================
// GET MY COMPLAINTS
// =================================
router.get(
  "/",
  verifyToken,
  getMyComplaints
);

// =================================
// GET COMPLAINT DETAILS
// =================================
router.get(
  "/:id",
  verifyToken,
  getComplaintDetails
);

module.exports = router;