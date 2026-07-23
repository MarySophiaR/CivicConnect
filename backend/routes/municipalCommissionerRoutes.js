const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createOfficer
} = require("../controllers/municipalCommissionerController");

const router = express.Router();

// Create Officer
router.post(
    "/create-officer",
    verifyToken,
    authorizeRoles("municipalCommissioner"),
    createOfficer
);

module.exports = router;