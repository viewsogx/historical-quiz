import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../app.js";
import { questions } from "../questions.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0); // véletlen szabad port
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

const post = (body) =>
  fetch(`${baseUrl}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

test("GET /api/question: kérdés 4 válasszal, helyes válasz nélkül", async () => {
  const res = await fetch(`${baseUrl}/api/question`);
  assert.equal(res.status, 200);
  const q = await res.json();
  assert.equal(typeof q.id, "number");
  assert.equal(typeof q.question, "string");
  assert.equal(q.answers.length, 4);
  assert.equal(q.correctAnswer, undefined);
});

test("GET /api/question: az exclude-ban megadott kérdések nem jönnek", async () => {
  const exclude = questions.map((q) => q.id).filter((id) => id !== 7);
  for (let i = 0; i < 10; i++) {
    const q = await (await fetch(`${baseUrl}/api/question?exclude=${exclude.join(",")}`)).json();
    assert.equal(q.id, 7);
  }
});

test("POST /api/answer: helyes válasz", async () => {
  const res = await post({ id: 1, answer: "1526" });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { id: 1, correct: true, correctAnswer: "1526" });
});

test("POST /api/answer: helytelen válasz", async () => {
  const data = await (await post({ id: 1, answer: "1456" })).json();
  assert.equal(data.correct, false);
  assert.equal(data.correctAnswer, "1526");
});

test("POST /api/answer: nem létező kérdés -> 404", async () => {
  assert.equal((await post({ id: 999, answer: "x" })).status, 404);
});

test("POST /api/answer: hiányzó válasz -> 400", async () => {
  assert.equal((await post({ id: 1 })).status, 400);
});

test("minden kérdésnek 4 különböző válasza van", () => {
  for (const q of questions) {
    assert.equal(new Set(q.answers).size, 4, `Hibás kérdés: ${q.id}`);
  }
});
