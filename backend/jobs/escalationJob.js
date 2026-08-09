const cron = require("node-cron");

const Complaint = require("../models/Complaint");
const Alert = require("../models/Alert");
const User = require("../models/User");

const {
    autoEscalateComplaint,
} = require("../services/escalationService");


const DEADLINE_NEAR_HOURS = 24;
const EE_FOLLOW_UP_HOURS = 24;

const DEADLINE_NEAR_MS =
    DEADLINE_NEAR_HOURS *
    60 *
    60 *
    1000;

const EE_FOLLOW_UP_MS =
    EE_FOLLOW_UP_HOURS *
    60 *
    60 *
    1000;


/* CREATE DEADLINE ALERT */

const createDeadlineAlert = async (complaint) => {
    if (!complaint.assignedTo) {
        return null;
    }

    const existingAlert = await Alert.findOne({
        complaint: complaint._id,
        recipient: complaint.assignedTo,
        type: "DEADLINE_NEAR",
    });

    if (existingAlert) {
        return existingAlert;
    }

    return Alert.create({
        recipient: complaint.assignedTo,
        complaint: complaint._id,
        type: "DEADLINE_NEAR",
        title: "Complaint Deadline Near",
        message:
            `The deadline for "${complaint.title}" is approaching. Please take action.`,
    });
};


/* CREATE EE OVERDUE ALERT */

const createEEOverdueAlert = async (complaint) => {
    if (!complaint.assignedTo) {
        return null;
    }

    const existingAlert = await Alert.findOne({
        complaint: complaint._id,
        recipient: complaint.assignedTo,
        type: "OVERDUE",
    });

    if (existingAlert) {
        return existingAlert;
    }

    return Alert.create({
        recipient: complaint.assignedTo,
        complaint: complaint._id,
        type: "OVERDUE",
        title: "Complaint Overdue",
        message:
            `The deadline for "${complaint.title}" has passed. Please take the required action.`,
    });
};


/* CREATE MC ALERT */

const createMCAlert = async (complaint) => {
    const mc = await User.findOne({
        role: "municipalCommissioner",
    });

    if (!mc) {
        return null;
    }

    const existingAlert = await Alert.findOne({
        complaint: complaint._id,
        recipient: mc._id,
        type: "ADMINISTRATIVE_ATTENTION",
    });

    if (existingAlert) {
        return existingAlert;
    }

    return Alert.create({
        recipient: mc._id,
        complaint: complaint._id,
        type: "ADMINISTRATIVE_ATTENTION",
        title: "Administrative Attention Required",
        message:
            `Complaint "${complaint.title}" remains unresolved after the EE follow-up period. Please review the matter.`,
    });
};


/* PROCESS DEADLINE NEAR */

const processDeadlineNear = async (
    complaint,
    now
) => {
    if (
        ![
            "Assigned",
            "In Progress",
        ].includes(complaint.status)
    ) {
        return;
    }

    if (!complaint.deadline) {
        return;
    }

    const timeLeft =
        new Date(complaint.deadline).getTime() -
        now.getTime();

    if (
        timeLeft <= 0 ||
        timeLeft > DEADLINE_NEAR_MS
    ) {
        return;
    }

    await createDeadlineAlert(
        complaint
    );
};


/* PROCESS EE OVERDUE */

const processEEOverdue = async (
    complaint,
    now
) => {
    if (
        complaint.currentLevel !==
        "executiveEngineer"
    ) {
        return;
    }

    if (
        ![
            "Assigned",
            "In Progress",
        ].includes(complaint.status)
    ) {
        return;
    }

    await createEEOverdueAlert(
        complaint
    );

    const overdueAlert =
        await Alert.findOne({
            complaint: complaint._id,
            recipient: complaint.assignedTo,
            type: "OVERDUE",
        });

    if (!overdueAlert) {
        return;
    }

    const followUpDeadline =
        new Date(
            overdueAlert.createdAt.getTime() +
            EE_FOLLOW_UP_MS
        );

    if (
        now <
        followUpDeadline
    ) {
        return;
    }

    const latest =
        await Complaint.findById(
            complaint._id
        );

    if (!latest) {
        return;
    }

    if (
        latest.status === "Resolved"
    ) {
        return;
    }

    if (
        latest.currentLevel !==
        "executiveEngineer"
    ) {
        return;
    }

    await createMCAlert(
        latest
    );
};


/* MAIN JOB */

const escalationJob = () => {
    cron.schedule(
        "* * * * *",
        async () => {
            try {
                const now = new Date();

                const activeComplaints =
                    await Complaint.find({
                        status: {
                            $in: [
                                "Assigned",
                                "In Progress",
                            ],
                        },
                        deadline: {
                            $ne: null,
                        },
                    });

                for (
                    const complaint
                    of activeComplaints
                ) {
                    if (
                        complaint.deadline >
                        now
                    ) {
                        await processDeadlineNear(
                            complaint,
                            now
                        );

                        continue;
                    }

                    if (
                        complaint.currentLevel ===
                        "executiveEngineer"
                    ) {
                        await processEEOverdue(
                            complaint,
                            now
                        );

                        continue;
                    }

                    await autoEscalateComplaint(
                        complaint
                    );
                }
            } catch (error) {
                // Keep scheduler running.
            }
        }
    );
};

module.exports =
    escalationJob;