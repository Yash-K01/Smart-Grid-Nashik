// backend/middleware/validation.js
const { body, validationResult, param, query } = require("express-validator");

// =========================================
// Validation Result Handler
// =========================================
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
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
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage("Email is too long"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .isLength({ max: 100 })
        .withMessage("Password is too long"),

    body("mobile")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid mobile number. Must be 10 digits starting with 6-9"),

    body("meterNumber")
        .trim()
        .notEmpty()
        .withMessage("Meter number is required")
        .isLength({ min: 5, max: 20 })
        .withMessage("Meter number must be between 5 and 20 characters"),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required")
        .isLength({ min: 5, max: 500 })
        .withMessage("Address must be between 5 and 500 characters"),

    body("area")
        .trim()
        .notEmpty()
        .withMessage("Area is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Area must be between 2 and 100 characters"),

    // Optional fields
    body("role")
        .optional()
        .isIn(["user", "technician", "admin"])
        .withMessage("Invalid role specified"),

    validate
];

// =========================================
// Login Validation
// =========================================
const loginValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 1 })
        .withMessage("Password cannot be empty"),

    body("role")
        .isIn(["admin", "user", "technician"])
        .withMessage("Invalid role. Must be admin, user, or technician")
        .notEmpty()
        .withMessage("Role is required"),

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
        .withMessage("Invalid complaint type")
        .notEmpty()
        .withMessage("Complaint type is required"),

    body("description")
        .trim()
        .isLength({ min: 10 })
        .withMessage("Description should be at least 10 characters")
        .isLength({ max: 1000 })
        .withMessage("Description should not exceed 1000 characters")
        .optional(),

    body("latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Invalid latitude value"),

    body("longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Invalid longitude value"),

    body("address")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Address should not exceed 500 characters"),

    validate
];

// =========================================
// Technician Registration Validation
// =========================================
const technicianValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name can only contain letters and spaces"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail()
        .withMessage("Please enter a valid email address"),

    body("contactNumber")
        .trim()
        .notEmpty()
        .withMessage("Contact number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Contact number must be 10 digits starting with 6, 7, 8, or 9"),

    body("location")
        .trim()
        .notEmpty()
        .withMessage("Location is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Location must be between 2 and 100 characters"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .isLength({ max: 100 })
        .withMessage("Password is too long (max 100 characters)"),

    body("education")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Education should not exceed 200 characters"),

    body("experience")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Experience should not exceed 200 characters"),

    validate
];

// =========================================
// Admin Registration Validation
// =========================================
const adminValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("mobile")
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid mobile number"),

    validate
];

// =========================================
// Mongo ObjectId Validation
// =========================================
const objectIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid ID format. Must be a valid MongoDB ObjectId"),

    validate
];

// =========================================
// Pagination Validation
// =========================================
const paginationValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100")
        .toInt(),

    query("sort")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort must be asc or desc"),

    validate
];

// =========================================
// Status Update Validation
// =========================================
const statusValidation = [
    body("status")
        .isIn(["Pending", "Assigned", "InProgress", "Completed", "Rejected"])
        .withMessage("Invalid status value"),

    body("remarks")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks should not exceed 500 characters"),

    validate
];

// =========================================
// Assignment Validation
// =========================================
const assignmentValidation = [
    body("complaintId")
        .isMongoId()
        .withMessage("Invalid complaint ID"),

    body("technicianId")
        .isMongoId()
        .withMessage("Invalid technician ID"),

    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    complaintValidation,
    technicianValidation,
    adminValidation,
    objectIdValidation,
    paginationValidation,
    statusValidation,
    assignmentValidation,
    validate
};