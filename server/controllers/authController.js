const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateUserId = async () => {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        uniqueId = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit number
        const existingUser = await User.findOne({ userId: uniqueId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return uniqueId.toString();
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Generate unique 4-digit user ID
        const userId = await generateUserId();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({ userId, name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Validate password
  
        const isMatch = await bcrypt.compare(password, user.password);
      
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
const session = async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password"); // Exclude password
   
        return res.status(200).json( user)

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { registerUser, loginUser,session };
