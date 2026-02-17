import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const styles = `
  .quiz-management-container {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: white;
  }

  .quiz-management-wrapper {
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

  .quiz-status {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
  }

  .status-created {
    background: rgba(255, 165, 0, 0.2);
    color: #ffa500;
    border: 1px solid #ffa500;
  }

  .status-published {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
    border: 1px solid #2ecc71;
  }

  .status-attempts {
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
    border: 1px solid #3498db;
  }

  .quiz-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 153, 255, 0.05);
    border-radius: 8px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
  }

  .detail-label {
    font-size: 0.85em;
    color: #aaa;
    margin-bottom: 5px;
  }

  .detail-value {
    font-size: 1em;
    color: #00d4ff;
    font-weight: 600;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 15px;
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

  .btn-danger {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
    border: 1px solid #e74c3c;
  }

  .btn-danger:hover {
    background: rgba(231, 76, 60, 0.3);
  }

  .btn-success {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
    border: 1px solid #2ecc71;
  }

  .btn-success:hover {
    background: rgba(46, 204, 113, 0.3);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-title {
    font-size: 1.5em;
    margin-bottom: 20px;
    color: #00d4ff;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    color: #00d4ff;
    font-weight: 600;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #0099ff;
    border-radius: 5px;
    color: white;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    background: rgba(0, 153, 255, 0.1);
    border-color: #00d4ff;
  }

  .modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .modal-buttons button {
    flex: 1;
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

  .attempts-list {
    background: rgba(0, 153, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    max-height: 300px;
    overflow-y: auto;
  }

  .attempt-item {
    padding: 10px;
    border-bottom: 1px solid rgba(0, 153, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .attempt-info {
    flex: 1;
  }

  .attempt-score {
    color: #2ecc71;
    font-weight: 600;
    margin-right: 10px;
  }

  .warning-message {
    background: rgba(255, 165, 0, 0.1);
    border: 1px solid #ffa500;
    color: #ffa500;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    font-size: 0.9em;
  }

  .success-message {
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid #2ecc71;
    color: #2ecc71;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    font-size: 0.9em;
  }

  .error-message {
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    font-size: 0.9em;
  }
`;

export default function TeacherQuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [selectedQuizzAttempts, setSelectedQuizzAttempts] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    setQuizzes(savedQuizzes);
    
    // Load attempts for each quiz
    const results = JSON.parse(localStorage.getItem("results") || "[]");
    const attemptsMap = {};
    savedQuizzes.forEach(quiz => {
      attemptsMap[quiz.quizId] = results.filter(r => r.quizId === quiz.quizId);
    });
    setQuizAttempts(attemptsMap);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      password: quiz.password,
      maxAttempts: quiz.maxAttempts || 1,
      timeLimit: quiz.timeLimit || 0,
    });
    setMessage("");
  };

  const handleUpdateQuiz = () => {
    if (!formData.title || !formData.password) {
      setMessage("Title and Password are required!");
      return;
    }

    const updated = quizzes.map(q => {
      if (q.quizId === editingQuiz.quizId) {
        return {
          ...q,
          title: formData.title,
          description: formData.description,
          password: formData.password,
          maxAttempts: parseInt(formData.maxAttempts),
          timeLimit: parseInt(formData.timeLimit),
        };
      }
      return q;
    });

    setQuizzes(updated);
    localStorage.setItem("quizzes", JSON.stringify(updated));
    setMessage("✅ Quiz updated successfully!");
    setTimeout(() => {
      setEditingQuiz(null);
      setMessage("");
    }, 1500);
  };

  const handleDeleteQuiz = (quiz) => {
    const attempts = quizAttempts[quiz.quizId] || [];
    
    if (attempts.length > 0) {
      setMessage(`❌ Cannot delete! This quiz has ${attempts.length} student attempt(s). Please archive it instead.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
      const updated = quizzes.filter(q => q.quizId !== quiz.quizId);
      setQuizzes(updated);
      localStorage.setItem("quizzes", JSON.stringify(updated));
      setMessage("✅ Quiz deleted successfully!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handlePublishToggle = (quiz) => {
    const updated = quizzes.map(q => {
      if (q.quizId === quiz.quizId) {
        return {
          ...q,
          published: !q.published,
          status: !q.published ? "published" : "created"
        };
      }
      return q;
    });
    setQuizzes(updated);
    localStorage.setItem("quizzes", JSON.stringify(updated));
  };

  const viewAttempts = (quiz) => {
    setSelectedQuizzAttempts({
      quiz,
      attempts: quizAttempts[quiz.quizId] || []
    });
  };

  const getAttemptStats = (quiz) => {
    const attempts = quizAttempts[quiz.quizId] || [];
    if (attempts.length === 0) return null;

    const scores = attempts.map(a => a.score || 0);
    const maxScore = quiz.totalPoints || 100;
    const percentages = scores.map(s => ((s / maxScore) * 100).toFixed(2));
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const avgPercentage = (percentages.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / percentages.length).toFixed(2);

    return {
      totalAttempts: attempts.length,
      uniqueStudents: new Set(attempts.map(a => a.user)).size,
      avgScore,
      avgPercentage,
      maxScore,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores)
    };
  };

  return (
    <div className="quiz-management-container">
      <style>{styles}</style>
      
      <div className="quiz-management-wrapper">
        <div className="header-section">
          <h1>📚 Quiz Management</h1>
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              message.includes("✅")
                ? "success-message"
                : message.includes("❌")
                ? "error-message"
                : "warning-message"
            }
          >
            {message}
          </motion.div>
        )}

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No quizzes yet</h3>
            <p>Create a new quiz from the dashboard to get started</p>
          </div>
        ) : (
          quizzes.map((quiz, idx) => {
            const stats = getAttemptStats(quiz);
            const attempts = quizAttempts[quiz.quizId] || [];

            return (
              <motion.div
                key={quiz.quizId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="quiz-card"
              >
                <div className="quiz-header">
                  <h2 className="quiz-title">{quiz.title}</h2>
                  <div className="quiz-status">
                    <span className={`status-badge status-${quiz.status || "created"}`}>
                      {quiz.status === "published" ? "✓ Published" : "○ Created"}
                    </span>
                    {attempts.length > 0 && (
                      <span className="status-badge status-attempts">
                        👥 {attempts.length} Attempt{attempts.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {quiz.description && (
                  <p style={{ color: "#aaa", marginBottom: "15px", margin: "0 0 15px 0" }}>
                    {quiz.description}
                  </p>
                )}

                <div className="quiz-details">
                  <div className="detail-item">
                    <span className="detail-label">Questions</span>
                    <span className="detail-value">{quiz.questions?.length || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Points</span>
                    <span className="detail-value">{quiz.totalPoints || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Limit</span>
                    <span className="detail-value">
                      {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : "No limit"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Max Attempts</span>
                    <span className="detail-value">
                      {quiz.maxAttempts === -1 ? "Unlimited" : quiz.maxAttempts || 1}
                    </span>
                  </div>
                </div>

                {stats && (
                  <div className="quiz-details">
                    <div className="detail-item">
                      <span className="detail-label">📊 Total Attempts</span>
                      <span className="detail-value">{stats.totalAttempts}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">👥 Unique Students</span>
                      <span className="detail-value">{stats.uniqueStudents}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📈 Avg Score</span>
                      <span className="detail-value">
                        {stats.avgScore}/{stats.maxScore} ({stats.avgPercentage}%)
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🏆 Best Score</span>
                      <span className="detail-value">{stats.bestScore}/{stats.maxScore}</span>
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={() => handleEditQuiz(quiz)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-secondary" onClick={() => viewAttempts(quiz)}>
                    📊 View Attempts ({attempts.length})
                  </button>
                  <button
                    className={`btn ${quiz.published ? "btn-secondary" : "btn-success"}`}
                    onClick={() => handlePublishToggle(quiz)}
                  >
                    {quiz.published ? "📴 Unpublish" : "📢 Publish"}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteQuiz(quiz)}
                    disabled={attempts.length > 0}
                    style={{
                      opacity: attempts.length > 0 ? 0.5 : 1,
                      cursor: attempts.length > 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Edit Quiz Modal */}
      {editingQuiz && (
        <div className="modal-overlay" onClick={() => setEditingQuiz(null)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Edit Quiz</h2>

            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Quiz Password</label>
              <input
                type="text"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Max Attempts (-1 for unlimited)</label>
              <input
                type="number"
                value={formData.maxAttempts || 1}
                onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Time Limit (minutes, 0 for no limit)</label>
              <input
                type="number"
                value={formData.timeLimit || 0}
                onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
              />
            </div>

            {quizAttempts[editingQuiz.quizId]?.length > 0 && (
              <div className="warning-message">
                ⚠️ This quiz has student attempts. You cannot change questions, but you can update other settings.
              </div>
            )}

            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={handleUpdateQuiz}>
                💾 Save Changes
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingQuiz(null)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Attempts Modal */}
      {selectedQuizzAttempts && (
        <div className="modal-overlay" onClick={() => setSelectedQuizzAttempts(null)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">📊 Attempts for "{selectedQuizzAttempts.quiz.title}"</h2>

            {selectedQuizzAttempts.attempts.length === 0 ? (
              <p style={{ color: "#aaa" }}>No attempts yet</p>
            ) : (
              <div className="attempts-list">
                {selectedQuizzAttempts.attempts.map((attempt, idx) => (
                  <div key={idx} className="attempt-item">
                    <div className="attempt-info">
                      <div style={{ fontWeight: 600, marginBottom: "5px" }}>
                        {attempt.user} 🧑‍🎓
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#aaa" }}>
                        {new Date(attempt.date || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="attempt-score">
                      {attempt.score}/{selectedQuizzAttempts.quiz.totalPoints || 100}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedQuizzAttempts(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
