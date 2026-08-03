const { body, validationResult, param } = require("express-validator");

// =========================================
// Validation Result Handler
// =========================================
const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();
};

// =========================================
// User Registration Validation
// =========================================
const registerValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 100 }),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("mobile")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid mobile number"),

    body("meterNumber")
        .trim()
        .notEmpty()
        .withMessage("Meter number is required"),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required"),

    body("area")
        .trim()
        .notEmpty()
        .withMessage("Area is required"),

    validate

];

// =========================================
// Login Validation
// =========================================
const loginValidation = [

    body("email")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    body("role")
        .isIn(["admin", "user", "technician"])
        .withMessage("Invalid role"),

    validate

];

// =========================================
// Complaint Validation
// =========================================
const complaintValidation = [

    body("complaintType")
        .isIn([
            "Power Cut",
            "Low Voltage",
            "High Voltage",
            "Meter Issue",
            "Billing Issue",
            "Transformer Issue",
            "Wire Damage",
            "Other"
        ])
        .withMessage("Invalid complaint type"),

    body("description")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Description should be at least 10 characters"),

    validate

];

// =========================================
// Technician Validation
// =========================================
const technicianValidation = [

    body("name")
        .trim()
        .notEmpty(),

    body("email")
        .isEmail(),

    body("contactNumber")
        .matches(/^[6-9]\d{9}$/),

    body("location")
        .trim()
        .notEmpty(),

    body("password")
        .isLength({ min: 6 }),

    validate

];

// =========================================
// Mongo ObjectId Validation
// =========================================
const objectIdValidation = [

    param("id")
        .isMongoId()
        .withMessage("Invalid ID"),

    validate

];

module.exports = {

    registerValidation,

    loginValidation,

    complaintValidation,

    technicianValidation,

    objectIdValidation,

    validate

};