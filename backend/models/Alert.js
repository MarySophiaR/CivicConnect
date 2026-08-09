const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        complaint: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "DEADLINE_NEAR",
                "OVERDUE",
                "ADMINISTRATIVE_ATTENTION",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

alertSchema.index(
    {
        recipient: 1,
        complaint: 1,
        type: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Alert", alertSchema);
