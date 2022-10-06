const mongoose = require("mongoose");
require("mongoose-type-url");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: { type: String, trim: true },
  profilePicture: { type: mongoose.SchemaTypes.Url },
  firstName: String,
  lastName: String,
  gender: String,
  address: String,
  farmName: String,
  birthDay: Date,
  companyLogo: { type: mongoose.SchemaTypes.Url },
});

module.exports = mongoose.model("User", userSchema);
