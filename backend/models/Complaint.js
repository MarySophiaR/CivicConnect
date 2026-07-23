const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
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

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["pothole", "garbage", "drainage"],
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    // ---------------------------------
    // Complaint Status
    // ---------------------------------
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Resolved"],
      default: "Assigned",
    },

    // ---------------------------------
    // Current Officer Level
    // ---------------------------------
    currentLevel: {
      type: String,
      enum: [
        "juniorEngineer",
        "assistantExecutiveEngineer",
        "executiveEngineer",
      ],
      default: "juniorEngineer",
    },

    // ---------------------------------
    // Assigned Officer
    // ---------------------------------
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ---------------------------------
    // Assignment History
    // ---------------------------------
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

    // ---------------------------------
    // SLA Deadline
    // ---------------------------------
    deadline: {
      type: Date,
      default: null,
    },

    // ---------------------------------
    // Resolution Details
    // ---------------------------------
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

    // ---------------------------------
    // Escalation History
    // ---------------------------------
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

    // ---------------------------------
    // Citizen
    // ---------------------------------
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Complaint", complaintSchema);
