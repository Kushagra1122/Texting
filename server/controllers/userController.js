const User = require("../models/User");

const getUser = async (req, res) => {
    try {
        console.log("HEY");
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findOne({ userId }).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User fetched successfully", user });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const friendRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        console.log(req.body);
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Sender and Receiver IDs are required." });
        }

        const sender = await User.findOne({ userId: senderId }).select("-password");
        const receiver = await User.findOne({ userId: receiverId }).select("-password");

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found." });
        }

        if (
            receiver.friendRequests.some(req => req.userId === sender.userId) ||
            receiver.friends.some(friend => friend.userId === sender.userId)
        ) {
            return res.status(400).json({ message: "Friend request already sent or already friends." });
        }

        sender.sentRequests.push({ userId: receiver.userId, name: receiver.name });
        receiver.friendRequests.push({ userId: sender.userId, name: sender.name });

        await sender.save();
        await receiver.save();

        return res.json({ message: "Friend request sent successfully!", user: sender });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { receiverId, senderId } = req.body;
        console.log(req.body);
        const user = await User.findOne({ userId: receiverId }).select("-password"); // Receiver
        const sender = await User.findOne({ userId: senderId }).select("-password");

        if (!user || !sender) {
            return res.status(404).json({ message: "User not found." });
        }

        const requestExists = user.friendRequests.some(req => req.userId === sender.userId);
        if (!requestExists) {
            return res.status(400).json({ message: "No friend request found from this user." });
        }

        user.friendRequests = user.friendRequests.filter(req => req.userId !== sender.userId);
        sender.sentRequests = sender.sentRequests.filter(req => req.userId !== user.userId);

        user.friends.push({ userId: sender.userId, name: sender.name });
        sender.friends.push({ userId: user.userId, name: user.name });

        await user.save();
        await sender.save();

        return res.json({ message: "Friend request accepted!", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        const user = await User.findOne({ userId }).select("-password"); // Receiver
        const sender = await User.findOne({ userId: senderId }).select("-password");

        if (!user || !sender) {
            return res.status(404).json({ message: "User not found." });
        }

        const requestExists = user.friendRequests.some(req => req.userId === sender.userId);
        if (!requestExists) {
            return res.status(400).json({ message: "No friend request found from this user." });
        }

        user.friendRequests = user.friendRequests.filter(req => req.userId !== sender.userId);
        sender.sentRequests = sender.sentRequests.filter(req => req.userId !== user.userId);

        await user.save();
        await sender.save();

        return res.json({ message: "Friend request rejected.", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { getUser, friendRequest, acceptRequest, rejectRequest };
