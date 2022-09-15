const User = require("../model/User");
const asyncHandler = require("express-async-handler");

const handleLogout = asyncHandler(async (req, res) => {
  //on client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204).json({ message: "Cookie Cleared" }); //204 here means we don't have cookies which means we are successful

  //Delete the refreshToken in db, by setting the refresh token back to an empty string and saving it back to our database
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.json({ message: "Cookie Cleared" });
});

module.exports = { handleLogout };
