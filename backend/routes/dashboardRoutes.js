const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    citizenDashboard,
    juniorEngineerDashboard,
    assistantExecutiveEngineerDashboard,
    executiveEngineerDashboard,
    municipalCommissionerDashboard,
    categoryStats,
    monthlyStats,
    recentComplaints,
    officerPerformance
} = require("../controllers/dashboardController");

const router = express.Router();

// ---------------------------------
// Citizen Dashboard
// ---------------------------------
router.get(
    "/citizen",
    verifyToken,
    authorizeRoles("citizen"),
    citizenDashboard
);

// ---------------------------------
// Junior Engineer Dashboard
// ---------------------------------
router.get(
    "/junior-engineer",
    verifyToken,
    authorizeRoles("juniorEngineer"),
    juniorEngineerDashboard
);

// ---------------------------------
// Assistant Executive Engineer Dashboard
// ---------------------------------
router.get(
    "/assistant-executive-engineer",
    verifyToken,
    authorizeRoles("assistantExecutiveEngineer"),
    assistantExecutiveEngineerDashboard
);

// ---------------------------------
// Executive Engineer Dashboard
// ---------------------------------
router.get(
    "/executive-engineer",
    verifyToken,
    authorizeRoles("executiveEngineer"),
    executiveEngineerDashboard
);

// ---------------------------------
// Municipal Commissioner Dashboard
// ---------------------------------
router.get(
    "/municipal-commissioner",
    verifyToken,
    authorizeRoles("municipalCommissioner"),
    municipalCommissionerDashboard
);

// ---------------------------------
// Category Statistics
// ---------------------------------
router.get(
    "/category-stats",
    verifyToken,
    categoryStats
);

// ---------------------------------
// Monthly Complaint Statistics
// ---------------------------------
router.get(
    "/monthly-stats",
    verifyToken,
    monthlyStats
);

// ---------------------------------
// Recent Complaints
// ---------------------------------
router.get(
    "/recent-complaints",
    verifyToken,
    recentComplaints
);

// ---------------------------------
// Officer Performance
// ---------------------------------
router.get(
    "/officer-performance",
    verifyToken,
    authorizeRoles("municipalCommissioner"),
    officerPerformance
);

module.exports = router;