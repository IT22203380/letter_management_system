const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const loginValidation = require("../middleware/validations/login.validation.middleware");
const registerValidation = require("../middleware/validations/register.validation.middleware");
const authenticate = require("../middleware/permissions/authenticate.middleware");

// Auth Routes
router.post("/login", loginValidation, userController.Login);
router.post("/register", registerValidation, userController.Register); 
router.post("/create-user", userController.CreateUser); 
router.post("/refresh", userController.Refresh);
router.post("/logout", userController.Logout);
router.post('/register-active', userController.RegisterActive);
// Protected Routes
router.get("/profile", authenticate, userController.getUserProfile); 

module.exports = router;