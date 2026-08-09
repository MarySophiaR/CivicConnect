const Alert = require("../models/Alert");

const getUserId = (req) => {
    return (
        req.user?.id ||
        req.user?._id ||
        req.user?.userId
    );
};


/* GET ALERTS */

const getMyAlerts = async (req, res) => {
    try {
        const userId = getUserId(req);

        const alerts = await Alert.find({
            recipient: userId,
        })
            .populate(
                "complaint",
                "title status currentLevel deadline"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            alerts,
            unreadCount: alerts.filter(
                (alert) => !alert.isRead
            ).length,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch alerts",
        });
    }
};


/* MARK ALERT AS READ */

const markAlertAsRead = async (req, res) => {
    try {
        const userId = getUserId(req);

        const alert = await Alert.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: userId,
            },
            {
                isRead: true,
                readAt: new Date(),
            },
            {
                new: true,
            }
        );

        if (!alert) {
            return res.status(404).json({
                message: "Alert not found",
            });
        }

        res.json({
            message: "Alert marked as read",
            alert,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update alert",
        });
    }
};


module.exports = {
    getMyAlerts,
    markAlertAsRead,
};