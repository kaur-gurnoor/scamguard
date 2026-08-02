// ScamGuard Senior - frontend logic
// Talks to the FastAPI backend defined in main.py

const API_BASE = "http://localhost:8000";
const QUESTION_COUNT = 6;

const UI_TRANSLATIONS = {
  en: {
    quizNav: "Quiz",
    analyzerNav: "Text Analyzer",
    quizHeaderTitle: "Spot the Scam",
    quizHeaderSubtitle: "Read or listen to each message, then decide if it's a scam or safe. Learn why afterward.",
    scoreLabel: "Score",
    questionLabel: "Question",
    loadingText: "Loading scenarios…",
    listenVoice: "🔈 Listen to Voice Call",
    voiceHint: "Tap to hear the message read aloud.",
    decisionPrompt: "What should you do?",
    btnScam: "🚨 It's a Scam",
    btnSafe: "✅ It's Safe",
    explanationLabel: "Explanation",
    btnNext: "Next Question →",
    trainingCompleteTitle: "Training Complete!",
    finalScorePrefix: "Your final score is",
    outOf: "out of",
    btnRestart: "Play Again",
    btnRetry: "Retry",
    analyzerTitle: "Custom Text Analyzer",
    analyzerSubtitle: "Paste a suspicious text message or email and check it for common scam warning signs.",
    analyzerInputLabel: "Message to analyze",
    analyzerPlaceholder: "Paste the message text here...",
    btnAnalyze: "Analyze Message",
    summaryLabel: "Summary",
    redFlagsLabel: "Red Flags Found",
    footerText: "Built to help older adults recognize and avoid common scams.",
    voiceLang: "en-US",
    voiceBadge: "VOICE CALL",
    textBadge: "TEXT MESSAGE",
    correctHeadline: "Correct! +1 Point",
    wrongHeadline: "Not quite - be careful."
  },
  es: {
    quizNav: "Cuestionario",
    analyzerNav: "Analizador de Texto",
    quizHeaderTitle: "Detecta la Estafa",
    quizHeaderSubtitle: "Lee o escucha cada mensaje, luego decide si es una estafa o si es seguro. Aprende el motivo después.",
    scoreLabel: "Puntuación",
    questionLabel: "Pregunta",
    loadingText: "Cargando escenarios…",
    listenVoice: "🔈 Escuchar llamada de voz",
    voiceHint: "Toca para escuchar el mensaje en voz alta.",
    decisionPrompt: "¿Qué deberías hacer?",
    btnScam: "🚨 Es una Estafa",
    btnSafe: "✅ Es Seguro",
    explanationLabel: "Explicación",
    btnNext: "Siguiente Pregunta →",
    trainingCompleteTitle: "¡Entrenamiento Completado!",
    finalScorePrefix: "Tu puntuación final es",
    outOf: "de",
    btnRestart: "Volver a Jugar",
    btnRetry: "Reintentar",
    analyzerTitle: "Analizador de Texto Personalizado",
    analyzerSubtitle: "Pega un mensaje de texto o correo sospechoso y comprueba si tiene señales de advertencia comunes de estafa.",
    analyzerInputLabel: "Mensaje a analizar",
    analyzerPlaceholder: "Pega el texto del mensaje aquí...",
    btnAnalyze: "Analizar Mensaje",
    summaryLabel: "Resumen",
    redFlagsLabel: "Señales de Alerta Encontradas",
    footerText: "Creado para ayudar a los adultos mayores a reconocer y evitar estafas comunes.",
    voiceLang: "es-ES",
    voiceBadge: "LLAMADA DE VOZ",
    textBadge: "MENSAJE DE TEXTO",
    correctHeadline: "¡Correcto! ¡+1 Punto!",
    wrongHeadline: "No del todo - ten cuidado."
  },
  fr: {
    quizNav: "Quiz",
    analyzerNav: "Analyseur de texte",
    quizHeaderTitle: "Repérez l'arnaque",
    quizHeaderSubtitle: "Lisez ou écoutez chaque message, puis décidez s'il s'agit d'une arnaque ou d'un message sûr.",
    scoreLabel: "Score",
    questionLabel: "Question",
    loadingText: "Chargement des scénarios…",
    listenVoice: "🔈 Écouter l'appel vocal",
    voiceHint: "Appuyez pour écouter le message à voix haute.",
    decisionPrompt: "Que devriez-vous faire ?",
    btnScam: "🚨 C'est une arnaque",
    btnSafe: "✅ C'est sûr",
    explanationLabel: "Explication",
    btnNext: "Question suivante →",
    trainingCompleteTitle: "Entraînement terminé !",
    finalScorePrefix: "Votre score final est de",
    outOf: "sur",
    btnRestart: "Rejouer",
    btnRetry: "Réessayer",
    analyzerTitle: "Analyseur de texte personnalisé",
    analyzerSubtitle: "Collez un message ou un e-mail suspect et vérifiez s'il contient des signes d'arnaque.",
    analyzerInputLabel: "Message à analyser",
    analyzerPlaceholder: "Collez le texte du message ici...",
    btnAnalyze: "Analyser le message",
    summaryLabel: "Résumé",
    redFlagsLabel: "Signaux d'alerte trouvés",
    footerText: "Conçu pour aider les séniors à reconnaître et éviter les arnaques.",
    voiceLang: "fr-FR",
    voiceBadge: "APPEL VOCAL",
    textBadge: "MESSAGE TEXTE",
    correctHeadline: "Correct ! +1 Point",
    wrongHeadline: "Pas tout à fait - soyez prudent."
  },
  de: {
    quizNav: "Quiz",
    analyzerNav: "Text-Analysator",
    quizHeaderTitle: "Erkenne den Betrug",
    quizHeaderSubtitle: "Lies oder höre jede Nachricht und entscheide, ob es Betrug oder sicher ist.",
    scoreLabel: "Punktestand",
    questionLabel: "Frage",
    loadingText: "Szenarien werden geladen…",
    listenVoice: "🔈 Sprachanruf anhören",
    voiceHint: "Tippe, um die Nachricht laut zu hören.",
    decisionPrompt: "Was solltest du tun?",
    btnScam: "🚨 Es ist Betrug",
    btnSafe: "✅ Es ist sicher",
    explanationLabel: "Erklärung",
    btnNext: "Nächste Frage →",
    trainingCompleteTitle: "Training abgeschlossen!",
    finalScorePrefix: "Dein Endergebnis ist",
    outOf: "von",
    btnRestart: "Erneut spielen",
    btnRetry: "Wiederholen",
    analyzerTitle: "Benutzerdefinierter Text-Analysator",
    analyzerSubtitle: "Füge eine verdächtige Nachricht ein und prüfe sie auf Warnzeichen.",
    analyzerInputLabel: "Zu analysierende Nachricht",
    analyzerPlaceholder: "Füge den Nachrichtentext hier ein...",
    btnAnalyze: "Nachricht analysieren",
    summaryLabel: "Zusammenfassung",
    redFlagsLabel: "Gefundene Warnsignale",
    footerText: "Entwickelt, um älteren Menschen zu helfen, Betrug zu erkennen.",
    voiceLang: "de-DE",
    voiceBadge: "SPRACHANRUF",
    textBadge: "TEXTNACHRICHT",
    correctHeadline: "Richtig! +1 Punkt",
    wrongHeadline: "Nicht ganz - sei vorsichtig."
  },
  hi: {
    quizNav: "क्विज़",
    analyzerNav: "टेक्स्ट विश्लेषक",
    quizHeaderTitle: "स्कैम को पहचानें",
    quizHeaderSubtitle: "प्रत्येक संदेश को पढ़ें या सुनें, फिर तय करें कि यह स्कैम है या सुरक्षित।",
    scoreLabel: "स्कोर",
    questionLabel: "प्रश्न",
    loadingText: "परिदृश्य लोड हो रहे हैं…",
    listenVoice: "🔈 कॉल सुनें",
    voiceHint: "संदेश को सुनने के लिए टैप करें।",
    decisionPrompt: "आपको क्या करना चाहिए?",
    btnScam: "🚨 यह एक स्कैम है",
    btnSafe: "✅ यह सुरक्षित है",
    explanationLabel: "स्पष्टीकरण",
    btnNext: "अगला प्रश्न →",
    trainingCompleteTitle: "प्रशिक्षण पूरा हुआ!",
    finalScorePrefix: "आपका अंतिम स्कोर है",
    outOf: "में से",
    btnRestart: "पुनः खेलें",
    btnRetry: "पुनः प्रयास करें",
    analyzerTitle: "टेक्स्ट विश्लेषक",
    analyzerSubtitle: "संदिग्ध संदेश पेस्ट करें और जांचें।",
    analyzerInputLabel: "विश्लेषण के लिए संदेश",
    analyzerPlaceholder: "संदेश यहाँ पेस्ट करें...",
    btnAnalyze: "संदेश का विश्लेषण करें",
    summaryLabel: "सारांश",
    redFlagsLabel: "चेतावनी के संकेत",
    footerText: "वरिष्ठ नागरिकों को स्कैम से बचाने में मदद के लिए निर्मित।",
    voiceLang: "hi-IN",
    voiceBadge: "वॉइस कॉल",
    textBadge: "टेक्स्ट संदेश",
    correctHeadline: "सही! +1 अंक",
    wrongHeadline: "सही नहीं - सावधान रहें।"
  },
  zh: {
    quizNav: "测验",
    analyzerNav: "文本分析器",
    quizHeaderTitle: "识别诈骗",
    quizHeaderSubtitle: "阅读或收听每条消息，判断是诈骗还是安全。",
    scoreLabel: "得分",
    questionLabel: "问题",
    loadingText: "正在加载场景…",
    listenVoice: "🔈 收听语音通话",
    voiceHint: "点击大声朗读消息。",
    decisionPrompt: "你该怎么做？",
    btnScam: "🚨 这是诈骗",
    btnSafe: "✅ 这是安全的",
    explanationLabel: "解释说明",
    btnNext: "下一题 →",
    trainingCompleteTitle: "训练完成！",
    finalScorePrefix: "你的最终得分是",
    outOf: "/",
    btnRestart: "再玩一次",
    btnRetry: "重试",
    analyzerTitle: "自定义文本分析器",
    analyzerSubtitle: "粘贴可疑的短信或电子邮件以检查常见防诈警示。",
    analyzerInputLabel: "要分析的消息",
    analyzerPlaceholder: "在此处粘贴消息文本...",
    btnAnalyze: "分析消息",
    summaryLabel: "摘要",
    redFlagsLabel: "发现的危险信号",
    footerText: "旨在帮助老年人识别并避免常见诈骗。",
    voiceLang: "zh-CN",
    voiceBadge: "语音通话",
    textBadge: "短信消息",
    correctHeadline: "正确！+1 分",
    wrongHeadline: "不完全正确 - 请保持警惕。"
  }
};

const state = {
  scenarios: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  lang: "en",
};

// ---- Element refs ----
const el = {
  navLinks: document.querySelectorAll(".nav-link:not(.lang-select)"),
  selectLang: document.getElementById("select-lang"),
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

// Update UI Text elements based on selected language
function applyLanguage() {
  const t = UI_TRANSLATIONS[state.lang] || UI_TRANSLATIONS["en"];
  if (!t) return;

  const quizNavBtn = document.querySelector('.nav-link[data-view="quiz"]');
  if (quizNavBtn) quizNavBtn.textContent = t.quizNav;

  const analyzerNavBtn = document.querySelector('.nav-link[data-view="analyzer"]');
  if (analyzerNavBtn) analyzerNavBtn.textContent = t.analyzerNav;

  const quizH1 = el.quizView.querySelector(".intro h1");
  if (quizH1) quizH1.textContent = t.quizHeaderTitle;

  const quizP = el.quizView.querySelector(".intro p");
  if (quizP) quizP.textContent = t.quizHeaderSubtitle;

  const scoreLabels = el.quizView.querySelectorAll(".score-label");
  if (scoreLabels[0]) scoreLabels[0].textContent = t.scoreLabel;
  if (scoreLabels[1]) scoreLabels[1].textContent = t.questionLabel;

  if (el.loadingState.querySelector("p")) el.loadingState.querySelector("p").innerHTML = t.loadingText;

  if (el.playVoiceBtn) el.playVoiceBtn.textContent = t.listenVoice;
  const voiceHint = el.voiceContent.querySelector(".voice-hint");
  if (voiceHint) voiceHint.textContent = t.voiceHint;

  const decisionPrompt = el.quizCard.querySelector(".decision-prompt");
  if (decisionPrompt) decisionPrompt.textContent = t.decisionPrompt;

  if (el.btnScam) el.btnScam.textContent = t.btnScam;
  if (el.btnSafe) el.btnSafe.textContent = t.btnSafe;

  const explainLabel = el.resultPanel.querySelector(".explain-label");
  if (explainLabel) explainLabel.textContent = t.explanationLabel;

  if (el.btnNext) el.btnNext.textContent = t.btnNext;

  const completeH2 = el.completeCard.querySelector("h2");
  if (completeH2) completeH2.textContent = t.trainingCompleteTitle;

  if (el.btnRestart) el.btnRestart.textContent = t.btnRestart;
  if (el.btnRetry) el.btnRetry.textContent = t.btnRetry;

  const analyzerH1 = el.analyzerView.querySelector(".intro h1");
  if (analyzerH1) analyzerH1.textContent = t.analyzerTitle;

  const analyzerP = el.analyzerView.querySelector(".intro p");
  if (analyzerP) analyzerP.textContent = t.analyzerSubtitle;

  const analyzerLabel = el.analyzerView.querySelector(".analyzer-label");
  if (analyzerLabel) analyzerLabel.textContent = t.analyzerInputLabel;

  if (el.analyzerInput) el.analyzerInput.placeholder = t.analyzerPlaceholder;
  if (el.btnAnalyze) el.btnAnalyze.textContent = t.btnAnalyze;

  const footerP = document.querySelector(".site-footer p");
  if (footerP) footerP.textContent = t.footerText;
}

// Select Language event handler
if (el.selectLang) {
  el.selectLang.addEventListener("change", (e) => {
    state.lang = e.target.value;
    applyLanguage();
    loadScenarios();
  });
}

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
    const res = await fetch(`${API_BASE}/api/scenarios?count=${QUESTION_COUNT}&lang=${state.lang}`);
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
  const t = UI_TRANSLATIONS[state.lang];
  state.answered = false;

  el.quizCard.classList.remove("hidden");
  el.completeCard.classList.add("hidden");
  el.resultPanel.classList.add("hidden");

  el.scoreValue.textContent = state.score;
  el.questionNum.textContent = state.currentIndex + 1;
  el.progressFill.style.width = `${(state.currentIndex / state.scenarios.length) * 100}%`;

  el.typeBadge.textContent = q.type === "voice" ? t.voiceBadge : t.textBadge;
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
  const t = UI_TRANSLATIONS[state.lang];
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(q.content);
  msg.lang = (t && t.voiceLang) ? t.voiceLang : state.lang;
  msg.rate = 0.85;
  window.speechSynthesis.speak(msg);
});

async function submitAnswer(userGuess) {
  if (state.answered) return;
  state.answered = true;
  el.btnScam.disabled = true;
  el.btnSafe.disabled = true;

  const q = state.scenarios[state.currentIndex];
  const t = UI_TRANSLATIONS[state.lang];

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

    el.resultHeadline.textContent = data.correct ? t.correctHeadline : t.wrongHeadline;
    el.resultHeadline.className = `result-headline ${data.correct ? "correct" : "wrong"}`;
    el.resultExplanation.textContent = data.explanation;
    el.resultPanel.classList.remove("hidden");

    if (window.Gamification) {
      const encouragement = Gamification.recordAnswer(data.correct);
      el.resultEncouragement.textContent = encouragement || "";
    }
  } catch (err) {
    el.resultHeadline.textContent = state.lang === "es" ? "No se pudo verificar tu respuesta." : "Couldn't verify your answer.";
    el.resultHeadline.className = "result-headline wrong";
    el.resultExplanation.textContent = state.lang === "es" ? "Hubo un problema al conectar con el servidor." : "There was a problem reaching the server. Please check your connection and try again.";
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
  const t = UI_TRANSLATIONS[state.lang] || UI_TRANSLATIONS["en"];
  el.quizCard.classList.add("hidden");
  el.completeCard.classList.remove("hidden");
  el.progressFill.style.width = "100%";
  el.finalScoreText.textContent = `${t.finalScorePrefix} ${state.score} ${t.outOf} ${state.scenarios.length}.`;

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

  const t = UI_TRANSLATIONS[state.lang];
  el.btnAnalyze.disabled = true;
  el.btnAnalyze.textContent = state.lang === "es" ? "Analizando..." : "Analyzing...";

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
    el.analyzerExplanation.textContent = state.lang === "es" ? "No se pudo conectar con el servidor de ScamGuard." : "Couldn't reach the ScamGuard server. Make sure the backend is running at " + API_BASE + ".";
    el.flagsSection.classList.add("hidden");
  } finally {
    el.btnAnalyze.disabled = false;
    el.btnAnalyze.textContent = t.btnAnalyze;
  }
});

// ---- Init ----
applyLanguage();
loadScenarios();

