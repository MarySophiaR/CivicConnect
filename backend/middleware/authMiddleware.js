const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {

    try {

        // ---------------------------------
        // Check Authorization Header
        // ---------------------------------

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        // ---------------------------------
        // Extract Token
        // ---------------------------------

        const token = authHeader.split(" ")[1];

        // ---------------------------------
        // Verify Token
        // ---------------------------------

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ---------------------------------
        // Get Latest User Details
        // ---------------------------------
        // This ensures changes made by the
        // System Administrator are reflected
        // immediately.

        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // ---------------------------------
        // Check Account Status
        // ---------------------------------

        if (!user.isActive) {
            return res.status(403).json({
                message:
                    "Your account has been deactivated. Please contact the System Administrator."
            });
        }

        // ---------------------------------
        // Attach User To Request
        // ---------------------------------

        req.user = user;

        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }

};

module.exports = verifyToken;