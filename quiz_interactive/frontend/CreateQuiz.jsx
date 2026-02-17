import React, { useState } from "react";

export default function CreateQuiz() {

  const [quizId, setQuizId] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [timer, setTimer] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {

    const formData = new FormData();
    formData.append("quizId", quizId);
    formData.append("password", password);
    formData.append("subject", subject);
    formData.append("timer", timer);
    formData.append("numQuestions", numQuestions);
    formData.append("pdf", file);

    await fetch("http://localhost:5000/api/quiz/create", {
      method: "POST",
      body: formData
    });

    alert("Quiz Created Successfully!");
  };

  return (
    <div style={{ padding: "30px", background: "black", color: "white" }}>
      <h2>Create New Quiz</h2>

      <input placeholder="Quiz ID" onChange={e => setQuizId(e.target.value)} />
      <input placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <input placeholder="Subject" onChange={e => setSubject(e.target.value)} />
      <input placeholder="Timer (minutes)" onChange={e => setTimer(e.target.value)} />

      <input type="number"
             placeholder="Number of Questions"
             value={numQuestions}
             onChange={e => setNumQuestions(e.target.value)} />

      <input type="file" accept="application/pdf"
             onChange={e => setFile(e.target.files[0])} />

      <button onClick={handleSubmit}>Generate & Save Quiz</button>
    </div>
  );
}
