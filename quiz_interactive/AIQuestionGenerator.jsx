import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { fetchQuizzes, updateQuiz } from "./quizzesApi";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

const stopWords = new Set([
  "about", "after", "again", "against", "along", "also", "among", "because", "before", "being",
  "between", "both", "could", "does", "during", "each", "from", "have", "into", "more", "most",
  "other", "over", "same", "should", "some", "such", "than", "that", "their", "there", "these",
  "they", "this", "those", "through", "under", "until", "very", "what", "when", "where", "which",
  "while", "with", "would", "your", "about", "above", "across", "after", "below", "cannot",
  "every", "first", "found", "given", "important", "material", "often", "using", "within",
]);

const normalizeText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim();

const splitIntoSentences = (text) =>
  normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 220);

const extractKeyPhrases = (text) => {
  const phrases = new Map();
  const normalized = normalizeText(text);
  const capitalizedMatches = normalized.match(/\b[A-Z][a-zA-Z0-9-]{2,}(?:\s+[A-Z][a-zA-Z0-9-]{2,})*/g) || [];

  capitalizedMatches.forEach((match) => {
    const phrase = match.trim();
    if (phrase.length >= 4) {
      phrases.set(phrase, (phrases.get(phrase) || 0) + 3);
    }
  });

  const words = normalized.match(/\b[a-zA-Z][a-zA-Z-]{4,}\b/g) || [];
  words.forEach((word) => {
    const lower = word.toLowerCase();
    if (!stopWords.has(lower)) {
      phrases.set(word, (phrases.get(word) || 0) + 1);
    }
  });

  return [...phrases.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([phrase]) => phrase)
    .filter((phrase, index, all) => all.findIndex((item) => item.toLowerCase() === phrase.toLowerCase()) === index);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findSentenceTerm = (sentence, keyPhrases) => {
  const sentenceLower = sentence.toLowerCase();
  const phraseMatch = keyPhrases.find((phrase) => {
    const lower = phrase.toLowerCase();
    return lower.length >= 4 && sentenceLower.includes(lower);
  });

  if (phraseMatch) return phraseMatch;

  const words = sentence.match(/\b[a-zA-Z][a-zA-Z-]{4,}\b/g) || [];
  const candidate = words
    .filter((word) => !stopWords.has(word.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0];

  return candidate || null;
};

const shuffleOptions = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const buildQuestionsFromText = (rawText, count) => {
  const text = normalizeText(rawText);
  const sentences = splitIntoSentences(text);
  const keyPhrases = extractKeyPhrases(text);

  if (sentences.length === 0 || keyPhrases.length < 4) {
    return {
      summary: "",
      warnings: [
        "The PDF did not contain enough selectable text for question generation. Text-based PDFs work best in free mode.",
      ],
      questions: [],
    };
  }

  const summary = sentences.slice(0, 2).join(" ").slice(0, 260);
  const warnings = [
    "Free mode generates questions from extracted PDF text, so scanned PDFs may produce weaker results.",
  ];
  const usedPrompts = new Set();
  const questions = [];

  for (const sentence of sentences) {
    if (questions.length >= count) break;

    const answer = findSentenceTerm(sentence, keyPhrases);
    if (!answer || answer.length < 4) continue;

    const regex = new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i");
    if (!regex.test(sentence)) continue;

    const promptSentence = sentence.replace(regex, "_____");
    if (promptSentence === sentence || promptSentence.includes("_____ _____")) continue;

    const distractors = keyPhrases
      .filter((phrase) => phrase.toLowerCase() !== answer.toLowerCase() && !sentence.toLowerCase().includes(phrase.toLowerCase()))
      .slice(0, 12)
      .filter((phrase, index, all) => all.findIndex((item) => item.toLowerCase() === phrase.toLowerCase()) === index)
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const prompt = `According to the uploaded material, which term correctly completes this statement?\n\n${promptSentence}`;
    if (usedPrompts.has(prompt)) continue;
    usedPrompts.add(prompt);

    const options = shuffleOptions([answer, ...distractors]);
    const correctAnswer = options.findIndex((option) => option === answer);
    const points = sentence.length > 130 ? 3 : sentence.length > 90 ? 2 : 1;

    questions.push({
      id: Date.now() + questions.length,
      text: prompt,
      options,
      correctAnswer,
      points,
      explanation: `The original sentence in the material uses "${answer}" in that blank.`,
      sourceHint: sentence.slice(0, 140),
    });
  }

  if (questions.length < count) {
    warnings.push(`Only ${questions.length} strong question(s) could be generated from the extracted text.`);
  }

  return {
    summary,
    warnings,
    questions,
  };
};

const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str || "").join(" ");
    text += `${pageText}\n`;
  }

  return text;
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
  const [aiError, setAiError] = useState("");
  const [generationWarnings, setGenerationWarnings] = useState([]);
  const [materialSummary, setMaterialSummary] = useState("");

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

  const resetGenerationState = () => {
    setGeneratedQuestions([]);
    setSelectedQuestions([]);
    setAiError("");
    setGenerationWarnings([]);
    setMaterialSummary("");
  };

  const onFileSelected = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileName(file.name);
      resetGenerationState();
      setAiError("Free mode currently supports text-based PDF files only.");
      return;
    }

    setFileName(file.name);
    setIsGenerating(true);
    resetGenerationState();

    try {
      const extractedText = await extractTextFromPDF(file);
      const count = Number.parseInt(numQuestions, 10) || 5;
      const result = buildQuestionsFromText(extractedText, count);

      setGeneratedQuestions(result.questions);
      setSelectedQuestions(result.questions.map((question) => question.id));
      setGenerationWarnings(result.warnings);
      setMaterialSummary(result.summary);

      if (result.questions.length === 0) {
        setAiError("No strong questions could be generated from this PDF. Try a text-based PDF with clearer content.");
      }
    } catch (error) {
      console.error("Free PDF generation failed:", error);
      setAiError("Unable to read this PDF. Try another text-based PDF file.");
    } finally {
      setIsGenerating(false);
    }
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
    updated.aiMode = "free-local";

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
        <h2 style={{ color: "#ff00ff" }}>Free PDF Question Generator</h2>

        <div className="material-section">
          <div style={{ marginBottom: 12 }}>
            Upload a text-based PDF and the app will generate free local questions from the extracted text.
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
              <div>Reading the PDF and generating free local questions...</div>
            </div>
          )}

          {aiError && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ff6b6b",
                background: "rgba(255, 107, 107, 0.12)",
                color: "#ffd6d6",
              }}
            >
              {aiError}
            </div>
          )}
        </div>

        <div className="generated-questions">
          {generatedQuestions.length > 0 && (
            <>
              <h3 style={{ color: "#9d00ff" }}>Generated Questions</h3>

              {materialSummary && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#ddd",
                  }}
                >
                  <strong style={{ color: "#fff" }}>Material summary:</strong> {materialSummary}
                </div>
              )}

              {generationWarnings.length > 0 && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #ffaa00",
                    background: "rgba(255, 170, 0, 0.10)",
                    color: "#ffe0a3",
                  }}
                >
                  {generationWarnings.map((warning, warningIndex) => (
                    <div key={warningIndex}>{warning}</div>
                  ))}
                </div>
              )}

              {generatedQuestions.map((question) => (
                <div key={question.id} className="question-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 700, whiteSpace: "pre-line" }}>{question.text}</div>
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

                  {(question.explanation || question.sourceHint) && (
                    <div style={{ marginTop: 10, color: "#bbb", fontSize: 13 }}>
                      {question.explanation && (
                        <div>
                          <strong style={{ color: "#fff" }}>Why:</strong> {question.explanation}
                        </div>
                      )}
                      {question.sourceHint && (
                        <div>
                          <strong style={{ color: "#fff" }}>From:</strong> {question.sourceHint}
                        </div>
                      )}
                    </div>
                  )}
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
                    resetGenerationState();
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
