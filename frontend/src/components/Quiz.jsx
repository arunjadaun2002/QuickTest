import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

const paletteColors = {
  answered: '#4caf50',
  notAnswered: '#f44336',
  notVisited: '#bdbdbd',
  review: '#ff9800',
};

const indexToLetter = (idx) => String.fromCharCode(65 + idx); // 0 -> 'A', 1 -> 'B', etc.

const Quiz = ({ studentName, studentEmail, studentPhone }) => {
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
    const phone = studentPhone;
    // Calculate score: 1 mark per correct answer (by letter, case-insensitive)
    let score = 0;
    questions.forEach((q, idx) => {
      if ((answers[idx] || '').trim().toUpperCase() === (q.answer || '').trim().toUpperCase()) score += 1;
    });
    if (name && email && phone && score >= 0) {
      try {
        await axios.post('http://localhost:5000/result', { name, email, phone, score });
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
    <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#3b4cb8', color: '#fff', padding: '1rem 2.5vw', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
        <div style={{ flex: 1, textAlign: 'left' }}>Mock Test (Set-2)</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 20 }}>Test Instructions:</div>
        <div style={{ flex: 1, textAlign: 'right', fontSize: 18 }}>
          Remaining Time: <span style={{ background: '#222', color: '#fff', borderRadius: 6, padding: '4px 12px', fontWeight: 700 }}>{formatTime(timeLeft)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
        {/* Main Question Panel */}
        <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: '2.5vw 0 0 0' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(80,80,160,0.10)', padding: '2.5rem 2rem', margin: '0 auto', maxWidth: 800, width: '100%', border: '1.5px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Question {current + 1}</div>
              <div style={{ fontSize: 15, color: '#444' }}>Marks For Correct Response: <b>1.00</b> | Negative Marking: <b>0.00</b></div>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 22, fontSize: 18, color: '#222' }}>{q.question}</div>
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
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
              <button onClick={handleMarkForReview} style={{ padding: '10px 22px', borderRadius: 8, background: paletteColors.review, color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>Mark For Review & Next</button>
              <button onClick={handleClear} style={{ padding: '10px 22px', borderRadius: 8, background: '#eee', color: '#333', border: 'none', fontWeight: 700, fontSize: 15 }}>Clear Response</button>
              <button onClick={handlePrev} disabled={current === 0} style={{ padding: '10px 22px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, opacity: current === 0 ? 0.5 : 1 }}>Previous</button>
              <button onClick={handleNext} disabled={current === questions.length - 1} style={{ padding: '10px 22px', borderRadius: 8, background: '#2196f3', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, opacity: current === questions.length - 1 ? 0.5 : 1 }}>Save & Next</button>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div style={{ flex: 1.2, background: '#fff', borderLeft: '1.5px solid #eee', padding: '2.5rem 1.5rem', minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 16px rgba(80,80,160,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Test Instructions:</div>
          <div style={{ marginBottom: 16, fontSize: 15, color: '#444', textAlign: 'center' }}>Remaining Time: <b>{formatTime(timeLeft)}</b></div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 22, background: '#4caf50', color: '#fff', borderRadius: 4, display: 'inline-block', textAlign: 'center', fontWeight: 700, fontSize: 15, lineHeight: '22px' }}>0</span> Answered</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 22, background: '#f44336', color: '#fff', borderRadius: 4, display: 'inline-block', textAlign: 'center', fontWeight: 700, fontSize: 15, lineHeight: '22px' }}>1</span> Not Answered</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 22, background: '#bdbdbd', color: '#222', borderRadius: 4, display: 'inline-block', textAlign: 'center', fontWeight: 700, fontSize: 15, lineHeight: '22px' }}>2</span> Not Visited</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 22, background: '#ff9800', color: '#fff', borderRadius: 4, display: 'inline-block', textAlign: 'center', fontWeight: 700, fontSize: 15, lineHeight: '22px' }}>3</span> Marked for Review</div>
          </div>
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
          <button onClick={handleSubmit} style={{ padding: '14px 40px', borderRadius: 8, background: '#3b4cb8', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', marginTop: 16, width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Quiz; 