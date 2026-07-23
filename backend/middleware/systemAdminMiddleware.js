const systemAdminMiddleware = (req, res, next) => {

    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized. Please login."
            });
        }

        if (req.user.role !== "systemAdmin") {
            return res.status(403).json({
                message: "Access denied. System Administrator only."
            });
        }

        next();

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = systemAdminMiddleware;