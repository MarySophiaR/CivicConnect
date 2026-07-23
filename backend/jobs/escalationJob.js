const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const { autoEscalateComplaint } = require("../services/escalationService");

const escalationJob = () => {

    cron.schedule("* * * * *", async () => {

        try {

            console.log("Checking complaints for SLA...");

            const complaints = await Complaint.find({
                status: "Pending",
                deadline: {
                    $lte: new Date()
                }
            });

            console.log(
                `Found ${complaints.length} overdue complaint(s).`
            );

            for (const complaint of complaints) {

                await autoEscalateComplaint(complaint);

            }

        } catch (error) {

            console.error(
                "Escalation Job Error:",
                error
            );

        }

    });

};

module.exports = escalationJob;