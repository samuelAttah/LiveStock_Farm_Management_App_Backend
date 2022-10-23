const express = require("express");
const router = express.Router();
const {
  handleForgotPassword,
  handleVerifyLink,
  handlePasswordReset,
} = require("../../controllers/authController");

router.post("/", handleForgotPassword);
router.get("/:id/:token", handleVerifyLink);
router.post("/:id/:token", handlePasswordReset);

module.exports = router;
