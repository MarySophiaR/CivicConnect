const { body, validationResult } = require("express-validator");

const validateComplaint = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required.")
        .isLength({ max: 100 })
        .withMessage("Title cannot exceed 100 characters."),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required.")
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("latitude")
        .notEmpty()
        .withMessage("Latitude is required.")
        .isFloat({
            min: -90,
            max: 90
        })
        .withMessage("Latitude must be between -90 and 90."),

    body("longitude")
        .notEmpty()
        .withMessage("Longitude is required.")
        .isFloat({
            min: -180,
            max: 180
        })
        .withMessage("Longitude must be between -180 and 180."),

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

module.exports = validateComplaint;