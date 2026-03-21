const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const OpenAI = require('openai');
const { z } = require('zod');
const { zodTextFormat } = require('openai/helpers/zod');

const router = express.Router();

const dataDir =
  process.env.QUIZZES_DATA_DIR ||
  process.env.STUDENTS_DATA_DIR ||
  path.join(__dirname, '..', 'data');
const dataFile = process.env.QUIZZES_DATA_FILE || path.join(dataDir, 'quizzes.json');
const uploadsDir = path.join(dataDir, 'uploads');
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const aiModel = process.env.OPENAI_MODEL || 'gpt-5-mini';

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const ensureDataDir = () => {
  const dir = path.dirname(dataFile);
  ensureDir(dir);
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

ensureDir(uploadsDir);

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF and image files are supported.'));
  },
});

const GeneratedQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  points: z.number().int().min(1).max(10),
  explanation: z.string().min(1).nullable(),
  sourceHint: z.string().min(1).nullable(),
});

const GeneratedQuestionSetSchema = z.object({
  materialSummary: z.string(),
  warnings: z.array(z.string()),
  questions: z.array(GeneratedQuestionSchema).min(1).max(20),
});

const clampQuestionCount = (value, fallback = 5) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(1, Math.min(parsed, 20));
};

const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const sanitizeQuestion = (question, index) => ({
  id: Date.now() + index,
  text: question.text.trim(),
  options: question.options.map((option) => option.trim()),
  correctAnswer: question.correctAnswer,
  points: question.points,
  explanation: question.explanation?.trim() || '',
  sourceHint: question.sourceHint?.trim() || '',
});

const buildAiPrompt = ({ quiz, count, existingQuestions }) => {
  const existingQuestionList =
    existingQuestions.length > 0
      ? existingQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')
      : 'None yet.';

  return [
    'You are creating multiple-choice quiz questions for a teacher.',
    `Quiz subject: ${quiz.subject || 'General'}`,
    `Requested number of questions: ${count}`,
    '',
    'Use only the uploaded material as your source.',
    'If the file is partially unreadable or lacks enough information, return the highest-confidence questions you can and explain the issue in warnings.',
    'Avoid duplicating or closely paraphrasing any existing questions.',
    'Each question must:',
    '- be grounded in the uploaded material',
    '- have exactly 4 answer options',
    '- have exactly 1 correct answer',
    '- be clearly worded for students',
    '- use a points value between 1 and 3 based on difficulty',
    '- include a short explanation and a short sourceHint referencing the relevant topic/section',
    '',
    'Existing questions to avoid:',
    existingQuestionList,
  ].join('\n');
};

// Get all quizzes
router.get('/', (req, res) => {
  const quizzes = readQuizzes();
  res.json({ quizzes });
});

router.post('/:quizId/ai-generate', upload.single('material'), async (req, res) => {
  const localFilePath = req.file?.path;

  try {
    if (!openai) {
      return res.status(503).json({
        message: 'AI generation is not configured on the server. Set OPENAI_API_KEY in backend/.env and restart the backend.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or image file first.' });
    }

    const quizzes = readQuizzes();
    const quiz = quizzes.find((item) => item.quizId === req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const requestedCount = clampQuestionCount(req.body.numQuestions, clampQuestionCount(quiz.numQuestions, 5));
    const existingQuestions = (quiz.questions || [])
      .map((question) => question.questionText || question.text || '')
      .filter(Boolean);

    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(localFilePath),
      purpose: 'user_data',
    });

    const response = await openai.responses.parse({
      model: aiModel,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              file_id: uploadedFile.id,
            },
            {
              type: 'input_text',
              text: buildAiPrompt({
                quiz,
                count: requestedCount,
                existingQuestions,
              }),
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(GeneratedQuestionSetSchema, 'quiz_question_generation'),
      },
    });

    const parsed = response.output_parsed;
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('The model did not return any questions.');
    }

    res.json({
      message: 'Questions generated successfully',
      generatedFrom: req.file.originalname,
      model: aiModel,
      requestedCount,
      materialSummary: parsed.materialSummary,
      warnings: parsed.warnings || [],
      questions: parsed.questions.map(sanitizeQuestion),
    });
  } catch (error) {
    console.error('AI question generation failed:', error);

    const status = error.status && Number.isInteger(error.status) ? error.status : 500;
    let message = 'Unable to generate questions from the uploaded file right now.';

    if (status === 401) {
      message = 'The OpenAI API key is invalid. Update OPENAI_API_KEY in the backend environment.';
    } else if (status === 429) {
      message = 'The AI service is rate-limited right now. Please wait a moment and try again.';
    } else if (error.message === 'Only PDF and image files are supported.') {
      message = error.message;
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'The uploaded file is too large. Please keep it under 50 MB.';
    }

    res.status(status).json({
      message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    cleanupTempFile(localFilePath);
  }
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

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'The uploaded file is too large. Please keep it under 50 MB.' });
    }
    return res.status(400).json({ message: error.message });
  }

  if (error.message === 'Only PDF and image files are supported.') {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

module.exports = router;
