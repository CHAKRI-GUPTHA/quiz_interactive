const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const dataDir = process.env.STUDENTS_DATA_DIR || path.join(__dirname, '..', 'data');
const dataFile = process.env.STUDENTS_DATA_FILE || path.join(dataDir, 'students.json');

const ensureDataDir = () => {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readStudents = () => {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read students file:', error.message);
    return [];
  }
};

const writeStudents = (students) => {
  ensureDataDir();
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2), 'utf8');
};

// Get all students
router.get('/', (req, res) => {
  const students = readStudents();
  res.json({ students });
});

// Add a student
router.post('/', (req, res) => {
  const { name, id, password } = req.body || {};

  if (!name || !id || !password) {
    return res.status(400).json({ message: 'Please fill all fields!' });
  }

  const students = readStudents();
  if (students.some((s) => s.id === id)) {
    return res.status(400).json({ message: 'Student ID already exists!' });
  }

  const newStudent = {
    name,
    id,
    password,
    createdAt: new Date().toISOString(),
  };

  const updated = [...students, newStudent];
  writeStudents(updated);

  res.status(201).json({ message: 'Student added successfully!', student: newStudent, students: updated });
});

// Student login
router.post('/login', (req, res) => {
  const { id, password } = req.body || {};

  if (!id || !password) {
    return res.status(400).json({ message: 'Student ID and Password are required' });
  }

  const students = readStudents();
  if (students.length === 0) {
    return res.status(404).json({ message: 'No students created yet! Ask your teacher to create your account.' });
  }

  const student = students.find((s) => s.id === id && s.password === password);
  if (!student) {
    return res.status(400).json({ message: 'Invalid Student ID or Password!' });
  }

  res.json({ message: 'Login successful', student: { id: student.id, name: student.name } });
});

// Delete a student by ID
router.delete('/:id', (req, res) => {
  const students = readStudents();
  const updated = students.filter((s) => s.id !== req.params.id);

  if (updated.length === students.length) {
    return res.status(404).json({ message: 'Student not found' });
  }

  writeStudents(updated);
  res.json({ message: 'Student deleted!', students: updated });
});

// Clear all students
router.delete('/', (req, res) => {
  writeStudents([]);
  res.json({ message: 'All students cleared!', students: [] });
});

module.exports = router;
