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

        // Only officer roles are allowed
        const allowedRoles = [
            "wardOfficer",
            "municipalOfficer",
            "districtOfficer"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid officer role."
            });
        }

        // Check existing email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create officer
        const officer = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Save
        await officer.save();

        return res.status(201).json({
            message: "Officer created successfully.",
            officer
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    createOfficer
};