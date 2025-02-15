const express = require("express");
const { getUser, acceptRequest, rejectRequest, friendRequest } = require("../controllers/userController");
const protect = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/getUser", protect, getUser);
router.post("/friendRequest", protect, friendRequest);
router.post("/acceptRequest", protect, acceptRequest);
router.post("/rejectRequest", protect, rejectRequest);
module.exports = router;
