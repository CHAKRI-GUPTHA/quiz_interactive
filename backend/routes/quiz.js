const express = require('express');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const router = express.Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('-password');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by ID (with password verification)
router.post('/access', async (req, res) => {
  try {
    const { quizId, password } = req.body;

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      message: 'Quiz access granted',
      quiz,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz result
router.post('/submit', async (req, res) => {
  try {
    const { userId, quizId, answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let totalScore = 0;
    answers.forEach((answer, index) => {
      if (answer.selectedAnswer === quiz.questions[index].correctAnswer) {
        totalScore += quiz.questions[index].points || 1;
      }
    });

    const result = new Result({
      userId,
      quizId,
      answers,
      totalScore,
      maxScore: quiz.totalPoints,
      percentage: (totalScore / quiz.totalPoints) * 100,
      timeTaken,
    });

    await result.save();

    res.status(201).json({
      message: 'Quiz submitted successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user results
router.get('/results/:userId', async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId }).populate('quizId');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attempts for a quiz (teacher view)
router.get('/attempts/:quizId', async (req, res) => {
  try {
    const attempts = await Result.find({ quizId: req.params.quizId })
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .sort({ submittedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attempts for a specific user on a specific quiz (student view)
router.get('/user-attempts/:userId/:quizId', async (req, res) => {
  try {
    const attempts = await Result.find({ 
      userId: req.params.userId, 
      quizId: req.params.quizId 
    }).populate('quizId').sort({ submittedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single attempt details
router.get('/attempt/:attemptId', async (req, res) => {
  try {
    const attempt = await Result.findById(req.params.attemptId)
      .populate('userId', 'name email')
      .populate('quizId');
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update quiz (teacher only - title, description, password, maxAttempts, timeLimit)
router.put('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz has attempts - if yes, only allow limited edits
    const attempts = await Result.find({ quizId: req.params.quizId });
    
    const { title, description, password, maxAttempts, timeLimit, published, status } = req.body;

    // Always allow these updates
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (password) quiz.password = password;
    if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (published !== undefined) quiz.published = published;
    if (status) quiz.status = status;

    // If quiz has attempts, don't allow question changes
    if (req.body.questions && attempts.length === 0) {
      quiz.questions = req.body.questions;
      quiz.totalPoints = req.body.totalPoints || quiz.totalPoints;
    }

    quiz.updatedAt = new Date();
    await quiz.save();

    res.json({
      message: 'Quiz updated successfully',
      quiz,
      hasAttempts: attempts.length > 0,
      warningMessage: attempts.length > 0 ? 'Quiz has student attempts. Questions cannot be modified.' : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete quiz (teacher only - only if no attempts)
router.delete('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz has any attempts
    const attempts = await Result.find({ quizId: req.params.quizId });
    
    if (attempts.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete quiz with student attempts',
        attemptsCount: attempts.length
      });
    }

    // Delete the quiz
    await Quiz.findByIdAndDelete(req.params.quizId);

    // Clean up any orphaned results
    await Result.deleteMany({ quizId: req.params.quizId });

    res.json({
      message: 'Quiz deleted successfully',
      quizTitle: quiz.title
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if quiz name exists
router.post('/check-name', async (req, res) => {
  try {
    const { title } = req.body;
    const existingQuiz = await Quiz.findOne({ title });
    
    if (existingQuiz) {
      // Check if it has attempts
      const attempts = await Result.find({ quizId: existingQuiz._id });
      return res.json({
        exists: true,
        hasAttempts: attempts.length > 0,
        message: attempts.length > 0 
          ? 'Quiz exists with student attempts - cannot recreate'
          : 'Quiz exists but has no attempts - can be recreated'
      });
    }
    
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
