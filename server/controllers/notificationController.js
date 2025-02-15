const Notification = require("../models/Notification");

// Create a notification
exports.createNotification = async (req, res) => {
    try {
        const { userId, senderId, type, message } = req.body;

        if (!userId || !senderId || !type || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newNotification = new Notification({ userId, senderId, type, message });
        await newNotification.save();

        return res.status(201).json({ message: "Notification created successfully", data: newNotification });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        return res.status(200).json({ message: "Notification marked as read", data: notification });
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
