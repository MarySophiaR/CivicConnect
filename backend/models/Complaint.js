const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    // =================================
    // Complaint Details
    // =================================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================
    // Image Path (Stored as String in MongoDB pointing to uploads/ folder)
    // =================================
    image: {
      type: String,
      required: true,
    },

    // =================================
    // Category
    // =================================
    category: {
      type: String,
      enum: ["pothole", "garbage", "drainage"],
      required: true,
      index: true,
    },

    // =================================
    // GPS Coordinates
    // =================================
    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    // =================================
    // Address Details
    // =================================
    address: {
      state: {
        type: String,
        required: true,
        trim: true,
      },

      district: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        required: true,
        trim: true,
      },

      landmark: {
        type: String,
        default: "",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =================================
    // Community Support
    // =================================
    supportCount: {
      type: Number,
      default: 1,
    },

    supporters: [
      {
        citizen: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        supportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =================================
    // Complaint Status
    // =================================
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
      index: true,
    },

    // =================================
    // Current Officer Level
    // =================================
    currentLevel: {
      type: String,
      enum: [
        "juniorEngineer",
        "assistantExecutiveEngineer",
        "executiveEngineer",
      ],
      default: "juniorEngineer",
    },

    // =================================
    // Assigned Officer
    // =================================
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =================================
    // Assignment History
    // =================================
    assignmentHistory: [
      {
        officer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        level: {
          type: String,
          enum: [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
          ],
        },

        assignedAt: {
          type: Date,
          default: Date.now,
        },

        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // =================================
    // SLA Deadline
    // =================================
    deadline: {
      type: Date,
      default: null,
    },

    // =================================
    // Resolution Details
    // =================================
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolutionRemarks: {
      type: String,
      trim: true,
      default: "",
    },

    // =================================
    // Escalation History
    // =================================
    escalationHistory: [
      {
        from: {
          type: String,
          enum: [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
          ],
        },

        to: {
          type: String,
          enum: [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
          ],
        },

        reason: {
          type: String,
          trim: true,
        },

        escalatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =================================
    // Citizen Information
    // =================================
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);