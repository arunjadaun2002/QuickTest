import axios from 'axios';
import React, { useState } from 'react';
import Instructions from './Instructions';
import Quiz from './Quiz';

const Registration = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' });
  const [message, setMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [preFetchedQuestions, setPreFetchedQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('https://quicktest-backend.onrender.com/register', form);
      setMessage(res.data.message);
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', city: '' });
      setStudentName(form.name);
      setStudentEmail(form.email);
      setStudentPhone(form.phone);
      setShowInstructions(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  if (showQuiz) {
    console.log('Rendering Quiz component with:', {
      studentName,
      studentEmail,
      studentPhone,
      preFetchedQuestions
    });
    return <Quiz 
      studentName={studentName} 
      studentEmail={studentEmail} 
      studentPhone={studentPhone} 
      preFetchedQuestions={preFetchedQuestions}
    />;
  }
  if (showInstructions) {
    console.log('Rendering Instructions component');
    return <Instructions onStartTest={(questions) => {
      console.log('Instructions onStartTest called with questions:', questions);
      setPreFetchedQuestions(questions);
      setShowQuiz(true);
    }} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff5757 0%, #9e005d 100%)',
      position: 'relative'
    }}>
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            width: '80%',
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #43cea2, #185a9d)',
                borderRadius: '2px',
                animation: 'loading 2s ease-in-out infinite'
              }} />
            </div>
            <div style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Starting Test...
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              Please wait while we prepare your test environment
            </div>
          </div>
        </div>
      )}

      {showWelcome ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 480,
          padding: '3rem 2rem',
          borderRadius: 32,
          background: 'rgba(255,255,255,0.0)',
          boxShadow: 'none',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '2.5rem',
            letterSpacing: '1px',
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 2px 16px rgba(0,0,0,0.10)'
          }}>
            Welcome to<br />
            Online Mock Test<br />
            For PPMET
          </h1>
          <button
            onClick={() => {
              setShowWelcome(false);
              setShowForm(true);
            }}
            style={{
              padding: '18px 48px',
              fontSize: '1.5rem',
              borderRadius: '32px',
              background: '#fff',
              color: '#e6006d',
              border: 'none',
              marginBottom: '2rem',
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '1px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              transition: 'background 0.2s, box-shadow 0.2s',
              outline: 'none',
            }}
          >
            Next
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 480,
          padding: '0',
          borderRadius: 32,
          background: 'rgba(255,255,255,0.0)',
          boxShadow: 'none',
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: 600,
            marginBottom: '2.5rem',
            letterSpacing: '1px',
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 2px 16px rgba(0,0,0,0.10)'
          }}>
            Register to <span style={{ fontWeight: 800 }}>Start Test</span>
          </h1>
          {showForm && (
            <div style={{
              background: '#fff',
              padding: '2.5rem 2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              minWidth: '340px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#4e54c8', fontWeight: 800, fontSize: '2rem' }}>Registration</h2>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <input 
                  name="name" 
                  placeholder="Name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    margin: '10px 0', 
                    fontSize: '1.1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }} 
                />
                <input 
                  name="phone" 
                  placeholder="WhatsApp Number" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    margin: '10px 0', 
                    fontSize: '1.1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }} 
                />
                <input 
                  name="email" 
                  placeholder="Email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    margin: '10px 0', 
                    fontSize: '1.1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }} 
                />
                <input 
                  name="city" 
                  placeholder="City" 
                  value={form.city} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    margin: '10px 0', 
                    fontSize: '1.1rem', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }} 
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.2rem',
                    borderRadius: '8px',
                    background: isLoading 
                      ? 'linear-gradient(90deg, #43cea2, #185a9d)' 
                      : 'linear-gradient(90deg, #43cea2, #185a9d)',
                    color: '#fff',
                    border: 'none',
                    marginTop: '1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    opacity: isLoading ? 0.8 : 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg 
                        className="animate-spin" 
                        style={{ 
                          width: '20px', 
                          height: '20px',
                          animation: 'spin 1s linear infinite'
                        }} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Starting Test...
                    </>
                  ) : (
                    'Start Test'
                  )}
                </button>
              </form>
            </div>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '18px 48px',
                fontSize: '1.5rem',
                borderRadius: '32px',
                background: '#fff',
                color: '#e6006d',
                border: 'none',
                margin: '2rem 0',
                cursor: 'pointer',
                fontWeight: 700,
                letterSpacing: '1px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
            >
              Start Registration
            </button>
          )}
          {message && <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: message.includes('success') ? '#43cea2' : '#d7263d' }}>{message}</p>}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Registration; 