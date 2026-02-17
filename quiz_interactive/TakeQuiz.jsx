import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function TakeQuiz() {
  const { index } = useParams();
  const quizIndex = parseInt(index);
  const navigate = useNavigate();

  const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
  const quiz = quizzes[quizIndex];

  const userName = sessionStorage.getItem("userName") || "Student";

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState((quiz?.timer || 0) * 60);
  const [passwordPrompt, setPasswordPrompt] = useState(true);
  const [quizPassword, setQuizPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  // Check for previous attempts and if max attempts exceeded
  useEffect(() => {
    if (!quiz) return;
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    const userAttempts = results.filter(r => r.user === userName && r.quizId === quiz.quizId);
    if (userAttempts.length > 0) {
      const maxAttempts = quiz.maxAttempts || 1;
      const attemptsRemaining = maxAttempts - userAttempts.length;
      
      setPreviousAttempt({
        count: userAttempts.length,
        lastAttempt: userAttempts[userAttempts.length - 1],
        allAttempts: userAttempts,
        maxAttempts: maxAttempts,
        attemptsRemaining: Math.max(0, attemptsRemaining),
        exhausted: attemptsRemaining <= 0
      });
    }
  }, [quiz, userName]);

  useEffect(() => {
    if (!quiz) return;
    if (!quiz.questions || quiz.questions.length === 0) return;
    setTotal(quiz.questions.reduce((s, q) => s + (q.points || 1), 0));
  }, [quiz]);

  // Start countdown if timer present
  useEffect(() => {
    if (!quiz || !quiz.timer || !quizStarted) return;
    setTimeLeft(quiz.timer * 60);
    const t = setInterval(() => {
      setTimeLeft((t0) => {
        if (t0 <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return t0 - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, quizStarted]);

  if (!quiz) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        Quiz not found. <button onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    );
  }

  const handlePasswordSubmit = () => {
    if (quizPassword === quiz.password) {
      setPasswordPrompt(false);
      setQuizStarted(true);
      setPasswordError("");
    } else {
      setPasswordError("❌ Invalid Password! Please try again.");
      setQuizPassword("");
    }
  };

  const handleSelect = (qId, optIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    const qs = quiz.questions || [];
    let s = 0;
    qs.forEach((q) => {
      const sel = answers[q.id];
      if (typeof sel !== 'undefined' && sel === q.correctAnswer) {
        s += q.points || 1;
      }
    });

    setScore(s);
    setSubmitted(true);

    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.push({
      quizId: quiz.quizId,
      user: userName,
      score: s,
      total: qs.reduce((t, q) => t + (q.points || 1), 0),
      answers,
      date: new Date().toISOString()
    });
    localStorage.setItem('results', JSON.stringify(results));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: 30, color: 'white', minHeight: '100vh' }}>
      {/* ✅ Password Protection Modal */}
      {passwordPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '2px solid #0099ff',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              minWidth: '350px',
              boxShadow: '0 10px 40px rgba(0, 153, 255, 0.3)'
            }}
          >
            <h2 style={{ marginBottom: '20px', color: '#00d4ff' }}>🔐 Enter Quiz Password</h2>
            <input
              type="password"
              placeholder="Enter the quiz password"
              value={quizPassword}
              onChange={(e) => setQuizPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #0099ff',
                borderRadius: '8px',
                color: 'white',
                marginBottom: '15px',
                fontSize: '1em'
              }}
              autoFocus
            />
            {passwordError && <p style={{ color: '#ff6b6b', marginBottom: '15px' }}>{passwordError}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePasswordSubmit}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#0099ff',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}
              >
                Verify
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ Attempts Info Popup or Exhausted Attempts */}
      {!passwordPrompt && previousAttempt && !submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: `2px solid ${previousAttempt.exhausted ? '#ff6b6b' : '#ffaa00'}`,
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              minWidth: '400px',
              boxShadow: `0 10px 40px rgba(${previousAttempt.exhausted ? '255, 107, 107' : '255, 170, 0'}, 0.3)`
            }}
          >
            {previousAttempt.exhausted ? (
              <>
                <h2 style={{ marginBottom: '20px', color: '#ff6b6b' }}>❌ No More Attempts Available</h2>
                <div style={{ textAlign: 'left', marginBottom: '20px', background: 'rgba(255,107,107,0.1)', padding: '20px', borderRadius: '8px' }}>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>📊 Total Attempts Used:</strong> {previousAttempt.count} / {previousAttempt.maxAttempts}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>🎯 Best Score:</strong> <span style={{ color: '#00ff99', fontSize: '1.2em' }}>{Math.max(...previousAttempt.allAttempts.map(a => a.score))}</span> / {previousAttempt.allAttempts[0].total}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>📅 Last Attempt:</strong> {new Date(previousAttempt.lastAttempt.date).toLocaleString()}
                  </p>
                </div>
                <p style={{ color: '#ff6b6b', marginBottom: '20px', fontSize: '0.95em', fontWeight: 'bold' }}>
                  You have exhausted all your attempts for this quiz!
                </p>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: '20px', color: '#ffaa00' }}>ℹ️ Quiz Already Attempted</h2>
                <div style={{ textAlign: 'left', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>📊 Attempts Remaining:</strong> <span style={{ color: '#00ff99', fontSize: '1.2em' }}>{previousAttempt.attemptsRemaining}</span> / {previousAttempt.maxAttempts}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>🎯 Last Score:</strong> <span style={{ color: '#00d4ff', fontSize: '1.1em' }}>{previousAttempt.lastAttempt.score}</span> / {previousAttempt.lastAttempt.total}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>📅 Last Attempt:</strong> {new Date(previousAttempt.lastAttempt.date).toLocaleString()}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>🏆 Best Score:</strong> {Math.max(...previousAttempt.allAttempts.map(a => a.score))} / {previousAttempt.allAttempts[0].total}
                  </p>
                </div>
                <p style={{ color: '#ffaa00', marginBottom: '20px', fontSize: '0.95em' }}>
                  ✅ You can take this quiz again! Click continue to attempt again.
                </p>
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px 24px',
                  background: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}
              >
                Back to Dashboard
              </button>
              {!previousAttempt.exhausted && (
                <button
                  onClick={() => setPreviousAttempt(null)}
                  style={{
                    padding: '12px 24px',
                    background: '#0099ff',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1em'
                  }}
                >
                  Continue to Quiz
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ Quiz Content - Only show if password verified and attempts not exhausted */}
      {!passwordPrompt && (!previousAttempt || !previousAttempt.exhausted) ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(0,153,255,0.1)', borderRadius: '8px', border: '1px solid #0099ff' }}>
            <p style={{ margin: '0 0 5px', color: '#00d4ff', fontWeight: 'bold' }}>
              📊 Attempts: {previousAttempt ? `${previousAttempt.count}/${previousAttempt.maxAttempts}` : `0/${quiz.maxAttempts || 1}`}
              {previousAttempt && !previousAttempt.exhausted && <span style={{ marginLeft: '15px', color: '#00ff99' }}>({previousAttempt.attemptsRemaining} remaining)</span>}
            </p>
          </div>
          <h2>{quiz.subject} — Take Quiz</h2>
          <p>Timer: {quiz.timer || 'No timer'} minutes</p>
          {quiz.timer > 0 && <p>Time left: {formatTime(timeLeft)}</p>}

          {!submitted ? (
            <div style={{ marginTop: 20 }}>
              {(quiz.questions || []).map((q) => (
                <div key={q.id} style={{ marginBottom: 18, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                  <div style={{ marginBottom: 8 }}><strong>Q{q.id}.</strong> {q.text}</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{ display: 'block', cursor: 'pointer', padding: 8, borderRadius: 6, background: answers[q.id] === i ? 'rgba(0,255,153,0.08)' : 'transparent' }}>
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={answers[q.id] === i}
                          onChange={() => handleSelect(q.id, i)}
                          style={{ marginRight: 8 }}
                        />
                        {String.fromCharCode(65 + i)}) {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={handleSubmit} style={{ padding: '10px 18px', background: '#00ff99', border: 'none', borderRadius: 6 }}>Submit</button>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 18px', background: '#666', border: 'none', borderRadius: 6 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <h3>Result</h3>
              <p style={{ fontSize: '1.2em' }}>Score: <strong style={{ color: '#00ff99' }}>{score}</strong> / {total}</p>
              <p style={{ fontSize: '1.1em', color: '#aaa' }}>Percentage: <strong style={{ color: '#00d4ff' }}>{((score / total) * 100).toFixed(2)}%</strong></p>

              <div style={{ marginTop: 20 }}>
                <h4>Review</h4>
                {(quiz.questions || []).map((q) => {
                  const sel = answers[q.id];
                  const correct = q.correctAnswer;
                  return (
                    <div key={q.id} style={{ marginBottom: 12, padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                      <div><strong>Q{q.id}.</strong> {q.text}</div>
                      <div style={{ marginTop: 8 }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ padding: 6, borderRadius: 4, marginBottom: 6, background: i === correct ? 'rgba(0,255,153,0.08)' : (i === sel ? 'rgba(255,107,107,0.06)' : 'transparent') }}>
                            {String.fromCharCode(65 + i)}) {opt} {i === correct && <span style={{ color: '#00ff99', marginLeft: 8 }}>✓</span>}{i === sel && i !== correct && <span style={{ color: '#ff6b6b', marginLeft: 8 }}>Your answer</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 18px', background: '#0099ff', border: 'none', borderRadius: 6 }}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
