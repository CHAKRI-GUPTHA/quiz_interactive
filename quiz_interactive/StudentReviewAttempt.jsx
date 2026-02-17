import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const styles = `
  .review-container {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: white;
  }

  .review-wrapper {
    max-width: 1000px;
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

  .score-section {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 15px;
    padding: 40px;
    margin-bottom: 40px;
    text-align: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 30px;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .score-icon {
    font-size: 2.5em;
    margin-bottom: 10px;
  }

  .score-label {
    font-size: 0.9em;
    color: #aaa;
    margin-bottom: 10px;
  }

  .score-value {
    font-size: 2.5em;
    font-weight: bold;
    color: #00d4ff;
  }

  .percentage-value {
    font-size: 2.5em;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .percentage-good {
    color: #2ecc71;
  }

  .percentage-fair {
    color: #f1c40f;
  }

  .percentage-poor {
    color: #e74c3c;
  }

  .quiz-info {
    background: rgba(0, 153, 255, 0.05);
    border: 1px solid rgba(0, 153, 255, 0.2);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info-label {
    font-size: 0.85em;
    color: #aaa;
    margin-bottom: 5px;
  }

  .info-value {
    font-size: 1.1em;
    color: #00d4ff;
    font-weight: 600;
  }

  .questions-section {
    margin-top: 40px;
  }

  .questions-section h2 {
    color: #00d4ff;
    margin-bottom: 20px;
    font-size: 1.5em;
  }

  .question-card {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 10px;
    padding: 25px;
    margin-bottom: 25px;
    transition: all 0.3s ease;
  }

  .question-card.correct {
    border-color: #2ecc71;
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.05));
  }

  .question-card.incorrect {
    border-color: #e74c3c;
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
  }

  .question-header {
    display: flex;
    align-items: start;
    gap: 15px;
    margin-bottom: 15px;
  }

  .question-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 153, 255, 0.2);
    color: #00d4ff;
    font-weight: bold;
    flex-shrink: 0;
  }

  .question-card.correct .question-number {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
  }

  .question-card.incorrect .question-number {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  .question-title {
    flex: 1;
  }

  .question-text {
    font-size: 1.1em;
    font-weight: 600;
    color: white;
    margin-bottom: 10px;
  }

  .question-points {
    font-size: 0.9em;
    color: #aaa;
  }

  .question-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: 600;
    white-space: nowrap;
  }

  .question-status.correct {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
  }

  .question-status.incorrect {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  .options-section {
    margin-top: 15px;
  }

  .option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 153, 255, 0.2);
    border-radius: 8px;
    padding: 12px 15px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(0, 153, 255, 0.2);
    color: #00d4ff;
    font-weight: bold;
    font-size: 0.9em;
    flex-shrink: 0;
  }

  .option-text {
    flex: 1;
    color: #ccc;
  }

  .option.selected {
    border-color: #3498db;
    background: rgba(52, 152, 219, 0.1);
  }

  .option.correct {
    border-color: #2ecc71;
    background: rgba(46, 204, 113, 0.1);
  }

  .option.correct .option-letter {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
  }

  .option.incorrect {
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
  }

  .option.incorrect .option-letter {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  .option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    flex-shrink: 0;
  }

  .answer-summary {
    margin-top: 15px;
    padding: 12px;
    background: rgba(0, 153, 255, 0.05);
    border-left: 3px solid #0099ff;
    border-radius: 5px;
    font-size: 0.9em;
  }

  .answer-label {
    color: #aaa;
    margin-bottom: 5px;
  }

  .your-answer {
    color: #3498db;
    font-weight: 600;
  }

  .correct-answer {
    color: #2ecc71;
    font-weight: 600;
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

  .action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 40px;
    justify-content: center;
  }

  .btn {
    padding: 12px 25px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1em;
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
`;

const getOptionLetter = (index) => {
  return String.fromCharCode(65 + index); // A, B, C, D, etc.
};

export default function StudentReviewAttempt() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttemptData();
  }, [attemptId]);

  const loadAttemptData = () => {
    setLoading(true);
    
    const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    const results = JSON.parse(localStorage.getItem("results") || "[]");
    const userName = sessionStorage.getItem("userName");

    // Find the attempt (can be by index or by unique id)
    let foundAttempt = null;
    const numAttemptId = parseInt(attemptId);
    
    if (!isNaN(numAttemptId)) {
      const userResults = results.filter(r => r.user === userName);
      foundAttempt = userResults[numAttemptId];
    }

    if (!foundAttempt && attemptId) {
      foundAttempt = results.find(r => r.id === attemptId);
    }

    if (foundAttempt) {
      setAttempt(foundAttempt);
      const foundQuiz = quizzes.find(q => q.quizId === foundAttempt.quizId);
      setQuiz(foundQuiz);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="review-container">
        <style>{styles}</style>
        <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="review-container">
        <style>{styles}</style>
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Attempt not found</h3>
          <p>This attempt could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate("/scoreboard")}>
            Back to Scoreboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = ((attempt.score || 0) / (attempt.totalPoints || 100)) * 100;
  const correctAnswers = attempt.answers?.filter(a => a.isCorrect).length || 0;
  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="review-container">
      <style>{styles}</style>

      <div className="review-wrapper">
        <div className="header-section">
          <h1>📖 Review Attempt</h1>
          <button className="back-button" onClick={() => navigate("/scoreboard")}>
            ← Back to Scoreboard
          </button>
        </div>

        {/* Score Section */}
        <motion.div
          className="score-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="score-item">
            <div className="score-icon">🎯</div>
            <div className="score-label">Your Score</div>
            <div className="score-value">{attempt.score || 0}/{attempt.totalPoints || 100}</div>
          </div>

          <div className="score-item">
            <div className="score-icon">📊</div>
            <div className="score-label">Percentage</div>
            <div className={`percentage-value ${
              percentage >= 80 ? "percentage-good" : 
              percentage >= 60 ? "percentage-fair" : 
              "percentage-poor"
            }`}>
              {percentage.toFixed(2)}%
            </div>
          </div>

          <div className="score-item">
            <div className="score-icon">✅</div>
            <div className="score-label">Correct Answers</div>
            <div className="score-value">{correctAnswers}/{totalQuestions}</div>
          </div>

          <div className="score-item">
            <div className="score-icon">⏱️</div>
            <div className="score-label">Time Taken</div>
            <div className="score-value">
              {attempt.timeTaken > 0 ? `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s` : "N/A"}
            </div>
          </div>
        </motion.div>

        {/* Quiz Info */}
        <div className="quiz-info">
          <div className="info-item">
            <span className="info-label">📝 Quiz Title</span>
            <span className="info-value">{quiz.title}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📚 Total Questions</span>
            <span className="info-value">{totalQuestions}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🏆 Total Points</span>
            <span className="info-value">{attempt.totalPoints || 100}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📅 Submitted On</span>
            <span className="info-value">
              {new Date(attempt.date || attempt.submittedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-section">
          <h2>📋 Question Review</h2>

          {quiz.questions && quiz.questions.map((question, qIndex) => {
            const studentAnswer = attempt.answers?.[qIndex];
            const isCorrect = studentAnswer?.isCorrect;
            const selectedOptionIndex = studentAnswer?.selectedAnswer;

            return (
              <motion.div
                key={qIndex}
                className={`question-card ${isCorrect ? "correct" : "incorrect"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
              >
                <div className="question-header">
                  <div className="question-number">{qIndex + 1}</div>
                  <div className="question-title">
                    <div className="question-text">{question.questionText}</div>
                    <div className="question-points">
                      {question.points || 1} point{(question.points || 1) !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className={`question-status ${isCorrect ? "correct" : "incorrect"}`}>
                    {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                  </div>
                </div>

                <div className="options-section">
                  {question.options && question.options.map((option, optIndex) => {
                    const isCorrectOption = optIndex === question.correctAnswer;
                    const isSelectedOption = optIndex === selectedOptionIndex;
                    let optionClass = "";

                    if (isSelectedOption && isCorrectOption) {
                      optionClass = "selected correct";
                    } else if (isSelectedOption && !isCorrectOption) {
                      optionClass = "selected incorrect";
                    } else if (isCorrectOption) {
                      optionClass = "correct";
                    }

                    return (
                      <div key={optIndex} className={`option ${optionClass}`}>
                        <div className="option-letter">{getOptionLetter(optIndex)}</div>
                        <div className="option-text">{option}</div>
                        {isSelectedOption && !isCorrectOption && (
                          <div className="option-icon">❌</div>
                        )}
                        {isCorrectOption && (
                          <div className="option-icon">✅</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="answer-summary">
                  <div className="answer-label">Your Answer:</div>
                  <div className="your-answer">
                    {selectedOptionIndex !== undefined
                      ? `${getOptionLetter(selectedOptionIndex)}) ${question.options[selectedOptionIndex]}`
                      : "Not answered"}
                  </div>

                  <div className="answer-label" style={{ marginTop: "10px" }}>
                    Correct Answer:
                  </div>
                  <div className="correct-answer">
                    {`${getOptionLetter(question.correctAnswer)}) ${question.options[question.correctAnswer]}`}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => navigate("/scoreboard")}>
            Back to Scoreboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
