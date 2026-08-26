const Complaint = require("../models/Complaint");

// ---------------------------------
// Get All Complaints for MC
// ---------------------------------
const getAssignedComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({})
            .populate("reportedBy", "name email")
            .populate("assignedTo", "name email role")
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

module.exports = {
    getAssignedComplaints
};