import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./APP.css";
import CreateQuiz from "./CreateQuiz";
import AddQuestions from "./AddQuestions";
import AIQuestionGenerator from "./AIQuestionGenerator";
import TakeQuiz from "./TakeQuiz";
import StudentAttempts from "./StudentAttempts";
import TeacherAnalytics from "./TeacherAnalytics";
import ManageStudents from "./ManageStudents";
import TeacherQuizManagement from "./TeacherQuizManagement";
import StudentScoreboard from "./StudentScoreboard";
import StudentReviewAttempt from "./StudentReviewAttempt";

function LoginPage() {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const teacher = { id: "TEACHER01", password: "admin01" };

  const handleLogin = () => {
    if (role === "teacher") {
      // Teacher login
      if (id === teacher.id && password === teacher.password) {
        setMessage("TEACHER Login Successful!");
        sessionStorage.setItem("role", "teacher");
        sessionStorage.setItem("userName", id);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage("Invalid Teacher Credentials!");
      }
    } else {
      // Student login - check against created students
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const studentFound = students.find(s => s.id === id && s.password === password);

      if (studentFound) {
        setMessage("STUDENT Login Successful!");
        sessionStorage.setItem("role", "student");
        sessionStorage.setItem("userName", id);
        sessionStorage.setItem("studentName", studentFound.name);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        if (students.length === 0) {
          setMessage("❌ No students created yet! Ask your teacher to create your account.");
        } else {
          setMessage("❌ Invalid Student ID or Password!");
        }
      }
    }
  };

  return (
    <div className="container">
      <div className="floating-icons">📚 ✏️ 📖 🖥️ 🎓</div>

      <div className="left-panel">
        <img
          src={
            role === "teacher"
              ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
              : "https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
          }
          alt="study"
        />
        <h2>{role === "teacher" ? "Teacher Portal" : "Student Portal"}</h2>
      </div>

      <motion.div
        key={role}
        className="right-panel"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="role-switch">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => {
              setRole("student");
              setMessage("");
            }}
          >
            Student
          </button>

          <button
            className={role === "teacher" ? "active" : ""}
            onClick={() => {
              setRole("teacher");
              setMessage("");
            }}
          >
            Teacher
          </button>
        </div>

        <h3>{role === "teacher" ? "Teacher Login" : "Student Login"}</h3>

        <input
          type="text"
          placeholder="Enter ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
        >
          Login
        </motion.button>

        {message && (
          <p className={message.includes("Successful") ? "success" : "error"}>
            {message}
          </p>
        )}

        {role === "student" && !message && (
          <div style={{
            background: 'rgba(0, 153, 255, 0.1)',
            border: '1px solid #0099ff',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '15px',
            color: '#aaa',
            fontSize: '0.9em',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>
              💡 <strong>Note:</strong> Your teacher must create your account with an ID and password first.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const userName = sessionStorage.getItem("userName");

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userName");
    navigate("/");
  };

  if (!role) {
    navigate("/");
    return null;
  }

  // ✅ Load created quizzes dynamically and refresh on route/localStorage changes
  const [quizzesState, setQuizzesState] = useState([]);
  const location = useLocation();

  const quizzes = quizzesState;

  useEffect(() => {
    setQuizzesState(JSON.parse(localStorage.getItem("quizzes") || "[]"));
  }, [location.key]);

  useEffect(() => {
    const handler = () => setQuizzesState(JSON.parse(localStorage.getItem("quizzes") || "[]"));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isQuizOpen = (quiz) => {
    if (!quiz.published) return false;
    const now = new Date();
    if (quiz.startTime) {
      const s = new Date(quiz.startTime);
      if (now < s) return false;
    }
    if (quiz.endTime) {
      const e = new Date(quiz.endTime);
      if (now > e) return false;
    }
    return true;
  };

  const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : 'Not set');

  const togglePublish = (i) => {
    const updated = [...quizzesState];
    updated[i] = { ...updated[i], published: !updated[i].published, status: !updated[i].published ? 'published' : 'created' };
    setQuizzesState(updated);
    localStorage.setItem('quizzes', JSON.stringify(updated));
  };

  const editSchedule = (i) => {
    const start = window.prompt('Enter start (YYYY-MM-DDTHH:MM) or leave blank', quizzesState[i].startTime || '');
    const end = window.prompt('Enter end (YYYY-MM-DDTHH:MM) or leave blank', quizzesState[i].endTime || '');
    const updated = [...quizzesState];
    updated[i] = { ...updated[i], startTime: start || null, endTime: end || null };
    setQuizzesState(updated);
    localStorage.setItem('quizzes', JSON.stringify(updated));
  };

  const getStatusBadge = (status) => {
    if (status === "created") {
      return <span style={{ color: "#00ff99", fontWeight: "bold" }}>✓ Created</span>;
    } else if (status === "cancelled") {
      return <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>✗ Cancelled</span>;
    }
    return status;
  };

  const quizItemStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid #0099ff",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease"
  };

  const actionButtonStyles = {
    padding: "8px 16px",
    marginRight: "10px",
    backgroundColor: "#0099ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9em",
    fontWeight: "600",
    transition: "all 0.3s ease"
  };

  return (
    <div className="container">
      <motion.div
        className="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "15px"
        }}
      >
        <div className="dashboard-header">
          <h1>Welcome, {userName}! 👋</h1>
          <p className="role-badge">{role.toUpperCase()} Portal</p>
        </div>

        {role === "student" ? (
          <div className="student-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px', flexWrap: 'wrap' }}>
              <h2 style={{margin: 0}}>📝 Available Quizzes</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  onClick={() => navigate("/scoreboard")}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #9d00ff, #6f00cc)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95em'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 Scoreboard
                </motion.button>
                <motion.button
                  onClick={() => navigate("/my-attempts")}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #0099ff, #00d4ff)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95em'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 My Attempts
                </motion.button>
              </div>
            </div>
            <div className="quiz-cards">
              {quizzes.filter(isQuizOpen).length === 0 ? (
                <p style={{ fontSize: "1.1em", color: "#999", marginTop: "20px" }}>
                  ⏳ No quizzes are currently available. Check back when a quiz is published and open.
                </p>
              ) : (
                quizzes.filter(isQuizOpen).map((quiz, idx) => (
                  <motion.div key={idx} className="quiz-card" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <h3>📝 {quiz.subject}</h3>
                    <p>{quiz.timer} Minutes | Attempts: {quiz.maxAttempts || 1}</p>
                    <p style={{ color: '#aaa', fontSize: '0.9em' }}>Opens: {formatDateTime(quiz.startTime)} | Closes: {formatDateTime(quiz.endTime)}</p>
                    <button onClick={() => navigate(`/take-quiz/${idx}`)}>Start Quiz</button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="teacher-dashboard">
            <h2>Manage Quizzes</h2>

            <div className="teacher-actions">
              <motion.button
                className="action-btn"
                onClick={() => navigate("/create-quiz")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ➕ Create New Quiz
              </motion.button>

              <motion.button
                className="action-btn"
                onClick={() => navigate("/quiz-management")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📚 Quiz Management
              </motion.button>

              <motion.button
                className="action-btn"
                onClick={() => navigate("/analytics")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📊 View Analytics
              </motion.button>

              <motion.button
                className="action-btn"
                onClick={() => navigate("/manage-students")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👥 Manage Students
              </motion.button>
            </div>

            {/* ✅ Dynamic Created Quizzes */}
            <h2 style={{ marginTop: "40px" }}>📊 All Quizzes</h2>

            <div className="quiz-list">
              {quizzes.length === 0 ? (
                <p>No quizzes created yet.</p>
              ) : (
                quizzes.map((quiz, index) => (
                  <div key={index} style={quizItemStyles}>
                    <div>
                      <h3 style={{ margin: "0 0 8px", color: "#00d4ff" }}>{quiz.subject}</h3>
                      <p style={{ margin: "5px 0", color: "#aaa", fontSize: "0.9em" }}>
                        <strong>Quiz ID:</strong> {quiz.quizId}
                      </p>
                      <p style={{ margin: "5px 0", color: "#aaa", fontSize: "0.9em" }}>
                        <strong>Status:</strong> {getStatusBadge(quiz.status || "created")}
                      </p>
                      <p style={{ margin: "5px 0", color: "#aaa", fontSize: "0.9em" }}>
                        <strong>Timer:</strong> {quiz.timer} min | <strong>Questions:</strong> {quiz.questions?.length || 0}/{quiz.numQuestions} | <strong>Max Attempts:</strong> {quiz.maxAttempts || 1}
                      </p>
                      {/* ✅ Show Quiz Password */}
                      <div style={{
                        marginTop: '10px',
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        <p style={{ margin: '0', color: '#000', fontSize: '0.85em', fontWeight: 'bold' }}>
                          🔐 Password: <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{quiz.password}</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <motion.button
                          style={{ ...actionButtonStyles, backgroundColor: quiz.published ? '#2ecc71' : '#9d00ff' }}
                          onClick={() => togglePublish(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {quiz.published ? 'Unpublish' : 'Publish'}
                        </motion.button>

                        <motion.button
                          style={{ ...actionButtonStyles, backgroundColor: '#ffaa00' }}
                          onClick={() => editSchedule(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🕒 Edit Schedule
                        </motion.button>

                        {quiz.status === 'created' && (
                          <>
                            <motion.button
                              style={{ ...actionButtonStyles, backgroundColor: '#9d00ff' }}
                              onClick={() => navigate(`/ai-generate/${index}`)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Generate questions using AI from PDF/Image"
                            >
                              🤖 AI Generate
                            </motion.button>
                            <motion.button
                              style={actionButtonStyles}
                              onClick={() => navigate(`/add-questions/${index}`)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              ➕ Add Questions
                            </motion.button>
                          </>
                        )}

                        <motion.button
                          style={{ ...actionButtonStyles, backgroundColor: '#666' }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${quiz.subject}"? All student attempts will be cleared!`)) {
                              const updatedQuizzes = quizzes.filter((_, i) => i !== index);
                              setQuizzesState(updatedQuizzes);
                              localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
                              
                              // ✅ Clear attempts for this quiz
                              const results = JSON.parse(localStorage.getItem('results') || '[]');
                              const updatedResults = results.filter(r => r.quizId !== quiz.quizId);
                              localStorage.setItem('results', JSON.stringify(updatedResults));
                              
                              alert(`✅ Quiz "${quiz.subject}" deleted and all attempts cleared!`);
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🗑️ Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <motion.button
          className="logout-btn"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/add-questions/:index" element={<AddQuestions />} />
        <Route path="/ai-generate/:index" element={<AIQuestionGenerator />} />
        <Route path="/take-quiz/:index" element={<TakeQuiz />} />
        <Route path="/my-attempts" element={<StudentAttempts />} />
        <Route path="/analytics" element={<TeacherAnalytics />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/quiz-management" element={<TeacherQuizManagement />} />
        <Route path="/scoreboard" element={<StudentScoreboard />} />
        <Route path="/review-attempt/:attemptId" element={<StudentReviewAttempt />} />
      </Routes>
    </HashRouter>
  );
}
