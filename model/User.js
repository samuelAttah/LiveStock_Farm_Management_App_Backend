const mongoose = require("mongoose");
require("mongoose-type-url");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: { type: String, trim: true, required: true, unique: true },
    profilePicture: { type: mongoose.SchemaTypes.Url },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, trim: true },
    homeAddress: { type: String, required: false },
    phoneNumber: { type: Number, index: false, unique: false },
    occupation: { type: String, trim: true },
    workAddress: { type: String, required: false },
    farmName: { type: String, trim: true },
    birthDay: Date,
    companyLogo: { type: mongoose.SchemaTypes.Url },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
