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

  if (showQuiz) return <Quiz studentName={studentName} studentEmail={studentEmail} studentPhone={studentPhone} />;
  if (showInstructions) return <Instructions onStartTest={() => setShowQuiz(true)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#4e54c8', marginBottom: '2.5rem', letterSpacing: '1px' }}>PPMET Mock Test Registration</h1>
      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: '12px 32px',
          fontSize: '1.2rem',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
          color: '#fff',
          border: 'none',
          marginBottom: '2rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        Start Registration
      </button>
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
          <h2 style={{ marginBottom: '1.5rem', color: '#4e54c8' }}>Registration</h2>
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
              Proceed
            </button>
          </form>
        </div>
      )}
      {message && <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: message.includes('success') ? '#43cea2' : '#d7263d' }}>{message}</p>}
    </div>
  );
};

export default Registration; 