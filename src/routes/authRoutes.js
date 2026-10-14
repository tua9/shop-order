const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Authentication views & handlers
router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);

router.get("/register", authController.getRegisterPage);
router.post("/register", authController.register);

router.get("/logout", authController.logout);
router.post("/logout", authController.logout);

module.exports = router;
