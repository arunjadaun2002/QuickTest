import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};

  if (!results) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#dc2626',
            marginBottom: '1rem'
          }}>No results found</h2>
          <button
            onClick={() => navigate('/test')}
            style={{
              background: 'linear-gradient(90deg, #3b4cb8, #4e54c8)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(78,84,200,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Take Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Gradient Header with Trophy */}
      <div style={{
        background: 'linear-gradient(90deg, #3b4cb8 0%, #4e54c8 100%)',
        borderRadius: '18px 18px 0 0',
        padding: '2rem 2rem 1.5rem 2rem',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(59,76,184,0.10)',
        position: 'relative',
        marginBottom: '-1.5rem',
        zIndex: 2
      }}>
        <FaTrophy size={48} style={{ color: '#ffd700', marginBottom: '0.5rem' }} />
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          margin: 0,
          letterSpacing: 1
        }}>Quiz Results</h1>
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Circular Score Badge */}
          <div style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '2rem',
            color: '#222',
            boxShadow: '0 4px 16px rgba(67,233,123,0.15)',
            border: '4px solid #fff',
            position: 'relative'
          }}>
            {results.obtainedMarks} <span style={{ fontSize: '1.1rem', color: '#555', fontWeight: 600 }}>/ {results.totalMarks}</span>
            <span style={{ fontSize: '1rem', color: '#2d3748', fontWeight: 600, marginTop: 2 }}>Score</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Percentage</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffd700' }}>{Math.round((results.obtainedMarks / results.totalMarks) * 100)}%</div>
          </div>
        </div>
        <div style={{ marginTop: '1.2rem', color: '#d1fae5', fontWeight: 600, fontSize: '1.1rem' }}>
          Your result has been saved!
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '0 0 18px 18px',
        padding: '2.5rem 2rem 2rem 2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        marginTop: 0
      }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          marginTop: '-2.5rem',
          zIndex: 1,
          position: 'relative'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #c7d2fe',
            boxShadow: '0 2px 8px rgba(59,76,184,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            ':hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 6px 20px rgba(59,76,184,0.12)'
            }
          }}>
            Total Questions
            <div style={{ fontSize: '2.2rem', color: '#3b4cb8', marginTop: 8 }}>{results.totalMarks}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #f0fff4 100%)',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #6ee7b7',
            boxShadow: '0 2px 8px rgba(16,185,129,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            ':hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 6px 20px rgba(16,185,129,0.12)'
            }
          }}>
            Correct Answers
            <div style={{ fontSize: '2.2rem', color: '#059669', marginTop: 8 }}>{results.obtainedMarks}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #fde68a',
            boxShadow: '0 2px 8px rgba(253,230,138,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            ':hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 6px 20px rgba(253,230,138,0.12)'
            }
          }}>
            Score Percentage
            <div style={{ fontSize: '2.2rem', color: '#eab308', marginTop: 8 }}>{Math.round((results.obtainedMarks / results.totalMarks) * 100)}%</div>
          </div>
        </div>

        {/* Question-wise Analysis */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          color: '#1e293b',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.75rem',
          marginTop: '2rem'
        }}>Question-wise Analysis</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.questionAnalysis.map((q, index) => (
            <div key={index} style={{
              background: q.isCorrect ? 'linear-gradient(90deg, #d1fae5 0%, #f0fff4 100%)' : 'linear-gradient(90deg, #fee2e2 0%, #fff1f2 100%)',
              padding: '1.5rem',
              borderRadius: '14px',
              border: q.isCorrect ? '1px solid #6ee7b7' : '1px solid #fecaca',
              boxShadow: q.isCorrect ? '0 2px 8px rgba(16,185,129,0.06)' : '0 2px 8px rgba(239,68,68,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              ':hover': {
                transform: 'translateY(-2px) scale(1.01)',
                boxShadow: q.isCorrect ? '0 6px 20px rgba(16,185,129,0.12)' : '0 6px 20px rgba(239,68,68,0.12)'
              }
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0
                }}>Q{index + 1}: {q.question}</h3>
                <span style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  background: q.isCorrect ? '#34d399' : '#f87171',
                  color: '#fff',
                  fontSize: '1rem',
                  boxShadow: q.isCorrect ? '0 2px 8px rgba(16,185,129,0.10)' : '0 2px 8px rgba(239,68,68,0.10)'
                }}>
                  {q.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.2rem'
              }}>
                {q.options.map((option, optIndex) => (
                  <div key={optIndex} style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: option === q.correctAnswer ? '#bbf7d0' : option === q.userAnswer ? '#fecaca' : '#f1f5f9',
                    border: '2px solid',
                    borderColor: option === q.correctAnswer ? '#22c55e' : option === q.userAnswer ? '#f87171' : '#e2e8f0',
                    color: '#334155',
                    fontWeight: option === q.correctAnswer ? 700 : 500,
                    fontSize: '1.05rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    {option}
                    {option === q.correctAnswer && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        color: '#16a34a',
                        fontWeight: 700
                      }}>✓</span>
                    )}
                    {option === q.userAnswer && !q.isCorrect && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        color: '#dc2626',
                        fontWeight: 700
                      }}>✗</span>
                    )}
                  </div>
                ))}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                background: '#f1f5f9',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '1.05rem',
                fontWeight: 600
              }}>
                <div>
                  <span style={{ color: '#475569' }}>Your Answer: </span>
                  <span style={{
                    color: q.isCorrect ? '#16a34a' : '#dc2626',
                    fontWeight: 700
                  }}>
                    {q.userAnswer || 'Not Answered'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#475569' }}>Correct Answer: </span>
                  <span style={{
                    color: '#16a34a',
                    fontWeight: 700
                  }}>
                    ({q.answer}) {q.correctAnswer}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            onClick={() => navigate('/test')}
            style={{
              background: 'linear-gradient(90deg, #3b4cb8, #4e54c8)',
              color: '#fff',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(78,84,200,0.3)',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem',
              letterSpacing: 1
            }}
          >
            Take Test Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 