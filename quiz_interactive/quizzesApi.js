const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.port === "5000" ? "" : "http://localhost:5000");

const QUIZZES_API = `${API_BASE}/api/quizzes`;

const request = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const fetchQuizzes = async () => {
  const data = await request(QUIZZES_API);
  return data.quizzes || [];
};

export const createQuiz = async (quiz) => {
  return request(QUIZZES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz),
  });
};

export const updateQuiz = async (quizId, quiz) => {
  return request(`${QUIZZES_API}/${encodeURIComponent(quizId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz),
  });
};

export const deleteQuiz = async (quizId) => {
  return request(`${QUIZZES_API}/${encodeURIComponent(quizId)}`, {
    method: "DELETE",
  });
};

export { QUIZZES_API };
