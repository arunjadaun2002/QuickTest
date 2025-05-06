import React, { useState } from 'react';

const Instructions = ({ onStartTest }) => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      {/* Header Bar */}
      <div style={{ background: '#3b4cb8', color: '#fff', padding: '1.2rem 0', textAlign: 'center', fontSize: '2rem', fontWeight: 700, letterSpacing: 1 }}>
        Test Instructions:
      </div>
      <div style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '2.5rem 2.5rem', position: 'relative' }}>
        <h2 style={{ color: '#222', marginBottom: '0.5rem', fontWeight: 700 }}>Instruction For Online Test</h2>
        <div style={{ color: '#e67c1b', fontWeight: 600, marginBottom: 18, fontSize: 16 }}>
          Please Read The Instructions Carefully Before Starting The Test.
        </div>
        <ol style={{ fontSize: '1.08rem', marginBottom: '1.5rem', lineHeight: 1.7, color: '#222' }}>
          <li>Click Start Test On Bottom Of Your Screen To Begin The Test.</li>
          <li>The Clock Has Been Set At Server And Count Down Timer At The Top Right Side Of The Screen Will Display Left Out Time To Closure From Where You Can Monitor Time You Have To Complete The Exam.</li>
          <li>Click One Of The Answer, Simply Click The Desired Option Button.</li>
          <li>Candidate Can Change Their Response Of Attempted Answer Anytime During Examination Slot Time By Clicking Another Answer Which Candidates Want To Change An Answer. Click To Remove Incorrect Answer, Click The Desired Option Button.</li>
          <li>Click On Next To Save The Answer And Moving To The Next Question. The Next Question Will Automatically Be Displayed.</li>
          <li>Click On Mark For Review To Review Your Answer At Later Stage.</li>
          <li>To Select A Question, Click On The Question Number On The Right Side Of The Screen.</li>
          <li>The Colour Coded Diagram On The Left Side Of The Screen Shows The Status Of The Question.</li>
        </ol>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, background: '#e0e0e0', color: '#222', borderRadius: 6, fontWeight: 700, fontSize: 18, textAlign: 'center', lineHeight: '32px' }}>1</span>
            <span>You Have Not Visited The Question Yet.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, background: '#f44336', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 18, textAlign: 'center', lineHeight: '32px' }}>3</span>
            <span>You Have Not Answered The Question.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, background: '#4caf50', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 18, textAlign: 'center', lineHeight: '32px' }}>5</span>
            <span>You Have Answered The Question.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, background: '#ff9800', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 18, textAlign: 'center', lineHeight: '32px' }}>7</span>
            <span>You Have NOT Answered The Question, But Have Marked The Question For Review.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, background: '#3b4cb8', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 18, textAlign: 'center', lineHeight: '32px' }}>9</span>
            <span>You Have Answered The Question, But Marked It For Review.</span>
          </div>
        </div>
        <ol style={{ fontSize: '1.08rem', marginBottom: '1.5rem', lineHeight: 1.7, color: '#222' }}>
          <li>Candidate Will Be Allowed To Shuffle Between Questions Anytime During The Examination As Per Their Convenience.</li>
          <li>All The Answered Questions Will Be Counted For Calculating The Final Score.</li>
          <li>Do Not Click Final SUBMIT On The Left Corner Of The Screen Unless You Have Completed The Exam. In Case You Click Final SUBMIT You Will Not Be Permitted To Continue.</li>
          <li>Score Obtained Will Be Displayed Immediately After The Test.</li>
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18, fontSize: 16 }}>
          <input type="checkbox" id="agree" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ width: 22, height: 22, marginRight: 10 }} />
          <label htmlFor="agree"><b>The Computer Provided To Me Is In Proper Working Condition.</b><br />I Have Read And Understood The Instructions Given Above.</label>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={onStartTest}
            disabled={!checked}
            style={{
              padding: '16px 60px',
              fontSize: '1.3rem',
              borderRadius: 10,
              background: checked ? 'linear-gradient(90deg, #3b4cb8, #43cea2)' : '#bdbdbd',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: checked ? 'pointer' : 'not-allowed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              letterSpacing: 1
            }}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 