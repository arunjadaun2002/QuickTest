import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Instructions = ({ onStartTest }) => {
  const [checked, setChecked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);

  // Pre-fetch questions when Instructions component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://quicktest-backend.onrender.com/quiz');
        console.log('Successfully fetched questions:', response.data);
        setQuestions(response.data.questions || []);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error pre-fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  // Pre-request fullscreen when checkbox is checked
  useEffect(() => {
    if (checked && !isFullScreen) {
      const requestFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        } catch (error) {
          console.error('Error requesting fullscreen:', error);
        }
      };
      requestFullscreen();
    }
  }, [checked, isFullScreen]);

  useEffect(() => {
    // Check if already in fullscreen
    const checkFullScreen = () => {
      const isFullScreenActive = 
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      
      setIsFullScreen(isFullScreenActive);
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
  }, []);

  // Add tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            // Force exit fullscreen after 3 violations
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            }
          } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleStartTest = async () => {
    if (!isDataReady) {
      console.log('Data not ready yet');
      return;
    }

    setIsLoading(true);
    try {
      // Pass pre-fetched questions to the test component
      onStartTest(questions);
    } catch (error) {
      console.error('Error starting test:', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      padding: '2rem 1rem'
    }}>
      {/* Header Bar */}
      <div style={{ 
        background: 'linear-gradient(90deg, #3b4cb8 0%, #4e54c8 100%)',
        color: '#fff',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '2.2rem',
        fontWeight: 700,
        letterSpacing: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        Test Instructions
      </div>

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
          boxShadow: '0 4px 12px rgba(255,68,68,0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          Warning: Tab switching detected! {3 - warnings} warnings remaining before test cancellation.
        </div>
      )}

      {!isFullScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '1.5rem',
          textAlign: 'center',
          padding: '2rem',
          backdropFilter: 'blur(5px)'
        }}>
          <h2 style={{ 
            marginBottom: '1.5rem',
            fontSize: '2.5rem',
            background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Full Screen Required</h2>
          <p style={{ marginBottom: '1rem', fontSize: '1.2rem', opacity: 0.9 }}>Please enable full screen mode to continue with the test.</p>
          <p style={{ color: '#ff4444', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Warning: {3 - warnings} violations remaining before auto-submit
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
              padding: '1rem 2.5rem',
              fontSize: '1.2rem',
              background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(78,84,200,0.3)',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(78,84,200,0.4)'
              }
            }}
          >
            Enable Full Screen
          </button>
        </div>
      )}

      <div style={{ 
        maxWidth: 1000, 
        margin: '0 auto', 
        background: '#fff', 
        borderRadius: 20, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
        padding: '3rem',
        position: 'relative',
        textAlign: 'left'
      }}>
        <h2 style={{ 
          color: '#2d3748', 
          marginBottom: '1rem', 
          fontWeight: 700,
          fontSize: '2rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '1rem'
        }}>
          Instructions For Online Test
        </h2>
        
        <div style={{ 
          color: '#e67c1b', 
          fontWeight: 600, 
          marginBottom: '2rem', 
          fontSize: '1.1rem',
          background: '#fff8e1',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ffe0b2'
        }}>
          Please Read The Instructions Carefully Before Starting The Test.
        </div>

        <div style={{ 
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            color: '#2d3748', 
            marginBottom: '1rem',
            fontSize: '1.2rem',
            fontWeight: 600
          }}>Instructions</h3>
          <ol style={{ 
            fontSize: '1.05rem', 
            lineHeight: 1.8, 
            color: '#4a5568',
            paddingLeft: '1.5rem',
            textAlign: 'left',
            margin: 0
          }}>
            <li>Each question carries 4 marks and No negative marking.</li>
            <li>Click start test on bottom of your screen to begin the test.</li>
            <li>The clock has been set at server and count down timer at the top right side of the screen will display left out time to closure.</li>
            <li>Click one of the answer, simply click the desired option button.</li>
            <li>Candidate can change their response of attempted answer anytime during examination slot time.</li>
            <li>Click on next to save the answer and move to the next question.</li>
            <li>Click on mark for review to review your answer at a later stage.</li>
            <li>To select a question, click on the question number on the right side.</li>
            <li>Candidate will be allowed to shuffle between questions anytime.</li>
          </ol>
        </div>

        {/* Legend */}
        <div style={{ 
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            color: '#2d3748', 
            marginBottom: '1rem',
            fontSize: '1.2rem',
            fontWeight: 600
          }}>Question Status Legend</h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: 32, 
                height: 32, 
                background: '#e0e0e0', 
                color: '#222', 
                borderRadius: 6, 
                fontWeight: 700, 
                fontSize: 18, 
                textAlign: 'center', 
                lineHeight: '32px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>1</span>
              <span style={{ color: '#4a5568' }}>Not Visited</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: 32, 
                height: 32, 
                background: '#f44336', 
                color: '#fff', 
                borderRadius: 6, 
                fontWeight: 700, 
                fontSize: 18, 
                textAlign: 'center', 
                lineHeight: '32px',
                boxShadow: '0 2px 4px rgba(244,67,54,0.2)'
              }}>3</span>
              <span style={{ color: '#4a5568' }}>Not Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: 32, 
                height: 32, 
                background: '#4caf50', 
                color: '#fff', 
                borderRadius: 6, 
                fontWeight: 700, 
                fontSize: 18, 
                textAlign: 'center', 
                lineHeight: '32px',
                boxShadow: '0 2px 4px rgba(76,175,80,0.2)'
              }}>5</span>
              <span style={{ color: '#4a5568' }}>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: 32, 
                height: 32, 
                background: '#ff9800', 
                color: '#fff', 
                borderRadius: 6, 
                fontWeight: 700, 
                fontSize: 18, 
                textAlign: 'center', 
                lineHeight: '32px',
                boxShadow: '0 2px 4px rgba(255,152,0,0.2)'
              }}>7</span>
              <span style={{ color: '#4a5568' }}>Marked for Review</span>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2rem', 
          fontSize: '1.05rem',
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <input 
            type="checkbox" 
            id="agree" 
            checked={checked} 
            onChange={e => setChecked(e.target.checked)} 
            style={{ 
              width: 24, 
              height: 24, 
              marginRight: '1rem',
              cursor: 'pointer'
            }} 
          />
          <label htmlFor="agree" style={{ color: '#4a5568' }}>
            <b style={{ color: '#2d3748' }}>I confirm that:</b><br />
            The computer provided to me is in proper working condition and I have read and understood all the instructions given above.
          </label>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleStartTest}
            disabled={!checked || isLoading || !isDataReady}
            style={{
              padding: '1rem 4rem',
              fontSize: '1.2rem',
              borderRadius: '12px',
              background: checked && !isLoading && isDataReady
                ? 'linear-gradient(90deg, #3b4cb8, #4e54c8)' 
                : '#e2e8f0',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: checked && !isLoading && isDataReady ? 'pointer' : 'not-allowed',
              boxShadow: checked && !isLoading && isDataReady
                ? '0 4px 12px rgba(78,84,200,0.3)' 
                : 'none',
              transition: 'all 0.3s ease',
              transform: checked && !isLoading && isDataReady ? 'translateY(0)' : 'none',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ opacity: 0 }}>Start Test</span>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  border: '3px solid #ffffff',
                  borderRadius: '50%',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }} />
              </>
            ) : !isDataReady ? (
              'Loading Questions...'
            ) : (
              'Start Test'
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translate(-50%, -100%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, 0);
              opacity: 1;
            }
          }
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Instructions; 