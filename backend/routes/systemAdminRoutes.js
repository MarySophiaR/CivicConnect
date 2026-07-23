const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const systemAdminMiddleware = require("../middleware/systemAdminMiddleware");

const {
    createOfficer,
    getAllOfficers,
    getOfficerCounts
} = require("../controllers/systemAdminController");

const router = express.Router();

// ---------------------------------
// Create Officer
// ---------------------------------
router.post(
    "/create-officer",
    verifyToken,
    systemAdminMiddleware,
    createOfficer
);

// ---------------------------------
// Get All Officers
// ---------------------------------
router.get(
    "/officers",
    verifyToken,
    systemAdminMiddleware,
    getAllOfficers
);


// ---------------------------------
// Get Officer Counts
// ---------------------------------
router.get(
    "/officer-counts",
    verifyToken,
    systemAdminMiddleware,
    getOfficerCounts
);

module.exports = router;