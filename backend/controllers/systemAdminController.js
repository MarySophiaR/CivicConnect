const User = require("../models/User");


// =========================================================
// OFFICER ROLES
// =========================================================

const officerRoles = [
    "juniorEngineer",
    "assistantExecutiveEngineer",
    "executiveEngineer",
    "municipalCommissioner"
];


// =========================================================
// GET ALL OFFICERS
// =========================================================

const getAllOfficers = async (req, res) => {

    try {

        const officers =
            await User.find({

                role: {
                    $in: officerRoles
                }

            })
            .select("-password")
            .sort({
                createdAt: -1
            });


        // =====================================================
        // ACTIVE OFFICERS
        // =====================================================

        const activeOfficers =
            officers.filter(
                (officer) =>
                    officer.isActive !== false
            ).length;


        // =====================================================
        // INACTIVE OFFICERS
        // =====================================================

        const inactiveOfficers =
            officers.length -
            activeOfficers;


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            totalOfficers:
                officers.length,

            activeOfficers,

            inactiveOfficers,

            officers

        });

    } catch (error) {

        console.error(
            "Get All Officers Error:",
            error
        );

        return res.status(500).json({
            message: "Server Error"
        });

    }

};


// =========================================================
// GET OFFICER COUNTS
// =========================================================

const getOfficerCounts = async (req, res) => {

    try {

        // =====================================================
        // GET ALL OFFICERS
        // =====================================================

        const officers =
            await User.find({

                role: {
                    $in: officerRoles
                }

            })
            .select("role isActive");


        // =====================================================
        // DEFAULT COUNTS
        // =====================================================

        const result = {

            // -----------------------------
            // OVERALL COUNTS
            // -----------------------------

            totalOfficers: 0,

            activeOfficers: 0,

            inactiveOfficers: 0,


            // -----------------------------
            // ROLE COUNTS
            // -----------------------------

            juniorEngineer: 0,

            assistantExecutiveEngineer: 0,

            executiveEngineer: 0,

            municipalCommissioner: 0

        };


        // =====================================================
        // CALCULATE COUNTS
        // =====================================================

        officers.forEach((officer) => {

            // -------------------------------------------------
            // TOTAL
            // -------------------------------------------------

            result.totalOfficers++;


            // -------------------------------------------------
            // ROLE
            // -------------------------------------------------

            if (
                officer.role ===
                "juniorEngineer"
            ) {

                result.juniorEngineer++;

            }


            else if (
                officer.role ===
                "assistantExecutiveEngineer"
            ) {

                result.assistantExecutiveEngineer++;

            }


            else if (
                officer.role ===
                "executiveEngineer"
            ) {

                result.executiveEngineer++;

            }


            else if (
                officer.role ===
                "municipalCommissioner"
            ) {

                result.municipalCommissioner++;

            }


            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            if (
                officer.isActive !== false
            ) {

                result.activeOfficers++;

            }

            else {

                result.inactiveOfficers++;

            }

        });


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get Officer Counts Error:",
            error
        );

        return res.status(500).json({
            message: "Server Error"
        });

    }

};


// =========================================================
// DEACTIVATE OFFICER
// =========================================================

const deactivateOfficer = async (
    req,
    res
) => {

    try {

        const { id } =
            req.params;


        // =====================================================
        // FIND OFFICER
        // =====================================================

        const officer =
            await User.findOne({

                _id: id,

                role: {
                    $in: officerRoles
                }

            });


        if (!officer) {

            return res.status(404).json({

                message:
                    "Officer not found."

            });

        }


        // =====================================================
        // CHECK ALREADY INACTIVE
        // =====================================================

        if (
            officer.isActive === false
        ) {

            return res.status(400).json({

                message:
                    "Officer account is already deactivated."

            });

        }


        // =====================================================
        // CHECK MINIMUM ACTIVE OFFICER CONSTRAINT
        // =====================================================
        // Ensure at least 1 active officer remains per role per ward & municipality
        if (Array.isArray(officer.municipalities) && Array.isArray(officer.wardNumbers)) {
            for (const municipality of officer.municipalities) {
                for (const wardNumber of officer.wardNumbers) {
                    const activePeerCount = await User.countDocuments({
                        _id: { $ne: officer._id }, // Exclude the officer being deactivated
                        role: officer.role,
                        isActive: true,
                        municipalities: municipality,
                        wardNumbers: wardNumber,
                    });

                    if (activePeerCount === 0) {
                        return res.status(400).json({
                            message: `Cannot deactivate this officer. At least one active ${officer.role} must remain assigned to Ward ${wardNumber} in ${municipality}.`
                        });
                    }
                }
            }
        }


        // =====================================================
        // DEACTIVATE
        // =====================================================

        officer.isActive = false;

        await officer.save();


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            message:
                "Officer account deactivated successfully.",

            officer: {

                _id:
                    officer._id,

                id:
                    officer._id,

                name:
                    officer.name,

                email:
                    officer.email,

                role:
                    officer.role,

                isActive:
                    officer.isActive

            }

        });

    } catch (error) {

        console.error(
            "Deactivate Officer Error:",
            error
        );

        return res.status(500).json({

            message:
                "Server Error"

        });

    }

};


// =========================================================
// ACTIVATE OFFICER
// =========================================================

const activateOfficer = async (
    req,
    res
) => {

    try {

        const { id } =
            req.params;


        // =====================================================
        // FIND OFFICER
        // =====================================================

        const officer =
            await User.findOne({

                _id: id,

                role: {
                    $in: officerRoles
                }

            });


        if (!officer) {

            return res.status(404).json({

                message:
                    "Officer not found."

            });

        }


        // =====================================================
        // CHECK ALREADY ACTIVE
        // =====================================================

        if (
            officer.isActive === true
        ) {

            return res.status(400).json({

                message:
                    "Officer account is already active."

            });

        }


        // =====================================================
        // ACTIVATE
        // =====================================================

        officer.isActive = true;

        await officer.save();


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            message:
                "Officer account activated successfully.",

            officer: {

                _id:
                    officer._id,

                id:
                    officer._id,

                name:
                    officer.name,

                email:
                    officer.email,

                role:
                    officer.role,

                isActive:
                    officer.isActive

            }

        });

    } catch (error) {

        console.error(
            "Activate Officer Error:",
            error
        );

        return res.status(500).json({

            message:
                "Server Error"

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getAllOfficers,

    getOfficerCounts,

    deactivateOfficer,

    activateOfficer

};