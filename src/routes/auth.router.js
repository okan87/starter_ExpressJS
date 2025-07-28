"use strict";
const router = require('express').Router()
const authController = require("../controllers/auth");


// Kullanıcı girişi
router.post("/login", authController.login);

// Refresh token ile yeni access token
router.post("/refresh", authController.refresh);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
