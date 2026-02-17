import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", id: "", password: "" });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load students from localStorage
  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    setStudents(savedStudents);
  }, []);

  // Save students to localStorage
  const saveStudents = (updatedStudents) => {
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudents(updatedStudents);
  };

  // Generate random password
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Add new student
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.id || !newStudent.password) {
      alert("Please fill all fields!");
      return;
    }

    // Check if ID already exists
    if (students.some(s => s.id === newStudent.id)) {
      alert("Student ID already exists!");
      return;
    }

    const updatedStudents = [...students, {
      ...newStudent,
      createdAt: new Date().toISOString()
    }];

    saveStudents(updatedStudents);
    setNewStudent({ name: "", id: "", password: "" });
    setShowForm(false);
    alert("✅ Student added successfully!");
  };

  // Delete student
  const handleDeleteStudent = (id) => {
    if (window.confirm(`Are you sure you want to delete student ${id}?`)) {
      const updatedStudents = students.filter(s => s.id !== id);
      saveStudents(updatedStudents);
      alert("✅ Student deleted!");
    }
  };

  // Clear all students
  const handleClearAll = () => {
    if (window.confirm("⚠️ This will DELETE ALL STUDENTS! Are you sure?")) {
      if (window.confirm("This action cannot be undone! Type 'DELETE' to confirm.")) {
        saveStudents([]);
        setShowClearConfirm(false);
        alert("✅ All students cleared!");
      }
    }
  };

  return (
    <div style={{ padding: 30, color: 'white', minHeight: '100vh', background: 'linear-gradient(135deg, #000000, #1a1a1a)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h2>👥 Manage Students</h2>
          <motion.button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0099ff, #00d4ff)',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '5px' }}>Total Students</div>
            <div style={{ fontSize: '2em', color: '#000', fontWeight: 'bold' }}>{students.length}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '12px 24px',
              background: '#2ecc71',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Add Student
          </motion.button>

          <motion.button
            onClick={() => setShowClearConfirm(true)}
            style={{
              padding: '12px 24px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️ Clear All Data
          </motion.button>
        </div>

        {/* Add Student Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #0099ff',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px'
            }}
          >
            <h3 style={{ marginTop: 0, color: '#00d4ff' }}>➕ Add New Student</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>Student Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #0099ff',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1em'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>Student ID *</label>
                  <input
                    type="text"
                    value={newStudent.id}
                    onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                    placeholder="e.g., STU001"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #0099ff',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1em'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#00d4ff' }}>Password *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      placeholder="Enter or generate"
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #0099ff',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1em'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewStudent({ ...newStudent, password: generatePassword() })}
                      style={{
                        padding: '12px 16px',
                        background: '#9d00ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🔄 Generate
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  style={{
                    padding: '10px 20px',
                    background: '#2ecc71',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Student
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Students List */}
        <h3 style={{ marginBottom: '15px', color: '#00d4ff' }}>📋 Student List ({students.length})</h3>

        {students.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #0099ff',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1em', color: '#aaa' }}>No students added yet. Click "Add Student" to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #0099ff' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: '#00d4ff' }}>Student Name</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#00d4ff' }}>Student ID</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#00d4ff' }}>Password</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#00d4ff' }}>Created</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: '#00d4ff' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(0,153,255,0.2)' }}>
                    <td style={{ padding: '15px', color: '#aaa' }}>
                      <strong style={{ color: '#00d4ff' }}>{student.name}</strong>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#00ff99', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {student.id}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'rgba(46, 204, 113, 0.1)',
                      borderRadius: '6px',
                      margin: '8px 0'
                    }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        color: '#000',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        display: 'inline-block'
                      }}>
                        {student.password}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#888', fontSize: '0.85em' }}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        style={{
                          padding: '8px 12px',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9em'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
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
              border: '2px solid #ff6b6b',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center',
              minWidth: '350px',
              boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)'
            }}
          >
            <h2 style={{ marginBottom: '20px', color: '#ff6b6b' }}>⚠️ Clear All Data?</h2>
            <p style={{ marginBottom: '20px', color: '#aaa', fontSize: '1em' }}>
              This will DELETE all {students.length} students and cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '12px 24px',
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '12px 24px',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Yes, Delete All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
