const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const systemAdminMiddleware = require("../middleware/systemAdminMiddleware");

const {
    getAllOfficers,
    getOfficerCounts,
    deactivateOfficer,
    activateOfficer
} = require("../controllers/systemAdminController");

const router = express.Router();


// =================================
// GET ALL OFFICERS
// =================================

router.get(
    "/officers",
    verifyToken,
    systemAdminMiddleware,
    getAllOfficers
);


// =================================
// GET OFFICER COUNTS
// =================================

router.get(
    "/officer-counts",
    verifyToken,
    systemAdminMiddleware,
    getOfficerCounts
);


// =================================
// DEACTIVATE OFFICER
// =================================

router.patch(
    "/officers/:id/deactivate",
    verifyToken,
    systemAdminMiddleware,
    deactivateOfficer
);


// =================================
// ACTIVATE OFFICER
// =================================

router.patch(
    "/officers/:id/activate",
    verifyToken,
    systemAdminMiddleware,
    activateOfficer
);


module.exports = router;