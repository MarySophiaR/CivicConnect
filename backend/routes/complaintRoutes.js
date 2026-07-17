const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const { createComplaint } = require("../controllers/complaintController");

const router = express.Router();

// Create Complaint
router.post(
    "/",
    verifyToken,
    upload.single("image"),
    createComplaint
);

module.exports = router;