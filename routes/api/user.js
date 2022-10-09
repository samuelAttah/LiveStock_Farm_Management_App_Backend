const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const userController = require("../../controllers/userController");

router.route("/details").get(userController.getUserDetails);

router.route("/updatedetails").put(userController.updateUserDetails);

router.route("/verifypassword").post(authController.handlePasswordVerify);

router.route("/resetpassword").post(authController.handlePasswordReset);

router.route("/profilepicture").put(userController.handleProfilePicture);

router.route("/removeprofilepicture").put(userController.removeProfilePicture);

router.route("/companyLogo").put(userController.handleCompanyLogo);

module.exports = router;
