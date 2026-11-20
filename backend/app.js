import express from "express";
import cors from "cors";
import { questions } from "./questions.js";

export const app = express();

app.use(cors());
app.use(express.json());

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/question?exclude=1,5,7
// Véletlenszerű kérdés 4 (kevert) válaszlehetőséggel. A helyes választ NEM küldi el.
app.get("/api/question", (req, res) => {
  const exclude = String(req.query.exclude ?? "")
    .split(",")
    .map(Number)
    .filter(Number.isInteger);

  let pool = questions.filter((q) => !exclude.includes(q.id));
  if (pool.length === 0) pool = questions;

  const q = pool[Math.floor(Math.random() * pool.length)];
  res.json({ id: q.id, question: q.question, answers: shuffle(q.answers) });
});

// POST /api/answer  body: { "id": 1, "answer": "1526" }
// Megmondja, hogy a megadott válasz helyes-e.
app.post("/api/answer", (req, res) => {
  const { id, answer } = req.body ?? {};
  const q = questions.find((x) => x.id === Number(id));

  if (!q) return res.status(404).json({ error: "Nincs ilyen kérdés." });
  if (typeof answer !== "string") return res.status(400).json({ error: "Hiányzó válasz." });

  const correctAnswer = q.answers[0];
  res.json({ id: q.id, correct: answer === correctAnswer, correctAnswer });
});
