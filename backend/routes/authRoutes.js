const express = require("express");
const validateRegister = require("../middleware/validateRegister");
const validateLogin = require("../middleware/validateLogin");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post(
    "/register",
    validateRegister,
    registerUser
);

// Login
router.post(
    "/login",
    validateLogin,
    loginUser
);

module.exports = router;