const mongoose = require("mongoose");
require("mongoose-type-url");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
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
    homeAddress: { type: String, required: false },
    phoneNumber: { type: Number, index: false, unique: false },
    occupation: String,
    workAddress: { type: String, required: false },
    farmName: String,
    birthDay: Date,
    companyLogo: { type: mongoose.SchemaTypes.Url },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
