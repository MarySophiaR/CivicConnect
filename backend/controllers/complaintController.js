const WORKFLOW = require("../config/workflowConfig");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const predictImage = require("../services/mlService");

// ---------------------------------
// Create Complaint
// ---------------------------------
const createComplaint = async (req, res) => {
  try {
    const { title, description, latitude, longitude } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    const image = req.file.path.replace(/\\/g, "/");

    const reportedBy = req.user._id;

    // AI Prediction
    const prediction = await predictImage(image);

    const category = prediction.category;
    const confidence = prediction.confidence;

    // Find Junior Engineer
    const juniorEngineer = await User.findOne({
      role: "juniorEngineer",
    });

    if (!juniorEngineer) {
      return res.status(404).json({
        message: "No Junior Engineer found.",
      });
    }

    // Initial SLA Deadline
    const deadline = new Date();

    deadline.setDate(deadline.getDate() + WORKFLOW.juniorEngineer.slaDays);

    // Create Complaint
    const complaint = new Complaint({
      title,
      description,
      image,

      category,
      confidence,

      latitude,
      longitude,

      status: "Assigned",

      currentLevel: "juniorEngineer",

      assignedTo: juniorEngineer._id,

      // Initial Assignment History
      assignmentHistory: [
        {
          officer: juniorEngineer._id,
          level: "juniorEngineer",
          assignedAt: new Date(),
          resolved: false,
        },
      ],

      deadline,

      reportedBy,
    });
    await complaint.save();

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ---------------------------------
// Get My Complaints
// ---------------------------------
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      reportedBy: req.user.id,
    });

    return res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ---------------------------------
// Get All Complaints
// ---------------------------------
const getAllComplaints = async (req, res) => {

    try {

        const {
            search,
            category,
            status,
            currentLevel,
            sort = "newest",
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // -------------------------
        // Search
        // -------------------------
        if (search) {

            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];

        }

        // -------------------------
        // Category Filter
        // -------------------------
        if (category) {

            query.category = category;

        }

        // -------------------------
        // Status Filter
        // -------------------------
        if (status) {

            query.status = status;

        }

        // -------------------------
        // Officer Level Filter
        // -------------------------
        if (currentLevel) {

            query.currentLevel = currentLevel;

        }

        // -------------------------
        // Sorting
        // -------------------------
        let sortOption = {};

        switch (sort) {

            case "oldest":
                sortOption = {
                    createdAt: 1
                };
                break;

            case "confidence":
                sortOption = {
                    confidence: -1
                };
                break;

            default:
                sortOption = {
                    createdAt: -1
                };

        }

        // -------------------------
        // Pagination
        // -------------------------
        const currentPage = Number(page);

        const pageSize = Number(limit);

        const skip = (currentPage - 1) * pageSize;

        const totalComplaints = await Complaint.countDocuments(query);

        const complaints = await Complaint.find(query)

            .populate("reportedBy", "name email")

            .populate("assignedTo", "name role")

            .sort(sortOption)

            .skip(skip)

            .limit(pageSize);

        return res.status(200).json({

            totalComplaints,

            currentPage,

            totalPages: Math.ceil(totalComplaints / pageSize),

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
// Get Complaint Details
// ---------------------------------
const getComplaintDetails = async (req, res) => {

    try {

        const complaint = await Complaint.findById(req.params.id)

            .populate("reportedBy", "name email")

            .populate("assignedTo", "name email role")

            .populate("resolvedBy", "name role")

            .populate("assignmentHistory.officer", "name role");

        if (!complaint) {

            return res.status(404).json({
                message: "Complaint not found."
            });

        }

        return res.status(200).json({
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
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintDetails
};
