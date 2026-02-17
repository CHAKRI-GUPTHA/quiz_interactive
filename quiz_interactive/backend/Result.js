const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentId: String,
  quizId: String,
  marks: Number,
  ipAddress: String
});

module.exports = mongoose.model("Result", resultSchema);
