const User = require("../model/User");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

//handler for new user information
const handleNewUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  if (!(username && password && email))
    return res
      .status(400)
      .json({ message: "Username, Email and Password are required" });
  //check for duplicate usernames in the db
  const usernameDuplicate = await User.findOne({ username: username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec(); //here we are looking for a username in our MongoDB that matches the username in the request.body. Collation checks if there is a usernameDuplicate in upper or lower cases.
  if (usernameDuplicate)
    return res.status(409).json({ message: "Username already exists" }); //status code 409 stands for conflict

  //check for email duplicate
  const emailDuplicate = await User.findOne({ email: email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (emailDuplicate)
    return res.status(409).json({ message: "Email already exists" }); //status code 409 stands for conflict
  try {
    //encrypt password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    //store new user
    //With mongoose we can create and store the new user all at once.
    //we have the default role assigned to the user schema by default so we need nod specify that anymore
    const result = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
    });
    console.log(result);
    res.status(201).json({ success: `New User ${username} Created!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { handleNewUser };
