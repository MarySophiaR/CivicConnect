const { body, validationResult } = require("express-validator");

const validateComplaint = [

    // ---------------------------------
    // Title
    // ---------------------------------
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required.")
        .isLength({ max: 100 })
        .withMessage("Title cannot exceed 100 characters."),

    // ---------------------------------
    // Description
    // ---------------------------------
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required.")
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    // ---------------------------------
    // GPS Coordinates (Optional)
    // ---------------------------------
    body("latitude")
        .optional({ checkFalsy: true })
        .isFloat({
            min: -90,
            max: 90
        })
        .withMessage("Latitude must be between -90 and 90."),

    body("longitude")
        .optional({ checkFalsy: true })
        .isFloat({
            min: -180,
            max: 180
        })
        .withMessage("Longitude must be between -180 and 180."),

    // ---------------------------------
    // Address
    // ---------------------------------
    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required."),

    body("district")
        .trim()
        .notEmpty()
        .withMessage("District is required."),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required."),

    body("area")
        .trim()
        .notEmpty()
        .withMessage("Area is required."),

    body("landmark")
        .optional()
        .trim(),

    body("pincode")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage("Pincode must be 6 digits."),

    // ---------------------------------
    // Validation Result
    // ---------------------------------
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