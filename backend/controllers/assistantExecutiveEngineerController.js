const Complaint = require("../models/Complaint");

// ---------------------------------
// Get Assigned Complaints
// ---------------------------------
const getAssignedComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
            assignedTo: req.user.id,
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


module.exports = {
    getAssignedComplaints
};