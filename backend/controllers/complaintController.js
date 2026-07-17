const Complaint = require("../models/Complaint");

// ---------------------------------
// Create Complaint
// ---------------------------------
const createComplaint = async (req, res) => {
    try {

        const {
    title,
    description,
    image,
    category,
    confidence,
    latitude,
    longitude
} = req.body;

// Logged-in user's ID (from JWT)
const reportedBy = req.user.id;

// Create Complaint
const complaint = new Complaint({
    title,
    description,
    image,
    category,
    confidence,
    latitude,
    longitude,
    reportedBy
});

// Save Complaint
await complaint.save();

// Success Response
return res.status(201).json({
    message: "Complaint submitted successfully.",
    complaint
});

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    createComplaint
};