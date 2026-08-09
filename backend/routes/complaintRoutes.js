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
  startComplaintWork,
  resolveComplaint,
  escalateComplaint
} = require("../controllers/complaintController");

const router = express.Router();

// =================================
// PREDICT COMPLAINT
// =================================
router.post(
  "/predict",
  verifyToken,
  uploadMemory.single("image"),
  predictComplaint
);

// =================================
// CREATE COMPLAINT
// =================================
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
// START COMPLAINT WORK
// =================================

router.post(
  "/:id/start",
  verifyToken,
  authorizeRoles(
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer"
  ),
  startComplaintWork
);


// =================================
// RESOLVE COMPLAINT
// =================================

router.post(
  "/:id/resolve",
  verifyToken,
  authorizeRoles(
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer"
  ),
  resolveComplaint
);


// =================================
// MANUAL ESCALATION
// =================================

router.post(
  "/:id/escalate",
  verifyToken,
  authorizeRoles(
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer"
  ),
  escalateComplaint
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