const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getMyAlerts,
    markAlertAsRead,
} = require("../controllers/alertController");

const router = express.Router();

const allNotificationRoles = [
    "citizen",
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer",
    "municipalCommissioner",
];


// =========================================================
// GET USER ALERTS
// =========================================================

router.get(
    "/",
    verifyToken,
    authorizeRoles(...allNotificationRoles),
    getMyAlerts
);


// =========================================================
// MARK ALERT AS READ
// =========================================================

router.patch(
    "/:id/read",
    verifyToken,
    authorizeRoles(...allNotificationRoles),
    markAlertAsRead
);


module.exports = router;