import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const createQuizStyles = `
  html, body {
    overflow-x: hidden;
  }

  .create-quiz-container {
    min-height: 100vh;
    padding: 40px;
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: white;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .create-quiz-wrapper {
    max-width: 900px;
    margin: 0 auto;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 15px;
    padding: 40px;
    border: 2px solid #0099ff;
    box-shadow: 0 10px 40px rgba(0, 153, 255, 0.2);
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #0099ff;
  }

  .header h1 {
    font-size: 2em;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #00d4ff, #0099ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .form-group {
    margin-bottom: 25px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #00d4ff;
  }

  .form-group input,
  .form-group textarea {
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
  .form-group textarea:focus {
    outline: none;
    background: rgba(0, 153, 255, 0.1);
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .button-group {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    justify-content: flex-end;
  }

  .btn-submit {
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

  .btn-submit:hover {
    box-shadow: 0 5px 20px rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .btn-back {
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

  .btn-back:hover {
    background: #444;
    color: white;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #0099ff;
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 153, 255, 0.3);
  }

  .modal-content h2 {
    margin: 0 0 15px;
    color: #00d4ff;
    font-size: 1.5em;
  }

  .modal-content p {
    color: #ccc;
    margin: 10px 0;
    line-height: 1.6;
  }

  .modal-buttons {
    display: flex;
    gap: 15px;
    margin-top: 25px;
    justify-content: flex-end;
  }

  .modal-btn-cancel {
    padding: 10px 20px;
    background: #333;
    color: #aaa;
    border: 1px solid #555;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.3s ease;
  }

  .modal-btn-cancel:hover {
    background: #444;
    color: white;
  }

  .modal-btn-confirm {
    padding: 10px 20px;
    background: linear-gradient(135deg, #00ff99, #00cc77);
    color: #000;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .modal-btn-confirm:hover {
    box-shadow: 0 5px 20px rgba(0, 255, 153, 0.4);
    transform: translateY(-2px);
  }

  .quiz-details {
    background: rgba(0, 153, 255, 0.1);
    border-left: 3px solid #00d4ff;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
  }

  .quiz-details p {
    margin: 8px 0;
    font-size: 0.95em;
  }

  .quiz-details strong {
    color: #00d4ff;
  }
`;

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [timer, setTimer] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempQuizData, setTempQuizData] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Generate random password
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pwd = "";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizId || !subject || !timer) {
      alert("Please fill all required fields!");
      return;
    }

    // Auto-generate password if empty
    const finalPassword = password || generatePassword();

    const quizData = {
      quizId,
      subject,
      password: finalPassword,
      timer: parseInt(timer),
      numQuestions: parseInt(numQuestions),
      questions: [],
      status: publishNow ? "published" : "created",
      published: publishNow,
      startTime: startTime || null,
      endTime: endTime || null,
      maxAttempts: parseInt(maxAttempts),
      createdAt: new Date().toISOString()
    };

    setTempQuizData(quizData);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
      quizzes.push(tempQuizData);
      localStorage.setItem("quizzes", JSON.stringify(quizzes));
      
      setShowConfirm(false);
      alert(`✅ Quiz "${tempQuizData.subject}" created successfully!`);
      
      setQuizId("");
      setPassword("");
      setSubject("");
      setTimer("");
      setNumQuestions(5);
      setMaxAttempts(1);
      setFile(null);
      setTempQuizData(null);
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      alert("Error creating quiz: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Save with cancelled status
    const quizData = {
      ...tempQuizData,
      status: "cancelled"
    };
    
    const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    quizzes.push(quizData);
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
    
    setShowConfirm(false);
    alert(`❌ Quiz creation cancelled!`);
    
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <>
      <style>{createQuizStyles}</style>
      
      {showConfirm && tempQuizData && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2>📋 Confirm Quiz Creation</h2>
            <p>Please review the quiz details before confirming:</p>
            
            <div className="quiz-details">
              <p><strong>Quiz ID:</strong> {tempQuizData.quizId}</p>
              <p><strong>Subject:</strong> {tempQuizData.subject}</p>
              <p><strong>Time Limit:</strong> {tempQuizData.timer} minutes</p>
              <p><strong>Questions:</strong> {tempQuizData.numQuestions}</p>
              <p><strong>Max Attempts:</strong> {tempQuizData.maxAttempts}</p>
              <p><strong>Start:</strong> {tempQuizData.startTime ? new Date(tempQuizData.startTime).toLocaleString() : 'Not scheduled'}</p>
              <p><strong>End:</strong> {tempQuizData.endTime ? new Date(tempQuizData.endTime).toLocaleString() : 'Not scheduled'}</p>
              <p><strong>Publish Now:</strong> {tempQuizData.published ? 'Yes' : 'No'}</p>
            </div>

            {/* ✅ Password Display for Teachers */}
            <div style={{ 
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)', 
              border: '2px solid #00ff99',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 8px', color: '#000', fontWeight: 'bold', fontSize: '0.9em' }}>🔐 STUDENT PASSWORD</p>
              <p style={{ margin: '0', color: '#000', fontSize: '1.3em', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {tempQuizData.password}
              </p>
              <p style={{ margin: '8px 0 0', color: '#000', fontSize: '0.85em' }}>Share this password with students to access the quiz</p>
            </div>

            <p style={{ color: "#ffaa00", fontSize: "0.95em" }}>
              After confirming, you can add questions to this quiz in your dashboard.
            </p>

            <div className="modal-buttons">
              <motion.button
                className="modal-btn-cancel"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✗ Cancel
              </motion.button>
              
              <motion.button
                className="modal-btn-confirm"
                onClick={handleConfirm}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? "Creating..." : "✓ Confirm"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="create-quiz-container">
        <motion.div
          className="create-quiz-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header">
            <h1>📝 Create New Quiz</h1>
            <p style={{ margin: "0", color: "#aaa", fontSize: "1.1em" }}>Set up your quiz</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Quiz ID *</label>
              <input
                type="text"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                placeholder="e.g., QUIZ001"
                required
              />
              <small style={{ color: "#888", marginTop: "5px", display: "block" }}>Unique identifier for this quiz</small>
            </div>

            <div className="form-group">
              <label>Quiz Subject/Title *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., General Knowledge"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password (optional - auto-generated if empty)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for auto-generation"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    style={{
                      padding: '12px 16px',
                      background: '#9d00ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔄 Generate
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Time Limit (minutes) *</label>
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Maximum Attempts Per Student</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                min="1"
                max="10"
                placeholder="e.g., 3"
              />
              <small style={{ color: "#888", marginTop: "5px", display: "block" }}>How many times can each student attempt this quiz? (1 = Single attempt only)</small>
            </div>

            <div className="form-group">
              <label>Upload PDF (Optional)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && <small style={{ color: "#00ff99", marginTop: "5px", display: "block" }}>📄 {file.name}</small>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time (optional)</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>End Time (optional)</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} style={{ marginRight: 8 }} /> Publish immediately
              </label>
            </div>

            <div className="button-group">
              <motion.button
                type="button"
                className="btn-back"
                onClick={() => window.history.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back
              </motion.button>

              <motion.button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? "Creating..." : "✓ Create Quiz"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
