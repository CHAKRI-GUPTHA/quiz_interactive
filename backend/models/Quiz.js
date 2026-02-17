const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: Number,
      points: Number,
    },
  ],
  totalPoints: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: true,
  },
  timeLimit: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: -1, // -1 means unlimited
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['created', 'published', 'archived'],
    default: 'created',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
