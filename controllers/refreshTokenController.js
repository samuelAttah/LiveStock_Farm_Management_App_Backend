const User = require("../model/User");

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send("Unauthorized");
  console.log(cookies.jwt);

  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();

  //Detected refresh token reuse
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        //if there is an error, it means the refresh token has expired, so we send a forbidden result
        if (err) return res.status(403).send("Forbidden");
        //if the refreshtoken is still valid but does not match current user, clear the refreshtoken for the user being hacked
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec();
        hackedUser.refreshToken = [];
        const result = await hackedUser.save();
        console.log(result);
      }
    );
    return res.status(403).send("Forbidden");
  }
  //here the user refreshToken matches, so we delete the old refreshtoken and set a new one.
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  //evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        //an error here shows that there is no
        console.log("expired refresh token");
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await foundUser.save();
        console.log(result);
      }
      if (err || foundUser.username !== decoded.username)
        return res.status(403).send("Forbidden");

      //refresh token was still valid
      const roles = Object.values(foundUser.roles);
      const accessToken = jwt.sign(
        { username: decoded.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10m" }
      );

      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      //Saving refreshToken with current User
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];

      const result = await foundUser.save();

      //Create Secure Cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken: accessToken });
    }
  );
};

module.exports = { handleRefreshToken };
