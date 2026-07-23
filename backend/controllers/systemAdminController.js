const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ---------------------------------
// Create Officer
// ---------------------------------
const createOfficer = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        // -------------------------
        // Validate Role
        // -------------------------
        const allowedRoles = [
            "juniorEngineer",
            "assistantExecutiveEngineer",
            "executiveEngineer",
            "municipalCommissioner"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid officer role."
            });
        }

        // -------------------------
        // Check Existing Email
        // -------------------------
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        // -------------------------
        // Hash Password
        // -------------------------
        const hashedPassword = await bcrypt.hash(password, 10);

        // -------------------------
        // Create Officer
        // -------------------------
        const officer = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        return res.status(201).json({

            message: "Officer created successfully.",

            officer: {
                id: officer._id,
                name: officer.name,
                email: officer.email,
                role: officer.role
            }

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Get All Officers
// ---------------------------------
const getAllOfficers = async (req, res) => {

    try {

        const officers = await User.find({

            role: {
                $in: [
                    "juniorEngineer",
                    "assistantExecutiveEngineer",
                    "executiveEngineer",
                    "municipalCommissioner"
                ]
            }

        })
        .select("-password")
        .sort({
            createdAt: -1
        });

        return res.status(200).json({

            totalOfficers: officers.length,

            officers

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

// ---------------------------------
// Get Officer Counts
// ---------------------------------
const getOfficerCounts = async (req, res) => {

    try {

        const officerCounts = await User.aggregate([

            {
                $match: {
                    role: {
                        $in: [
                            "juniorEngineer",
                            "assistantExecutiveEngineer",
                            "executiveEngineer",
                            "municipalCommissioner"
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: "$role",
                    count: {
                        $sum: 1
                    }
                }
            }

        ]);

        const result = {
            totalOfficers: 0,
            juniorEngineer: 0,
            assistantExecutiveEngineer: 0,
            executiveEngineer: 0,
            municipalCommissioner: 0
        };

        officerCounts.forEach((officer) => {

            result[officer._id] = officer.count;

            result.totalOfficers += officer.count;

        });

        return res.status(200).json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    createOfficer,
    getAllOfficers,
    getOfficerCounts
};