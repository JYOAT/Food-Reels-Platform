const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const foodPartnerController = require("../controller/food-partner.controller");

const router = express.Router();
router.get(
  "/:id",
  authMiddleware.authFoodPartnerMiddleware,
  foodPartnerController.getFoodPartnerById
);

module.exports = router;
