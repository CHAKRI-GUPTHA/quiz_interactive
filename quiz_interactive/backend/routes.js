const router = require("express").Router();
const Quiz = require("../models/Quiz");

router.post("/create", async (req, res) => {
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.json({ message: "Quiz Created" });
});

router.get("/all", async (req, res) => {
  const quizzes = await Quiz.find();
  res.json(quizzes);
});

module.exports = router;
