const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// =========================================================
// GOVERNMENT EMPLOYEE ROLES
// =========================================================

const employeeRoles = [
    "systemAdmin",
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer",
    "municipalCommissioner"
];


// =========================================================
// REGISTER USER
// =========================================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            employeeId
        } = req.body;


        // =====================================================
        // BASIC REQUIRED FIELDS
        // =====================================================

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required."
            });

        }


        // =====================================================
        // NORMALIZE VALUES
        // =====================================================

        const normalizedEmail =
            email.trim().toLowerCase();

        const normalizedEmployeeId =
            employeeId
                ? employeeId.trim().toUpperCase()
                : null;


        // =====================================================
        // CHECK EMAIL ALREADY EXISTS
        // =====================================================

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                message: "User already exists."
            });

        }


        // =====================================================
        // EMPLOYEE REGISTRATION
        // =====================================================

        let employeeData = null;


        if (normalizedEmployeeId) {

            /*
             * Load Employee model only after the
             * Employee Database connection has been
             * established.
             */

            const Employee =
                require("../models/Employee");


            // =================================================
            // FIND EMPLOYEE IN GOVERNMENT REGISTRY
            // =================================================

            employeeData =
                await Employee.findOne({
                    employeeId:
                        normalizedEmployeeId
                });


            // =================================================
            // EMPLOYEE ID NOT FOUND
            // =================================================

            if (!employeeData) {

                return res.status(404).json({

                    message:
                        "Invalid Employee ID."

                });

            }


            // =================================================
            // CHECK EMPLOYEE ACCOUNT STATUS
            // =================================================

            if (
                employeeData.isActive === false
            ) {

                return res.status(403).json({

                    message:
                        "This employee account is inactive. Please contact the System Administrator."

                });

            }


            // =================================================
            // CHECK EMAIL MATCH
            // =================================================

           if (employeeData.email.toLowerCase() !== normalizedEmail) {
             return res.status(400).json({
               message: "Email does not match the Employee ID.",
             });
           }


            // =================================================
            // CHECK EMPLOYEE ID ALREADY REGISTERED
            // =================================================

            const existingEmployeeUser =
                await User.findOne({
                    employeeId:
                        normalizedEmployeeId
                });


            if (existingEmployeeUser) {

                return res.status(400).json({

                    message:
                        "This Employee ID is already registered."

                });

            }


            // =================================================
            // MUNICIPALITY MUST HAVE AN ACTIVE SYSTEM ADMIN
            // =================================================

            if (
                employeeData.role !== "systemAdmin" &&
                Array.isArray(employeeData.municipalities) &&
                employeeData.municipalities.length > 0
            ) {

                const activeSAForMunicipality =
                    await User.findOne({
                        role: "systemAdmin",
                        isActive: true,
                        municipalities: {
                            $in: employeeData.municipalities
                        }
                    });


                if (!activeSAForMunicipality) {

                    return res.status(403).json({

                        message:
                            "Municipal employee registration opens once your municipality's System Administrator has been onboarded. Contact your municipal office."

                    });

                }

            }

        }


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =====================================================
        // CREATE USER DATA
        // =====================================================

        const userData = {

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword

        };


        // =====================================================
        // CITIZEN REGISTRATION
        // =====================================================

        if (!employeeData) {

            userData.role =
                "citizen";

            userData.employeeId =
                null;

            userData.municipalities =
                [];

            userData.wardNumbers =
                [];

        }


        // =====================================================
        // GOVERNMENT EMPLOYEE REGISTRATION
        // =====================================================

        else {

            userData.employeeId =
                employeeData.employeeId;

            userData.role =
                employeeData.role;

            userData.municipalities =
                employeeData.municipalities;

            userData.wardNumbers =
                employeeData.wardNumbers;

        }


        // =====================================================
        // CREATE USER
        // =====================================================

        const user =
            new User(userData);


        // =====================================================
        // SAVE USER
        // =====================================================

        await user.save();


        // =====================================================
        // GENERATE JWT TOKEN
        // =====================================================

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({

            message:
                "User registered successfully.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                employeeId:
                    user.employeeId,

                role:
                    user.role,

                municipalities:
                    user.municipalities,

                wardNumbers:
                    user.wardNumbers,

                isActive:
                    user.isActive

            }

        });

    } catch (error) {

        console.error(
            "Register User Error:",
            error
        );


        // =====================================================
        // DUPLICATE KEY ERROR
        // =====================================================

        if (error.code === 11000) {

            return res.status(400).json({

                message:
                    "This email or Employee ID is already registered."

            });

        }


        return res.status(500).json({

            message:
                "Internal Server Error"

        });

    }

};


// =========================================================
// LOGIN USER (CITIZEN & OFFICER)
// =========================================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            employeeId,
            password
        } = req.body;


        // =====================================================
        // CHECK REQUIRED FIELDS
        // =====================================================

        if ((!email && !employeeId) || !password) {

            return res.status(400).json({

                message:
                    "Email or Employee ID and password are required."

            });

        }


        // =====================================================
        // FIND USER (BY EMAIL OR EMPLOYEE ID)
        // =====================================================

        let query = {};

        if (email) {

            query.email =
                email.trim().toLowerCase();

        } else if (employeeId) {

            query.employeeId =
                employeeId.trim().toUpperCase();

        }

        const user =
            await User.findOne(query);


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid credentials or user not found."

            });

        }


        // =====================================================
        // CHECK ACCOUNT STATUS
        // =====================================================

        if (!user.isActive) {

            return res.status(403).json({

                message:
                    "Your account has been deactivated. Please contact the System Administrator."

            });

        }


        // =====================================================
        // COMPARE PASSWORD
        // =====================================================

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({

                message:
                    "Invalid credentials."

            });

        }


        // =====================================================
        // GENERATE JWT TOKEN
        // =====================================================

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


        // =====================================================
        // LOGIN RESPONSE
        // =====================================================

        return res.status(200).json({

            message:
                "Login successful.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                employeeId:
                    user.employeeId,

                role:
                    user.role,

                municipalities:
                    user.municipalities,

                wardNumbers:
                    user.wardNumbers,

                isActive:
                    user.isActive

            }

        });

    } catch (error) {

        console.error(
            "Login User Error:",
            error
        );


        return res.status(500).json({

            message:
                "Internal Server Error"

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    registerUser,

    loginUser

};