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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }}>
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
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', margin: '10px 0', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input name="phone" placeholder="WhatsApp Number" value={form.phone} onChange={handleChange} required style={{ width: '100%', padding: '12px', margin: '10px 0', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '12px', margin: '10px 0', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} required style={{ width: '100%', padding: '12px', margin: '10px 0', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc' }} />
                <button type="submit" style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.2rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #43cea2, #185a9d)',
                  color: '#fff',
                  border: 'none',
                  marginTop: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  Start Test
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
    </div>
  );
};

export default Registration; 