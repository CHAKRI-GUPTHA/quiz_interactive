import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/CreateQuiz.css";

export default function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    quizId: "",
    title: "",
    description: "",
    password: "",
    timeLimit: 30,
    questions: [
      {
        id: 1,
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 1,
      },
    ],
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: name === "timeLimit" ? parseInt(value) : value,
    });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: quizData.questions.length + 1,
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: updatedQuestions });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate total points
    const totalPoints = quizData.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );

    const finalQuizData = {
      ...quizData,
      totalPoints,
    };

    console.log("Quiz Data:", finalQuizData);
    alert("Quiz created successfully! (Demo - Not connected to backend yet)");
  };

  return (
    <div className="create-quiz-container">
      <motion.div
        className="create-quiz-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header">
          <h1>📝 Create New Quiz</h1>
          <p>Set up your quiz and add questions</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            Questions ({quizData.questions.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            Review & Submit
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <motion.div
              className="tab-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="form-group">
                <label>Quiz ID *</label>
                <input
                  type="text"
                  name="quizId"
                  value={quizData.quizId}
                  onChange={handleBasicChange}
                  placeholder="e.g., QUIZ001"
                  required
                />
                <small>Unique identifier for this quiz</small>
              </div>

              <div className="form-group">
                <label>Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleBasicChange}
                  placeholder="e.g., General Knowledge"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleBasicChange}
                  placeholder="Add a brief description of the quiz"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quiz Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={quizData.password}
                    onChange={handleBasicChange}
                    placeholder="Students need this to access"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={quizData.timeLimit}
                    onChange={handleBasicChange}
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <motion.button
                type="button"
                className="btn-next"
                onClick={() => setActiveTab("questions")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next: Add Questions →
              </motion.button>
            </motion.div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <motion.div
              className="tab-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="questions-section">
                {quizData.questions.map((question, qIndex) => (
                  <motion.div
                    key={qIndex}
                    className="question-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIndex * 0.1 }}
                  >
                    <div className="question-header">
                      <h3>Question {qIndex + 1}</h3>
                      {quizData.questions.length > 1 && (
                        <motion.button
                          type="button"
                          className="btn-delete"
                          onClick={() => removeQuestion(qIndex)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✕ Delete
                        </motion.button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Question Text *</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, "questionText", e.target.value)
                        }
                        placeholder="Enter your question here"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="options-section">
                      <label>Options *</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="option-input">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            value={optIndex}
                            checked={question.correctAnswer === optIndex}
                            onChange={() =>
                              handleQuestionChange(qIndex, "correctAnswer", optIndex)
                            }
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, optIndex, e.target.value)
                            }
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label>Points for this question</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "points",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        max="10"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="button-group">
                <motion.button
                  type="button"
                  className="btn-add-question"
                  onClick={addQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ➕ Add Another Question
                </motion.button>

                <motion.button
                  type="button"
                  className="btn-next"
                  onClick={() => setActiveTab("review")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Review Quiz →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Review Tab */}
          {activeTab === "review" && (
            <motion.div
              className="tab-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="review-section">
                <div className="review-card">
                  <h3>Quiz Summary</h3>
                  <div className="review-item">
                    <strong>Quiz ID:</strong>
                    <span>{quizData.quizId || "Not set"}</span>
                  </div>
                  <div className="review-item">
                    <strong>Title:</strong>
                    <span>{quizData.title || "Not set"}</span>
                  </div>
                  <div className="review-item">
                    <strong>Description:</strong>
                    <span>{quizData.description || "No description"}</span>
                  </div>
                  <div className="review-item">
                    <strong>Time Limit:</strong>
                    <span>{quizData.timeLimit} minutes</span>
                  </div>
                  <div className="review-item">
                    <strong>Total Questions:</strong>
                    <span>{quizData.questions.length}</span>
                  </div>
                  <div className="review-item">
                    <strong>Total Points:</strong>
                    <span>
                      {quizData.questions.reduce((sum, q) => sum + q.points, 0)}
                    </span>
                  </div>
                </div>

                <div className="review-card">
                  <h3>Questions Preview</h3>
                  {quizData.questions.map((question, idx) => (
                    <div key={idx} className="question-preview">
                      <p>
                        <strong>Q{idx + 1}:</strong> {question.questionText}
                      </p>
                      <ul>
                        {question.options.map((option, optIdx) => (
                          <li
                            key={optIdx}
                            className={
                              question.correctAnswer === optIdx ? "correct" : ""
                            }
                          >
                            {question.correctAnswer === optIdx && "✓ "}
                            {option}
                          </li>
                        ))}
                      </ul>
                      <small>Points: {question.points}</small>
                    </div>
                  ))}
                </div>

                <div className="button-group">
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveTab("questions")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Questions
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="btn-submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✓ Create Quiz
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
