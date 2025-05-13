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
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Log connection attempt
console.log('Attempting to connect to MongoDB...');
console.log('Database name from URI:', MONGODB_URI.split('/').pop().split('?')[0]);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  console.log('Connected to database:', mongoose.connection.name);
  console.log('Connection host:', mongoose.connection.host);
  
  // List all collections
  return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
  console.log('Available collections:', collections.map(c => c.name));
  
  // Check if our collections exist
  const requiredCollections = ['result', 'StudentInfo', 'QuizInfo'];
  const existingCollections = collections.map(c => c.name);
  
  console.log('Checking required collections...');
  requiredCollections.forEach(collection => {
    if (existingCollections.includes(collection)) {
      console.log(`✓ Collection '${collection}' exists`);
    } else {
      console.log(`✗ Collection '${collection}' does not exist`);
    }
  });
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  if (err.name === 'MongoServerSelectionError') {
    console.error('Could not connect to MongoDB server. Please check:');
    console.error('1. Your internet connection');
    console.error('2. The MongoDB Atlas IP whitelist');
    console.error('3. Your username and password');
  }
  process.exit(1);
});

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

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
  phone: { type: String, required: true },
  email: { type: String, required: true },
  score: { type: Number, required: true },
  autoSubmitted: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', resultSchema, 'result');

// Feedback model
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  detail: { type: String, required: true },
  rating: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedback');

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
  console.log('Received result request:', req.body);
  
  // Validate required fields
  const { name, phone, email, score, autoSubmitted } = req.body;
  if (!name || !phone || !email || score === undefined) {
    console.error('Missing required fields:', { name, phone, email, score });
    return res.status(400).json({ 
      message: 'Missing required fields', 
      details: { name, phone, email, score }
    });
  }

  // Validate score is a number and non-negative
  if (typeof score !== 'number' || score < 0) {
    console.error('Invalid score:', score);
    return res.status(400).json({ 
      message: 'Invalid score value', 
      details: { score }
    });
  }

  try {
    // Log the current database and collection
    console.log('Current database:', mongoose.connection.name);
    console.log('Target collection:', Result.collection.name);

    const result = new Result({ name, phone, email, score, autoSubmitted });
    const savedResult = await result.save();
    console.log('Successfully saved result to collection:', Result.collection.name);
    console.log('Saved result:', savedResult);
    
    // Verify the data was saved by querying it back
    const verifiedResult = await Result.findById(savedResult._id);
    console.log('Verified saved result:', verifiedResult);
    
    // List all documents in the collection
    const allResults = await Result.find({});
    console.log('Total documents in collection:', allResults.length);
    
    res.status(201).json({ 
      message: 'Result saved successfully',
      result: savedResult
    });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ 
      message: 'Failed to save result', 
      error: error.message,
      details: error.errors
    });
  }
});

// Endpoint to save feedback
app.post('/feedback', async (req, res) => {
  console.log('Received feedback request:', req.body);
  
  // Validate required fields
  const { name, phone, email, subject, detail, rating } = req.body;
  if (!name || !phone || !email || !subject || !detail || rating === undefined) {
    console.error('Missing required fields:', { name, phone, email, subject, detail, rating });
    return res.status(400).json({ 
      message: 'Missing required fields', 
      details: { name, phone, email, subject, detail, rating }
    });
  }

  try {
    // Log the current database and collection
    console.log('Current database:', mongoose.connection.name);
    console.log('Target collection:', Feedback.collection.name);

    const feedback = new Feedback({
      name,
      phone,
      email,
      subject,
      detail,
      rating
    });
    
    const savedFeedback = await feedback.save();
    console.log('Successfully saved feedback to collection:', Feedback.collection.name);
    console.log('Saved feedback:', savedFeedback);
    
    // Verify the data was saved by querying it back
    const verifiedFeedback = await Feedback.findById(savedFeedback._id);
    console.log('Verified saved feedback:', verifiedFeedback);
    
    // List all documents in the collection
    const allFeedbacks = await Feedback.find({});
    console.log('Total feedback documents in collection:', allFeedbacks.length);
    
    res.status(201).json({ 
      message: 'Feedback saved successfully',
      feedback: savedFeedback
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ 
      message: 'Failed to save feedback', 
      error: error.message,
      details: error.errors
    });
  }
});

// Test endpoint to verify database connectivity
app.post('/test-db', async (req, res) => {
  try {
    // Create a test document
    const testDoc = new Result({
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      score: 100
    });
    
    // Save the test document
    const savedDoc = await testDoc.save();
    console.log('Test document saved:', savedDoc);
    
    // Query all documents
    const allDocs = await Result.find({});
    console.log('Total documents in collection:', allDocs.length);
    console.log('All documents:', allDocs);
    
    res.json({
      message: 'Test successful',
      savedDocument: savedDoc,
      totalDocuments: allDocs.length,
      allDocuments: allDocs
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    });
  }
});

// Test endpoint to insert a sample document
app.post('/insert-test', async (req, res) => {
  try {
    const testDoc = new Result({
      name: 'Test User',
      phone: '1234567890',
      score: 100,
      timestamp: new Date()
    });
    
    const savedDoc = await testDoc.save();
    console.log('Test document saved:', savedDoc);
    
    // Verify the document was saved
    const verifiedDoc = await Result.findById(savedDoc._id);
    console.log('Verified document:', verifiedDoc);
    
    res.json({
      message: 'Test document inserted successfully',
      document: savedDoc,
      verified: verifiedDoc
    });
  } catch (error) {
    console.error('Test insertion failed:', error);
    res.status(500).json({
      message: 'Test insertion failed',
      error: error.message
    });
  }
});

// Diagnostic endpoint to check database connection and data
app.get('/check-db', async (req, res) => {
  try {
    // Get database info
    const dbInfo = {
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: []
    };

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    dbInfo.collections = collections.map(c => c.name);

    // Get document counts for each collection
    const counts = {};
    for (const collection of ['result', 'StudentInfo', 'QuizInfo']) {
      try {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        counts[collection] = count;
      } catch (err) {
        counts[collection] = `Error: ${err.message}`;
      }
    }

    // Get sample documents from result collection
    const sampleResults = await Result.find({}).limit(5);

    res.json({
      databaseInfo: dbInfo,
      collectionCounts: counts,
      sampleResults: sampleResults,
      connectionString: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')
    });
  } catch (error) {
    console.error('Database check failed:', error);
    res.status(500).json({
      message: 'Database check failed',
      error: error.message
    });
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
