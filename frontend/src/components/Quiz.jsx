import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

const paletteColors = {
  answered: '#4caf50',
  notAnswered: '#f44336',
  notVisited: '#bdbdbd',
  review: '#ff9800',
};

const indexToLetter = (idx) => String.fromCharCode(65 + idx); // 0 -> 'A', 1 -> 'B', etc.

const Quiz = ({ studentName, studentEmail, studentPhone, preFetchedQuestions }) => {
  console.log('Quiz component mounted with pre-fetched questions:', preFetchedQuestions);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState(preFetchedQuestions || []);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [submitted, setSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [securityViolations, setSecurityViolations] = useState(0);
  const MAX_VIOLATIONS = 3;
  const timerRef = useRef();
  const resultRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const SIDEBAR_WIDTH_DESKTOP = 320;
  const SIDEBAR_WIDTH_MOBILE = 0.9 * window.innerWidth;
  const isMobile = window.innerWidth <= 700;
  const SIDEBAR_WIDTH = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH_DESKTOP;
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackDetail, setFeedbackDetail] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);

  useEffect(() => {
    console.log('Initializing answers and visited state');
    // Initialize answers and visited state if we have questions
    if (questions.length > 0) {
      const initialAnswers = {};
      const initialVisited = {};
      questions.forEach((_, idx) => {
        initialAnswers[idx] = '';
        initialVisited[idx] = false;
      });
      setAnswers(initialAnswers);
      setVisited(initialVisited);
      console.log('Initialized answers and visited state:', { initialAnswers, initialVisited });
    }
  }, [questions]);

  const handleSubmit = async (isAuto = false, preCalculatedScore = null) => {
    // Prevent multiple submissions
    if (submitted) return;
    
    setSubmitted(true);
    clearInterval(timerRef.current);
    
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (e) {
      // Ignore fullscreen exit errors
    }

    const name = studentName;
    const email = studentEmail;
    const phone = studentPhone;
    
    // Use preCalculatedScore if provided (for auto-submission), otherwise calculate
    let score = preCalculatedScore;
    if (score === null) {
      score = 0;
      for (let idx = 0; idx < questions.length; idx++) {
        const userAnswer = (answers[idx] || '').trim().toUpperCase();
        const correctAnswer = (questions[idx].answer || '').trim().toUpperCase();
        if (userAnswer === correctAnswer) {
          score += 4;
        }
      }
    }

    console.log('Submitting with score:', score, 'Auto-submitted:', isAuto);

    if (!name || !email || !phone) {
      console.error('Missing required fields:', { name, email, phone });
      setError('Missing required student information');
      return;
    }

    try {
      const submissionData = {
        name,
        email,
        phone,
        score: score, // Ensure score is explicitly set
        autoSubmitted: isAuto,
        totalQuestions: questions.length,
        submissionTime: new Date().toISOString()
      };

      console.log('Sending submission data:', submissionData);

      const response = await axios.post('https://quicktest-backend.onrender.com/result', submissionData);
      console.log('Result saved successfully:', response.data);
      setResultSaved(true);
      if (isAuto) {
        setAutoSubmitted(true);
      }
    } catch (error) {
      console.error('Error saving result:', error.response?.data || error.message);
      setError('Failed to save result. Please try again.');
      setResultSaved(false);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get('https://quicktest-backend.onrender.com/quiz');
        setQuiz(res.data);
        setCurrent(0); // Reset to first question on new quiz load
        console.log('Quiz object:', res.data);
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted]);

  useEffect(() => {
    setVisited((v) => ({ ...v, [current]: true }));
  }, [current]);

  useEffect(() => {
    if (submitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((w) => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            // Calculate score before auto-submission
            let autoSubmitScore = 0;
            for (let idx = 0; idx < questions.length; idx++) {
              const userAnswer = (answers[idx] || '').trim().toUpperCase();
              const correctAnswer = (questions[idx].answer || '').trim().toUpperCase();
              if (userAnswer === correctAnswer) {
                autoSubmitScore += 4;
              }
            }
            console.log('Tab switch violation auto-submission score:', autoSubmitScore);
            setAutoSubmitted(true);
            handleSubmit(true, autoSubmitScore);
          } else {
            setShowWarning(true);
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
            }
            warningTimeoutRef.current = setTimeout(() => {
              setShowWarning(false);
            }, 3000);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [submitted, questions, answers]);

  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
    };
  }, []);

  useEffect(() => {
    if (submitted && autoSubmitted && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [submitted, autoSubmitted]);

  useEffect(() => {
    // Check fullscreen status
    const checkFullScreen = () => {
      const isFullScreenActive = 
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      
      setIsFullScreen(isFullScreenActive);
      
      if (!isFullScreenActive && !submitted) {
        setSecurityViolations(prev => {
          const newViolations = prev + 1;
          if (newViolations >= MAX_VIOLATIONS) {
            // Calculate score before auto-submission
            let autoSubmitScore = 0;
            for (let idx = 0; idx < questions.length; idx++) {
              const userAnswer = (answers[idx] || '').trim().toUpperCase();
              const correctAnswer = (questions[idx].answer || '').trim().toUpperCase();
              if (userAnswer === correctAnswer) {
                autoSubmitScore += 4;
              }
            }
            console.log('Security violation auto-submission score:', autoSubmitScore);
            handleSubmit(true, autoSubmitScore);
          }
          return newViolations;
        });
      }
    };

    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', checkFullScreen);
    document.addEventListener('webkitfullscreenchange', checkFullScreen);
    document.addEventListener('mozfullscreenchange', checkFullScreen);
    document.addEventListener('MSFullscreenChange', checkFullScreen);

    // Initial check
    checkFullScreen();

    return () => {
      document.removeEventListener('fullscreenchange', checkFullScreen);
      document.removeEventListener('webkitfullscreenchange', checkFullScreen);
      document.removeEventListener('mozfullscreenchange', checkFullScreen);
      document.removeEventListener('MSFullscreenChange', checkFullScreen);
    };
  }, [submitted, questions, answers, MAX_VIOLATIONS]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    const preventShortcuts = (e) => {
      if (
        (e.ctrlKey || e.metaKey) && (
          e.key === 'c' || // Copy
          e.key === 'v' || // Paste
          e.key === 'a' || // Select all
          e.key === 'p' || // Print
          e.key === 's' || // Save
          e.key === 'u'    // View source
        )
      ) {
        e.preventDefault();
        setSecurityViolations(prev => {
          const newViolations = prev + 1;
          if (newViolations >= MAX_VIOLATIONS) {
            // Calculate score before auto-submission
            let autoSubmitScore = 0;
            for (let idx = 0; idx < questions.length; idx++) {
              const userAnswer = (answers[idx] || '').trim().toUpperCase();
              const correctAnswer = (questions[idx].answer || '').trim().toUpperCase();
              if (userAnswer === correctAnswer) {
                autoSubmitScore += 4;
              }
            }
            console.log('Keyboard shortcut violation auto-submission score:', autoSubmitScore);
            handleSubmit(true, autoSubmitScore);
          }
          return newViolations;
        });
      }
    };

    document.addEventListener('keydown', preventShortcuts);
    return () => document.removeEventListener('keydown', preventShortcuts);
  }, [submitted, questions, answers, MAX_VIOLATIONS]);

  // Prevent right-click
  useEffect(() => {
    const preventContextMenu = (e) => {
      e.preventDefault();
      setSecurityViolations(prev => {
        const newViolations = prev + 1;
        if (newViolations >= MAX_VIOLATIONS) {
          // Calculate score before auto-submission
          let autoSubmitScore = 0;
          for (let idx = 0; idx < questions.length; idx++) {
            const userAnswer = (answers[idx] || '').trim().toUpperCase();
            const correctAnswer = (questions[idx].answer || '').trim().toUpperCase();
            if (userAnswer === correctAnswer) {
              autoSubmitScore += 4;
            }
          }
          console.log('Context menu violation auto-submission score:', autoSubmitScore);
          handleSubmit(true, autoSubmitScore);
        }
        return newViolations;
      });
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, [submitted, questions, answers, MAX_VIOLATIONS]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;
  if (!quiz) return <div>No quiz found.</div>;

  const q = questions[current];

  if (!q) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>
        No question found for this index.
      </div>
    );
  }

  const handleOptionChange = (letter) => {
    setAnswers({ ...answers, [current]: letter });
  };

  const handleMarkForReview = () => {
    setMarked({ ...marked, [current]: true });
    handleNext();
  };

  const handleClear = () => {
    setAnswers((a) => {
      const copy = { ...a };
      delete copy[current];
      return copy;
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleJump = (idx) => setCurrent(idx);

  const getPaletteStatus = (idx) => {
    if (answers[idx]) return 'answered';
    if (marked[idx]) return 'review';
    if (visited[idx]) return 'notAnswered';
    return 'notVisited';
  };

  const formatTime = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  if (submitted) {
    let score = 0;
    questions.forEach((q, idx) => {
      if ((answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase()) score += 4;
    });
    return (
      <div ref={resultRef} style={{ maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '2rem' }}>
        <h2 style={{ color: '#185a9d', marginBottom: '1.5rem' }}>Quiz Results</h2>
        {autoSubmitted && (
          <div style={{ 
            background: '#fff3e0', 
            border: '1px solid #ff9800', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            color: '#d7263d',
            fontWeight: 700 
          }}>
            Test auto-submitted due to multiple tab switching violations.
          </div>
        )}
        <div style={{ marginBottom: 24, fontSize: 18 }}>
          <b>Score: {score} / {questions.length*4}</b>
        </div>
        {resultSaved && <div style={{ color: '#388e3c', marginBottom: 16 }}>Your result has been saved!</div>}
        {!resultSaved && <div style={{ color: '#d7263d', marginBottom: 16 }}>Result not saved or server error.</div>}
        {questions.map((q, idx) => {
          const isCorrect = (answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase();
          // Get the correct answer text
          const correctIdx = (q.answer || '').toUpperCase().charCodeAt(0) - 65;
          const correctText = q.options && correctIdx >= 0 && correctIdx < q.options.length ? q.options[correctIdx] : q.answer;
          return (
            <div key={idx} style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: isCorrect ? '#e8f5e9' : '#ffebee', border: isCorrect ? '1px solid #4caf50' : '1px solid #f44336' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Q{idx + 1}: {q.question}</div>
              <div>Your answer: <b style={{ color: isCorrect ? '#388e3c' : '#d32f2f' }}>{answers[idx] || 'No answer'}</b></div>
              <div>Correct answer: <b style={{ color: '#388e3c' }}>{correctText}</b><span style={{ color: '#888', marginLeft: 8, fontWeight: 400 }}>({q.answer})</span></div>
            </div>
          );
        })}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <b>Thank you for taking the test!</b>
        </div>
        {/* Feedback Button and Form */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              style={{ padding: '12px 32px', borderRadius: 8, background: '#3b4cb8', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', marginTop: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer' }}
            >
              Submit Feedback
            </button>
          ) : (
            <div style={{ marginTop: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Feedback Type:</label>
              <select
                value={feedbackSubject}
                onChange={e => setFeedbackSubject(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16, fontSize: 16 }}
              >
                <option value="">Select feedback type</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Suggestion">Suggestion</option>
                <option value="General Feedback">General Feedback</option>
              </select>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Suggestion / Problem Detail:</label>
              <textarea
                value={feedbackDetail}
                onChange={e => setFeedbackDetail(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', minHeight: 80, fontSize: 16, marginBottom: 16 }}
                placeholder="Describe your suggestion, problem, or feedback"
              />
              {/* Rating Bar */}
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>Rate your experience:</span>
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    style={{
                      cursor: 'pointer',
                      fontSize: 28,
                      color: feedbackRating >= star ? '#FFD600' : '#ccc',
                      marginRight: 2,
                      transition: 'color 0.2s',
                      userSelect: 'none',
                    }}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  const mailto = `mailto:arunjadaun2002@gmail.com?subject=${encodeURIComponent(feedbackSubject)}&body=${encodeURIComponent(feedbackDetail)}`;
                  window.location.href = mailto;
                }}
                style={{ padding: '10px 28px', borderRadius: 8, background: '#388e3c', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', marginRight: 12, cursor: 'pointer' }}
                disabled={!feedbackSubject || !feedbackDetail}
              >
                Send
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                style={{ padding: '10px 18px', borderRadius: 8, background: '#eee', color: '#333', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isFullScreen && !submitted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: '1.5rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Full Screen Required</h2>
        <p>Please enable full screen mode to continue with the test.</p>
        <p style={{ color: '#ff4444', marginTop: '1rem' }}>
          Warning: {MAX_VIOLATIONS - securityViolations} violations remaining before auto-submit
        </p>
        <button 
          onClick={() => {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen();
            }
          }}
          style={{
            marginTop: '1rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Enable Full Screen
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
        {/* Main Question Panel */}
        <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: isMobile ? '2vw 0 0 0' : '2.5vw 0 0 0', width: '100%' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(80,80,160,0.10)', padding: isMobile ? '1.2rem 0.5rem' : '2.5rem 2rem', margin: '0 auto', maxWidth: 800, width: '100%', border: '1.5px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 20, textAlign: 'center', marginBottom: 32 }}>
                Question {current + 1}
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 16, color: '#444', marginBottom: 10 }}>
              
            </div>
            <div style={{ fontWeight: 600, marginBottom: 22, fontSize: 18, color: '#222', textAlign: 'center' }}>{q.question}</div>
            <div style={{ marginBottom: 30 }}>
              {q.options.map((opt, oidx) => {
                const letter = indexToLetter(oidx);
                return (
                  <label key={oidx} style={{ display: 'flex', alignItems: 'center', marginBottom: 18, fontSize: '1.13rem', borderRadius: 8, padding: '10px 16px', background: answers[current] === letter ? '#e3f2fd' : '#fafafa', border: answers[current] === letter ? '2px solid #3b4cb8' : '1.5px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s', fontWeight: answers[current] === letter ? 700 : 500, color: answers[current] === letter ? '#222' : '#444' }}>
                    <input
                      type="radio"
                      name={`q${current}`}
                      value={letter}
                      checked={answers[current] === letter}
                      onChange={() => handleOptionChange(letter)}
                      style={{ marginRight: 14, accentColor: '#3b4cb8', width: 18, height: 18 }}
                    />
                    <b style={{ marginRight: 8 }}>{letter}.</b> {opt}
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginTop: 18 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={handleMarkForReview} style={{ padding: '10px 22px', borderRadius: 8, background: paletteColors.review, color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>Mark For Review & Next</button>
                <button onClick={handleClear} style={{ padding: '10px 22px', borderRadius: 8, background: '#eee', color: '#333', border: 'none', fontWeight: 700, fontSize: 15 }}>Clear Response</button>
                <button onClick={handlePrev} disabled={current === 0} style={{ padding: '10px 22px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, opacity: current === 0 ? 0.5 : 1 }}>Previous</button>
                <button onClick={handleNext} disabled={current === questions.length - 1} style={{ padding: '10px 22px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, opacity: current === questions.length - 1 ? 0.5 : 1 }}>Save & Next</button>
              </div>
              <button 
                onClick={() => handleSubmit()} 
                style={{ 
                  padding: '12px 40px', 
                  borderRadius: 8, 
                  background: '#3b4cb8', 
                  color: '#fff', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  border: 'none', 
                  marginTop: 16,
                  width: '200px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar with slide effect and overlay on mobile */}
        <div
          style={{
            width: SIDEBAR_WIDTH,
            minWidth: isMobile ? 'unset' : SIDEBAR_WIDTH_DESKTOP,
            maxWidth: SIDEBAR_WIDTH,
            background: '#fff',
            borderLeft: isMobile ? 'none' : '1.5px solid #eee',
            padding: isMobile ? '1.2rem 0.5rem' : '2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: isMobile ? '0 2px 16px rgba(80,80,160,0.18)' : '0 2px 16px rgba(80,80,160,0.06)',
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            right: 0,
            bottom: 0,
            left: isMobile ? 'unset' : 'unset',
            transform: showSidebar ? 'translateX(0)' : `translateX(${SIDEBAR_WIDTH}px)`,
            transition: 'transform 0.3s',
            overflowY: 'auto',
            height: isMobile ? '100vh' : '100%',
            zIndex: 2500,
          }}
        >
          {/* Toggle button at the top of the sidebar */}
          {showSidebar && (
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                alignSelf: 'flex-end',
                marginBottom: 16,
                background: '#3b4cb8',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                fontSize: 22,
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
              }}
              aria-label="Hide Question List"
            >
              ◀
            </button>
          )}
          {showSidebar && (
            <>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Question list</div>
              <div style={{ marginBottom: 16, fontSize: 15, color: '#444', textAlign: 'center' }}>Remaining Time: <b>{formatTime(timeLeft)}</b></div>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 16, textAlign: 'center' }}>Choose a Question</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 36px)', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
                {questions.map((_, idx) => {
                  const status = getPaletteStatus(idx);
                  let bg = '#bdbdbd';
                  if (status === 'answered') bg = '#4caf50';
                  if (status === 'notAnswered') bg = '#f44336';
                  if (status === 'review') bg = '#ff9800';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleJump(idx)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        border: current === idx ? '2px solid #3b4cb8' : '1px solid #ccc',
                        background: bg,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        outline: 'none',
                        marginBottom: 2
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {/* Show button at right edge when sidebar is hidden */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              position: 'fixed',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              background: '#3b4cb8',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: 22,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
            }}
            aria-label="Show Question List"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz; 