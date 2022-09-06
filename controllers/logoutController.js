const User = require("../model/User");
const asyncHandler = require("express-async-handler");

const handleLogout = asyncHandler(async (req, res) => {
  //on client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //204 here means we don't have cookies which means we are successful
  const refreshToken = cookies.jwt;

  //Is refresh token in database?
  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  //Delete the refreshToken in db, by setting the refresh token back to an empty string and saving it back to our database
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  const result = await foundUser.save();
  console.log("result", result);
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.sendStatus(204);
});

module.exports = { handleLogout };
