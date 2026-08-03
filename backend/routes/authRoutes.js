const express = require("express");

const router = express.Router();

const {
    registerUser,
    login,
} = require("../controllers/authController");

const {

registerValidation,

loginValidation

}=require("../middleware/validation");

// ==========================
// User Registration
// ==========================
router.post(
"/register",
registerValidation,
registerUser
);

// ==========================
// Login
// ==========================
router.post(
"/login",
loginValidation,
login
);

module.exports = router;