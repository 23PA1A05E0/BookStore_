const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyEmail,
    resetPassword
} = require("../controllers/authController");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password/verify", verifyEmail);
router.post("/forgot-password/reset", resetPassword);

module.exports = router;