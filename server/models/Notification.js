const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true }, // The user receiving the notification
        senderId: { type: String, required: true }, // The user who triggered the notification
        type: {
            type: String,
            enum: ["friendRequest", "message", "acceptedRequest"],
            required: true
        }, // Type of notification
        message: { type: String, required: true }, // Notification message
        isRead: { type: Boolean, default: false }, // Mark as read/unread
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
