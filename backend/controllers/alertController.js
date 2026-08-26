const Alert = require("../models/Alert");

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user?.userId || null;
};

// =========================================================
// GET MY ALERTS
// =========================================================
const getMyAlerts = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authenticated user not found",
      });
    }

    const alerts = await Alert.find({
      recipient: userId,
    })
      .populate("complaint", "title status currentLevel deadline municipality wardNumber")
      .sort({ createdAt: -1 });

    const unreadCount = alerts.reduce(
      (count, alert) => count + (alert.isRead ? 0 : 1),
      0
    );

    return res.status(200).json({
      alerts,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

// =========================================================
// MARK ALERT AS READ
// =========================================================
const markAlertAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authenticated user not found",
      });
    }

    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true }
    ).populate("complaint", "title status currentLevel deadline");

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    return res.status(200).json({
      message: "Alert marked as read",
      alert,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update alert",
      error: error.message,
    });
  }
};

module.exports = {
  getMyAlerts,
  markAlertAsRead,
};