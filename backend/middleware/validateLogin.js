const { body, validationResult } = require("express-validator");

const validateLogin = [

    /*
    =========================================================
    LOGIN IDENTIFIER
    =========================================================
    */

    body()
        .custom((value) => {

            const hasEmail =
                value.email &&
                String(value.email).trim() !== "";

            const hasEmployeeId =
                value.employeeId &&
                String(value.employeeId).trim() !== "";

            if (!hasEmail && !hasEmployeeId) {

                throw new Error(
                    "Email or Employee ID is required."
                );

            }

            if (hasEmail && hasEmployeeId) {

                throw new Error(
                    "Provide either Email or Employee ID, not both."
                );

            }

            return true;

        }),


    /*
    =========================================================
    EMAIL VALIDATION
    =========================================================
    */

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email."),


    /*
    =========================================================
    EMPLOYEE ID VALIDATION
    =========================================================
    */

    body("employeeId")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Employee ID cannot be empty.")
        .toUpperCase(),


    /*
    =========================================================
    PASSWORD
    =========================================================
    */

    body("password")
        .notEmpty()
        .withMessage("Password is required."),


    /*
    =========================================================
    VALIDATION RESULT
    =========================================================
    */

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({

                message: "Validation failed.",

                errors: errors.array()

            });

        }

        next();

    }

];

module.exports = validateLogin;