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
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 min default
  const [submitted, setSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timerRef = useRef();
  const resultRef = useRef(null);

  const handleSubmit = async () => {
    setSubmitted(true);
    clearInterval(timerRef.current);
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
    const handleVisibility = () => {
      if (document.hidden) {
        setWarnings((w) => {
          if (w < 1) setShowWarning(true);
          if (w + 1 >= 2) {
            setShowWarning(false);
            setAutoSubmitted(true);
            handleSubmit();
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
          }
          return w + 1;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
        {autoSubmitted && <div style={{ color: '#d7263d', fontWeight: 700, marginBottom: 16 }}>Test auto-submitted due to exceeding tab switch limit.</div>}
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
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
          {showWarning && (
            <div style={{ marginTop: 24, color: '#d7263d', fontWeight: 700, fontSize: 18, background: '#fff3e0', padding: 16, borderRadius: 8, border: '1px solid #ff9800' }}>
              Warning: Tab switch or minimize detected!<br />
              You have {2 - warnings} warning(s) left before auto-submit.
            </div>
          )}
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