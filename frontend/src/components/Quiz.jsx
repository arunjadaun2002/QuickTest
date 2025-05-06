import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

const paletteColors = {
  answered: '#4caf50',
  notAnswered: '#f44336',
  notVisited: '#bdbdbd',
  review: '#ff9800',
};

const indexToLetter = (idx) => String.fromCharCode(65 + idx); // 0 -> 'A', 1 -> 'B', etc.

const Quiz = ({ studentName, studentEmail }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
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

  const handleSubmit = async () => {
    setSubmitted(true);
    clearInterval(timerRef.current);
    
    // Exit fullscreen mode when submitting
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    const name = studentName;
    const email = studentEmail;
    let score = 0;
    questions.forEach((q, idx) => {
      if ((answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase()) score += 1;
    });
    if (name && email && score >= 0) {
      try {
        await axios.post('http://localhost:5000/result', { name, email, score });
        setResultSaved(true);
      } catch (e) {
        setResultSaved(false);
      }
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get('http://localhost:5000/quiz');
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
            setAutoSubmitted(true);
            handleSubmit();
          } else {
            setShowWarning(true);
            // Clear any existing timeout
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
            }
            // Set new timeout
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
  }, [submitted]);

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
            handleSubmit();
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
  }, [submitted]);

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
            handleSubmit();
          }
          return newViolations;
        });
      }
    };

    document.addEventListener('keydown', preventShortcuts);
    return () => document.removeEventListener('keydown', preventShortcuts);
  }, []);

  // Prevent right-click
  useEffect(() => {
    const preventContextMenu = (e) => {
      e.preventDefault();
      setSecurityViolations(prev => {
        const newViolations = prev + 1;
        if (newViolations >= MAX_VIOLATIONS) {
          handleSubmit();
        }
        return newViolations;
      });
    };

    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  // Prevent tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        setSecurityViolations(prev => {
          const newViolations = prev + 1;
          if (newViolations >= MAX_VIOLATIONS) {
            handleSubmit();
          }
          return newViolations;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitted]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>{error}</div>;
  if (!quiz) return <div>No quiz found.</div>;

  const questions = quiz.questions || [];
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
      if ((answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase()) score += 1;
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
          <b>Score: {score} / {questions.length}</b>
        </div>
        {resultSaved && <div style={{ color: '#388e3c', marginBottom: 16 }}>Your result has been saved!</div>}
        {!resultSaved && <div style={{ color: '#d7263d', marginBottom: 16 }}>Result not saved or server error.</div>}
        {questions.map((q, idx) => {
          const isCorrect = (answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase();
          return (
            <div key={idx} style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: isCorrect ? '#e8f5e9' : '#ffebee', border: isCorrect ? '1px solid #4caf50' : '1px solid #f44336' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Q{idx + 1}: {q.question}</div>
              <div>Your answer: <b style={{ color: isCorrect ? '#388e3c' : '#d32f2f' }}>{answers[idx] || 'No answer'}</b></div>
              <div>Correct answer: <b style={{ color: '#388e3c' }}>{q.answer}</b></div>
            </div>
          );
        })}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <b>Thank you for taking the test!</b>
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      {showWarning && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: '#ff4444',
          color: '#fff',
          padding: '1rem 2rem',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          Warning: Tab switching detected! {3 - warnings} warnings remaining before auto-submission.
        </div>
      )}
      {/* Main Question Panel */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', paddingTop: '4vh' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(80,80,160,0.10)', padding: '2.5rem 2rem', margin: '0 auto', maxWidth: 700, width: '100%', marginTop: '2vh', marginBottom: '2vh', border: '1.5px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 22 }}>Question {current + 1}</div>
            <div style={{ fontSize: 15, color: '#888' }}>Marks For Correct Response: 1.00 | Negative Marking: 0.00</div>
          </div>
          <div style={{ fontWeight: 700, marginBottom: 24, fontSize: 20, color: '#222' }}>{q.question}</div>
          <div>
            {q.options.map((opt, oidx) => {
              const letter = indexToLetter(oidx);
              return (
                <label key={oidx} style={{ display: 'block', marginBottom: 18, fontSize: '1.18rem', borderRadius: 8, padding: '12px 16px', background: answers[current] === letter ? '#e3f2fd' : '#fafafa', border: answers[current] === letter ? '2px solid #4e54c8' : '1.5px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s', fontWeight: answers[current] === letter ? 700 : 500, color: answers[current] === letter ? '#222' : '#444' }}>
                  <input
                    type="radio"
                    name={`q${current}`}
                    value={letter}
                    checked={answers[current] === letter}
                    onChange={() => handleOptionChange(letter)}
                    style={{ marginRight: 14 }}
                  />
                  <b>{letter}.</b> {opt}
                </label>
              );
            })}
          </div>
          <div style={{ marginTop: 36, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handleMarkForReview} style={{ padding: '12px 28px', borderRadius: 8, background: paletteColors.review, color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>Mark For Review & Next</button>
            <button onClick={handleClear} style={{ padding: '12px 28px', borderRadius: 8, background: '#eee', color: '#333', border: 'none', fontWeight: 700, fontSize: 16 }}>Clear Response</button>
            <button onClick={handlePrev} disabled={current === 0} style={{ padding: '12px 28px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, opacity: current === 0 ? 0.5 : 1 }}>Previous</button>
            <button onClick={handleNext} disabled={current === questions.length - 1} style={{ padding: '12px 28px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, opacity: current === questions.length - 1 ? 0.5 : 1 }}>Save & Next</button>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div style={{ flex: 1, background: '#fff', borderLeft: '1px solid #eee', padding: '2.5rem 2rem', minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Test Instructions:</div>
        <div style={{ marginBottom: 20, fontSize: 17 }}>Remaining Time: <b>{formatTime(timeLeft)}</b></div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 20, background: paletteColors.answered, display: 'inline-block', borderRadius: 4 }}></span> Answered</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 20, background: paletteColors.notAnswered, display: 'inline-block', borderRadius: 4 }}></span> Not Answered</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 20, background: paletteColors.review, display: 'inline-block', borderRadius: 4 }}></span> Marked for Review</div>
        </div>
        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 16 }}>Choose a Question</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 40px)', gap: 10, marginBottom: 32 }}>
          {questions.map((_, idx) => {
            const status = getPaletteStatus(idx);
            return (
              <button
                key={idx}
                onClick={() => handleJump(idx)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: current === idx ? '2px solid #2196f3' : '1px solid #ccc',
                  background: paletteColors[status],
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 18,
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
        <button onClick={handleSubmit} style={{ padding: '16px 48px', borderRadius: 10, background: '#673ab7', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', marginTop: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>Submit</button>
      </div>
    </div>
  );
};

export default Quiz; 