const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    getMyAlerts,
    markAlertAsRead,
} = require("../controllers/alertController");

const router = express.Router();

const officerRoles = [
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer",
    "municipalCommissioner",
];


router.get(
    "/",
    verifyToken,
    authorizeRoles(...officerRoles),
    getMyAlerts
);


router.patch(
    "/:id/read",
    verifyToken,
    authorizeRoles(...officerRoles),
    markAlertAsRead
);


module.exports = router;