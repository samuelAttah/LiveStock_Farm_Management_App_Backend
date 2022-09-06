const User = require("../model/User");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const handleLogin = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);

  const { username, password } = req?.body;
  if (!(username && password))
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  const foundUser = await User.findOne({ username: username }).exec();

  if (!foundUser) return res.status(401).send("Unauthorized User");

  //evaluate password using bcrypt if username was found
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    //THIS IS WHERE WE SEND A JWT FOR PROTECTED ROUTES IN OUR API
    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20m" }
    );
    const newRrefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({
        refreshToken: refreshToken,
      }).exec();
      if (!foundToken) {
        console.log("attempted refresh token reuse at login!");
        //clear all revious refresh tokens
        newRefreshTokenArray = [];
      }
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }
    //Saving refreshToken with current User
    foundUser.refreshToken = [...newRefreshTokenArray, newRrefreshToken];
    const result = await foundUser.save();
    console.log("result", result);

    res.cookie("jwt", newRrefreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    }); // remember to add secure true in production
    return res.json({ accessToken: accessToken });
  } else {
    return res.status(401).send("Invalid Password");
  }
});

module.exports = { handleLogin };
