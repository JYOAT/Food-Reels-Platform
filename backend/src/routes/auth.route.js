const express = require("express");
const authController = require("../controller/auth.controller");
const router = express.Router();

//user auth routes
router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);
router.get("/user/logout", authController.logoutUser);

//food partner auth routes
router.post("/food-partner/register", authController.registeredFoodPartner);
router.post("/food-partner/login", authController.loginFoodPartner);
router.get("/food-partner/logout", authController.logoutFoodPartner);

module.exports = router;
