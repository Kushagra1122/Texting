const express = require("express");
const { registerUser, loginUser, session } = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/session",protect, session);
module.exports = router;
