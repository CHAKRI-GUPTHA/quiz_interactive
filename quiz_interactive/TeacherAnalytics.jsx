import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizStats, setQuizStats] = useState(null);

  useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    const savedResults = JSON.parse(localStorage.getItem("results") || "[]");
    setQuizzes(savedQuizzes);
    setResults(savedResults);
  }, []);

  const calculateStats = (quizId) => {
    const quizResults = results.filter(r => r.quizId === quizId);
    if (quizResults.length === 0) return null;

    const scores = quizResults.map(r => r.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return {
      totalAttempts: quizResults.length,
      uniqueStudents: new Set(quizResults.map(r => r.user)).size,
      averageScore: averageScore.toFixed(2),
      maxScore,
      minScore,
      attempts: quizResults.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  };

  const handleQuizSelect = (quiz, idx) => {
    setSelectedQuiz(idx);
    setQuizStats(calculateStats(quiz.quizId));
  };

  return (
    <div style={{ padding: 30, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #000000, #1a1a1a)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ marginBottom: 30 }}>📊 Teacher Analytics Dashboard</h2>

        {/* Overall Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0099ff, #00d4ff)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>📝</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>Total Quizzes</div>
            <div style={{ fontSize: '2em', color: '#000', fontWeight: 'bold' }}>{quizzes.length}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>Total Attempts</div>
            <div style={{ fontSize: '2em', color: '#000', fontWeight: 'bold' }}>{results.length}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #9d00ff, #6f00cc)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '8px' }}>👨‍🎓</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>Unique Students</div>
            <div style={{ fontSize: '2em', color: '#fff', fontWeight: 'bold' }}>
              {new Set(results.map(r => r.user)).size}
            </div>
          </div>
        </div>

        {/* Quiz Selection */}
        <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>📋 Select Quiz for Details</h3>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
          {quizzes.length === 0 ? (
            <p style={{ color: '#aaa' }}>No quizzes created yet.</p>
          ) : (
            quizzes.map((quiz, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleQuizSelect(quiz, idx)}
                style={{
                  padding: '15px',
                  background: selectedQuiz === idx ? '#0099ff' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${selectedQuiz === idx ? '#00d4ff' : '#0099ff'}`,
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1em',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <strong>{quiz.subject}</strong> (ID: {quiz.quizId}) • {results.filter(r => r.quizId === quiz.quizId).length} attempts
              </motion.button>
            ))
          )}
        </div>

        {/* Detailed Statistics */}
        {selectedQuiz !== null && quizStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #0099ff',
              borderRadius: '10px',
              padding: '25px',
              marginBottom: '30px'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#00d4ff' }}>
              📊 {quizzes[selectedQuiz]?.subject} - Statistics
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{ background: 'rgba(0,255,153,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #00ff99' }}>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>Total Attempts</div>
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#00ff99' }}>{quizStats.totalAttempts}</div>
              </div>

              <div style={{ background: 'rgba(0,212,255,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #00d4ff' }}>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>Unique Students</div>
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#00d4ff' }}>{quizStats.uniqueStudents}</div>
              </div>

              <div style={{ background: 'rgba(0,153,255,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #0099ff' }}>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>Average Score</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#0099ff' }}>{quizStats.averageScore}</div>
              </div>

              <div style={{ background: 'rgba(255,170,0,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #ffaa00' }}>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>Highest Score</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ffaa00' }}>{quizStats.maxScore}</div>
              </div>

              <div style={{ background: 'rgba(255,107,107,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #ff6b6b' }}>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>Lowest Score</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b6b' }}>{quizStats.minScore}</div>
              </div>
            </div>

            {/* Student Results Table */}
            <h4 style={{ marginBottom: '15px' }}>Student Attempts</h4>
            <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0099ff' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#00d4ff' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#00d4ff' }}>Score</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#00d4ff' }}>Percentage</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#00d4ff' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizStats.attempts.map((attempt, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0,153,255,0.2)' }}>
                      <td style={{ padding: '12px', color: '#aaa' }}>{attempt.user}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#00ff99', fontWeight: 'bold' }}>
                        {attempt.score} / {attempt.total}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#0099ff', fontWeight: 'bold' }}>
                        {((attempt.score / attempt.total) * 100).toFixed(1)}%
                      </td>
                      <td style={{ padding: '12px', color: '#aaa', fontSize: '0.9em' }}>
                        {new Date(attempt.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={() => navigate('/dashboard')}
          style={{
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
