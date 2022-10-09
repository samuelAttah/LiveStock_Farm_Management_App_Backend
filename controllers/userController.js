const User = require("../model/User");
const asyncHandler = require("express-async-handler");

//GET USER DETAILS
// @desc Get User details
// @route GET /user
// @access Private

const getUserDetails = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  const userDetails = await User.findOne({ username: requestUser })
    .select("-password")
    .lean();

  return res.status(200).json([{ ...userDetails }]);
});

//UPLOAD PROFILE PICTURE
// @desc Update Profile Picture
// @route PUT /user
// @access Private

const handleProfilePicture = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { profilePicture } = req?.body;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (!profilePicture) {
    return res
      .status(400)
      .json({ message: "Missing Required paramter-picture" });
  }

  foundUser.profilePicture = profilePicture;
  const result = await foundUser.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured while saving profile Picture" });
  }

  return res.status(200).json({ message: "Upload Successful" });
});

//REMOVE PROFILE PICTURE
// @desc Remove Company Logo
// @route PUT /user
// @access Private

const removeProfilePicture = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  foundUser.profilePicture = null;
  const result = await foundUser.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured while removing profile Picture" });
  }

  return res.status(200).json({ message: "Successfully Removed" });
});

//UPLOAD COMPANY LOGO
// @desc Update Company Logo
// @route PUT /user
// @access Private

const handleCompanyLogo = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { companyLogo } = req?.body;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (!companyLogo) {
    return res.status(400).json({ message: "Missing Required parameter" });
  }

  foundUser.companyLogo = companyLogo;
  const result = await foundUser.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured while saving company Logo" });
  }

  return res.status(200).json({ message: "Upload Successful" });
});

//UPDATE USER DETAILS NEW BATCH
// @desc Update existing user details
// @route PUT /user
// @access Private
const updateUserDetails = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const {
    homeAddress,
    firstName,
    lastName,
    gender,
    birthday,
    email,
    farmName,
    phoneNumber,
  } = req?.body;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (req?.body?.username) {
    return res.status(400).json({ message: "Username Can't be modified" });
  }

  if (
    !homeAddress ||
    !gender ||
    !birthday ||
    !email ||
    !farmName ||
    !lastName ||
    !firstName ||
    !phoneNumber
  ) {
    return res.status(400).json({ message: "Missing Required Parameters" });
  }

  foundUser.homeAddress = homeAddress;
  foundUser.gender = gender;
  foundUser.birthDay = birthday;
  foundUser.email = email;
  foundUser.farmName = farmName;
  foundUser.firstName = firstName;
  foundUser.lastName = lastName;
  foundUser.phoneNumber = phoneNumber;
  foundUser.companyLogo = req?.body?.companyLogo
    ? req.body.companyLogo
    : foundUser.companyLogo;
  foundUser.profilePicture = req?.body?.profilePicture
    ? req.body.profilePicture
    : foundUser.profilePicture;
  foundUser.workAddress = req?.body?.workAddress
    ? req.body.workAddress
    : foundUser.workAddress;
  foundUser.occupation = req?.body?.occupation
    ? req?.body?.occupation
    : foundUser.occupation;

  const result = await foundUser.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured while Updating User details" });
  }

  return res.status(200).json({ message: "User details Successfully Updated" });
});

module.exports = {
  getUserDetails,
  handleProfilePicture,
  updateUserDetails,
  handleCompanyLogo,
  removeProfilePicture,
};
