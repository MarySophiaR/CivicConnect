const { body, validationResult } = require("express-validator");

const validateRegister = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required.")
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Please enter a valid email address."),

    body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/)
    .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
    
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

module.exports = validateRegister;