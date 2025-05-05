import express from 'express';
import User from '../models/User';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const user = new User({ name, email, mobile });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit test results
router.post('/:userId/test-results', async (req, res) => {
  try {
    const { answers, score } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        testResults: {
          answers,
          score,
          completedAt: new Date(),
        },
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 