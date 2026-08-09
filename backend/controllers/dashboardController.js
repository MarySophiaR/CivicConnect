const Complaint = require("../models/Complaint");

// ---------------------------------
// Citizen Dashboard
// ---------------------------------
const citizenDashboard = async (req, res) => {

    try {

        const reportedBy = req.user.id;

        const totalComplaints = await Complaint.countDocuments({
            reportedBy
        });

        const assigned = await Complaint.countDocuments({
            reportedBy,
            status: "Assigned"
        });

        const inProgress = await Complaint.countDocuments({
            reportedBy,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            reportedBy,
            status: "Resolved"
        });

        return res.status(200).json({
            totalComplaints,
            assigned,
            inProgress,
            resolved
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Junior Engineer Dashboard
// ---------------------------------
const juniorEngineerDashboard = async (req, res) => {

    try {

        const officerId = req.user.id || req.user._id;

        const totalComplaints = await Complaint.countDocuments({
            assignedTo: officerId
        });

        const assigned = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Assigned"
        });

        const inProgress = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Resolved"
        });

        return res.status(200).json({

            totalComplaints,
            assigned,
            inProgress,
            resolved

        });

    } catch (error) {

        return res.status(500).json({
            message: "Server Error"
        });

    }

};


// ---------------------------------
// Assistant Executive Engineer Dashboard
// ---------------------------------
const assistantExecutiveEngineerDashboard = async (req, res) => {

    try {

        const officerId = req.user.id || req.user._id;

        const totalComplaints = await Complaint.countDocuments({
            assignedTo: officerId
        });

        const assigned = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Assigned"
        });

        const inProgress = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Resolved"
        });

        return res.status(200).json({

            totalComplaints,
            assigned,
            inProgress,
            resolved

        });

    } catch (error) {

        return res.status(500).json({
            message: "Server Error"
        });

    }

};


// ---------------------------------
// Executive Engineer Dashboard
// ---------------------------------
const executiveEngineerDashboard = async (req, res) => {

    try {

        const officerId = req.user.id || req.user._id;

        const totalComplaints = await Complaint.countDocuments({
            assignedTo: officerId
        });

        const assigned = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Assigned"
        });

        const inProgress = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "In Progress"
        });

        const resolved = await Complaint.countDocuments({
            assignedTo: officerId,
            status: "Resolved"
        });

        return res.status(200).json({

            totalComplaints,
            assigned,
            inProgress,
            resolved

        });

    } catch (error) {


        return res.status(500).json({
            message: "Server Error"
        });

    }

};


// ---------------------------------
// Municipal Commissioner Dashboard
// ---------------------------------
const municipalCommissionerDashboard = async (req, res) => {

    try {

        const totalComplaints =
            await Complaint.countDocuments();

        const assigned =
            await Complaint.countDocuments({
                status: "Assigned"
            });

        const inProgress =
            await Complaint.countDocuments({
                status: "In Progress"
            });

        const resolved =
            await Complaint.countDocuments({
                status: "Resolved"
            });

        return res.status(200).json({

            totalComplaints,
            assigned,
            inProgress,
            resolved

        });

    } catch (error) {

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Category Statistics
// ---------------------------------
const categoryStats = async (req, res) => {

    try {

        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        const response = {
            pothole: 0,
            garbage: 0,
            drainage: 0
        };

        stats.forEach((item) => {

            response[item._id] = item.count;

        });

        return res.status(200).json(response);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Monthly Complaint Statistics
// ---------------------------------
const monthlyStats = async (req, res) => {

    try {

        const stats = await Complaint.aggregate([

            {
                $group: {

                    _id: {
                        $month: "$createdAt"
                    },

                    complaints: {
                        $sum: 1
                    }

                }
            },

            {
                $sort: {
                    _id: 1
                }
            }

        ]);

        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        const response = stats.map(item => ({

            month: months[item._id - 1],

            complaints: item.complaints

        }));

        return res.status(200).json(response);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Recent Complaints
// ---------------------------------
const recentComplaints = async (req, res) => {

    try {

        let filter = {};

        if (req.user.role === "citizen") {

            filter.reportedBy = req.user.id;

        }

        else if (

            req.user.role === "juniorEngineer" ||

            req.user.role === "assistantExecutiveEngineer" ||

            req.user.role === "executiveEngineer"

        ) {

            filter.assignedTo = req.user.id;

        }

        else if (req.user.role === "municipalCommissioner") {

            filter = {};

        }

        const complaints = await Complaint.find(filter)

            .populate("reportedBy", "name email")

            .populate("assignedTo", "name email role")

            .sort({
                createdAt: -1
            })

            .limit(5);

        return res.status(200).json({

            total: complaints.length,

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
// Officer Performance 
// ---------------------------------
const officerPerformance = async (req, res) => {

    try {

        const performance = await Complaint.aggregate([

            // Split assignmentHistory array
            {
                $unwind: "$assignmentHistory"
            },

            // Group by officer
            {
                $group: {

                    _id: "$assignmentHistory.officer",

                    assigned: {
                        $sum: 1
                    },

                    resolved: {
                        $sum: {
                            $cond: [
                                "$assignmentHistory.resolved",
                                1,
                                0
                            ]
                        }
                    }

                }
            },

            // Get officer details
            {
                $lookup: {

                    from: "users",

                    localField: "_id",

                    foreignField: "_id",

                    as: "officer"

                }
            },

            // Convert array to object
            {
                $unwind: "$officer"
            },

            // Output fields
            {
                $project: {

                    _id: 0,

                    officerId: "$officer._id",

                    name: "$officer.name",

                    role: "$officer.role",

                    assigned: 1,

                    resolved: 1,

                    pending: {
                        $subtract: [
                            "$assigned",
                            "$resolved"
                        ]
                    }

                }
            },

            // Sort by most assigned
            {
                $sort: {
                    assigned: -1
                }
            }

        ]);

        return res.status(200).json({

            totalOfficers: performance.length,

            performance

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Server Error"

        });

    }

};

module.exports = {
    citizenDashboard,
    juniorEngineerDashboard,
    assistantExecutiveEngineerDashboard,
    executiveEngineerDashboard,
    municipalCommissionerDashboard,
    categoryStats,
    monthlyStats,
    recentComplaints,
    officerPerformance
};