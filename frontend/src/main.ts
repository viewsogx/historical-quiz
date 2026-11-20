import "./style.css";
import { fetchQuestion, checkAnswer, type Question } from "./api";

const TOTAL_QUESTIONS = 5;

const app = document.querySelector<HTMLDivElement>("#app")!;

let askedIds: number[] = [];
let score = 0;
let current: Question | null = null;

function renderStart(): void {
  app.innerHTML = `
    <div class="card">
      <h1>Történelem kvíz</h1>
      <p>${TOTAL_QUESTIONS} kérdés vár rád. Sok sikert!</p>
      <button id="start" class="primary">Kezdés</button>
    </div>
  `;
  app.querySelector("#start")!.addEventListener("click", startQuiz);
}

async function startQuiz(): Promise<void> {
  askedIds = [];
  score = 0;
  await loadNextQuestion();
}

async function loadNextQuestion(): Promise<void> {
  app.innerHTML = `<div class="card"><p>Betöltés…</p></div>`;
  try {
    current = await fetchQuestion(askedIds);
    askedIds.push(current.id);
    renderQuestion(current);
  } catch (err) {
    renderError(err);
  }
}

function renderQuestion(q: Question): void {
  app.innerHTML = `
    <div class="card">
      <div class="progress">${askedIds.length}. kérdés / ${TOTAL_QUESTIONS}</div>
      <h2>${escapeHtml(q.question)}</h2>
      <div class="answers">
        ${q.answers
          .map((a, i) => `<button class="answer" data-index="${i}">${escapeHtml(a)}</button>`)
          .join("")}
      </div>
      <p id="feedback" class="feedback"></p>
      <button id="next" class="primary hidden">
        ${askedIds.length < TOTAL_QUESTIONS ? "Következő kérdés" : "Eredmény"}
      </button>
    </div>
  `;

  const buttons = app.querySelectorAll<HTMLButtonElement>(".answer");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => onAnswer(q, q.answers[Number(btn.dataset.index)], btn, buttons))
  );
  app.querySelector("#next")!.addEventListener("click", () => {
    if (askedIds.length < TOTAL_QUESTIONS) loadNextQuestion();
    else renderResult();
  });
}

async function onAnswer(
  q: Question,
  answer: string,
  clicked: HTMLButtonElement,
  all: NodeListOf<HTMLButtonElement>
): Promise<void> {
  all.forEach((b) => (b.disabled = true));
  const feedback = app.querySelector<HTMLParagraphElement>("#feedback")!;

  try {
    const result = await checkAnswer(q.id, answer);
    if (result.correct) {
      score++;
      clicked.classList.add("correct");
      feedback.textContent = "Helyes válasz!";
    } else {
      clicked.classList.add("wrong");
      all.forEach((b) => {
        if (q.answers[Number(b.dataset.index)] === result.correctAnswer) b.classList.add("correct");
      });
      feedback.textContent = `Helytelen. A helyes válasz: ${result.correctAnswer}`;
    }
    app.querySelector("#next")!.classList.remove("hidden");
  } catch (err) {
    renderError(err);
  }
}

function renderResult(): void {
  app.innerHTML = `
    <div class="card">
      <h1>Vége a kvíznek!</h1>
      <p class="score">${score} / ${TOTAL_QUESTIONS}</p>
      <p>Ennyi helyes választ adtál.</p>
      <button id="restart" class="primary">Újra</button>
    </div>
  `;
  app.querySelector("#restart")!.addEventListener("click", startQuiz);
}

function renderError(err: unknown): void {
  const msg = err instanceof Error ? err.message : "Ismeretlen hiba.";
  app.innerHTML = `
    <div class="card">
      <h2>Hiba</h2>
      <p>${escapeHtml(msg)}</p>
      <p>Fut a backend a 3000-es porton?</p>
      <button id="retry" class="primary">Újrapróbálás</button>
    </div>
  `;
  app.querySelector("#retry")!.addEventListener("click", renderStart);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

renderStart();
