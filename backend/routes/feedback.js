const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  try {
    const { testResultId, feedback } = req.body;

    // Update the test result with feedback
    const testResult = await TestResult.findByIdAndUpdate(
      testResultId,
      { feedback },
      { new: true }
    );

    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    // Send email with feedback
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'adst5051@gmail.com',
      subject: 'New Test Feedback Received',
      html: `
        <h2>New Test Feedback</h2>
        <p><strong>Test Result ID:</strong> ${testResultId}</p>
        <p><strong>Rating:</strong> ${feedback.rating}/5</p>
        <p><strong>Comment:</strong></p>
        <p>${feedback.comment}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

module.exports = router; 