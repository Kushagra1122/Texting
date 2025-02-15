const Message = require("../models/Message");
const User = require("../models/User");

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();

        return res.status(201).json({ message: "Message sent successfully", data: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { userId, friendId } = req.params;
console.log(userId, friendId)
        if (!userId || !friendId) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
