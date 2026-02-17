import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function StudentAttempts() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName") || "Student";
  const studentName = sessionStorage.getItem("studentName") || userName;
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    const userResults = results.filter(r => r.user === userName);
    setAttempts(userResults);
  }, [userName]);

  return (
    <div style={{ padding: 30, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #000000, #1a1a1a)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ marginBottom: 10 }}>📊 My Quiz Attempts</h2>
        <p style={{ color: '#aaa', marginBottom: 30 }}>Student: <strong style={{ color: '#00d4ff' }}>{studentName}</strong> | ID: <strong style={{ color: '#00ff99' }}>{userName}</strong></p>

        {attempts.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #0099ff',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1em', color: '#aaa' }}>You haven't attempted any quizzes yet.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#0099ff',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {attempts.map((attempt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #0099ff',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div style={{ fontSize: '2em' }}>📝</div>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: '#00d4ff' }}>Quiz: {attempt.quizId}</h3>
                  <p style={{ margin: '5px 0', color: '#aaa', fontSize: '0.9em' }}>
                    Attempted: {new Date(attempt.date).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '2em',
                    fontWeight: 'bold',
                    color: '#00ff99',
                    marginBottom: '8px'
                  }}>
                    {attempt.score} / {attempt.total}
                  </div>
                  <div style={{
                    fontSize: '1.1em',
                    color: '#aaa'
                  }}>
                    {((attempt.score / attempt.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            background: '#666',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1em'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
