import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're in fullscreen
    const checkFullscreen = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };

    // Handle fullscreen change
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);

    // Prevent right-click
    const preventRightClick = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', preventRightClick);

    // Prevent tab switching
    const preventTabSwitch = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', preventTabSwitch);

    // Prevent fullscreen exit
    const preventFullscreenExit = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', preventFullscreenExit);

    // Request fullscreen if not already in fullscreen
    if (!isFullscreen) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('msfullscreenchange', checkFullscreen);
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventTabSwitch);
      document.removeEventListener('keydown', preventFullscreenExit);
    };
  }, [isFullscreen]);

  useEffect(() => {
    // Fetch questions from backend
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://quicktest-backend.onrender.com/api/questions');
        setQuestions(response.data);
        // Initialize answers object
        const initialAnswers = {};
        response.data.forEach(q => {
          initialAnswers[q._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://quicktest-backend.onrender.com/api/submit-test', {
        answers,
        timeTaken: 10800 - timeLeft,
        userId: localStorage.getItem('userId') // Assuming you store userId after login
      });
      
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      navigate('/results', { state: { results: response.data } });
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isFullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Please enable fullscreen mode to continue</h2>
          <p className="text-gray-600">The test requires fullscreen mode to prevent cheating.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mock Test</h1>
          <div className="text-xl font-semibold text-red-600">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question._id} className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">
                Question {index + 1}: {question.text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option}
                      checked={answers[question._id] === option}
                      onChange={() => handleAnswerChange(question._id, option)}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test; 