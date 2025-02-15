const express = require("express");
const { createNotification, getNotifications, markAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.post("/create", createNotification);
router.get("/:userId", getNotifications);
router.put("/markAsRead/:notificationId", markAsRead);

module.exports = router;
