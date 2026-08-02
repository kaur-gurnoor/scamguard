// ScamGuard Senior - frontend logic
// Talks to the FastAPI backend defined in main.py

const API_BASE = "http://localhost:8000";
const QUESTION_COUNT = 6;

const state = {
  scenarios: [],
  currentIndex: 0,
  score: 0,
  answered: false,
};

// ---- Element refs ----
const el = {
  navLinks: document.querySelectorAll(".nav-link"),
  quizView: document.getElementById("quiz-view"),
  analyzerView: document.getElementById("analyzer-view"),

  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  quizCard: document.getElementById("quiz-card"),
  completeCard: document.getElementById("complete-card"),

  scoreValue: document.getElementById("score-value"),
  questionNum: document.getElementById("question-num"),
  questionTotal: document.getElementById("question-total"),
  progressFill: document.getElementById("progress-fill"),

  typeBadge: document.getElementById("scenario-type-badge"),
  title: document.getElementById("scenario-title"),
  sender: document.getElementById("scenario-sender"),
  textContent: document.getElementById("text-content"),
  scenarioText: document.getElementById("scenario-text"),
  voiceContent: document.getElementById("voice-content"),
  playVoiceBtn: document.getElementById("play-voice-btn"),

  btnScam: document.getElementById("btn-scam"),
  btnSafe: document.getElementById("btn-safe"),

  resultPanel: document.getElementById("result-panel"),
  resultHeadline: document.getElementById("result-headline"),
  resultEncouragement: document.getElementById("result-encouragement"),
  resultExplanation: document.getElementById("result-explanation"),
  btnNext: document.getElementById("btn-next"),

  finalScoreText: document.getElementById("final-score-text"),
  btnRestart: document.getElementById("btn-restart"),
  btnRetry: document.getElementById("btn-retry"),
  apiBaseDisplay: document.getElementById("api-base-display"),

  analyzerInput: document.getElementById("analyzer-input"),
  btnAnalyze: document.getElementById("btn-analyze"),
  analyzerResult: document.getElementById("analyzer-result"),
  riskBadge: document.getElementById("risk-badge"),
  analyzerExplanation: document.getElementById("analyzer-explanation"),
  flagsSection: document.getElementById("flags-section"),
  flagsList: document.getElementById("flags-list"),
};

el.apiBaseDisplay.textContent = API_BASE;

// ---- Navigation ----
el.navLinks.forEach((btn) => {
  btn.addEventListener("click", () => {
    el.navLinks.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    el.quizView.classList.toggle("hidden", view !== "quiz");
    el.analyzerView.classList.toggle("hidden", view !== "analyzer");
  });
});

// ---- Quiz flow ----
async function loadScenarios() {
  el.loadingState.classList.remove("hidden");
  el.errorState.classList.add("hidden");
  el.quizCard.classList.add("hidden");
  el.completeCard.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/scenarios?count=${QUESTION_COUNT}`);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();

    state.scenarios = data.scenarios || [];
    state.currentIndex = 0;
    state.score = 0;
    state.answered = false;

    el.questionTotal.textContent = state.scenarios.length;
    el.loadingState.classList.add("hidden");

    if (state.scenarios.length === 0) {
      throw new Error("No scenarios returned");
    }

    renderQuestion();
  } catch (err) {
    el.loadingState.classList.add("hidden");
    el.errorState.classList.remove("hidden");
  }
}

function renderQuestion() {
  if (state.currentIndex >= state.scenarios.length) {
    showComplete();
    return;
  }

  const q = state.scenarios[state.currentIndex];
  state.answered = false;

  el.quizCard.classList.remove("hidden");
  el.completeCard.classList.add("hidden");
  el.resultPanel.classList.add("hidden");

  el.scoreValue.textContent = state.score;
  el.questionNum.textContent = state.currentIndex + 1;
  el.progressFill.style.width = `${(state.currentIndex / state.scenarios.length) * 100}%`;

  el.typeBadge.textContent = q.type === "voice" ? "VOICE CALL" : "TEXT MESSAGE";
  el.title.textContent = q.title;
  el.sender.textContent = q.sender;

  if (q.type === "text") {
    el.textContent.classList.remove("hidden");
    el.voiceContent.classList.add("hidden");
    el.scenarioText.textContent = q.content;
  } else {
    el.textContent.classList.add("hidden");
    el.voiceContent.classList.remove("hidden");
  }

  el.btnScam.disabled = false;
  el.btnSafe.disabled = false;
}

el.playVoiceBtn.addEventListener("click", () => {
  const q = state.scenarios[state.currentIndex];
  if (!q) return;
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(q.content);
  msg.rate = 0.85;
  window.speechSynthesis.speak(msg);
});

async function submitAnswer(userGuess) {
  if (state.answered) return;
  state.answered = true;
  el.btnScam.disabled = true;
  el.btnSafe.disabled = true;

  const q = state.scenarios[state.currentIndex];

  try {
    const res = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario_id: q.id,
        user_guess: userGuess,
        scenarios: state.scenarios,
      }),
    });

    if (!res.ok) throw new Error("Verify failed");
    const data = await res.json();

    if (data.correct) {
      state.score += 1;
      el.scoreValue.textContent = state.score;
    }

    el.resultHeadline.textContent = data.correct ? "Correct! +1 Point" : "Not quite - be careful.";
    el.resultHeadline.className = `result-headline ${data.correct ? "correct" : "wrong"}`;
    el.resultExplanation.textContent = data.explanation;
    el.resultPanel.classList.remove("hidden");

    if (window.Gamification) {
      const encouragement = Gamification.recordAnswer(data.correct);
      el.resultEncouragement.textContent = encouragement || "";
    }
  } catch (err) {
    el.resultHeadline.textContent = "Couldn't verify your answer.";
    el.resultHeadline.className = "result-headline wrong";
    el.resultExplanation.textContent = "There was a problem reaching the server. Please check your connection and try again.";
    el.resultPanel.classList.remove("hidden");
    el.resultEncouragement.textContent = "";
  }
}

el.btnScam.addEventListener("click", () => submitAnswer(true));
el.btnSafe.addEventListener("click", () => submitAnswer(false));

el.btnNext.addEventListener("click", () => {
  state.currentIndex += 1;
  renderQuestion();
});

function showComplete() {
  el.quizCard.classList.add("hidden");
  el.completeCard.classList.remove("hidden");
  el.progressFill.style.width = "100%";
  el.finalScoreText.textContent = `Your final score is ${state.score} out of ${state.scenarios.length}.`;

  if (window.Gamification) {
    Gamification.recordQuizComplete(state.score, state.scenarios.length);
  }
}

el.btnRestart.addEventListener("click", loadScenarios);
el.btnRetry.addEventListener("click", loadScenarios);

// ---- Analyzer flow ----
el.btnAnalyze.addEventListener("click", async () => {
  const text = el.analyzerInput.value.trim();
  if (!text) return;

  el.btnAnalyze.disabled = true;
  el.btnAnalyze.textContent = "Analyzing...";

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("Analyze failed");
    const data = await res.json();

    el.analyzerResult.classList.remove("hidden");
    el.riskBadge.textContent = data.risk_level;

    const riskClass = data.risk_level.startsWith("High")
      ? "high"
      : data.risk_level.startsWith("Medium")
      ? "medium"
      : "low";
    el.riskBadge.className = `risk-badge ${riskClass}`;

    el.analyzerExplanation.textContent = data.explanation;

    if (data.red_flags_found && data.red_flags_found.length > 0) {
      el.flagsSection.classList.remove("hidden");
      el.flagsList.innerHTML = "";
      data.red_flags_found.forEach((flag) => {
        const li = document.createElement("li");
        li.textContent = flag;
        el.flagsList.appendChild(li);
      });
    } else {
      el.flagsSection.classList.add("hidden");
    }

    if (window.Gamification) {
      Gamification.recordAnalyzerUse();
    }
  } catch (err) {
    el.analyzerResult.classList.remove("hidden");
    el.riskBadge.textContent = "Error";
    el.riskBadge.className = "risk-badge high";
    el.analyzerExplanation.textContent = "Couldn't reach the ScamGuard server. Make sure the backend is running at " + API_BASE + ".";
    el.flagsSection.classList.add("hidden");
  } finally {
    el.btnAnalyze.disabled = false;
    el.btnAnalyze.textContent = "Analyze Message";
  }
});

// ---- Init ----
loadScenarios();
