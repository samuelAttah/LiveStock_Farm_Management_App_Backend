const User = require("../model/User");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const handleLogin = asyncHandler(async (req, res) => {
  const { username, password } = req?.body;

  if (!(username && password))
    return res
      .status(400)
      .json({ message: "Username and Password are required" });

  const foundUser = await User.findOne({ username: username }).exec();

  if (!foundUser) return res.status(401).json({ message: "Unauthorized User" });

  //evaluate password using bcrypt if username was found
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    //THIS IS WHERE WE SEND A JWT FOR PROTECTED ROUTES IN OUR API
    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    }); // remember to add secure true in production
    return res.json({ accessToken: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid Password" });
  }
});

const handlePasswordVerify = asyncHandler(async (req, res) => {
  const { oldPassword } = req?.body;
  const requestUser = req?.user;

  const foundUser = await User.findOne({ username: requestUser }).lean().exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User not recognized" });
  }

  if (!oldPassword) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }

  //evaluate password using bcrypt
  const match = await bcrypt.compare(oldPassword, foundUser.password);

  if (!match) {
    return res.status(400).json({ message: "Password Mismatch" });
  }

  return res.status(200).json({ message: "Password Match" });
});

const handlePasswordReset = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req?.body;
  const requestUser = req?.user;

  const foundUser = await User.findOne({ username: requestUser }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User not recognized" });
  }

  if (!oldPassword) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }

  //evaluate password using bcrypt
  const match = await bcrypt.compare(oldPassword, foundUser.password);

  if (!match) {
    return res.status(400).json({ message: "Password Mismatch" });
  }

  // CHECK THAT NEW PASSWORD ISNT SAME AS OLD ONE
  const samePassword = bcrypt.compare(newPassword, foundUser.password);

  if (samePassword) {
    return res
      .status(400)
      .json({ message: "New Password is Same as Old Password!" });
  }

  //If match and not samePassword, hash new passWord.
  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  foundUser.password = newHashedPassword;
  const result = await foundUser.save();

  if (!result) {
    return res.status(400).json({ message: "Failed to Reset password" });
  }

  return res.status(200).json({ message: "Password Reset was Successful" });
});

module.exports = { handleLogin, handlePasswordVerify, handlePasswordReset };
