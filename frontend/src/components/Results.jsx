import React from 'react';
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
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1e293b'
        }}>Test Results</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#475569'
            }}>Total Questions</h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#3b4cb8'
            }}>{results.totalMarks}</p>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#475569'
            }}>Correct Answers</h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#3b4cb8'
            }}>{results.obtainedMarks}</p>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#475569'
            }}>Score Percentage</h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#3b4cb8'
            }}>{Math.round((results.obtainedMarks / results.totalMarks) * 100)}%</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#1e293b',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '0.75rem'
          }}>Question-wise Analysis</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {results.questionAnalysis.map((q, index) => (
              <div key={index} style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: '#1e293b'
                  }}>Question {index + 1}</h3>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    background: q.isCorrect ? '#dcfce7' : '#fee2e2',
                    color: q.isCorrect ? '#166534' : '#991b1b'
                  }}>
                    {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p style={{
                  fontSize: '1.1rem',
                  color: '#334155',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6
                }}>{q.question}</p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 
                        option === q.correctAnswer ? '#dcfce7' :
                        option === q.userAnswer ? '#fee2e2' : '#f1f5f9',
                      border: '1px solid',
                      borderColor: 
                        option === q.correctAnswer ? '#86efac' :
                        option === q.userAnswer ? '#fecaca' : '#e2e8f0',
                      color: '#334155'
                    }}>
                      <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      {option}
                      {option === q.correctAnswer && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          color: '#166534',
                          fontWeight: 600
                        }}>✓</span>
                      )}
                      {option === q.userAnswer && !q.isCorrect && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          color: '#991b1b',
                          fontWeight: 600
                        }}>✗</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f1f5f9',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Your Answer: </span>
                    <span style={{
                      color: q.isCorrect ? '#166534' : '#991b1b',
                      fontWeight: 600
                    }}>
                      {q.userAnswer || 'Not Answered'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Correct Answer: </span>
                    <span style={{
                      color: '#166534',
                      fontWeight: 600
                    }}>
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/test')}
            style={{
              background: 'linear-gradient(90deg, #3b4cb8, #4e54c8)',
              color: '#fff',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 12px rgba(78,84,200,0.3)',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem'
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