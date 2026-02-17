const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: String, // teacher or student
  userId: String,
  password: String
});

module.exports = mongoose.model("User", userSchema);
