const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");

router.route("/verifypassword").post(authController.handlePasswordVerify);

router.route("/resetpassword").post(authController.handlePasswordReset);

module.exports = router;
