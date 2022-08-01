const User = require("../model/User");

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send("Unauthorized");
  console.log(cookies.jwt);

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();

  if (!foundUser) return res.status(403).send("Forbidden");
  //evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.status(403).send("Forbidden");

    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken: accessToken });
  });
};

module.exports = { handleRefreshToken };
