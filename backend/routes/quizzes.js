const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const dataDir =
  process.env.QUIZZES_DATA_DIR ||
  process.env.STUDENTS_DATA_DIR ||
  path.join(__dirname, '..', 'data');
const dataFile = process.env.QUIZZES_DATA_FILE || path.join(dataDir, 'quizzes.json');

const ensureDataDir = () => {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readQuizzes = () => {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read quizzes file:', error.message);
    return [];
  }
};

const writeQuizzes = (quizzes) => {
  ensureDataDir();
  fs.writeFileSync(dataFile, JSON.stringify(quizzes, null, 2), 'utf8');
};

// Get all quizzes
router.get('/', (req, res) => {
  const quizzes = readQuizzes();
  res.json({ quizzes });
});

// Get quiz by quizId
router.get('/:quizId', (req, res) => {
  const quizzes = readQuizzes();
  const quiz = quizzes.find((q) => q.quizId === req.params.quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  res.json({ quiz });
});

// Create quiz
router.post('/', (req, res) => {
  const quiz = req.body || {};

  if (!quiz.quizId || !quiz.subject || !quiz.password) {
    return res.status(400).json({ message: 'Quiz ID, Subject, and Password are required' });
  }

  const quizzes = readQuizzes();
  if (quizzes.some((q) => q.quizId === quiz.quizId)) {
    return res.status(400).json({ message: 'Quiz ID already exists' });
  }

  const newQuiz = {
    ...quiz,
    createdAt: quiz.createdAt || new Date().toISOString(),
  };

  const updated = [...quizzes, newQuiz];
  writeQuizzes(updated);

  res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz, quizzes: updated });
});

// Update quiz
router.put('/:quizId', (req, res) => {
  const quizzes = readQuizzes();
  const idx = quizzes.findIndex((q) => q.quizId === req.params.quizId);
  if (idx === -1) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  const updatedQuiz = {
    ...quizzes[idx],
    ...req.body,
    quizId: quizzes[idx].quizId,
    updatedAt: new Date().toISOString(),
  };

  quizzes[idx] = updatedQuiz;
  writeQuizzes(quizzes);

  res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz, quizzes });
});

// Delete quiz
router.delete('/:quizId', (req, res) => {
  const quizzes = readQuizzes();
  const updated = quizzes.filter((q) => q.quizId !== req.params.quizId);
  if (updated.length === quizzes.length) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  writeQuizzes(updated);
  res.json({ message: 'Quiz deleted successfully', quizzes: updated });
});

module.exports = router;
