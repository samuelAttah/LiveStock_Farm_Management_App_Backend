const User = require("../model/User");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const nodemailer = require("nodemailer");

//POST
// @desc Login User
// @route POST /login
// @access Public

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

//POST
// @desc FORGOT PASSWORD with email
// @route POST /forgotpassword
// @access Public

const handleForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req?.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const foundUser = await User.findOne({ email: email }).lean().exec();

  if (!foundUser) {
    return res
      .status(401)
      .json({ message: "User with given Email Does not Exist" });
  }

  const token = jwt.sign(
    { username: foundUser.username },
    process.env.PASSWORD_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  const url = `${process.env.BASE_URL}/password-reset/${foundUser._id}/${token}/`;

  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `This mail was sent because you requested a password reset. 
  If you did not make this request, Contact the web master at ${process.env.BASE_URL}.
  Kindly click the link below to reset password.          
  ${url}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Failed to Send Email" });
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Email sent successfully" });
    }
  });
});

//GET
// @desc FORGOT PASSWORD with email
// @route GET /forgotpassword
// @access Public

const handleVerifyLink = asyncHandler(async (req, res) => {
  const { id, token } = req?.params;
  if (!id || !token) {
    return res.status(403).json({ message: "Invalid Password Reset Link" });
  }

  const foundUser = await User.findOne({ _id: id }).lean().exec();

  if (!foundUser) return res.status(401).json({ message: "Invalid User" });

  jwt.verify(token, process.env.PASSWORD_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Forbidden Reset Link",
      });
    //because this implies user's token is invalid
    else {
      return res
        .status(200)
        .json({ message: `Valid Reset Link for ${decoded.username}` });
    }
  });
});

const handlePasswordReset = asyncHandler(async (req, res) => {
  const { id, token } = req?.params;
  const { password } = req?.body;

  if (!id || !token) {
    return res.status(403).json({ message: "Invalid Password Reset Link" });
  }

  if (!password)
    return res.status(400).json({ message: "Valid Password is required" });

  const foundUser = await User.findOne({ _id: id }).exec();

  if (!foundUser) return res.status(401).json({ message: "Invalid User" });

  const newHashedPassword = await bcrypt.hash(password, 10);

  jwt.verify(token, process.env.PASSWORD_TOKEN_SECRET, async (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Forbidden User Link",
      });

    foundUser.password = newHashedPassword;
    const result = await foundUser.save();

    if (!result) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Password Reset was Successful" });
  });
});

//POST
// @desc Verify User Password, when the user is already logged in but wishes to change password
// @route POST /user/verifypassword"
// @access Private

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

//POST
// @desc Change User Password, when the user is already logged in but wishes to change password
// @route POST /user/changepassword"
// @access Private

const handlePasswordChange = asyncHandler(async (req, res) => {
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
    return res
      .status(400)
      .json({ message: "Your Old Passwords do not Mismatch" });
  }

  // CHECK THAT NEW PASSWORD ISNT SAME AS OLD ONE
  const samePassword = await bcrypt.compare(newPassword, foundUser.password);

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

module.exports = {
  handleLogin,
  handlePasswordVerify,
  handlePasswordChange,
  handleForgotPassword,
  handleVerifyLink,
  handlePasswordReset,
};
