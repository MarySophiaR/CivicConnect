const { body, validationResult } = require("express-validator");

const validateLogin = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Please enter a valid email."),

    body("password")
        .notEmpty()
        .withMessage("Password is required."),

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