import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const styles = `
  .scoreboard-container {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: white;
  }

  .scoreboard-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-section {
    margin-bottom: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .header-section h1 {
    font-size: 2em;
    background: linear-gradient(135deg, #00d4ff, #0099ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .back-button {
    padding: 10px 20px;
    background: rgba(0, 153, 255, 0.2);
    border: 1px solid #0099ff;
    color: #00d4ff;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(0, 153, 255, 0.3);
    transform: translateY(-2px);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 10px;
    padding: 25px;
    text-align: center;
  }

  .stat-icon {
    font-size: 2.5em;
    margin-bottom: 10px;
  }

  .stat-label {
    font-size: 0.9em;
    color: #aaa;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 2em;
    color: #00d4ff;
    font-weight: bold;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    border-bottom: 2px solid rgba(0, 153, 255, 0.2);
  }

  .tab-button {
    padding: 12px 20px;
    background: transparent;
    border: none;
    color: #aaa;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
  }

  .tab-button.active {
    color: #00d4ff;
    border-bottom-color: #00d4ff;
  }

  .tab-button:hover {
    color: #00d4ff;
  }

  .quiz-card {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 10px;
    padding: 25px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }

  .quiz-card:hover {
    border-color: #00d4ff;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    transform: translateY(-5px);
  }

  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 15px;
    gap: 20px;
  }

  .quiz-title {
    font-size: 1.5em;
    font-weight: bold;
    color: #00d4ff;
    margin: 0;
  }

  .attempt-count {
    background: rgba(0, 153, 255, 0.2);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    color: #00d4ff;
  }

  .attempt-list {
    display: grid;
    gap: 12px;
  }

  .attempt-item {
    background: rgba(0, 153, 255, 0.05);
    border: 1px solid rgba(0, 153, 255, 0.2);
    border-radius: 8px;
    padding: 15px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 15px;
    align-items: center;
  }

  .attempt-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .attempt-date {
    font-size: 0.9em;
    color: #aaa;
  }

  .attempt-details {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .score-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 100px;
  }

  .score-big {
    font-size: 1.8em;
    font-weight: bold;
    color: #2ecc71;
  }

  .score-max {
    font-size: 0.9em;
    color: #aaa;
  }

  .percentage-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 100px;
  }

  .percentage-big {
    font-size: 1.8em;
    font-weight: bold;
  }

  .percentage-label {
    font-size: 0.9em;
    color: #aaa;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .btn {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9em;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #0099ff, #00d4ff);
    color: #000;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 153, 255, 0.4);
  }

  .btn-secondary {
    background: rgba(0, 153, 255, 0.2);
    color: #00d4ff;
    border: 1px solid #0099ff;
  }

  .btn-secondary:hover {
    background: rgba(0, 153, 255, 0.3);
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #aaa;
  }

  .empty-state-icon {
    font-size: 3em;
    margin-bottom: 20px;
  }

  .performance-bar {
    width: 100%;
    height: 8px;
    background: rgba(0, 153, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 8px;
  }

  .performance-fill {
    height: 100%;
    background: linear-gradient(90deg, #0099ff, #00d4ff);
    transition: width 0.3s ease;
  }

  .rating {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
    margin-top: 8px;
  }

  .rating-excellent {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
    border: 1px solid #2ecc71;
  }

  .rating-good {
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
    border: 1px solid #3498db;
  }

  .rating-fair {
    background: rgba(241, 196, 15, 0.2);
    color: #f1c40f;
    border: 1px solid #f1c40f;
  }

  .rating-poor {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
    border: 1px solid #e74c3c;
  }
`;

export default function StudentScoreboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName") || "Student";
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    const savedResults = JSON.parse(localStorage.getItem("results") || "[]");
    
    setQuizzes(savedQuizzes);
    
    // Filter results for current student
    const studentResults = savedResults.filter(r => r.user === userName);
    setResults(studentResults);
  };

  const getQuizAttempts = (quizId) => {
    return results.filter(r => r.quizId === quizId);
  };

  const getQuestionDetails = (quizId) => {
    const quiz = quizzes.find(q => q.quizId === quizId);
    return quiz ? quiz.questions?.length || 0 : 0;
  };

  const getRating = (percentage) => {
    if (percentage >= 80) return { text: "Excellent! 🌟", class: "rating-excellent" };
    if (percentage >= 60) return { text: "Good 👍", class: "rating-good" };
    if (percentage >= 40) return { text: "Fair 👌", class: "rating-fair" };
    return { text: "Needs Practice 📚", class: "rating-poor" };
  };

  const calculateStats = () => {
    if (results.length === 0) {
      return {
        totalAttempts: 0,
        totalQuizzesTaken: 0,
        averageScore: 0,
        averagePercentage: 0
      };
    }

    const uniqueQuizzes = new Set(results.map(r => r.quizId));
    const scores = results.map(r => r.score || 0);
    const totalPoints = results.map(r => r.totalPoints || 100);
    
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const avgPercentage = (
      results.reduce((sum, r) => sum + ((r.score || 0) / (r.totalPoints || 100)) * 100, 0) / 
      results.length
    ).toFixed(2);

    return {
      totalAttempts: results.length,
      totalQuizzesTaken: uniqueQuizzes.size,
      averageScore: avgScore,
      averagePercentage: avgPercentage
    };
  };

  const getQuizzesWithAttempts = () => {
    return quizzes
      .filter(quiz => getQuizAttempts(quiz.quizId).length > 0)
      .sort((a, b) => {
        const attemptsA = getQuizAttempts(a.quizId);
        const attemptsB = getQuizAttempts(b.quizId);
        return new Date(attemptsB[0]?.date) - new Date(attemptsA[0]?.date);
      });
  };

  const stats = calculateStats();

  return (
    <div className="scoreboard-container">
      <style>{styles}</style>

      <div className="scoreboard-wrapper">
        <div className="header-section">
          <div>
            <h1>🏆 My Scoreboard</h1>
            <p style={{ color: "#aaa", margin: "10px 0 0 0" }}>Welcome, {userName}!</p>
          </div>
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Statistics Section */}
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
          >
            <div className="stat-icon">📝</div>
            <div className="stat-label">Total Attempts</div>
            <div className="stat-value">{stats.totalAttempts}</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon">📚</div>
            <div className="stat-label">Quizzes Completed</div>
            <div className="stat-value">{stats.totalQuizzesTaken}</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon">📊</div>
            <div className="stat-label">Average Score</div>
            <div className="stat-value">{stats.averageScore}</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon">📈</div>
            <div className="stat-label">Average Percentage</div>
            <div className="stat-value">{stats.averagePercentage}%</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📋 All Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            🔍 Quiz Details
          </button>
        </div>

        {/* All Quizzes Tab */}
        {activeTab === "all" && (
          <div>
            {results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No attempts yet</h3>
                <p>Take a quiz to see your scores here</p>
                <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </button>
              </div>
            ) : (
              results
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((result, idx) => {
                  const percentage = ((result.score || 0) / (result.totalPoints || 100)) * 100;
                  const rating = getRating(percentage);
                  const quiz = quizzes.find(q => q.quizId === result.quizId);

                  return (
                    <motion.div
                      key={idx}
                      className="quiz-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="quiz-header">
                        <div className="quiz-title">{quiz?.title || "Unknown Quiz"}</div>
                      </div>

                      <div className="attempt-details">
                        <div className="score-display">
                          <div className="score-big">{result.score || 0}</div>
                          <div className="score-max">of {result.totalPoints || 100}</div>
                        </div>

                        <div className="percentage-display">
                          <div className="percentage-big" style={{ 
                            color: percentage >= 80 ? "#2ecc71" : percentage >= 60 ? "#3498db" : percentage >= 40 ? "#f1c40f" : "#e74c3c"
                          }}>
                            {percentage.toFixed(2)}%
                          </div>
                          <div className="percentage-label">Percentage</div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="attempt-date">
                            🕐 {new Date(result.date || Date.now()).toLocaleDateString()} {new Date(result.date || Date.now()).toLocaleTimeString()}
                          </div>
                          <div style={{ marginTop: "8px" }}>
                            <span className={`rating ${rating.class}`}>
                              {rating.text}
                            </span>
                          </div>
                          <div className="performance-bar">
                            <div className="performance-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="action-buttons" style={{ marginTop: "15px" }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setActiveTab("details");
                            setSelectedQuiz(result.quizId);
                          }}
                        >
                          📖 Review Answer
                        </button>
                      </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        )}

        {/* Quiz Details Tab */}
        {activeTab === "details" && (
          <div>
            {getQuizzesWithAttempts().length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>No quiz details available</h3>
                <p>Take a quiz first to see detailed statistics</p>
              </div>
            ) : (
              getQuizzesWithAttempts().map((quiz, idx) => {
                const attempts = getQuizAttempts(quiz.quizId);
                const scores = attempts.map(a => a.score || 0);
                const percentages = scores.map(s => ((s / (quiz.totalPoints || 100)) * 100).toFixed(2));
                const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
                const avgPercentage = (percentages.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / percentages.length).toFixed(2);
                const bestScore = Math.max(...scores);
                const worstScore = Math.min(...scores);

                return (
                  <motion.div
                    key={idx}
                    className="quiz-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="quiz-header">
                      <div className="quiz-title">{quiz.title}</div>
                      <div className="attempt-count">
                        {attempts.length} Attempt{attempts.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {quiz.description && (
                      <p style={{ color: "#aaa", marginBottom: "15px" }}>
                        {quiz.description}
                      </p>
                    )}

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "15px",
                      marginBottom: "20px",
                      padding: "15px",
                      background: "rgba(0, 153, 255, 0.05)",
                      borderRadius: "8px"
                    }}>
                      <div>
                        <div style={{ fontSize: "0.85em", color: "#aaa", marginBottom: "5px" }}>
                          📊 Questions
                        </div>
                        <div style={{ fontSize: "1.3em", color: "#00d4ff", fontWeight: "bold" }}>
                          {getQuestionDetails(quiz.quizId)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85em", color: "#aaa", marginBottom: "5px" }}>
                          🏆 Best Score
                        </div>
                        <div style={{ fontSize: "1.3em", color: "#2ecc71", fontWeight: "bold" }}>
                          {bestScore}/{quiz.totalPoints || 100}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85em", color: "#aaa", marginBottom: "5px" }}>
                          📉 Worst Score
                        </div>
                        <div style={{ fontSize: "1.3em", color: "#e74c3c", fontWeight: "bold" }}>
                          {worstScore}/{quiz.totalPoints || 100}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85em", color: "#aaa", marginBottom: "5px" }}>
                          📈 Average
                        </div>
                        <div style={{ fontSize: "1.3em", color: "#3498db", fontWeight: "bold" }}>
                          {avgScore}/{quiz.totalPoints || 100}
                        </div>
                      </div>
                    </div>

                    <h4 style={{ marginTop: "20px", marginBottom: "15px", color: "#00d4ff" }}>
                      📋 All Attempts
                    </h4>

                    <div className="attempt-list">
                      {attempts
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((attempt, aidx) => {
                          const percentage = ((attempt.score || 0) / (quiz.totalPoints || 100)) * 100;
                          const rating = getRating(percentage);

                          return (
                            <div key={aidx} className="attempt-item">
                              <div className="attempt-info">
                                <div style={{ fontWeight: "600" }}>
                                  Attempt {attempts.length - aidx}
                                </div>
                                <div className="attempt-date">
                                  {new Date(attempt.date || Date.now()).toLocaleDateString()} {new Date(attempt.date || Date.now()).toLocaleTimeString()}
                                </div>
                                <span className={`rating ${rating.class}`}>
                                  {rating.text}
                                </span>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "1.5em", fontWeight: "bold", color: "#00d4ff" }}>
                                  {attempt.score || 0}/{quiz.totalPoints || 100}
                                </div>
                                <div style={{ fontSize: "0.9em", color: "#aaa" }}>
                                  {percentage.toFixed(2)}%
                                </div>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => navigate(`/review-attempt/${attempt.id || aidx}`)}
                                  style={{ marginTop: "8px", width: "100%" }}
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
