const mongoose = require("mongoose");
const { Schema } = mongoose;

//object IDs are automatically created for us so we do not need to specify that anymore
const employeeSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
