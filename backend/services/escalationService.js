const User = require("../models/User");
const WORKFLOW = require("../config/workflowConfig");
const Complaint = require("../models/Complaint");

// =========================================
// AUTO ESCALATE COMPLAINT
// =========================================

const autoEscalateComplaint = async (complaint) => {
    try {

        // =========================================
        // SAFETY CHECK
        // =========================================

        if (!complaint) {

            console.log(
                "[AUTO ESCALATION] Complaint is missing."
            );

            return false;
        }


        // =========================================
        // DO NOT ESCALATE RESOLVED COMPLAINT
        // =========================================

        if (complaint.status === "Resolved") {

            console.log(
                `[AUTO ESCALATION] Complaint ${complaint._id} is already resolved.`
            );

            return false;
        }


        // =========================================
        // CHECK DEADLINE
        // =========================================
        //
        // This function should only automatically
        // escalate a complaint after its SLA deadline.
        //
        // =========================================

        if (!complaint.deadline) {

            console.log(
                `[AUTO ESCALATION] Deadline is missing for complaint: ${complaint._id}`
            );

            return false;
        }


        const now = new Date();

        const deadline =
            new Date(complaint.deadline);


        if (Number.isNaN(deadline.getTime())) {

            console.log(
                `[AUTO ESCALATION] Invalid deadline for complaint: ${complaint._id}`
            );

            return false;
        }


        if (now < deadline) {

            console.log(
                `[AUTO ESCALATION] SLA deadline has not been reached for complaint: ${complaint._id}`
            );

            return false;
        }


        // =========================================
        // CURRENT LEVEL
        // =========================================

        const currentLevel =
            complaint.currentLevel;


        if (!currentLevel) {

            console.log(
                `[AUTO ESCALATION] Current level missing for complaint: ${complaint._id}`
            );

            return false;
        }


        // =========================================
        // GET CURRENT WORKFLOW
        // =========================================

        const currentWorkflow =
            WORKFLOW[currentLevel];


        if (!currentWorkflow) {

            console.log(
                `[AUTO ESCALATION] No workflow configuration found for level: ${currentLevel}`
            );

            return false;
        }


        // =========================================
        // FIND NEXT LEVEL
        // =========================================

        const nextLevel =
            currentWorkflow.next;


        // =========================================
        // FINAL LEVEL
        // =========================================

        if (!nextLevel) {

            console.log(
                `[AUTO ESCALATION] Complaint ${complaint._id} has already reached the final officer level.`
            );

            return false;
        }


        // =========================================
        // FIND NEXT OFFICER
        // =========================================

        const nextOfficer =
            await User.findOne({
                role: nextLevel,
            });


        if (!nextOfficer) {

            console.log(
                `[AUTO ESCALATION] No ${nextLevel} found for complaint: ${complaint._id}`
            );

            return false;
        }


        // =========================================
        // VALIDATE NEXT SLA
        // =========================================

        const nextSlaDays =
            WORKFLOW[nextLevel]?.slaDays;


        if (
            !nextSlaDays ||
            nextSlaDays <= 0
        ) {

            console.log(
                `[AUTO ESCALATION] Invalid SLA configuration for ${nextLevel}.`
            );

            return false;
        }


        // =========================================
        // STORE PREVIOUS LEVEL
        // =========================================

        const previousLevel =
            complaint.currentLevel;


        // =========================================
        // STORE CURRENT ASSIGNMENT
        // =========================================

        const currentAssignment =
            complaint.assignmentHistory?.[
                complaint.assignmentHistory.length - 1
            ];


        // =========================================
        // CLOSE PREVIOUS ASSIGNMENT
        // =========================================

        if (currentAssignment) {

            currentAssignment.resolved =
                true;

            currentAssignment.resolvedAt =
                now;
        }


        // =========================================
        // CALCULATE NEW DEADLINE
        // =========================================

        const newDeadline =
            new Date(now);


        newDeadline.setDate(
            newDeadline.getDate() +
            nextSlaDays
        );


        // =========================================
        // RECORD AUTOMATIC ESCALATION
        // =========================================
        //
        // IMPORTANT:
        //
        // type MUST be "automatic".
        //
        // Otherwise the Complaint schema's default
        // value ("manual") could incorrectly classify
        // this escalation.
        //
        // =========================================

        if (
            !Array.isArray(
                complaint.escalationHistory
            )
        ) {

            complaint.escalationHistory =
                [];
        }


        complaint.escalationHistory.push({

            from:
                previousLevel,

            to:
                nextLevel,

            reason:
                "Automatically escalated due to SLA breach",

            escalatedAt:
                now,

            type:
                "automatic",
        });


        // =========================================
        // UPDATE CURRENT LEVEL
        // =========================================

        complaint.currentLevel =
            nextLevel;


        // =========================================
        // ASSIGN TO NEXT OFFICER
        // =========================================

        complaint.assignedTo =
            nextOfficer._id;


        // =========================================
        // RESET STATUS
        // =========================================
        //
        // The new officer has received the complaint
        // but has NOT started working yet.
        //
        // Therefore:
        //
        // Assigned
        //    ↓
        // Start Work
        //    ↓
        // In Progress
        //    ↓
        // Resolve
        //
        // =========================================

        complaint.status =
            "Assigned";


        // =========================================
        // SET NEW SLA DEADLINE
        // =========================================

        complaint.deadline =
            newDeadline;


        // =========================================
        // ADD NEW ASSIGNMENT HISTORY
        // =========================================

        complaint.assignmentHistory.push({

            officer:
                nextOfficer._id,

            level:
                nextLevel,

            assignedAt:
                now,

            startedAt:
                null,

            resolvedAt:
                null,

            resolved:
                false,
        });


        // =========================================
        // SAVE EVERYTHING
        // =========================================

        await complaint.save();


        // =========================================
        // LOG
        // =========================================

        console.log(
            "\n========================================"
        );

        console.log(
            "[AUTO ESCALATION SUCCESS]"
        );

        console.log(
            `Complaint ID: ${complaint._id}`
        );

        console.log(
            `Complaint: ${complaint.title}`
        );

        console.log(
            `FROM: ${previousLevel}`
        );

        console.log(
            `TO: ${nextLevel}`
        );

        console.log(
            `Assigned Officer: ${nextOfficer.name}`
        );

        console.log(
            `Escalated At: ${now.toLocaleString("en-IN")}`
        );

        console.log(
            `New Deadline: ${newDeadline.toLocaleString("en-IN")}`
        );

        console.log(
            "Type: automatic"
        );

        console.log(
            "========================================\n"
        );


        // =========================================
        // RETURN SUCCESS
        // =========================================

        return true;


    } catch (error) {

        // =========================================
        // ERROR HANDLING
        // =========================================

        console.error(
            "[AUTO ESCALATION ERROR]:",
            error
        );

        return false;
    }
};


// =========================================
// EXPORT
// =========================================

module.exports = {
    autoEscalateComplaint,
};