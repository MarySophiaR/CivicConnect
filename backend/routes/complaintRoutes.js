const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const { createComplaint } = require("../controllers/complaintController");

const router = express.Router();

// Create Complaint
router.post("/", verifyToken, createComplaint);

module.exports = router;