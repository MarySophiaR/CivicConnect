const Complaint = require("../models/Complaint");
const { autoEscalateComplaint } = require("../services/escalationService");

// ---------------------------------
// Get Assigned Complaints
// ---------------------------------
const getAssignedComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
            assignedTo: req.user.id,
            status: {
                $ne: "Resolved"
            }
        })
        .populate("reportedBy", "name email")
        .sort({
            createdAt: -1
        });

        return res.status(200).json({
            totalComplaints: complaints.length,
            complaints
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Start Work
// ---------------------------------
const startWork = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found."
            });
        }

        if (
            !complaint.assignedTo ||
            complaint.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not assigned to this complaint."
            });
        }

        if (complaint.status === "Resolved") {
            return res.status(400).json({
                message: "Complaint already resolved."
            });
        }

        if (complaint.status === "In Progress") {
            return res.status(400).json({
                message: "Work has already been started."
            });
        }

        complaint.status = "In Progress";

        await complaint.save();

        return res.status(200).json({
            message: "Work started successfully.",
            complaint
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Resolve Complaint
// ---------------------------------
const resolveComplaint = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found."
            });
        }

        if (
            !complaint.assignedTo ||
            complaint.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not assigned to this complaint."
            });
        }

        if (complaint.status !== "In Progress") {
            return res.status(400).json({
                message: "Start work before resolving the complaint."
            });
        }

        complaint.status = "Resolved";

        complaint.resolvedBy = req.user.id;

        complaint.resolvedAt = new Date();

        complaint.resolutionRemarks =
            req.body.resolutionRemarks || "";

        // -------------------------------
        // Mark latest assignment resolved
        // -------------------------------
        if (complaint.assignmentHistory.length > 0) {

            complaint.assignmentHistory[
                complaint.assignmentHistory.length - 1
            ].resolved = true;

        }

        await complaint.save();

        return res.status(200).json({
            message: "Complaint resolved successfully.",
            complaint
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Escalate Complaint
// ---------------------------------
const escalateComplaint = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found."
            });
        }

        if (
            !complaint.assignedTo ||
            complaint.assignedTo.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "You are not assigned to this complaint."
            });
        }

        if (complaint.status !== "In Progress") {
            return res.status(400).json({
                message: "Start work before escalating the complaint."
            });
        }

        const escalated =
            await autoEscalateComplaint(complaint);

        if (!escalated) {

            return res.status(400).json({
                message: "Complaint cannot be escalated further."
            });

        }

        return res.status(200).json({
            message: "Complaint escalated successfully.",
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
    getAssignedComplaints,
    startWork,
    resolveComplaint,
    escalateComplaint
};