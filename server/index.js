const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Message = require("./models/Message"); // Import the Message model
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

const clients = new Map(); // 🔥 Fix: Define `clients` map to store active WebSocket connections

wss.on("connection", (ws) => {
    console.log("✅ New WebSocket connection established");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "join") {
                clients.set(data.userId, ws);
                console.log(`👤 User ${data.userId} connected.`);

                // Notify sender that messages were delivered
                for (const msg of await Message.find({ receiverId: data.userId, seen: false })) {
                    const senderSocket = clients.get(msg.senderId);
                    if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
                        senderSocket.send(
                            JSON.stringify({
                                type: "messageDelivered",
                                messageId: msg._id,
                            })
                        );
                    }
                }
            }

            if (data.type === "sendMessage") {
                const newMessage = new Message({
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    message: data.message,
                    seen: false,
                });

                await newMessage.save();

                const receiverSocket = clients.get(data.receiverId);
                if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                    receiverSocket.send(
                        JSON.stringify({
                            type: "receiveMessage",
                            messageId: newMessage._id,
                            senderId: data.senderId,
                            message: data.message,
                            timestamp: newMessage.createdAt,
                        })
                    );

                    // Notify sender that message was delivered
                    ws.send(
                        JSON.stringify({
                            type: "messageDelivered",
                            messageId: newMessage._id,
                        })
                    );
                }
            }

            if (data.type === "seenMessage") {
                await Message.updateMany(
                    { senderId: data.senderId, receiverId: data.receiverId, seen: false },
                    { seen: true }
                );

                const senderSocket = clients.get(data.senderId);
                if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
                    senderSocket.send(
                        JSON.stringify({
                            type: "messageSeen",
                            senderId: data.senderId,
                        })
                    );
                }
            }
        } catch (error) {
            console.error("WebSocket Message Error:", error);
        }
    });

    ws.on("close", () => {
        for (const [userId, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(userId);
                console.log(`👋 User ${userId} disconnected.`);
                break;
            }
        }
    });
});


server.listen(9000, () => console.log("🚀 Server running on port 9000"));
