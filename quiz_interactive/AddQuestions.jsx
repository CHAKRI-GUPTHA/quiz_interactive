import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const addQuestionsStyles = `
  html, body {
    overflow-x: hidden;
  }

  .add-questions-container {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: white;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .add-questions-wrapper {
    max-width: 900px;
    margin: 0 auto;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 15px;
    padding: 40px;
    border: 2px solid #0099ff;
    box-shadow: 0 10px 40px rgba(0, 153, 255, 0.2);
  }

  .aq-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #0099ff;
  }

  .aq-header h1 {
    font-size: 2em;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #00d4ff, #0099ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .quiz-info {
    background: rgba(0, 153, 255, 0.1);
    border-left: 3px solid #00d4ff;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 30px;
  }

  .quiz-info p {
    margin: 8px 0;
    color: #ccc;
  }

  .quiz-info strong {
    color: #00d4ff;
  }

  .question-form {
    background: rgba(0, 153, 255, 0.05);
    border: 1px solid #0099ff;
    padding: 25px;
    border-radius: 10px;
    margin-bottom: 25px;
  }

  .question-form h3 {
    margin: 0 0 20px;
    color: #00ff99;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #00d4ff;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #0099ff;
    border-radius: 5px;
    color: white;
    font-family: "Poppins", sans-serif;
    font-size: 1em;
    transition: all 0.3s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    background: rgba(0, 153, 255, 0.1);
    border-color: #00d4ff;
  }

  .option-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .option-group input {
    flex: 1;
  }

  .option-group input[type="radio"] {
    width: auto;
    margin-right: 10px;
  }

  .button-group {
    display: flex;
    gap: 15px;
    margin-top: 25px;
    justify-content: flex-end;
  }

  .btn-primary {
    padding: 12px 25px;
    background: linear-gradient(135deg, #0099ff, #00d4ff);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    box-shadow: 0 5px 20px rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .btn-secondary {
    padding: 12px 25px;
    background: #333;
    color: #aaa;
    border: 1px solid #555;
    border-radius: 8px;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    background: #444;
    color: white;
  }

  .questions-list {
    margin-top: 40px;
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 10px;
  }

  .questions-list::-webkit-scrollbar {
    width: 8px;
  }

  .questions-list::-webkit-scrollbar-track {
    background: rgba(0, 153, 255, 0.1);
    border-radius: 5px;
  }

  .questions-list::-webkit-scrollbar-thumb {
    background: #0099ff;
    border-radius: 5px;
  }

  .questions-list::-webkit-scrollbar-thumb:hover {
    background: #00d4ff;
  }

  .questions-list h3 {
    color: #00d4ff;
    margin-bottom: 20px;
    margin-top: 0;
  }

  .question-item {
    background: rgba(0, 153, 255, 0.05);
    border-left: 3px solid #00ff99;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
  }

  .question-item p {
    margin: 8px 0;
    color: #ccc;
  }
`;

export default function AddQuestions() {
  const navigate = useNavigate();
  const { index } = useParams();
  const quizIndex = parseInt(index);

  const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
  const quiz = quizzes[quizIndex];

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [points, setPoints] = useState(1);

  if (!quiz) {
    return <div style={{ textAlign: "center", padding: "40px", color: "white" }}>Quiz not found!</div>;
  }

  const handleAddQuestion = () => {
    if (!questionText || options.some(opt => !opt)) {
      alert("Please fill all fields!");
      return;
    }

    const newQuestion = {
      id: (quiz.questions?.length || 0) + 1,
      text: questionText,
      options,
      correctAnswer: parseInt(correctAnswer),
      points: parseInt(points)
    };

    const updatedQuiz = { ...quiz };
    if (!updatedQuiz.questions) updatedQuiz.questions = [];
    updatedQuiz.questions.push(newQuestion);

    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex] = updatedQuiz;

    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));

    // Reset form
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setPoints(1);

    alert("Question added successfully!");
  };

  const handleRemoveQuestion = (questionId) => {
    const updatedQuiz = { ...quiz };
    updatedQuiz.questions = updatedQuiz.questions.filter(q => q.id !== questionId);

    const updatedQuizzes = [...quizzes];
    updatedQuizzes[quizIndex] = updatedQuiz;

    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
    window.location.reload();
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  return (
    <>
      <style>{addQuestionsStyles}</style>
      <div className="add-questions-container">
        <motion.div
          className="add-questions-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="aq-header">
            <h1>📚 Add Questions</h1>
            <p style={{ margin: "0", color: "#aaa", fontSize: "1.1em" }}>Build your quiz</p>
          </div>

          <div className="quiz-info">
            <p><strong>Quiz:</strong> {quiz.subject}</p>
            <p><strong>Quiz ID:</strong> {quiz.quizId}</p>
            <p><strong>Total Questions Required:</strong> {quiz.numQuestions} | <strong>Added:</strong> {quiz.questions?.length || 0}</p>
          </div>

          <div className="question-form">
            <h3>➕ Add New Question</h3>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Options *</label>
              {options.map((option, idx) => (
                <div key={idx} className="option-group">
                  <input
                    type="radio"
                    name="correct"
                    value={idx}
                    checked={correctAnswer === idx}
                    onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
              <small style={{ color: "#888" }}>Select the radio button for the correct answer</small>
            </div>

            <div className="form-group">
              <label>Points for this question *</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                max="100"
                required
              />
            </div>

            <div className="button-group">
              <motion.button
                className="btn-secondary"
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back
              </motion.button>

              <motion.button
                style={{
                  padding: "12px 25px",
                  background: "linear-gradient(135deg, #9d00ff, #ff00ff)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1em",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => navigate(`/ai-generate/${index}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🤖 Generate with AI
              </motion.button>
              
              <motion.button
                className="btn-primary"
                onClick={handleAddQuestion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓ Add Question
              </motion.button>
            </div>
          </div>

          {quiz.questions && quiz.questions.length > 0 && (
            <div className="questions-list">
              <h3>✓ Questions Added ({quiz.questions.length})</h3>
              {quiz.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <p><strong>Q{question.id}:</strong> {question.text}</p>
                  <p><strong>Correct Answer:</strong> {question.options[question.correctAnswer]} ({question.points} points)</p>
                  <motion.button
                    style={{
                      padding: "6px 12px",
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "10px"
                    }}
                    onClick={() => handleRemoveQuestion(question.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Remove
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
