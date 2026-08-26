const WORKFLOW = require("../config/workflowConfig");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const predictImage = require("../services/mlService");
const { getDistance } = require("geolib");
const fs = require("fs");
const path = require("path");

const ESCALATION_REASONS = require("../config/escalationReasons");

const {
  createAssignmentAlert,
  createManualEscalationAlert,
  createResolvedAlert,
} = require("../services/escalationService");

// =========================================================
// OFFICER ROLES
// =========================================================

const OFFICER_ROLES = [
  "juniorEngineer",
  "assistantExecutiveEngineer",
  "executiveEngineer",
];

// =========================================================
// HELPER: ESCAPE REGEX
// =========================================================

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// =========================================================
// HELPER: FORMAT IMAGE PATH
// =========================================================

const formatImagePath = (fileObj) => {
  if (!fileObj) return "";

  const fileName =
    fileObj.filename || (fileObj.path ? path.basename(fileObj.path) : "");

  return fileName ? `uploads/${fileName}` : "";
};

// =========================================================
// HELPER: SAFELY DELETE FILE
// =========================================================

const deleteFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // Suppressed
  }
};

// =========================================================
// HELPER: NORMALIZE MUNICIPALITY
// =========================================================

const normalizeMunicipality = (value) => {
  if (!value) return "";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

// =========================================================
// HELPER: NORMALIZE MUNICIPALITY NAME
// =========================================================

const normalizeMunicipalityName = (value) => {
  if (!value) {
    return "";
  }

  const name = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const aliases = {
    // Shimoga
    shivamogga: "Shimoga",
    shimoga: "Shimoga",
    "shivamogga district": "Shimoga",
    "shimoga district": "Shimoga",
    "shimoga city corporation": "Shimoga",

    // Davangere
    davangere: "Davangere",
    davanagere: "Davangere",
    "davangere city corporation": "Davangere",

    // Bhadravathi (with BDVT)
    bhadravathi: "Bhadravathi",
    bhadravati: "Bhadravathi",
    bdvt: "Bhadravathi",
    "bhadravathi tmc": "Bhadravathi",
  };

  return aliases[name] || String(value).trim();
};

// =========================================================
// HELPER: GET MUNICIPALITY ALIASES
// =========================================================

const getMunicipalityAliases = (value) => {
  const normalized = normalizeMunicipality(value);

  if (!normalized) {
    return [];
  }

  switch (normalized) {
    case "shimoga":
    case "shivamogga":
    case "shimoga district":
    case "shivamogga district":
    case "shimoga city corporation":
      return ["Shimoga"];

    case "bhadravathi":
    case "bhadravati":
    case "bdvt":
    case "bhadravathi tmc":
      return ["Bhadravathi"];

    case "davangere":
    case "davanagere":
    case "davangere city corporation":
      return ["Davangere"];

    default:
      return [String(value).trim()];
  }
};

// =========================================================
// HELPER: MUNICIPALITY REGEX PATTERNS
// =========================================================

const getMunicipalityRegexPatterns = (municipality) => {
  const aliases = getMunicipalityAliases(municipality);

  return aliases.map(
    (alias) => new RegExp(`^${escapeRegex(alias)}$`, "i")
  );
};

// =========================================================
// HELPER: NORMALIZE WARD
// =========================================================

const normalizeWard = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const ward = Number(value);

  return Number.isInteger(ward) && ward >= 1 ? ward : null;
};

// =========================================================
// HELPER: NORMALIZE COMPLAINT WARD
// =========================================================

const normalizeComplaintWard = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  let ward = String(value).trim().toLowerCase();

  if (!ward) {
    return null;
  }

  ward = ward
    .replace(/\bward\b/g, "")
    .replace(/\bnumber\b/g, "")
    .replace(/\bno\b/g, "")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();

  ward = ward.replace(/^(\d+)(st|nd|rd|th)$/, "$1");

  if (!/^\d+$/.test(ward)) {
    return null;
  }

  const wardNumber = Number(ward);

  if (!Number.isInteger(wardNumber) || wardNumber <= 0) {
    return null;
  }

  return wardNumber;
};

// =========================================================
// HELPER: FORWARD GEOCODING (ADDRESS TO COORDINATES)
// =========================================================

const forwardGeocodeAddress = async ({ landmark, area, city, municipality, district, state, pincode }) => {
  const clean = (value) =>
    value ? String(value).replace(/[()]/g, "").replace(/^near\s+/i, "").trim() : "";

  const cityName = clean(city || municipality);
  const stateName = clean(state) || "Karnataka";

  // Try progressively simpler versions of the address: full detail first,
  // then drop the most hyperlocal/unreliable parts if nothing matches.
  // Every attempt is a REAL geocoding call — nothing here is a hardcoded
  // or approximate fallback coordinate.
  const attempts = [
    [clean(landmark), clean(area), cityName, clean(district), stateName, "India", clean(pincode)],
    [clean(landmark), cityName, clean(district), stateName, "India", clean(pincode)],
    [clean(area), cityName, stateName, "India"],
    [clean(landmark), cityName, stateName, "India"],
    [cityName, stateName, "India"],
  ];

  for (const parts of attempts) {
    const queryParts = parts.filter(Boolean).join(", ");
    if (!queryParts) continue;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryParts)}&limit=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "MunicipalComplaintSystem/1.0",
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          return { latitude: lat, longitude: lon };
        }
      }
    } catch (error) {
      // Suppressed network errors, try next attempt
    }
  }

  return null;
};

// =========================================================
// HELPER: CHECK MUNICIPALITY SUPPORT
// =========================================================

const isMunicipalitySupported = async (municipality) => {
  const patterns = getMunicipalityRegexPatterns(municipality);

  if (!patterns.length) {
    return false;
  }

  const officer = await User.findOne({
    role: "juniorEngineer",
    isActive: true,
    municipalities: {
      $in: patterns,
    },
  }).select("_id");

  return !!officer;
};

// =========================================================
// HELPER: CHECK WARD SUPPORT
// =========================================================

const isWardSupported = async ({ municipality, wardNumber }) => {
  const normalizedWard = normalizeWard(wardNumber);
  const patterns = getMunicipalityRegexPatterns(municipality);

  if (!patterns.length || normalizedWard === null) {
    return false;
  }

  const officer = await User.findOne({
    role: "juniorEngineer",
    isActive: true,
    municipalities: {
      $in: patterns,
    },
    wardNumbers: normalizedWard,
  }).select("_id");

  return !!officer;
};

// =========================================================
// HELPER: CHECK REQUIRED OFFICERS
// =========================================================

const checkRequiredOfficers = async ({ municipality, wardNumber }) => {
  const normalizedWard = normalizeWard(wardNumber);
  const patterns = getMunicipalityRegexPatterns(municipality);

  if (!patterns.length || normalizedWard === null) {
    return {
      municipalityExists: false,
      wardJeExists: false,
      wardAeeExists: false,
      wardEeExists: false,
      municipalCommissionerExists: false,
    };
  }

  const municipalityJuniorEngineer = await User.findOne({
    role: "juniorEngineer",
    isActive: true,
    municipalities: {
      $in: patterns,
    },
  }).select("_id");

  const municipalityExists = !!municipalityJuniorEngineer;

  const wardOfficers = await User.find({
    isActive: true,
    municipalities: {
      $in: patterns,
    },
    wardNumbers: normalizedWard,
    role: {
      $in: [
        "juniorEngineer",
        "assistantExecutiveEngineer",
        "executiveEngineer",
      ],
    },
  }).select("_id name role municipalities wardNumbers");

  const hasJuniorEngineer = wardOfficers.some(
    (officer) => officer.role === "juniorEngineer"
  );

  const hasAssistantExecutiveEngineer = wardOfficers.some(
    (officer) => officer.role === "assistantExecutiveEngineer"
  );

  const hasExecutiveEngineer = wardOfficers.some(
    (officer) => officer.role === "executiveEngineer"
  );

  const municipalCommissioner = await User.findOne({
    role: "municipalCommissioner",
    isActive: true,
    municipalities: {
      $in: patterns,
    },
  }).select("_id name role municipalities");

  return {
    municipalityExists,
    wardJeExists: hasJuniorEngineer,
    wardAeeExists: hasAssistantExecutiveEngineer,
    wardEeExists: hasExecutiveEngineer,
    municipalCommissionerExists: !!municipalCommissioner,
  };
};

// =========================================================
// HELPER: GET ACTIVE COMPLAINT COUNT
// =========================================================

const getOfficerActiveComplaintCount = async (officerId) => {
  return Complaint.countDocuments({
    assignedTo: officerId,
    status: {
      $ne: "Resolved",
    },
  });
};

// =========================================================
// HELPER: FIND LEAST LOADED OFFICER
// =========================================================

const findLeastLoadedOfficer = async ({
  role,
  municipality,
  wardNumber,
  excludeOfficerId = null,
}) => {
  const normalizedWard = normalizeWard(wardNumber);
  const patterns = getMunicipalityRegexPatterns(municipality);

  if (!patterns.length) {
    return null;
  }

  const officers = await User.find({
    role,
    isActive: true,
    municipalities: {
      $in: patterns,
    },
    ...(normalizedWard !== null
      ? {
          wardNumbers: normalizedWard,
        }
      : {}),
  }).select("_id name role municipalities wardNumbers createdAt");

  if (!officers.length) {
    return null;
  }

  const eligibleOfficers = officers.filter((officer) => {
    if (!excludeOfficerId) {
      return true;
    }

    return officer._id.toString() !== excludeOfficerId.toString();
  });

  if (!eligibleOfficers.length) {
    return null;
  }

  const officerLoads = await Promise.all(
    eligibleOfficers.map(async (officer) => {
      const activeComplaintCount = await getOfficerActiveComplaintCount(
        officer._id
      );

      return {
        officer,
        activeComplaintCount,
      };
    })
  );

  officerLoads.sort((a, b) => {
    if (a.activeComplaintCount !== b.activeComplaintCount) {
      return a.activeComplaintCount - b.activeComplaintCount;
    }

    return (
      new Date(a.officer.createdAt || 0) - new Date(b.officer.createdAt || 0)
    );
  });

  const selected = officerLoads[0];

  return {
    officer: selected.officer,
    activeComplaintCount: selected.activeComplaintCount,
  };
};

// =========================================================
// PREDICT COMPLAINT
// =========================================================

const predictComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    const prediction = await predictImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.status(200).json({
      category: prediction.category,
      confidence: prediction.confidence,
      probabilities: prediction.probabilities || {},
    });
  } catch (error) {
    return res.status(500).json({
      message: "Prediction failed.",
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message,
    });
  }
};

// =========================================================
// CREATE COMPLAINT
// =========================================================

const createComplaint = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      title,
      description,
      category,
      municipality,
      state,
      district,
      city,
      area,
      landmark,
      pincode,
      wardNumber,
      latitude,
      longitude,
    } = req.body;

    // =========================================================
    // IMAGE VALIDATION
    // =========================================================

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    uploadedFilePath = req.file.path;

    const cleanImagePath = formatImagePath(req.file);

    const reportedBy = req.user?._id || req.user?.id;

    if (!reportedBy) {
      deleteFile(uploadedFilePath);

      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    // =========================================================
    // NORMALIZE MUNICIPALITY
    // =========================================================

    const municipalityInput =
      municipality ||
      district ||
      city ||
      "Shimoga";

    const normalizedMunicipality =
      normalizeMunicipalityName(municipalityInput);

    // =========================================================
    // NORMALIZE WARD
    // =========================================================

    const normalizedWard =
      normalizeComplaintWard(wardNumber) || 1;

    // =========================================================
    // NORMALIZE CATEGORY
    // =========================================================

    const normalizedCategory =
      category
        ? String(category).trim().toLowerCase()
        : "pothole";

    // =========================================================
    // COORDINATE RESOLUTION
    // =========================================================

    let resolvedLatitude = null;
    let resolvedLongitude = null;

    const incomingLat =
      latitude !== undefined
        ? parseFloat(latitude)
        : NaN;

    const incomingLng =
      longitude !== undefined
        ? parseFloat(longitude)
        : NaN;

    // ---------------------------------------------------------
    // USE CLIENT COORDINATES IF PROVIDED
    // ---------------------------------------------------------

    if (
      Number.isFinite(incomingLat) &&
      Number.isFinite(incomingLng)
    ) {
      resolvedLatitude = incomingLat;
      resolvedLongitude = incomingLng;
    }

    // ---------------------------------------------------------
    // OTHERWISE FORWARD GEOCODE ADDRESS
    // ---------------------------------------------------------

    else {
      const geocoded =
        await forwardGeocodeAddress({
          landmark,
          area,
          city:
            city ||
            normalizedMunicipality,
          municipality:
            normalizedMunicipality,
          district:
            district ||
            normalizedMunicipality,
          state,
          pincode,
        });

      if (geocoded) {
        resolvedLatitude =
          geocoded.latitude;

        resolvedLongitude =
          geocoded.longitude;
      }
    }

    // =========================================================
    // FIND ACTIVE JE FOR THIS MUNICIPALITY + WARD
    // =========================================================

    const assignment =
      await findLeastLoadedOfficer({
        role: "juniorEngineer",

        municipality:
          normalizedMunicipality,

        wardNumber:
          normalizedWard,
      });

    // =========================================================
    // NO ACTIVE JE AVAILABLE
    // =========================================================

    if (!assignment) {
      deleteFile(uploadedFilePath);

      return res.status(409).json({
        message:
          `No active Junior Engineer is available for ${normalizedMunicipality}, Ward ${normalizedWard}.`,
      });
    }

    const assignedOfficer =
      assignment.officer;

    // =========================================================
    // SLA
    // =========================================================

    const slaDays =
      Number(
        WORKFLOW?.juniorEngineer?.slaDays
      ) || 3;

    const deadline =
      new Date();

    deadline.setDate(
      deadline.getDate() + slaDays
    );

    // =========================================================
    // COMPLAINT DATA
    // =========================================================

    const complaintData = {
      title:
        typeof title === "string" &&
        title.trim()
          ? title.trim()
          : "Civic Issue Report",

      description:
        typeof description === "string" &&
        description.trim()
          ? description.trim()
          : "Reported via platform.",

      image:
        cleanImagePath,

      category:
        normalizedCategory,

      municipality:
        normalizedMunicipality,

      wardNumber:
        normalizedWard,

      latitude:
        resolvedLatitude,

      longitude:
        resolvedLongitude,

      address: {
        state:
          state
            ? String(state).trim()
            : "Karnataka",

        district:
          district
            ? String(district).trim()
            : normalizedMunicipality,

        city:
          city
            ? String(city).trim()
            : normalizedMunicipality,

        area:
          area
            ? String(area).trim()
            : "",

        landmark:
          landmark
            ? String(landmark).trim()
            : "",

        pincode:
          pincode
            ? String(pincode).trim()
            : "",
      },

      // =======================================================
      // INITIAL STATUS
      // =======================================================

      status:
        "Assigned",

      currentLevel:
        "juniorEngineer",

      // =======================================================
      // ACTIVE JE ASSIGNMENT
      // =======================================================

      assignedTo:
        assignedOfficer._id,

      // =======================================================
      // ASSIGNMENT HISTORY
      // =======================================================

      assignmentHistory: [
        {
          officer:
            assignedOfficer._id,

          level:
            "juniorEngineer",

          assignedAt:
            new Date(),

          startedAt:
            null,

          resolvedAt:
            null,

          endedAt:
            null,

          endReason:
            null,

          resolved:
            false,
        },
      ],

      deadline,

      reportedBy,

      supportCount:
        1,

      supporters: [
        {
          citizen:
            reportedBy,
        },
      ],
    };

    // =========================================================
    // SAVE COMPLAINT
    // =========================================================

    const complaint =
      new Complaint(
        complaintData
      );

    await complaint.save();

    // File successfully associated with complaint.
    uploadedFilePath = null;

    // =========================================================
    // LOG ASSIGNMENT
    // =========================================================

    console.log(
      "\n========================================"
    );

    console.log(
      "[INITIAL JE ASSIGNMENT]"
    );

    console.log(
      `Complaint ID: ${complaint._id}`
    );

    console.log(
      `Municipality: ${normalizedMunicipality}`
    );

    console.log(
      `Ward: ${normalizedWard}`
    );

    console.log(
      `Assigned JE: ${assignedOfficer.name}`
    );

    console.log(
      `Employee ID: ${assignedOfficer.employeeId || "N/A"}`
    );

    console.log(
      `Active workload before assignment: ${assignment.activeComplaintCount}`
    );

    console.log(
      `Assigned At: ${new Date().toLocaleString("en-IN")}`
    );

    console.log(
      "Officer Status: ACTIVE"
    );

    console.log(
      "========================================\n"
    );

    // =========================================================
    // RESPONSE
    // =========================================================

    return res.status(201).json({
      duplicate: false,

      message:
        "Complaint submitted successfully.",

      complaint,
    });

  } catch (error) {

    // =========================================================
    // CLEANUP UPLOADED IMAGE ON FAILURE
    // =========================================================

    if (uploadedFilePath) {
      deleteFile(
        uploadedFilePath
      );
    }

    console.error(
      "[CREATE COMPLAINT ERROR]:",
      error
    );

    return res.status(500).json({
      message:
        "Server Error",

      error:
        error.message,
    });
  }
};

// =========================================================
// UPDATE / EDIT COMPLAINT
// =========================================================

const updateComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      reportedBy: userId,
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    if (!["Pending", "Assigned"].includes(complaint.status)) {
      return res.status(403).json({
        message:
          "This complaint can no longer be edited because it has already been processed.",
      });
    }

    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Complaint title is required.",
      });
    }

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        message: "Complaint description is required.",
      });
    }

    complaint.title = title.trim();
    complaint.description = description.trim();

    await complaint.save();

    return res.status(200).json({
      message: "Complaint updated successfully.",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// GET MY COMPLAINTS
// =========================================================

const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const complaints = await Complaint.find({
      reportedBy: userId,
    }).sort({
      createdAt: -1,
    });

    const updatedComplaints = complaints.map((complaint) => {
      const today = new Date();
      const deadline = complaint.deadline
        ? new Date(complaint.deadline)
        : null;

      let daysLeft = null;

      if (deadline && !Number.isNaN(deadline.getTime())) {
        const diffTime = deadline - today;
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const complaintObj = complaint.toObject();

      return {
        ...complaintObj,
        image: complaintObj.image || "",
        daysLeft,
      };
    });

    return res.status(200).json({
      count: complaints.length,
      complaints: updatedComplaints,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// GET ALL COMPLAINTS
// =========================================================

const getAllComplaints = async (req, res) => {
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
    const userRole = req.user?.role;
    const userId = req.user?._id || req.user?.id;

    if (OFFICER_ROLES.includes(userRole)) {
      if (!userId) {
        return res.status(401).json({
          message: "User authentication information is missing.",
        });
      }
      query.assignedTo = userId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (currentLevel) query.currentLevel = currentLevel;

    let sortOption = {};

    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "confidence":
        sortOption = { confidence: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const totalComplaints = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name role municipalities wardNumbers")
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      totalComplaints,
      currentPage,
      totalPages: Math.ceil(totalComplaints / pageSize),
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// GET COMPLAINT DETAILS
// =========================================================

const getComplaintDetails = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email role municipalities wardNumbers")
      .populate("resolvedBy", "name role")
      .populate(
        "assignmentHistory.officer",
        "name role municipalities wardNumbers"
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;

    if (OFFICER_ROLES.includes(userRole)) {
      const isCurrentAssignee =
        complaint.assignedTo?._id?.toString() === userId?.toString();

      const wasInHistory = complaint.assignmentHistory?.some(
        (h) =>
          h.officer?._id?.toString() === userId?.toString() ||
          h.officer?.toString() === userId?.toString()
      );

      if (!isCurrentAssignee && wasInHistory) {
        return res.status(403).json({
          isEscalatedAway: true,
          message: "This complaint has been escalated. You no longer have access to it.",
        });
      }
    }

    return res.status(200).json({
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// DASHBOARD STATISTICS
// =========================================================

const getDashboardStats = async (req, res) => {
  try {
    const reportedBy = req.user?._id || req.user?.id;

    const total = await Complaint.countDocuments({ reportedBy });
    const assigned = await Complaint.countDocuments({
      reportedBy,
      status: "Assigned",
    });
    const inProgress = await Complaint.countDocuments({
      reportedBy,
      status: "In Progress",
    });
    const resolved = await Complaint.countDocuments({
      reportedBy,
      status: "Resolved",
    });

    const recentComplaints = await Complaint.find({ reportedBy })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      total,
      assigned,
      inProgress,
      resolved,
      recentComplaints,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// START WORK
// =========================================================

const startComplaintWork = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;

    if (!OFFICER_ROLES.includes(userRole)) {
      return res.status(403).json({
        message: "Only assigned officers can start complaint work.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    if (
      !complaint.assignedTo ||
      complaint.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    if (complaint.currentLevel !== userRole) {
      return res.status(403).json({
        message:
          "Your officer level does not match the current complaint level.",
      });
    }

    if (complaint.status !== "Assigned") {
      return res.status(400).json({
        message: "This complaint cannot be started in its current status.",
      });
    }

    if (complaint.deadline && new Date() >= new Date(complaint.deadline)) {
      return res.status(400).json({
        message:
          "The complaint deadline has already been reached. Automatic escalation will be handled by the system.",
      });
    }

    const currentAssignment =
      complaint.assignmentHistory[complaint.assignmentHistory.length - 1];

    if (!currentAssignment) {
      return res.status(400).json({
        message: "Assignment history is missing.",
      });
    }

    if (currentAssignment.startedAt) {
      return res.status(400).json({
        message: "Work has already been started for this assignment.",
      });
    }

    const now = new Date();
    currentAssignment.startedAt = now;
    complaint.status = "In Progress";

    await complaint.save();

    return res.status(200).json({
      message: "Complaint work started successfully.",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// RESOLVE COMPLAINT
// =========================================================

const resolveComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;

    if (!OFFICER_ROLES.includes(userRole)) {
      return res.status(403).json({
        message: "Only officers can resolve complaints.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const { resolutionRemarks } = req.body;

    if (typeof resolutionRemarks !== "string" || !resolutionRemarks.trim()) {
      return res.status(400).json({
        message: "Resolution remarks are required.",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    if (
      !complaint.assignedTo ||
      complaint.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    if (complaint.currentLevel !== userRole) {
      return res.status(403).json({
        message:
          "Your officer level does not match the current complaint level.",
      });
    }

    if (complaint.status !== "In Progress") {
      return res.status(400).json({
        message: "Complaint must be in progress before it can be resolved.",
      });
    }

    const currentAssignment =
      complaint.assignmentHistory[complaint.assignmentHistory.length - 1];

    if (!currentAssignment) {
      return res.status(400).json({
        message: "Assignment history is missing.",
      });
    }

    const now = new Date();

    complaint.status = "Resolved";
    complaint.resolvedBy = userId;
    complaint.resolvedAt = now;
    complaint.resolutionRemarks = resolutionRemarks.trim();

    currentAssignment.resolved = true;
    currentAssignment.resolvedAt = now;
    currentAssignment.endedAt = now;
    currentAssignment.endReason = "resolved";

    await complaint.save();

    await createResolvedAlert({
      complaint,
      resolvedBy: userId,
      remarks: resolutionRemarks.trim(),
    });

    return res.status(200).json({
      message: "Complaint resolved successfully.",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================================================
// MANUAL ESCALATION
// =========================================================

const escalateComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;

    const escalationRoles = ["juniorEngineer", "assistantExecutiveEngineer"];

    if (!escalationRoles.includes(userRole)) {
      return res.status(403).json({
        message:
          "Only Junior Engineers and Assistant Executive Engineers can manually escalate complaints.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information is missing.",
      });
    }

    const reasonCode = req.body?.reasonCode;
    const note =
      typeof req.body?.note === "string" ? req.body.note.trim() : "";

    if (typeof reasonCode !== "string" || !reasonCode.trim()) {
      return res.status(400).json({
        message: "Please select a valid escalation reason.",
      });
    }

    const validReason = ESCALATION_REASONS.find(
      (reason) => reason.code === reasonCode.trim()
    );

    if (!validReason) {
      return res.status(400).json({
        message: "Please select a valid escalation reason.",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    if (complaint.currentLevel !== userRole) {
      return res.status(403).json({
        message:
          "Your officer level does not match the current complaint level.",
      });
    }

    if (
      !complaint.assignedTo ||
      complaint.assignedTo.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    if (!["Assigned", "In Progress"].includes(complaint.status)) {
      return res.status(400).json({
        message: "This complaint cannot be escalated in its current status.",
      });
    }

    if (!complaint.deadline) {
      return res.status(400).json({
        message: "Complaint deadline is not available.",
      });
    }

    const now = new Date();
    const deadline = new Date(complaint.deadline);

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        message: "Complaint deadline is invalid.",
      });
    }

    if (now >= deadline) {
      return res.status(400).json({
        message:
          "Manual escalation is no longer available because the deadline has been reached. The system will handle automatic escalation.",
      });
    }

    const currentLevel = complaint.currentLevel;
    const currentWorkflow = WORKFLOW[currentLevel];

    if (!currentWorkflow) {
      return res.status(400).json({
        message: "Workflow configuration not found.",
      });
    }

    const nextLevel = currentWorkflow.next;

    if (!nextLevel) {
      return res.status(400).json({
        message:
          "This complaint has already reached the highest officer level.",
      });
    }

    const allowedNextLevels = {
      juniorEngineer: "assistantExecutiveEngineer",
      assistantExecutiveEngineer: "executiveEngineer",
    };

    if (allowedNextLevels[currentLevel] !== nextLevel) {
      return res.status(400).json({
        message: "Invalid escalation path.",
      });
    }

    const municipality = complaint.municipality;
    const wardNumber = complaint.wardNumber;

    if (!municipality) {
      return res.status(400).json({
        message: "Complaint municipality is missing.",
      });
    }

    if (normalizeWard(wardNumber) === null) {
      return res.status(400).json({
        message: "Complaint ward number is invalid.",
      });
    }

    const nextAssignment = await findLeastLoadedOfficer({
      role: nextLevel,
      municipality,
      wardNumber,
      excludeOfficerId: userId,
    });

    if (!nextAssignment) {
      return res.status(404).json({
        message: `No active ${nextLevel} is registered for ${municipality}, Ward ${wardNumber}.`,
      });
    }

    const nextOfficer = nextAssignment.officer;

    if (!Array.isArray(complaint.assignmentHistory)) {
      complaint.assignmentHistory = [];
    }

    const currentAssignment =
      complaint.assignmentHistory[complaint.assignmentHistory.length - 1];

    if (!currentAssignment) {
      return res.status(400).json({
        message: "Assignment history is missing.",
      });
    }

    currentAssignment.endedAt = now;
    currentAssignment.endReason = "manual_escalation";
    currentAssignment.resolved = false;

    if (!Array.isArray(complaint.escalationHistory)) {
      complaint.escalationHistory = [];
    }

    complaint.escalationHistory.push({
      from: currentLevel,
      to: nextLevel,
      reason: validReason.label,
      note,
      escalatedAt: now,
      type: "manual",
    });

    const nextSlaDays = Number(WORKFLOW[nextLevel]?.slaDays);

    if (!Number.isFinite(nextSlaDays) || nextSlaDays <= 0) {
      return res.status(400).json({
        message: `Invalid SLA configuration for ${nextLevel}.`,
      });
    }

    const newDeadline = new Date(now);
    newDeadline.setDate(newDeadline.getDate() + nextSlaDays);

    complaint.currentLevel = nextLevel;
    complaint.assignedTo = nextOfficer._id;
    complaint.status = "Assigned";
    complaint.deadline = newDeadline;

    complaint.assignmentHistory.push({
      officer: nextOfficer._id,
      level: nextLevel,
      assignedAt: now,
      startedAt: null,
      resolvedAt: null,
      endedAt: null,
      endReason: null,
      resolved: false,
    });

    await complaint.save();

    await createManualEscalationAlert({
      complaint,
      fromOfficer: userId,
      toOfficer: nextOfficer._id,
      reason: validReason.label,
      note,
    });

    return res.status(200).json({
      success: true,
      message: "Complaint escalated successfully.",
      complaint,
      escalation: {
        from: currentLevel,
        to: nextLevel,
        assignedTo: nextOfficer._id,
        assignedOfficer: nextOfficer.name,
        municipality,
        wardNumber,
        previousActiveComplaintCount: nextAssignment.activeComplaintCount,
        newDeadline,
        reason: validReason.label,
        note,
        type: "manual",
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to escalate complaint.",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  predictComplaint,
  createComplaint,
  updateComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintDetails,
  getDashboardStats,
  startComplaintWork,
  resolveComplaint,
  escalateComplaint,
};