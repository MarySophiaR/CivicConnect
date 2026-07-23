const User = require("../models/User");
const WORKFLOW = require("../config/workflowConfig");

const autoEscalateComplaint = async (complaint) => {

    const currentLevel = complaint.currentLevel;

    const nextLevel = WORKFLOW[currentLevel].next;

    // Already at final level
    if (!nextLevel) {

        console.log(
            `${complaint.title} has already reached the final level.`
        );

        return false;

    }

    // Find next officer
    const nextOfficer = await User.findOne({
        role: nextLevel
    });

    if (!nextOfficer) {

        console.log(
            `No ${nextLevel} found for complaint: ${complaint.title}`
        );

        return false;

    }

    // Move complaint to next level
    complaint.currentLevel = nextLevel;

    // Automatically assign to next officer
    complaint.assignedTo = nextOfficer._id;

    // Record assignment history
    complaint.assignmentHistory.push({
        officer: nextOfficer._id,
        level: nextLevel,
        assignedAt: new Date(),
        resolved: false
    });

    // New officer receives Assigned complaint
    complaint.status = "Assigned";

    // Reset SLA deadline
    const deadline = new Date();

    deadline.setDate(
        deadline.getDate() +
        WORKFLOW[nextLevel].slaDays
    );

    complaint.deadline = deadline;

    // Save escalation history
    complaint.escalationHistory.push({
        from: currentLevel,
        to: nextLevel,
        reason: "Automatically escalated due to SLA breach"
    });

    await complaint.save();

    console.log(
        `${complaint.title} escalated from ${currentLevel} to ${nextLevel}.`
    );

    return true;

};

module.exports = {
    autoEscalateComplaint
};