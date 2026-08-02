const WORKFLOW = require("../config/workflowConfig");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const predictImage = require("../services/mlService");
const { getDistance } = require("geolib");
const fs = require("fs");
const path = require("path");

// =================================
// HELPER: Format Image Path
// =================================
const formatImagePath = (fileObj) => {
  if (!fileObj) return "";

  const fileName =
    fileObj.filename ||
    (fileObj.path ? path.basename(fileObj.path) : "");

  return fileName ? `uploads/${fileName}` : "";
};

// =================================
// HELPER: Safely Delete File
// =================================
const deleteFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      console.log(
        `[CLEANUP] Deleted file: ${filePath}`
      );
    }
  } catch (error) {
    console.error(
      `[CLEANUP ERROR] Could not delete ${filePath}:`,
      error.message
    );
  }
};

// =================================
// PREDICT COMPLAINT
// =================================
const predictComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    console.log("\n=================================");
    console.log("ML PREDICTION REQUEST");
    console.log(
      "Original filename:",
      req.file.originalname
    );
    console.log("MIME type:", req.file.mimetype);
    console.log("File size:", req.file.size);
    console.log("=================================\n");

    const prediction = await predictImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    console.log(
      "ML Prediction:",
      prediction
    );

    return res.status(200).json({
      category: prediction.category,
      confidence: prediction.confidence,
      probabilities:
        prediction.probabilities || {},
    });
  } catch (error) {
    console.error(
      "Prediction Controller Error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      message: "Prediction failed.",
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message,
    });
  }
};

// =================================
// CREATE COMPLAINT
// =================================
const createComplaint = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      state,
      district,
      city,
      area,
      landmark,
      pincode,
    } = req.body;

    // ---------------------------------
    // Check image
    // ---------------------------------
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    uploadedFilePath = req.file.path;

    const cleanImagePath =
      formatImagePath(req.file);

    // ---------------------------------
    // Get logged-in citizen
    // ---------------------------------
    const reportedBy =
      req.user._id || req.user.id;

    if (!reportedBy) {
      deleteFile(uploadedFilePath);

      return res.status(401).json({
        message:
          "User authentication information is missing.",
      });
    }

    // ---------------------------------
    // Convert coordinates
    // ---------------------------------
    const reqLat =
      latitude !== undefined &&
      latitude !== null &&
      latitude !== ""
        ? Number(latitude)
        : null;

    const reqLng =
      longitude !== undefined &&
      longitude !== null &&
      longitude !== ""
        ? Number(longitude)
        : null;

    if (
      (reqLat !== null && isNaN(reqLat)) ||
      (reqLng !== null && isNaN(reqLng))
    ) {
      deleteFile(uploadedFilePath);

      return res.status(400).json({
        message:
          "Invalid latitude or longitude.",
      });
    }

    // ---------------------------------
    // Normalize category
    // ---------------------------------
    const normalizedCategory = category
      ? category.trim().toLowerCase()
      : "";

    if (!normalizedCategory) {
      deleteFile(uploadedFilePath);

      return res.status(400).json({
        message:
          "Complaint category is required.",
      });
    }

    // =================================
    // DUPLICATE CHECK
    // =================================

    let duplicateComplaint = null;

    const escapedCategory =
      normalizedCategory.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const unresolvedComplaints =
      await Complaint.find({
        category: {
          $regex: new RegExp(
            `^${escapedCategory}$`,
            "i"
          ),
        },
        status: {
          $ne: "Resolved",
        },
      });

    console.log(
      `[DEBUG] Total Active DB Complaints in "${normalizedCategory}": ${unresolvedComplaints.length}`
    );

    // ---------------------------------
    // Tier 1: Location duplicate check
    // ---------------------------------
    if (
      reqLat !== null &&
      reqLng !== null &&
      !isNaN(reqLat) &&
      !isNaN(reqLng)
    ) {
      for (const existing of unresolvedComplaints) {
        const exLat = Number(
          existing.latitude
        );

        const exLng = Number(
          existing.longitude
        );

        if (
          !isNaN(exLat) &&
          !isNaN(exLng) &&
          exLat !== 0 &&
          exLng !== 0
        ) {
          const distance = getDistance(
            {
              latitude: reqLat,
              longitude: reqLng,
            },
            {
              latitude: exLat,
              longitude: exLng,
            }
          );

          console.log(
            `[DEBUG] Distance from complaint ${existing._id}: ${distance} meters`
          );

          if (distance <= 100) {
            duplicateComplaint = existing;
            break;
          }
        }
      }
    }

    // ---------------------------------
    // Tier 2: Address duplicate check
    // ---------------------------------
    else {
      const normalizedCity = city
        ? city.trim().toLowerCase()
        : "";

      const normalizedArea = area
        ? area.trim().toLowerCase()
        : "";

      if (
        normalizedCity &&
        normalizedArea
      ) {
        for (const existing of unresolvedComplaints) {
          const existingCity =
            existing.address?.city
              ? existing.address.city
                  .trim()
                  .toLowerCase()
              : "";

          const existingArea =
            existing.address?.area
              ? existing.address.area
                  .trim()
                  .toLowerCase()
              : "";

          if (
            existingCity ===
              normalizedCity &&
            existingArea ===
              normalizedArea
          ) {
            duplicateComplaint = existing;
            break;
          }
        }
      }
    }

    // =================================
    // HANDLE DUPLICATE
    // =================================
    if (duplicateComplaint) {
      console.log(
        `[DUPLICATE] Existing complaint found: ${duplicateComplaint._id}`,
      );

      // Delete newly uploaded image because
      // this complaint will NOT be created.
      deleteFile(uploadedFilePath);

      const supporters = Array.isArray(duplicateComplaint.supporters)
        ? duplicateComplaint.supporters
        : [];

      const alreadySupported = supporters.some((support) => {
        if (support?.citizen) {
          return support.citizen.toString() === reportedBy.toString();
        }

        return support?.toString?.() === reportedBy.toString();
      });

      // ---------------------------------
      // Calculate how many calendar days ago
      // the original complaint was reported
      // ---------------------------------
      const createdAt = new Date(duplicateComplaint.createdAt);

      const today = new Date();

      const createdDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );

      const currentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const diffTime = currentDate.getTime() - createdDate.getTime();

      const daysAgo = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      // ---------------------------------
      // Already supported
      // ---------------------------------
      if (alreadySupported) {
        return res.status(200).json({
          duplicate: true,
          isDuplicate: true,
          alreadySupported: true,
          status: duplicateComplaint.status,
          daysAgo,
          message:
            "This issue has already been reported and you have already supported it.",
          complaintId: duplicateComplaint._id,
          supportCount: duplicateComplaint.supportCount || 1,
        });
      }

      // ---------------------------------
      // Add community support
      // ---------------------------------
      const updatedComplaint = await Complaint.findByIdAndUpdate(
        duplicateComplaint._id,
        {
          $push: {
            supporters: {
              citizen: reportedBy,
            },
          },
          $inc: {
            supportCount: 1,
          },
        },
        {
          new: true,
          runValidators: false,
        },
      );

      if (!updatedComplaint) {
        return res.status(404).json({
          message: "Duplicate complaint could not be updated.",
        });
      }

      return res.status(200).json({
        duplicate: true,
        isDuplicate: true,
        alreadySupported: false,
        status: updatedComplaint.status,
        daysAgo,
        message:
          "This issue has already been reported. Your report has been added as community support.",
        complaintId: updatedComplaint._id,
        supportCount: updatedComplaint.supportCount,
      });
    }

    // =================================
    // ASSIGN TO JUNIOR ENGINEER
    // =================================
    const juniorEngineer =
      await User.findOne({
        role: "juniorEngineer",
      });

    if (!juniorEngineer) {
      deleteFile(uploadedFilePath);

      return res.status(404).json({
        message:
          "No Junior Engineer found to assign this complaint.",
      });
    }

    // ---------------------------------
    // Calculate SLA deadline
    // ---------------------------------
    const slaDays =
      WORKFLOW?.juniorEngineer
        ?.slaDays || 3;

    const deadline = new Date();

    deadline.setDate(
      deadline.getDate() + slaDays
    );

    // =================================
    // CREATE COMPLAINT
    // =================================
    const complaint =
      new Complaint({
        title,
        description,

        image: cleanImagePath,

        category:
          normalizedCategory,

        latitude: reqLat,
        longitude: reqLng,

        address: {
          state: state || "",
          district: district || "",
          city: city || "",
          area: area || "",
          landmark: landmark || "",
          pincode: pincode || "",
        },

        status: "Assigned",

        currentLevel:
          "juniorEngineer",

        assignedTo:
          juniorEngineer._id,

        assignmentHistory: [
          {
            officer:
              juniorEngineer._id,

            level:
              "juniorEngineer",

            assignedAt:
              new Date(),

            resolved: false,
          },
        ],

        deadline,

        reportedBy,

        supportCount: 1,

        supporters: [
          {
            citizen: reportedBy,
          },
        ],
      });

    await complaint.save();

    // Image successfully saved
    uploadedFilePath = null;

    console.log(
      `[SUCCESS] Complaint created: ${complaint._id}`
    );

    console.log(
      `[SUCCESS] ORIGINAL image saved: ${cleanImagePath}`
    );

    return res.status(201).json({
      duplicate: false,
      message:
        "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    // Delete uploaded image if complaint
    // creation failed.
    if (uploadedFilePath) {
      deleteFile(uploadedFilePath);
    }

    console.error(
      "Create Complaint Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =================================
// UPDATE / EDIT COMPLAINT
// =================================
// Citizen can edit ONLY:
// - title
// - description
//
// Citizen CANNOT edit:
// - image
// - category
// - location
// - status
// - assigned officer
// - current level
// - deadline
// - support count
// =================================
const updateComplaint = async (
  req,
  res
) => {
  try {
    const complaintId =
      req.params.id;

    const userId =
      req.user._id || req.user.id;

    // ---------------------------------
    // Authentication check
    // ---------------------------------
    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication information is missing.",
      });
    }

    // ---------------------------------
    // Get complaint belonging to user
    // ---------------------------------
    const complaint =
      await Complaint.findOne({
        _id: complaintId,
        reportedBy: userId,
      });

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found.",
      });
    }

    // ---------------------------------
    // Check whether editing is allowed
    // ---------------------------------
    if (
      !["Pending", "Assigned"].includes(
        complaint.status
      )
    ) {
      return res.status(403).json({
        message:
          "This complaint can no longer be edited because it has already been processed.",
      });
    }

    // ---------------------------------
    // Get fields
    // ---------------------------------
    const {
      title,
      description,
    } = req.body;

    // ---------------------------------
    // Validate title
    // ---------------------------------
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        message:
          "Complaint title is required.",
      });
    }

    // ---------------------------------
    // Validate description
    // ---------------------------------
    if (
      typeof description !==
        "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message:
          "Complaint description is required.",
      });
    }

    // ---------------------------------
    // Update ONLY allowed fields
    // ---------------------------------
    complaint.title =
      title.trim();

    complaint.description =
      description.trim();

    await complaint.save();

    console.log(
      `[SUCCESS] Complaint updated: ${complaint._id}`
    );

    return res.status(200).json({
      message:
        "Complaint updated successfully.",
      complaint,
    });
  } catch (error) {
    console.error(
      "Update Complaint Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =================================
// GET MY COMPLAINTS
// =================================
const getMyComplaints = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id || req.user.id;

    const complaints =
      await Complaint.find({
        reportedBy: userId,
      }).sort({
        createdAt: -1,
      });

    const updatedComplaints =
      complaints.map(
        (complaint) => {
          const today =
            new Date();

          const deadline =
            new Date(
              complaint.deadline
            );

          const diffTime =
            deadline - today;

          const daysLeft =
            Math.ceil(
              diffTime /
                (1000 *
                  60 *
                  60 *
                  24)
            );

          const complaintObj =
            complaint.toObject();

          return {
            ...complaintObj,

            image:
              complaintObj.image ||
              "",

            daysLeft,
          };
        }
      );

    return res.status(200).json({
      count: complaints.length,
      complaints:
        updatedComplaints,
    });
  } catch (error) {
    console.error(
      "Get My Complaints Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =================================
// GET ALL COMPLAINTS
// =================================
const getAllComplaints = async (
  req,
  res
) => {
  try {
    const {
      search,
      category,
      status,
      currentLevel,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // ---------------------------------
    // Search
    // ---------------------------------
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ---------------------------------
    // Filters
    // ---------------------------------
    if (category) {
      query.category =
        category;
    }

    if (status) {
      query.status = status;
    }

    if (currentLevel) {
      query.currentLevel =
        currentLevel;
    }

    // ---------------------------------
    // Sorting
    // ---------------------------------
    let sortOption = {};

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "confidence":
        sortOption = {
          confidence: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    // ---------------------------------
    // Pagination
    // ---------------------------------
    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const pageSize =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        100
      );

    const skip =
      (currentPage - 1) *
      pageSize;

    // ---------------------------------
    // Count
    // ---------------------------------
    const totalComplaints =
      await Complaint.countDocuments(
        query
      );

    // ---------------------------------
    // Fetch complaints
    // ---------------------------------
    const complaints =
      await Complaint.find(query)
        .populate(
          "reportedBy",
          "name email"
        )
        .populate(
          "assignedTo",
          "name role"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize);

    return res.status(200).json({
      totalComplaints,

      currentPage,

      totalPages: Math.ceil(
        totalComplaints /
          pageSize
      ),

      complaints,
    });
  } catch (error) {
    console.error(
      "Get All Complaints Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =================================
// GET COMPLAINT DETAILS
// =================================
const getComplaintDetails = async (
  req,
  res
) => {
  try {
    const complaint =
      await Complaint.findById(
        req.params.id
      )
        .populate(
          "reportedBy",
          "name email"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "resolvedBy",
          "name role"
        )
        .populate(
          "assignmentHistory.officer",
          "name role"
        );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found.",
      });
    }

    return res.status(200).json({
      complaint,
    });
  } catch (error) {
    console.error(
      "Get Complaint Details Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =================================
// DASHBOARD STATISTICS
// =================================
const getDashboardStats = async (
  req,
  res
) => {
  try {
    const reportedBy =
      req.user._id || req.user.id;

    const total =
      await Complaint.countDocuments({
        reportedBy,
      });

    const assigned =
      await Complaint.countDocuments({
        reportedBy,
        status: "Assigned",
      });

    const inProgress =
      await Complaint.countDocuments({
        reportedBy,
        status: "In Progress",
      });

    const resolved =
      await Complaint.countDocuments({
        reportedBy,
        status: "Resolved",
      });

    const recentComplaints =
      await Complaint.find({
        reportedBy,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5);

    return res.status(200).json({
      total,
      assigned,
      inProgress,
      resolved,
      recentComplaints,
    });
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =================================
// EXPORTS
// =================================
module.exports = {
  predictComplaint,
  createComplaint,
  updateComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintDetails,
  getDashboardStats,
};