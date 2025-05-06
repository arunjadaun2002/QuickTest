const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quicktest';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// StudentInfo model
const studentInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
});
const StudentInfo = mongoose.model('StudentInfo', studentInfoSchema, 'StudentInfo');

// QuizInfo model
const quizInfoSchema = new mongoose.Schema({}, { strict: false });
const QuizInfo = mongoose.model('QuizInfo', quizInfoSchema, 'QuizInfo');

// Result model
const resultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
});
const Result = mongoose.model('Result', resultSchema, 'result');

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { name, phone, email, city } = req.body;
    const student = new StudentInfo({ name, phone, email, city });
    await student.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Endpoint to fetch the quiz
app.get('/quiz', async (req, res) => {
  try {
    const quiz = await QuizInfo.findOne();
    if (!quiz) return res.status(404).json({ message: 'No quiz found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
});

// Endpoint to save result
app.post('/result', async (req, res) => {
  try {
    const { name, score } = req.body;
    const result = new Result({ name, score });
    await result.save();
    res.status(201).json({ message: 'Result saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save result', error: error.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MERN Stack API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
