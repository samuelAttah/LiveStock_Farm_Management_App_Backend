const User = require("../model/User");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password))
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  const foundUser = await User.findOne({ username: username }).exec();

  if (!foundUser) return res.status(401).send("Unauthorized User");

  //evaluate password using bcrypt if username was found
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    //THIS IS WHERE WE SEND A JWT FOR PROTECTED ROUTES IN OUR API
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2m" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    //Saving refreshToken with current User
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log("result", result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    }); // remember to add secure true in production
    return res.json({ accessToken: accessToken });
  } else {
    return res.status(401).send("Invalid Password");
  }
};

module.exports = { handleLogin };
