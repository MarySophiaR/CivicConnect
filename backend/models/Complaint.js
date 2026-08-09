const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    // =================================
    // COMPLAINT DETAILS
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
    // IMAGE
    // =================================

    image: {
      type: String,
      required: true,
    },

    // =================================
    // CATEGORY
    // =================================

    category: {
      type: String,
      enum: ["pothole", "garbage", "drainage"],
      required: true,
      index: true,
    },

    // =================================
    // GPS COORDINATES
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
    // ADDRESS
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
    // COMMUNITY SUPPORT
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
    // COMPLAINT STATUS
    // =================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
      ],
      default: "Pending",
      index: true,
    },

    // =================================
    // CURRENT OFFICER LEVEL
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
    // CURRENT ASSIGNED OFFICER
    // =================================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =================================
    // ASSIGNMENT HISTORY
    // =================================

    assignmentHistory: [
      {
        officer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        level: {
          type: String,
          enum: [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
          ],
          required: true,
        },

        assignedAt: {
          type: Date,
          default: Date.now,
        },

        // =================================
        // WHEN OFFICER STARTED WORK
        // =================================

        startedAt: {
          type: Date,
          default: null,
        },

        // =================================
        // WHEN OFFICER RESOLVED COMPLAINT
        // =================================

        resolvedAt: {
          type: Date,
          default: null,
        },

        // =================================
        // WHEN THIS ASSIGNMENT ENDED
        // =================================

        endedAt: {
          type: Date,
          default: null,
        },

        // =================================
        // HOW ASSIGNMENT ENDED
        // =================================

        endReason: {
          type: String,
          enum: [
            "resolved",
            "manual_escalation",
            "automatic_escalation",
            null,
          ],
          default: null,
        },

        // =================================
        // LEGACY / RESOLUTION FLAG
        // =================================
        //
        // IMPORTANT:
        //
        // resolved = true ONLY when the officer
        // actually resolves the complaint.
        //
        // Escalation does NOT mean resolved.
        //

        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // =================================
    // SLA DEADLINE
    // =================================

    deadline: {
      type: Date,
      default: null,
    },

    // =================================
    // RESOLUTION DETAILS
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
    // ESCALATION HISTORY
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
          required: true,
        },

        to: {
          type: String,
          enum: [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
          ],
          required: true,
        },

        // =================================
        // ESCALATION REASON
        // =================================
        //
        // Manual:
        // predefined reason selected by officer.
        //
        // Automatic:
        // system-generated SLA reason.
        //

        reason: {
          type: String,
          required: true,
          trim: true,
        },

        // Optional additional note for manual escalation

        note: {
          type: String,
          trim: true,
          default: "",
        },

        escalatedAt: {
          type: Date,
          default: Date.now,
        },

        // =================================
        // MANUAL / AUTOMATIC
        // =================================

        type: {
          type: String,
          enum: ["manual", "automatic"],
          default: "manual",
        },
      },
    ],

    // =================================
    // CITIZEN
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

module.exports = mongoose.model(
  "Complaint",
  complaintSchema
);