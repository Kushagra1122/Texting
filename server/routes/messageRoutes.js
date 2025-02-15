const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/send",sendMessage);
router.get("/:userId/:friendId", getMessages);

module.exports = router;
