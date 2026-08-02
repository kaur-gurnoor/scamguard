// ScamGuard Senior - Gamification System
// XP, levels, streaks, badges, challenges, personalized goals, and celebrations.
// Everything persists in localStorage. Pure front-end, no backend dependency.

const Gamification = (() => {
  const STORAGE_KEY = "scamguard_gamification";

  // XP awarded per action
  const XP = {
    ANSWER: 10,
    CORRECT_BONUS: 5,
    QUIZ_COMPLETE: 25,
    PERFECT_ROUND: 50,
    ANALYZER_USE: 5,
  };

  const LEVEL_THRESHOLDS = [0, 80, 200, 380, 620, 950, 1400, 2000, 2800, 3800, 5000, 6500];

  const THEMES = [
    { level: 1, id: "classic", name: "Classic Blue", primary: "#2454a8", primaryDark: "#173b7e", accent: "#0b8f6d" },
    { level: 2, id: "ocean", name: "Ocean", primary: "#0f6e8c", primaryDark: "#0a4f65", accent: "#12a4a0" },
    { level: 3, id: "sunset", name: "Sunset", primary: "#b5502e", primaryDark: "#8a3b20", accent: "#d98324" },
    { level: 4, id: "forest", name: "Forest", primary: "#2f6b3a", primaryDark: "#204a28", accent: "#7a9e3f" },
    { level: 5, id: "berry", name: "Berry", primary: "#8c2f6b", primaryDark: "#63204c", accent: "#c1447e" },
    { level: 7, id: "midnight", name: "Midnight", primary: "#33397a", primaryDark: "#22265a", accent: "#5c63b8" },
  ];

  const BADGES = [
    { id: "first_steps", name: "First Steps", icon: "\u{1F423}", desc: "Answer your first question.", check: (s) => s.stats.questionsAnswered >= 1 },
    { id: "quiz_champion", name: "Quiz Champion", icon: "\u{1F3C6}", desc: "Complete a full quiz round.", check: (s) => s.stats.quizzesCompleted >= 1 },
    { id: "perfect_round", name: "Perfect Round", icon: "\u{1F31F}", desc: "Get every question right in a round.", check: (s) => s.stats.perfectRounds >= 1 },
    { id: "sharp_eye", name: "Sharp Eye", icon: "\u{1F575}️", desc: "Get 20 correct answers total.", check: (s) => s.stats.correctAnswers >= 20 },
    { id: "dedicated_learner", name: "Dedicated Learner", icon: "\u{1F4DA}", desc: "Answer 50 questions total.", check: (s) => s.stats.questionsAnswered >= 50 },
    { id: "scam_sleuth", name: "Scam Sleuth", icon: "\u{1F50D}", desc: "Use the Text Analyzer 10 times.", check: (s) => s.stats.analyzerUses >= 10 },
    { id: "week_warrior", name: "Week Warrior", icon: "\u{1F525}", desc: "Reach a 7-day streak.", check: (s) => s.streak.longest >= 7 },
    { id: "month_master", name: "Month Master", icon: "\u{1F5D3}️", desc: "Reach a 30-day streak.", check: (s) => s.streak.longest >= 30 },
    { id: "century_club", name: "Century Club", icon: "\u{1F4AF}", desc: "Earn 100 total XP.", check: (s) => s.xp >= 100 },
    { id: "high_roller", name: "High Roller", icon: "\u{1F48E}", desc: "Earn 500 total XP.", check: (s) => s.xp >= 500 },
    { id: "rising_star", name: "Rising Star", icon: "⭐", desc: "Reach Level 5.", check: (s) => getLevel(s.xp).level >= 5 },
  ];

  const CHALLENGES = {
    daily: { label: "Answer 3 questions today", target: 3, xp: 20 },
    weekly: { label: "Complete 3 quiz rounds this week", target: 3, xp: 75 },
    monthly: { label: "Answer 100 questions this month", target: 100, xp: 200 },
  };

  const ENCOURAGEMENTS_CORRECT = [
    "Nice catch! You spotted it.",
    "Sharp eyes! That's exactly right.",
    "You're getting better at this every day.",
    "Great instincts on that one.",
    "That's the kind of thinking that stops scammers cold.",
  ];

  const ENCOURAGEMENTS_WRONG = [
    "Good try, this one's tricky. Read the explanation below.",
    "Scammers count on people missing this one, now you won't.",
    "That's exactly why we practice, keep going.",
    "Close look, that one fools a lot of people.",
  ];

  const defaultState = () => ({
    xp: 0,
    stats: {
      questionsAnswered: 0,
      correctAnswers: 0,
      quizzesCompleted: 0,
      perfectRounds: 0,
      analyzerUses: 0,
    },
    streak: { current: 0, longest: 0, lastActiveDate: null },
    badges: [],
    challenges: {
      daily: { periodKey: null, progress: 0, completed: false },
      weekly: { periodKey: null, progress: 0, completed: false },
      monthly: { periodKey: null, progress: 0, completed: false },
    },
    goal: { text: "", target: 0, startCount: 0, progress: 0 },
    unlockedThemes: ["classic"],
    activeTheme: "classic",
  });

  let state = defaultState();

  // ---- Persistence ----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { ...defaultState(), ...parsed };
        state.stats = { ...defaultState().stats, ...(parsed.stats || {}) };
        state.streak = { ...defaultState().streak, ...(parsed.streak || {}) };
        state.challenges = {
          daily: { ...defaultState().challenges.daily, ...((parsed.challenges || {}).daily || {}) },
          weekly: { ...defaultState().challenges.weekly, ...((parsed.challenges || {}).weekly || {}) },
          monthly: { ...defaultState().challenges.monthly, ...((parsed.challenges || {}).monthly || {}) },
        };
        state.goal = { ...defaultState().goal, ...(parsed.goal || {}) };
      }
    } catch (e) {
      state = defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable, ignore */
    }
  }

  // ---- Date helpers ----
  function dayKey(d) {
    return d.toISOString().slice(0, 10);
  }
  function monthKey(d) {
    return d.toISOString().slice(0, 7);
  }
  function weekKey(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${weekNo}`;
  }
  function daysBetween(a, b) {
    const msPerDay = 86400000;
    const da = new Date(a + "T00:00:00Z").getTime();
    const db = new Date(b + "T00:00:00Z").getTime();
    return Math.round((db - da) / msPerDay);
  }

  // ---- Levels ----
  function getLevel(xp) {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    }
    const idx = level - 1;
    const currentFloor = LEVEL_THRESHOLDS[idx] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const nextThreshold = LEVEL_THRESHOLDS[idx + 1] ?? currentFloor + 2000;
    return { level, currentFloor, nextThreshold };
  }

  function unlockThemesForLevel(level) {
    const newlyUnlocked = [];
    THEMES.forEach((t) => {
      if (t.level <= level && !state.unlockedThemes.includes(t.id)) {
        state.unlockedThemes.push(t.id);
        newlyUnlocked.push(t);
      }
    });
    return newlyUnlocked;
  }

  // ---- Streak ----
  function touchStreak() {
    const today = dayKey(new Date());
    const last = state.streak.lastActiveDate;

    if (last === today) return; // already counted today

    if (last === null) {
      state.streak.current = 1;
    } else {
      const gap = daysBetween(last, today);
      if (gap === 1) {
        state.streak.current += 1;
      } else if (gap > 1) {
        state.streak.current = 1;
      }
      // gap <= 0 shouldn't happen since last !== today, ignore
    }

    state.streak.lastActiveDate = today;
    if (state.streak.current > state.streak.longest) {
      state.streak.longest = state.streak.current;
    }
  }

  // ---- Challenges ----
  function ensureChallengePeriod(type) {
    const now = new Date();
    const key = type === "daily" ? dayKey(now) : type === "weekly" ? weekKey(now) : monthKey(now);
    const ch = state.challenges[type];
    if (ch.periodKey !== key) {
      ch.periodKey = key;
      ch.progress = 0;
      ch.completed = false;
    }
  }

  function ensureAllChallengePeriods() {
    ensureChallengePeriod("daily");
    ensureChallengePeriod("weekly");
    ensureChallengePeriod("monthly");
  }

  function bumpChallenge(type, amount) {
    ensureChallengePeriod(type);
    const def = CHALLENGES[type];
    const ch = state.challenges[type];
    if (ch.completed) return;

    ch.progress = Math.min(def.target, ch.progress + amount);
    if (ch.progress >= def.target) {
      ch.completed = true;
      addXP(def.xp, `Challenge complete: ${def.label}`);
      showToast({
        icon: "\u{1F3C5}",
        title: "Challenge Complete!",
        subtitle: `${def.label} (+${def.xp} XP)`,
        variant: "challenge",
      });
    }
  }

  // ---- Badges ----
  function checkBadges() {
    const newly = [];
    BADGES.forEach((b) => {
      if (!state.badges.includes(b.id) && b.check(state)) {
        state.badges.push(b.id);
        newly.push(b);
      }
    });
    newly.forEach((b) => {
      showToast({
        icon: b.icon,
        title: "Achievement Unlocked!",
        subtitle: b.name,
        variant: "badge",
      });
    });
    return newly;
  }

  // ---- XP / Level up ----
  function addXP(amount, reason) {
    const before = getLevel(state.xp).level;
    state.xp += amount;
    const after = getLevel(state.xp);

    if (after.level > before) {
      const unlocked = unlockThemesForLevel(after.level);
      showToast({
        icon: "\u{1F389}",
        title: `Level Up! Level ${after.level}`,
        subtitle: unlocked.length
          ? `New theme unlocked: ${unlocked.map((t) => t.name).join(", ")}`
          : "Keep up the great work.",
        variant: "level",
      });
    }
  }

  // ---- Goal ----
  function setGoal(text, target) {
    state.goal = {
      text: text || "",
      target: Math.max(0, parseInt(target, 10) || 0),
      startCount: state.stats.quizzesCompleted,
      progress: 0,
    };
    save();
    renderPanel();
  }

  function updateGoalProgress() {
    if (!state.goal.target) return;
    const done = state.stats.quizzesCompleted - state.goal.startCount;
    state.goal.progress = Math.max(0, Math.min(state.goal.target, done));
  }

  // ---- Public recording actions ----
  function recordAnswer(isCorrect) {
    ensureAllChallengePeriods();
    touchStreak();

    state.stats.questionsAnswered += 1;
    if (isCorrect) state.stats.correctAnswers += 1;

    addXP(XP.ANSWER + (isCorrect ? XP.CORRECT_BONUS : 0), "answer");
    bumpChallenge("daily", 1);
    bumpChallenge("monthly", 1);

    checkBadges();
    save();
    renderHUD();
    renderPanel();

    return isCorrect
      ? ENCOURAGEMENTS_CORRECT[Math.floor(Math.random() * ENCOURAGEMENTS_CORRECT.length)]
      : ENCOURAGEMENTS_WRONG[Math.floor(Math.random() * ENCOURAGEMENTS_WRONG.length)];
  }

  function recordQuizComplete(score, total) {
    ensureAllChallengePeriods();
    state.stats.quizzesCompleted += 1;
    const isPerfect = total > 0 && score === total;
    if (isPerfect) state.stats.perfectRounds += 1;

    addXP(XP.QUIZ_COMPLETE + (isPerfect ? XP.PERFECT_ROUND : 0), "quiz complete");
    bumpChallenge("weekly", 1);

    updateGoalProgress();
    checkBadges();
    save();
    renderHUD();
    renderPanel();
  }

  function recordAnalyzerUse() {
    ensureAllChallengePeriods();
    touchStreak();
    state.stats.analyzerUses += 1;
    addXP(XP.ANALYZER_USE, "analyzer use");
    checkBadges();
    save();
    renderHUD();
    renderPanel();
  }

  function setActiveTheme(themeId) {
    if (!state.unlockedThemes.includes(themeId)) return;
    state.activeTheme = themeId;
    save();
    applyTheme();
    renderPanel();
  }

  function applyTheme() {
    const theme = THEMES.find((t) => t.id === state.activeTheme) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-primary-dark", theme.primaryDark);
    root.style.setProperty("--theme-accent", theme.accent);
  }

  // ---- Toasts ----
  let toastContainer;

  function showToast({ icon, title, subtitle, variant }) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `game-toast game-toast-${variant || "xp"}`;
    toast.innerHTML = `
      <span class="game-toast-icon">${icon}</span>
      <span class="game-toast-text">
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </span>
    `;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  // ---- HUD ----
  let hudEl, panelOverlay;

  function buildHUD() {
    hudEl = document.createElement("button");
    hudEl.id = "gamification-hud";
    hudEl.className = "gamification-hud";
    hudEl.setAttribute("aria-label", "Open your progress");
    document.body.appendChild(hudEl);
    hudEl.addEventListener("click", openPanel);

    toastContainer = document.createElement("div");
    toastContainer.id = "game-toast-container";
    toastContainer.className = "game-toast-container";
    document.body.appendChild(toastContainer);

    panelOverlay = document.createElement("div");
    panelOverlay.id = "progress-overlay";
    panelOverlay.className = "modal-overlay hidden";
    document.body.appendChild(panelOverlay);

    panelOverlay.addEventListener("click", (e) => {
      if (e.target === panelOverlay) closePanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panelOverlay.classList.contains("hidden")) closePanel();
    });
  }

  function renderHUD() {
    if (!hudEl) return;
    const lvl = getLevel(state.xp);
    const span = lvl.nextThreshold - lvl.currentFloor;
    const into = state.xp - lvl.currentFloor;
    const pct = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 100;

    hudEl.innerHTML = `
      <span class="hud-streak">\u{1F525} ${state.streak.current}</span>
      <span class="hud-level">Lv ${lvl.level}</span>
      <span class="hud-xp-track"><span class="hud-xp-fill" style="width:${pct}%"></span></span>
    `;
  }

  function renderPanel() {
    if (!panelOverlay) return;
    const lvl = getLevel(state.xp);
    const span = lvl.nextThreshold - lvl.currentFloor;
    const into = state.xp - lvl.currentFloor;
    const pct = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 100;

    const badgesHtml = BADGES.map((b) => {
      const unlocked = state.badges.includes(b.id);
      return `
        <div class="badge-tile ${unlocked ? "unlocked" : "locked"}" title="${b.desc}">
          <span class="badge-icon">${unlocked ? b.icon : "\u{1F512}"}</span>
          <span class="badge-name">${b.name}</span>
        </div>`;
    }).join("");

    const challengeHtml = ["daily", "weekly", "monthly"]
      .map((type) => {
        ensureChallengePeriod(type);
        const def = CHALLENGES[type];
        const ch = state.challenges[type];
        const pctC = Math.round((ch.progress / def.target) * 100);
        return `
          <div class="challenge-row">
            <div class="challenge-info">
              <span class="challenge-label">${type[0].toUpperCase() + type.slice(1)}: ${def.label}</span>
              <span class="challenge-progress-text">${ch.progress}/${def.target} ${ch.completed ? "✅" : ""}</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${pctC}%"></div></div>
          </div>`;
      })
      .join("");

    const themeHtml = THEMES.map((t) => {
      const unlocked = state.unlockedThemes.includes(t.id);
      const active = state.activeTheme === t.id;
      return `
        <button class="theme-swatch ${active ? "active" : ""} ${unlocked ? "" : "locked"}"
          data-theme-id="${t.id}" ${unlocked ? "" : "disabled"}
          title="${unlocked ? t.name : `Unlock at Level ${t.level}`}"
          style="background:${t.primary}">
          ${unlocked ? "" : "\u{1F512}"}
        </button>`;
    }).join("");

    updateGoalProgress();
    const goalPct = state.goal.target ? Math.round((state.goal.progress / state.goal.target) * 100) : 0;

    panelOverlay.innerHTML = `
      <div class="modal-panel progress-panel" role="dialog" aria-modal="true" aria-labelledby="progress-panel-title">
        <div class="modal-header">
          <h2 id="progress-panel-title">Your Progress</h2>
          <button class="modal-close" id="progress-close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">

          <div class="level-summary">
            <div class="level-badge">Lv ${lvl.level}</div>
            <div class="level-details">
              <p class="settings-label" style="margin-bottom:6px;">${state.xp} XP total</p>
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
              <p class="settings-hint">${lvl.nextThreshold - state.xp} XP to next level</p>
            </div>
          </div>

          <div class="streak-summary">
            <div>
              <span class="streak-flame">\u{1F525}</span>
              <strong>${state.streak.current}-day streak</strong>
            </div>
            <span class="settings-hint">Longest: ${state.streak.longest} days</span>
          </div>

          <div class="settings-group">
            <p class="settings-label">Trophy Case</p>
            <div class="badge-grid">${badgesHtml}</div>
          </div>

          <div class="settings-group">
            <p class="settings-label">Challenges</p>
            ${challengeHtml}
          </div>

          <div class="settings-group">
            <p class="settings-label">Your Goal</p>
            <div class="goal-editor">
              <input type="text" id="goal-text-input" placeholder="e.g. Practice every day this week" value="${state.goal.text.replace(/"/g, "&quot;")}">
              <input type="number" id="goal-target-input" min="1" placeholder="Rounds" value="${state.goal.target || ""}" style="width:80px;">
              <button class="btn btn-primary" id="goal-save-btn">Save</button>
            </div>
            ${
              state.goal.target
                ? `<p class="settings-hint" style="margin-top:8px;">${state.goal.text || "Goal"}: ${state.goal.progress}/${state.goal.target} quiz rounds</p>
                   <div class="progress-track"><div class="progress-fill" style="width:${goalPct}%"></div></div>`
                : `<p class="settings-hint" style="margin-top:8px;">Set a personal goal to track your own pace.</p>`
            }
          </div>

          <div class="settings-group">
            <p class="settings-label">Themes (unlock by leveling up)</p>
            <div class="theme-grid">${themeHtml}</div>
          </div>

        </div>
      </div>
    `;

    panelOverlay.querySelector("#progress-close-btn").addEventListener("click", closePanel);
    panelOverlay.querySelector("#goal-save-btn").addEventListener("click", () => {
      const text = panelOverlay.querySelector("#goal-text-input").value;
      const target = panelOverlay.querySelector("#goal-target-input").value;
      setGoal(text, target);
    });
    panelOverlay.querySelectorAll(".theme-swatch:not(.locked)").forEach((btn) => {
      btn.addEventListener("click", () => setActiveTheme(btn.dataset.themeId));
    });
  }

  function openPanel() {
    renderPanel();
    panelOverlay.classList.remove("hidden");
  }

  function closePanel() {
    panelOverlay.classList.add("hidden");
  }

  function init() {
    load();
    ensureAllChallengePeriods();
    save();
    buildHUD();
    applyTheme();
    renderHUD();
  }

  return {
    init,
    recordAnswer,
    recordQuizComplete,
    recordAnalyzerUse,
    setGoal,
    setActiveTheme,
    openPanel,
    closePanel,
    getState: () => ({ ...state }),
  };
})();

document.addEventListener("DOMContentLoaded", () => Gamification.init());
