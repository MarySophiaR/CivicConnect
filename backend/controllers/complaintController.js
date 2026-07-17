const Complaint = require("../models/Complaint");
const predictImage = require("../services/mlService");

// ---------------------------------
// Create Complaint
// ---------------------------------
const createComplaint = async (req, res) => {
    try {

        const {
            title,
            description,
            latitude,
            longitude
        } = req.body;

        // Check if image is uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image."
            });
        }

        // Image uploaded by Multer
        const image = req.file.path.replace(/\\/g, "/");

        // Logged-in user's ID (from JWT)
        const reportedBy = req.user.id;

        // Get AI Prediction from Flask
        const prediction = await predictImage(image);

        const category = prediction.category;
        const confidence = prediction.confidence;

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