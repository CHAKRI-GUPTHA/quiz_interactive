const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-system')
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.log('⚠️  MongoDB not available - running in test mode');
  console.log('   To use MongoDB, set MONGODB_URI in .env or install MongoDB locally');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));

// Basic route
app.get('/', (req, res) => {
  res.send('Quiz System API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
