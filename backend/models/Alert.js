const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    /* =========================================================
       RECIPIENT
    ========================================================= */
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================================================
       COMPLAINT
    ========================================================= */
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },

    /* =========================================================
       ALERT TYPE
    ========================================================= */
    type: {
      type: String,
      enum: [
        // Assignment Alerts
        "ASSIGNMENT",

        // Escalation Alerts
        "MANUAL_ESCALATION",
        "AUTO_ESCALATION",

        // Resolution Alerts
        "RESOLVED",

        // Deadline approaching (24h left)
        "DEADLINE_NEAR",

        // EE SLA overdue
        "OVERDUE",

        // EE SLA overdue + 24h -> Municipal Commissioner attention
        "MC_ATTENTION",
      ],
      required: true,
    },

    /* =========================================================
       ALERT TITLE
    ========================================================= */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================================================
       MESSAGE CONTENT
    ========================================================= */
    message: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================================================
       READ STATUS
    ========================================================= */
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================================================
       READ TIME
    ========================================================= */
    readAt: {
      type: Date,
      default: null,
    },

    /* =========================================================
       ESCALATION / EVENT TIME
    ========================================================= */
    escalationAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */
alertSchema.index({
  recipient: 1,
  complaint: 1,
  type: 1,
});

alertSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Alert", alertSchema);