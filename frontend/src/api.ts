export interface Question {
  id: number;
  question: string;
  answers: string[];
}

export interface AnswerResult {
  id: number;
  correct: boolean;
  correctAnswer: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function fetchQuestion(exclude: number[]): Promise<Question> {
  const res = await fetch(`${API_URL}/api/question?exclude=${exclude.join(",")}`);
  if (!res.ok) throw new Error("Nem sikerült lekérni a kérdést.");
  return res.json();
}

export async function checkAnswer(id: number, answer: string): Promise<AnswerResult> {
  const res = await fetch(`${API_URL}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, answer })
  });
  if (!res.ok) throw new Error("Nem sikerült ellenőrizni a választ.");
  return res.json();
}
