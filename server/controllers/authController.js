const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateUserId = async () => {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        uniqueId = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit number
        console.log(`Generated userId: ${uniqueId}`);

        const existingUser = await User.findOne({ userId: uniqueId });
        console.log(`Checking if userId ${uniqueId} is unique...`);

        if (!existingUser) {
            isUnique = true;
            console.log(`userId ${uniqueId} is unique!`);
        }
    }

    return uniqueId.toString();
};

const registerUser = async (req, res) => {
    try {
        console.log("Received registration request:", req.body);
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log(`User with email ${email} already exists`);
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate unique 4-digit user ID
        const userId = await generateUserId();
        console.log(`Generated unique userId for ${email}: ${userId}`);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        console.log("Generated salt for password hashing");
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed password successfully");

        // Create new user
        user = new User({ userId, name, email, password: hashedPassword });
        await user.save();
        console.log(`User registered successfully: ${email}`);

        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const loginUser = async (req, res) => {
    try {
        console.log("Received login request:", req.body);
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: No user found with email ${email}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Validate password
        console.log("Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Login failed: Incorrect password for email ${email}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("Password matched, generating JWT token...");
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log(`User ${email} logged in successfully`);
        res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const session = async (req, res) => {
    try {
        console.log("Fetching session for user:", req.user);
        const user = await User.findById(req.user).select("-password"); // Exclude password

        if (!user) {
            console.log("Session request failed: User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Session data retrieved successfully");
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error in session:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { registerUser, loginUser, session };
