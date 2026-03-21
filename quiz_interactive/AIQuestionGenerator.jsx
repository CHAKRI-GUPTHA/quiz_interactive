import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuizzes, updateQuiz } from "./quizzesApi";

const styles = `
.ai-generator-container{min-height:100vh;padding:40px;background:linear-gradient(135deg,#000,#1a1a1a);color:#fff}
.ai-generator-wrapper{max-width:1000px;margin:0 auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;padding:28px;border:2px solid #9d00ff}
.material-section{padding:18px;border:2px dashed #9d00ff;border-radius:10px;text-align:center;background:rgba(157,0,255,0.04)}
.upload-area{padding:18px;cursor:pointer}
.file-input{display:none}
.loading{display:flex;flex-direction:column;align-items:center;gap:10px;color:#9d00ff}
.generated-questions{margin-top:20px}
.question-card{background:rgba(255,255,255,0.03);padding:12px;border-radius:8px;margin-bottom:12px}
`;

const questionBank = [
  {
    text: "What is the main product of photosynthesis?",
    correct: "Glucose",
    distractors: ["Oxygen", "Carbon dioxide", "ATP"],
    explanation: "Plants produce glucose during photosynthesis.",
    sourceHint: "Prepared question set",
    points: 2,
  },
  {
    text: "Where does photosynthesis mainly occur in plant cells?",
    correct: "Chloroplast",
    distractors: ["Nucleus", "Mitochondria", "Ribosome"],
    explanation: "Chloroplasts contain chlorophyll and carry out photosynthesis.",
    sourceHint: "Prepared question set",
    points: 2,
  },
  {
    text: "Which organelle is known as the powerhouse of the cell?",
    correct: "Mitochondrion",
    distractors: ["Golgi apparatus", "Lysosome", "Chloroplast"],
    explanation: "Mitochondria generate most of the cell's usable energy.",
    sourceHint: "Prepared question set",
    points: 1,
  },
  {
    text: "Which process produces two genetically identical daughter cells?",
    correct: "Mitosis",
    distractors: ["Meiosis", "Diffusion", "Photosynthesis"],
    explanation: "Mitosis is responsible for regular cell division and growth.",
    sourceHint: "Prepared question set",
    points: 2,
  },
  {
    text: "What does ACID stand for in database systems?",
    correct: "Atomicity, Consistency, Isolation, Durability",
    distractors: [
      "Accuracy, Consistency, Integrity, Durability",
      "Atomicity, Concurrency, Isolation, Dependency",
      "Availability, Consistency, Integration, Durability",
    ],
    explanation: "ACID describes the core reliability properties of a transaction.",
    sourceHint: "Prepared question set",
    points: 3,
  },
  {
    text: "Which normal form removes partial dependency in a database?",
    correct: "Second Normal Form (2NF)",
    distractors: ["First Normal Form (1NF)", "Third Normal Form (3NF)", "BCNF"],
    explanation: "2NF removes partial dependencies on part of a composite key.",
    sourceHint: "Prepared question set",
    points: 3,
  },
  {
    text: "Which gas is absorbed by plants during photosynthesis?",
    correct: "Carbon dioxide",
    distractors: ["Oxygen", "Nitrogen", "Hydrogen"],
    explanation: "Plants use carbon dioxide along with water and sunlight.",
    sourceHint: "Prepared question set",
    points: 1,
  },
  {
    text: "Which biomolecule stores genetic information?",
    correct: "DNA",
    distractors: ["Protein", "Lipid", "Glucose"],
    explanation: "DNA carries hereditary information in living organisms.",
    sourceHint: "Prepared question set",
    points: 1,
  },
];

const shuffleOptions = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const generatePreparedQuestions = (count) => {
  const questions = [];

  for (let index = 0; index < count; index += 1) {
    const template = questionBank[index % questionBank.length];
    const options = shuffleOptions([template.correct, ...template.distractors]);
    const correctAnswer = options.findIndex((option) => option === template.correct);
    const versionSuffix = index >= questionBank.length ? ` (${Math.floor(index / questionBank.length) + 1})` : "";

    questions.push({
      id: Date.now() + index,
      text: `${template.text}${versionSuffix}`,
      options,
      correctAnswer,
      points: template.points,
      explanation: template.explanation,
      sourceHint: template.sourceHint,
    });
  }

  return questions;
};

export default function AIQuestionGenerator() {
  const navigate = useNavigate();
  const { index } = useParams();
  const quizIndex = Number.parseInt(index, 10);

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [autoPublish, setAutoPublish] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchQuizzes();
        setQuizzes(data || []);
      } catch (error) {
        setQuizzes([]);
        setLoadError("Unable to reach server. Start the backend to use shared quizzes.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [index]);

  const quiz = quizzes[quizIndex];

  if (loading) {
    return <div style={{ padding: 30, color: "white" }}>Loading quiz...</div>;
  }

  if (loadError) {
    return <div style={{ padding: 30, color: "white" }}>{loadError}</div>;
  }

  if (!quiz) {
    return <div style={{ padding: 30, color: "white" }}>Quiz not found</div>;
  }

  const onFileSelected = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedQuestions([]);

    const count = Number.parseInt(numQuestions, 10) || 5;

    setTimeout(() => {
      const questions = generatePreparedQuestions(count);
      setGeneratedQuestions(questions);
      setSelectedQuestions(questions.map((question) => question.id));
      setIsGenerating(false);
    }, 700);
  };

  const toggleSelect = (id) => {
    setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const approveSelected = async () => {
    const toAdd = generatedQuestions.filter((question) => selectedQuestions.includes(question.id));
    if (toAdd.length === 0) {
      alert("Select at least one question");
      return;
    }

    const updated = { ...quiz };
    if (!updated.questions) updated.questions = [];

    toAdd.forEach((question) => {
      updated.questions.push({
        id: (updated.questions.length || 0) + 1,
        text: question.text,
        questionText: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        explanation: question.explanation || "",
        sourceHint: question.sourceHint || "",
      });
      updated.totalPoints = (updated.totalPoints || 0) + question.points;
    });

    updated.materialFile = fileName;
    updated.aiGenerated = true;
    updated.aiMode = "prepared-questions";

    if (autoPublish) {
      updated.published = true;
      updated.status = "published";
    }

    const all = [...quizzes];
    all[quizIndex] = updated;
    setQuizzes(all);

    try {
      await updateQuiz(updated.quizId, updated);
    } catch (error) {
      alert("Unable to reach server. Start the backend to use shared quizzes.");
      return;
    }

    alert(`${toAdd.length} questions added`);
    navigate("/dashboard");
  };

  return (
    <div className="ai-generator-container">
      <style>{styles}</style>
      <div className="ai-generator-wrapper">
        <h2 style={{ color: "#ff00ff" }}>Prepared Question Generator</h2>

        <div className="material-section">
          <div style={{ marginBottom: 12 }}>
            Upload any PDF and the app will generate the prepared question set automatically.
          </div>
          <label className="upload-area">
            <input className="file-input" type="file" accept="application/pdf" onChange={onFileSelected} />
            <div style={{ color: "#ccc" }}>{fileName || "Click to choose a PDF file"}</div>
          </label>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <label style={{ color: "#ccc", display: "flex", alignItems: "center", gap: 8 }}>
              Number of questions:
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(event) => setNumQuestions(event.target.value)}
                style={{ width: 80, padding: 6, borderRadius: 6, border: "1px solid #9d00ff", background: "transparent", color: "#fff" }}
              />
            </label>

            <label style={{ color: "#ccc", display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={autoPublish} onChange={(event) => setAutoPublish(event.target.checked)} />
              <span style={{ fontSize: 13, color: "#aaa" }}>Publish quiz after adding</span>
            </label>
          </div>

          {isGenerating && (
            <div className="loading">
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "4px solid rgba(157,0,255,0.3)",
                  borderTop: "4px solid #9d00ff",
                  borderRadius: 20,
                  animation: "spin 1s linear infinite",
                }}
              />
              <div>Generating prepared questions...</div>
            </div>
          )}
        </div>

        <div className="generated-questions">
          {generatedQuestions.length > 0 && (
            <>
              <h3 style={{ color: "#9d00ff" }}>Generated Questions</h3>

              {generatedQuestions.map((question) => (
                <div key={question.id} className="question-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 700 }}>{question.text}</div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleSelect(question.id)}
                        />
                        <span style={{ fontSize: 12, color: "#aaa" }}>Include</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        style={{
                          padding: "6px 8px",
                          background: optionIndex === question.correctAnswer ? "rgba(0,255,153,0.08)" : "transparent",
                          borderRadius: 6,
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + optionIndex)})</strong>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                <button
                  className="btn-submit"
                  onClick={approveSelected}
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(135deg,#9d00ff,#ff00ff)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                >
                  Add Selected to Quiz
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setFileName("");
                    setGeneratedQuestions([]);
                    setSelectedQuestions([]);
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
