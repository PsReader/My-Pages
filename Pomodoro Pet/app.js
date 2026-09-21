(function () {
  "use strict";

  const STORAGE_KEY = "pomodoroPetState";
  const EVENT_LOG_KEY = "pomodoroPetEventLog";
  const MAX_LOCAL_EVENTS = 250;
  const APP_VERSION = "1.0.0";

  const DEV_MODE = new URLSearchParams(window.location.search).has("dev");

  const CIRC = 2 * Math.PI * 86;

  const STAGES = {
    "tiny-sprout": {
      title: "Tiny Sprout",
      messages: {
        idle: "Ready when you are.",
        ready: "Ready when you are.",
        focusing: "I'm focusing with you.",
        break: "A good break supports the next step.",
        celebrating: "You and Sprout did it together!",
        proud: "Small steps become steady progress.",
        sleepy: "Welcome back. A fresh streak starts today."
      }
    },
    "focus-bloom": {
      title: "Focus Bloom",
      messages: {
        idle: "Let's make a little progress.",
        ready: "Ready when you are.",
        focusing: "Nice and steady.",
        break: "A good break supports the next step.",
        celebrating: "Our rhythm is growing!",
        proud: "Focus Bloom is here!",
        sleepy: "Welcome back. A fresh streak starts today."
      }
    },
    "study-sage": {
      title: "Study Sage",
      messages: {
        idle: "Steady and present.",
        ready: "A calm session starts here.",
        focusing: "Steady and present.",
        break: "A good break supports the next step.",
        celebrating: "That was thoughtful work.",
        proud: "Your steady work is growing.",
        sleepy: "Welcome back. A fresh streak starts today."
      }
    }
  };

  const ACCESSORIES = [
    { id: "paper-crown", name: "Paper Crown", cost: 15, minLevel: 1, category: "head" },
    { id: "cozy-beanie", name: "Cozy Beanie", cost: 30, minLevel: 2, category: "head" },
    { id: "round-glasses", name: "Round Glasses", cost: 45, minLevel: 3, category: "head" },
    { id: "tiny-backpack", name: "Tiny Backpack", cost: 25, minLevel: 2, category: "body" },
    { id: "notebook", name: "Notebook", cost: 50, minLevel: 4, category: "body" },
    { id: "clock-charm", name: "Clock Charm", cost: 60, minLevel: 5, category: "body" },
    { id: "scarf", name: "Cozy Scarf", cost: 35, minLevel: 2, category: "body" },
    { id: "coffee-mug", name: "Coffee Mug", cost: 60, minLevel: 4, category: "body" },
    { id: "cat-ear-headphones", name: "Cat-Ear Headphones", cost: 60, minLevel: 5, category: "head" },
    { id: "star-wand", name: "Star Wand", cost: 90, minLevel: 6, category: "body" },
    { id: "wizard-hat", name: "Wizard Hat", cost: 100, minLevel: 8, category: "head" }
  ];

  const ACHIEVEMENTS = [
    {
      id: "first-focus",
      name: "First Focus",
      requirement: "Complete one session",
      check: (s) => s.totalSessions >= 1
    },
    {
      id: "steady-mind",
      name: "Steady Mind",
      requirement: "Reach a three-day streak",
      check: (s) => s.streak >= 3
    },
    {
      id: "focus-master",
      name: "Focus Master",
      requirement: "Complete 50 sessions",
      check: (s) => s.totalSessions >= 50
    }
  ];

  const ACHIEVEMENT_ICONS = {
    "first-focus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg>',
    "steady-mind": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    "focus-master": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
  };

  const PLANT_TYPES = [
    { id: "clover", name: "Clover", plant: "#8BCB88", dark: "#5FA56A", bloom: "#A8DDB5" },
    { id: "sunflower", name: "Sunflower", plant: "#7FB069", dark: "#4F8A4F", bloom: "#F6C85F" },
    { id: "lavender", name: "Lavender", plant: "#B9A7E8", dark: "#806DB8", bloom: "#D9C8FF" },
    { id: "pine", name: "Pine", plant: "#6FA8A0", dark: "#3E7B72", bloom: "#8BCB88" }
  ];

  const MAX_PLANTS = 6;

  const MODE_LABEL = { focus: "Focus", short: "Short Break", long: "Long Break" };

  const MODE_RANGE = {
    focus: { min: 15, max: 120 },
    short: { min: 5, max: 15 },
    long: { min: 15, max: 30 }
  };

  const clampMinutes = (v, range) => Math.min(Math.max(Math.floor(v), range.min), range.max);

  const MODE_SETTING_KEY = {
    focus: "focusMinutes",
    short: "shortBreakMinutes",
    long: "longBreakMinutes"
  };

  const TICK_STEP = 36;
  const TICK_LABEL_EVERY = 5;

  const DEFAULT_STATE = {
    version: 1,
    petName: "Sprout",
    coins: 0,
    xp: 0,
    level: 1,
    totalSessions: 0,
    todaySessions: 0,
    lastSessionDate: null,
    streak: 0,
    dailyBonusClaimed: false,
    ownedAccessories: [],
    equippedAccessories: [],
    achievements: [],
    gardenPlants: [],
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      soundEnabled: true,
      hapticsEnabled: true,
      reducedMotion: "system",
      theme: "light"
    },
    onboarding: {
      complete: false,
      step: "meet"
    },
    timer: {
      mode: "focus",
      remainingSeconds: 25 * 60,
      endTime: null,
      isRunning: false,
      completionHandled: false
    }
  };

  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  let state = {};
  let petViewState = null;
  let timerInterval = null;
  let audioCtx = null;

  function structuredClonePoly(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return structuredClonePoly(value);
  }

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function nonNegativeNumber(value, fallback) {
    return isFiniteNumber(value) && value >= 0 ? value : fallback;
  }

  function stringFallback(value, fallback) {
    return typeof value === "string" && value.length ? value : fallback;
  }

  function normalizeState(saved) {
    const d = clone(DEFAULT_STATE);
    const merged = Object.assign({}, d, saved || {});

    merged.petName = stringFallback(merged.petName, "Sprout").slice(0, 20);
    merged.coins = nonNegativeNumber(merged.coins, 0);
    merged.xp = nonNegativeNumber(merged.xp, 0);
    merged.level = Math.max(1, Math.floor(nonNegativeNumber(merged.level, 1)));
    delete merged.cheatsUnlocked;
    merged.totalSessions = Math.floor(nonNegativeNumber(merged.totalSessions, 0));
    merged.todaySessions = Math.floor(nonNegativeNumber(merged.todaySessions, 0));
    merged.streak = Math.floor(nonNegativeNumber(merged.streak, 0));
    merged.ownedAccessories = Array.isArray(merged.ownedAccessories)
      ? merged.ownedAccessories.filter((id) => ACCESSORIES.some((a) => a.id === id))
      : [];
    merged.equippedAccessories = Array.isArray(merged.equippedAccessories)
      ? merged.equippedAccessories.filter((id) => merged.ownedAccessories.indexOf(id) !== -1)
      : [];
    merged.achievements = Array.isArray(merged.achievements)
      ? merged.achievements.filter((id) => ACHIEVEMENTS.some((a) => a.id === id))
      : [];
    merged.gardenPlants = Array.isArray(merged.gardenPlants)
      ? merged.gardenPlants.filter(
          (p) => p && typeof p === "object" && p.id && p.type && isFiniteNumber(p.growth)
        )
      : [];
    merged.settings = Object.assign({}, d.settings, merged.settings || {});
    merged.settings.focusMinutes = clampMinutes(nonNegativeNumber(merged.settings.focusMinutes, 25), MODE_RANGE.focus);
    merged.settings.shortBreakMinutes = clampMinutes(nonNegativeNumber(merged.settings.shortBreakMinutes, 5), MODE_RANGE.short);
    merged.settings.longBreakMinutes = clampMinutes(nonNegativeNumber(merged.settings.longBreakMinutes, 15), MODE_RANGE.long);
    merged.settings.soundEnabled = merged.settings.soundEnabled !== false;
    merged.settings.hapticsEnabled = merged.settings.hapticsEnabled !== false;
    merged.settings.reducedMotion = merged.settings.reducedMotion === "reduce" ? "reduce" : "system";
    merged.settings.theme = merged.settings.theme === "dark" ? "dark" : "light";
    merged.onboarding = Object.assign({}, d.onboarding, merged.onboarding || {});
    merged.onboarding.step =
      ["meet", "loop", "duration"].indexOf(merged.onboarding.step) === -1
        ? "meet"
        : merged.onboarding.step;
    if (!DEV_MODE) delete merged.dev;
    merged.timer = Object.assign({}, d.timer, merged.timer || {});
    merged.timer.mode = ["focus", "short", "long"].indexOf(merged.timer.mode) === -1 ? "focus" : merged.timer.mode;
    merged.timer.remainingSeconds = Math.floor(nonNegativeNumber(merged.timer.remainingSeconds, getModeDurationSeconds(merged, "focus")));
    merged.timer.isRunning = merged.timer.isRunning === true;
    merged.timer.endTime = isFiniteNumber(merged.timer.endTime) ? merged.timer.endTime : null;
    merged.timer.completionHandled = merged.timer.completionHandled === true;

    updateLevel(merged);
    return merged;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_STATE);
      const saved = JSON.parse(raw);
      return normalizeState(saved);
    } catch (error) {
      console.warn("Could not load saved pet data:", error);
      return clone(DEFAULT_STATE);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save pet data:", error);
    }
  }

  function reconcileDailyFields() {
    const today = getLocalDateKey();
    if (state.lastSessionDate && state.lastSessionDate !== today) {
      state.todaySessions = 0;
      state.dailyBonusClaimed = false;
      saveState();
    }
  }

  function resetProgress() {
    const ok = window.confirm(
      "Reset all progress? This clears your pet, coins, XP, streak, garden, and accessories. It cannot be undone."
    );
    if (!ok) return;
    state = clone(DEFAULT_STATE);
    petViewState = null;
    stopTimer(false);
    saveState();
    renderApp();
    announce("Progress reset to start fresh.");
  }

  function getOffsetDays() {
    return state.dev && state.dev.dateOffsetDays ? state.dev.dateOffsetDays : 0;
  }

  function getRuntimeDate() {
    const d = new Date();
    d.setDate(d.getDate() + getOffsetDays());
    return d;
  }

  function getLocalDateKey(date) {
    const d = date || getRuntimeDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function dateKeyToUtcDay(dateKey) {
    const parts = dateKey.split("-").map(Number);
    return Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000;
  }

  function daysBetween(dateKeyA, dateKeyB) {
    return Math.abs(dateKeyToUtcDay(dateKeyA) - dateKeyToUtcDay(dateKeyB));
  }

  function updateLevel(toUpdate) {
    toUpdate.level = Math.floor(toUpdate.xp / 50) + 1;
  }

  function getXpIntoCurrentLevel() {
    return state.xp % 50;
  }

  function getLevelProgressPercent() {
    return (getXpIntoCurrentLevel() / 50) * 100;
  }

  function getPetStageFn(level) {
    if (level >= 8) return "study-sage";
    if (level >= 3) return "focus-bloom";
    return "tiny-sprout";
  }

  function getModeDurationSeconds(appState, mode) {
    const s = appState.settings;
    if (mode === "short") return s.shortBreakMinutes * 60;
    if (mode === "long") return s.longBreakMinutes * 60;
    if (appState.dev && appState.dev.focusOverrideSeconds) return appState.dev.focusOverrideSeconds;
    return s.focusMinutes * 60;
  }

  function fillTimerOnMode(force) {
    const expected = getModeDurationSeconds(state, state.timer.mode);
    if (force || state.timer.remainingSeconds === 0 || state.timer.remainingSeconds > expected) {
      state.timer.remainingSeconds = expected;
    }
  }

  function switchMode(mode) {
    if (state.timer.isRunning) return;
    if (state.timer.mode === mode && state.timer.remainingSeconds > 0) return;
    state.timer.mode = mode;
    state.timer.remainingSeconds = getModeDurationSeconds(state, mode);
    state.timer.endTime = null;
    state.timer.completionHandled = false;
    saveState();
    renderTimer();
    renderPet();
    if (state.timer.remainingSeconds === 0) {
      announce("Pick a duration in Settings to get started.");
    }
  }

  function startTimer() {
    if (state.timer.mode === "focus" && state.timer.remainingSeconds === 0) {
      announce("Set a focus duration in Settings first.");
      return;
    }
    if (state.timer.remainingSeconds === 0) return;
    state.timer.isRunning = true;
    state.timer.completionHandled = false;
    state.timer.endTime = Date.now() + state.timer.remainingSeconds * 1000;
    startTickLoop();
    saveState();
    if (state.timer.mode === "focus") {
      trackEvent("focus_started", { duration_minutes: state.timer.remainingSeconds / 60 });
      playSound("timer-start");
    } else {
      playSound("ui-select");
    }
    renderTimer();
    renderPet();
  }

  function pauseTimer() {
    if (!state.timer.isRunning) return;
    state.timer.isRunning = false;
    state.timer.remainingSeconds = getRemainingSeconds();
    state.timer.endTime = null;
    stopTickLoop();
    saveState();
    playSound("ui-select");
    renderTimer();
    renderPet();
  }

  function startTickLoop() {
    if (timerInterval === null) {
      timerInterval = window.setInterval(tickTimer, 250);
    }
  }

  function stopTickLoop() {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function stopTimer(render) {
    stopTickLoop();
    state.timer.isRunning = false;
    state.timer.endTime = null;
    state.timer.remainingSeconds = getModeDurationSeconds(state, state.timer.mode);
    state.timer.completionHandled = false;
    saveState();
    if (render !== false) {
      renderTimer();
      renderPet();
    }
  }

  function getRemainingSeconds() {
    if (!state.timer.isRunning || !state.timer.endTime) {
      return state.timer.remainingSeconds;
    }
    return Math.max(0, Math.ceil((state.timer.endTime - Date.now()) / 1000));
  }

  function tickTimer() {
    state.timer.remainingSeconds = getRemainingSeconds();

    if (state.timer.remainingSeconds === 0 && !state.timer.completionHandled) {
      stopTickLoop();
      state.timer.completionHandled = true;
      state.timer.isRunning = false;
      state.timer.endTime = null;
      saveState();
      handleTimerComplete();
      return;
    }

    renderTimer();
  }

  function recordCompletedSession() {
    const today = getLocalDateKey();
    const previousDate = state.lastSessionDate;
    const previousStage = getPetStageFn(state.level);
    const previousLevel = state.level;

    if (previousDate !== today) {
      state.todaySessions = 0;
      state.dailyBonusClaimed = false;
    }

    const streakTransition = computeStreakTransition(previousDate, today);
    state.streak = computeStreak(previousDate, today);

    state.lastSessionDate = today;
    state.todaySessions += 1;
    state.totalSessions += 1;
    state.coins += 5;
    state.xp += 10;

    let bonusAwarded = false;
    if (state.todaySessions === 4 && !state.dailyBonusClaimed) {
      state.coins += 25;
      state.dailyBonusClaimed = true;
      bonusAwarded = true;
    }

    updateLevel(state);
    const nextStage = getPetStageFn(state.level);

    const awarded = checkAchievements();
    const gardenBed = tendGarden(today);

    saveState();

    trackEvent("focus_completed", {
      duration_minutes: getModeDurationSeconds(state, "focus") / 60,
      coins_awarded: 5,
      xp_awarded: 10
    });
    trackEvent("streak_" + streakTransition);
    if (bonusAwarded) trackEvent("daily_bonus_awarded", { today_sessions: state.todaySessions, amount: 25 });
    awarded.forEach((id) => trackEvent("achievement_unlocked", { achievement_id: id }));
    if (gardenBed) trackEvent("garden_reward_unlocked", { plant_id: gardenBed.id });
    if (state.level !== previousLevel) trackEvent("level_reached", { level: state.level, previous_level: previousLevel });
    if (nextStage !== previousStage) {
      trackEvent("evolution_unlocked", { from_stage: previousStage, to_stage: nextStage });
    }

    playSound("timer-complete");
    setTimeout(() => playSound("coins"), 350);
    if (bonusAwarded) setTimeout(() => playSound("daily-bonus"), 800);
    vibrate([12, 40, 12]);

    switchAfterFocus();
    saveState();

    const levelUp = state.level !== previousLevel;
    const evolved = nextStage !== previousStage;

    renderApp();

    petViewState = "celebrating";
    renderPet();

    const bits = [];
    bits.push("+10 XP and +5 coins");
    if (bonusAwarded) bits.push("+25 daily bonus!");
    if (levelUp) bits.push("Reached Level " + state.level);
    if (evolved) {
      const stageName = STAGES[nextStage].title;
      showEvolutionNotice(stageName);
      bits.push(STAGES[nextStage].title + " unlocked!");
      setTimeout(() => playSound("evolve"), 900);
    }
    showReward("Focus complete!", bits.join(" / "));
    announce(bits.join(". "));

    if (petViewState === "celebrating") {
      window.setTimeout(() => {
        if (petViewState === "celebrating") {
          petViewState = "proud";
          renderPet();
        }
      }, 800);
      window.setTimeout(() => {
        if (petViewState === "proud") {
          petViewState = null;
          renderPet();
        }
      }, 2200);
    }
  }

  function computeStreakTransition(previousDate, today) {
    if (!previousDate) return "started";
    if (previousDate === today) return "continued";
    if (daysBetween(previousDate, today) === 1) return "continued";
    return "broken";
  }

  function computeStreak(previousDate, today) {
    if (!previousDate) return 1;
    if (previousDate === today) return Math.max(state.streak, 1);
    if (daysBetween(previousDate, today) === 1) return state.streak + 1;
    return 1;
  }

  function checkAchievements() {
    const newly = [];
    ACHIEVEMENTS.forEach((a) => {
      if (state.achievements.indexOf(a.id) === -1 && a.check(state)) {
        state.achievements.push(a.id);
        newly.push(a.id);
      }
    });
    return newly;
  }

  function tendGarden(today) {
    const growing = state.gardenPlants.find((p) => p.growth < 3);
    if (growing) {
      growing.growth += 1;
      growing.lastWatered = today;
      return null;
    }
    if (state.gardenPlants.length >= MAX_PLANTS) return null;
    const plant = {
      id: "plant-" + state.gardenPlants.length + "-" + today,
      type: PLANT_TYPES[state.gardenPlants.length % PLANT_TYPES.length].id,
      growth: 1,
      plantedOn: today,
      lastWatered: today
    };
    state.gardenPlants.push(plant);
    return plant;
  }

  function switchAfterFocus() {
    if (state.timer.mode !== "focus") return;
    state.timer.mode = "short";
    state.timer.remainingSeconds = getModeDurationSeconds(state, "short");
    state.timer.isRunning = false;
    state.timer.endTime = null;
    state.timer.completionHandled = false;
  }

  function handleTimerComplete() {
    if (state.timer.mode === "focus") {
      recordCompletedSession();
    } else {
      playSound("timer-complete");
      vibrate(10);
      announce("Break complete. Ready for the next focus session.");
      switchAfterBreak();
      saveState();
      renderApp();
    }
  }

  function switchAfterBreak() {
    state.timer.mode = "focus";
    state.timer.remainingSeconds = getModeDurationSeconds(state, "focus");
    state.timer.endTime = null;
    state.timer.completionHandled = false;
  }

  function buyAccessory(accessoryId) {
    const accessory = ACCESSORIES.find((a) => a.id === accessoryId);
    if (!accessory) return;
    if (state.level < accessory.minLevel) return;
    if (state.ownedAccessories.indexOf(accessoryId) !== -1) return;
    if (state.coins < accessory.cost) return;

    state.coins -= accessory.cost;
    state.ownedAccessories.push(accessoryId);
    saveState();
    trackEvent("accessory_purchased", { accessory_id: accessoryId, cost: accessory.cost });
    playSound("coins");
    renderApp();
    announce(accessory.name + " purchased! Equip it from the shop.");
  }

  function equipAccessory(accessoryId) {
    if (state.ownedAccessories.indexOf(accessoryId) === -1) return;
    const accessory = ACCESSORIES.find((a) => a.id === accessoryId);
    if (!accessory) return;

    const isEquipped = state.equippedAccessories.indexOf(accessoryId) !== -1;
    let next;
    if (isEquipped) {
      next = state.equippedAccessories.filter((id) => id !== accessoryId);
    } else {
      const others = state.equippedAccessories.filter(
        (id) => ACCESSORIES.find((a) => a.id === id).category !== accessory.category
      );
      next = others.concat([accessoryId]);
    }
    state.equippedAccessories = next;
    saveState();
    trackEvent("accessory_equipped", { accessory_id: accessoryId, category: accessory.category });
    playSound("ui-select");
    renderApp();
  }

  function getPetStateName() {
    if (petViewState && petViewState !== "proud") return petViewState;
    if (state.timer.isRunning) {
      return state.timer.mode === "focus" ? "focusing" : "break";
    }
    if (petViewState) return petViewState;
    if (state.lastSessionDate && daysBetween(state.lastSessionDate, getLocalDateKey()) > 1) {
      return "sleepy";
    }
    return "ready";
  }

  function renderPet() {
    const pet = qs(".pet");
    const title = qs("#pet-title");
    const message = qs("#pet-message");
    if (!pet || !title || !message) return;

    const stage = getPetStageFn(state.level);
    const stateName = getPetStateName();
    const petName = state.petName || "Sprout";

    pet.className = "pet pet--" + stage;
    pet.dataset.stage = stage;
    pet.dataset.state = stateName;
    qs(".pet-art", pet).setAttribute("aria-label", petName + ", " + STAGES[stage].title + ", " + stateName);
    qs(".stage-icon").textContent = "\u2726";

    title.textContent = STAGES[stage].title;

    const nextMessage = STAGES[stage].messages[stateName] || STAGES[stage].messages.ready;
    if (message.textContent !== nextMessage) {
      message.textContent = nextMessage;
    }

    qsa(".acc", pet).forEach((el) => {
      el.hidden = state.equippedAccessories.indexOf(el.dataset.acc) === -1;
    });
  }

  let evolutionNoticeTimer = null;

  function showEvolutionNotice(stageName) {
    const notice = qs("#evolution-notice");
    if (!notice) return;
    notice.hidden = false;
    notice.textContent = stageName + " unlocked! Your Sprout grew through steady focus.";
    window.clearTimeout(evolutionNoticeTimer);
    evolutionNoticeTimer = window.setTimeout(() => {
      notice.hidden = true;
    }, 5000);
  }

  function renderHeader() {
    qs("#header-pet-name").textContent = state.petName || "Sprout";
    qs("#header-level").textContent = state.level;
    qs("#coins").textContent = state.coins;
    const toggle = qs("#sound-toggle");
    toggle.setAttribute("aria-pressed", String(state.settings.soundEnabled));
    toggle.setAttribute("aria-label", state.settings.soundEnabled ? "Mute sound" : "Turn sound on");
    toggle.title = state.settings.soundEnabled ? "Mute sound" : "Sound is off";
    toggle.classList.toggle("is-muted", !state.settings.soundEnabled);
    const themeToggle = qs("#theme-toggle");
    themeToggle.setAttribute("aria-pressed", String(state.settings.theme === "dark"));
  }

  function renderProgress() {
    qs("#level").textContent = state.level;
    qs("#xp-current").textContent = getXpIntoCurrentLevel();
    const pct = getLevelProgressPercent();
    qs("#xp-fill").style.width = pct + "%";
    const bar = qs(".xp-bar");
    bar.setAttribute("aria-valuenow", String(getXpIntoCurrentLevel()));
    qs("#streak").textContent = state.streak;
    qs("#today-sessions").textContent = state.todaySessions;
    qs("#total-sessions").textContent = state.totalSessions;

    const hint = qs("#bonus-hint");
    if (state.dailyBonusClaimed) {
      hint.textContent = "Daily +25 coin bonus claimed for today.";
    } else if (state.todaySessions >= 4) {
      hint.textContent = "Finish 4 sessions to claim the +25 coin bonus.";
    } else {
      const left = 4 - state.todaySessions;
      hint.textContent = left + " more session" + (left === 1 ? "" : "s") + " today unlocks a +25 coin bonus.";
    }
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function renderTimer() {
    const modeLabel = { focus: "Focus", short: "Short Break", long: "Long Break" }[state.timer.mode];
    qs("#timer-heading").textContent = modeLabel;
    qs("#timer-mode-label").textContent = modeLabel;
    qs("#timer-display").textContent = formatTime(getRemainingSeconds());

    const expected = getModeDurationSeconds(state, state.timer.mode);
    const remaining = Math.max(0, Math.min(getRemainingSeconds(), expected));
    const fraction = expected > 0 ? remaining / expected : 0;
    qs("#timer-ring-progress").style.strokeDasharray = String(CIRC);
    qs("#timer-ring-progress").style.strokeDashoffset = String(CIRC * (1 - fraction));

    qsa(".mode-btn").forEach((btn) => {
      const active = btn.id === "mode-btn-" + state.timer.mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    const primary = qs("#timer-primary");
    if (state.timer.isRunning) {
      primary.textContent = "Pause";
    } else if (state.timer.mode === "focus") {
      primary.textContent = "Start Focus";
    } else {
      primary.textContent = "Start " + modeLabel;
    }

    let hint = "";
    if (state.timer.isRunning) {
      hint = state.timer.mode === "focus" ? "Focus mode - your pet is focusing with you." : "Break time - relax.";
    } else {
      const today = getLocalDateKey();
      if (state.lastSessionDate === today) {
        hint = "Session " + state.todaySessions + " of today";
      } else if (state.lastSessionDate && daysBetween(state.lastSessionDate, today) > 1) {
        hint = "Welcome back. A fresh streak starts today.";
      } else {
        hint = "Ready";
      }
    }
    qs("#session-hint").textContent = hint;

    const preview = qs("#reward-preview");
    if (state.timer.mode === "focus") {
      if (state.dailyBonusClaimed) {
        preview.textContent = "Complete this session to earn 10 XP + 5 coins. Daily bonus already claimed.";
      } else if (state.todaySessions === 3) {
        preview.textContent = "Complete this session to earn 10 XP + 5 coins and unlock the +25 coin bonus!";
      } else {
        preview.textContent = "Complete this session to earn 10 XP + 5 coins.";
      }
    } else {
      preview.textContent = "Break completions rest your mind. They do not award XP or coins.";
    }

    const root = document.documentElement;
    root.classList.toggle("focus-mode", state.timer.isRunning && state.timer.mode === "focus");

    renderTimeDial();
  }

  let lastDialMode = null;
  let lastDialValue = null;

  function positionDialBar() {
    const bar = qs("#time-dial-bar");
    const ruler = qs("#time-dial-ruler");
    if (!bar || !ruler) return;
    const range = MODE_RANGE[state.timer.mode];
    const v = Math.min(Math.max(range.min + Math.round(ruler.scrollLeft / TICK_STEP), range.min), range.max);
    bar.style.transform = "translateX(" + ((v - range.min) * TICK_STEP - ruler.scrollLeft) + "px)";
  }

  function renderTimeDial() {
    const dial = qs("#time-dial");
    const ruler = qs("#time-dial-ruler");
    if (!dial || !ruler) return;

    const mode = state.timer.mode;
    const range = MODE_RANGE[mode];
    const settingKey = MODE_SETTING_KEY[mode];
    const current = Math.min(Math.max(Math.floor(state.settings[settingKey]), range.min), range.max);
    const devOverride = !!(state.dev && state.dev.focusOverrideSeconds && mode === "focus");
    const locked = state.timer.isRunning || devOverride;

    const needsRebuild = !locked && (lastDialMode !== mode || lastDialValue !== current);
    if (needsRebuild || !ruler.childElementCount) {
      ruler.textContent = "";
      const frag = document.createDocumentFragment();
      for (let v = range.min; v <= range.max; v++) {
        const tick = document.createElement("button");
        tick.type = "button";
        tick.className = "time-dial__tick";
        tick.setAttribute("role", "option");
        tick.setAttribute("aria-selected", v === current ? "true" : "false");
        tick.setAttribute("aria-label", MODE_LABEL[mode] + " " + v + " minutes");
        tick.dataset.value = String(v);
        tick.disabled = locked;

        const mark = document.createElement("span");
        mark.className = "time-dial__mark";
        tick.appendChild(mark);

        if (v % TICK_LABEL_EVERY === 0 || v === range.min || v === range.max) {
          tick.classList.add("is-major");
          const num = document.createElement("span");
          num.className = "time-dial__num";
          num.textContent = String(v);
          tick.appendChild(num);
        }

        if (v === current) tick.classList.add("is-active");
        frag.appendChild(tick);
      }
      ruler.appendChild(frag);
      const targetLeft = (current - range.min) * TICK_STEP;
      const animate = lastDialMode === mode && lastDialValue !== current && state.settings.reducedMotion !== "reduce";
      ruler.scrollTo({ left: targetLeft, behavior: animate ? "smooth" : "auto" });
      positionDialBar();
      lastDialMode = mode;
      lastDialValue = current;
    }

    dial.classList.toggle("is-disabled", locked);
    const prevBtn = qs("#time-dial-prev");
    const nextBtn = qs("#time-dial-next");
    if (prevBtn) prevBtn.disabled = locked;
    if (nextBtn) nextBtn.disabled = locked;

    const caption = qs("#time-dial-caption");
    const rangeText = range.min + "\u2013" + range.max + " min";
    if (devOverride) {
      caption.textContent = MODE_LABEL[mode] + " duration locked - dev 10s override on.";
    } else if (state.timer.isRunning) {
      caption.textContent = MODE_LABEL[mode] + " duration locked while running (" + rangeText + ").";
    } else {
      caption.textContent = MODE_LABEL[mode] + " duration (" + rangeText + ")";
    }
  }

  function stepDial(dir) {
    if (state.timer.isRunning) return;
    const mode = state.timer.mode;
    const range = MODE_RANGE[mode];
    const current = Math.min(Math.max(Math.floor(state.settings[MODE_SETTING_KEY[mode]]), range.min), range.max);
    commitDialValue(current + dir);
  }

  function commitDialValue(value) {
    if (state.timer.isRunning) return;
    const mode = state.timer.mode;
    const range = MODE_RANGE[mode];
    const v = Math.min(Math.max(Math.floor(value), range.min), range.max);
    const settingKey = MODE_SETTING_KEY[mode];
    if (state.settings[settingKey] === v && state.timer.remainingSeconds === v * 60) return;
    state.settings[settingKey] = v;
    state.timer.remainingSeconds = v * 60;
    state.timer.endTime = null;
    state.timer.completionHandled = false;
    saveState();
    playSound("ui-select");
    renderTimer();
  }

  function renderShop() {
    const grid = qs("#shop-grid");
    grid.textContent = "";
    ACCESSORIES.forEach((acc) => {
      const owned = state.ownedAccessories.indexOf(acc.id) !== -1;
      const unlocked = state.level >= acc.minLevel;
      const equipped = state.equippedAccessories.indexOf(acc.id) !== -1;
      const affordable = state.coins >= acc.cost;

      const card = document.createElement("div");
      card.className = "shop-card" + (unlocked ? "" : " is-locked");

      const canvas = document.createElement("div");
      canvas.className = "acc-preview";
      const inner = document.createElement("div");
      inner.className = "acc-canvas";
      const accEl = document.createElement("span");
      accEl.className = "acc acc--" + acc.id;
      inner.appendChild(accEl);
      canvas.appendChild(inner);

      const name = document.createElement("div");
      name.className = "shop-card__name";
      name.textContent = acc.name;

      const lock = document.createElement("div");
      lock.className = "shop-card__lock";
      lock.textContent = unlocked ? "" : "Unlocks at Level " + acc.minLevel;

      const cost = document.createElement("div");
      cost.className = "shop-card__cost";
      if (owned) {
        cost.textContent = "Owned";
      } else {
        const icon = document.createElement("span");
        icon.className = "coin-icon";
        icon.setAttribute("aria-hidden", "true");
        cost.appendChild(icon);
        cost.appendChild(document.createTextNode(acc.cost));
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-card__btn" + (equipped ? " is-equipped" : "");
      if (owned) {
        btn.textContent = equipped ? "Equipped" : "Equip";
      } else if (unlocked) {
        btn.textContent = affordable ? "Buy" : "Too expensive";
        btn.disabled = !affordable;
      } else {
        btn.textContent = "Locked";
        btn.disabled = true;
      }

      btn.addEventListener("click", () => {
        if (owned) equipAccessory(acc.id);
        else buyAccessory(acc.id);
      });

      card.appendChild(canvas);
      card.appendChild(name);
      card.appendChild(lock);
      card.appendChild(cost);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function renderGarden() {
    const grid = qs("#garden-grid");
    grid.textContent = "";

    const slots = MAX_PLANTS;
    for (let i = 0; i < slots; i++) {
      const plant = state.gardenPlants[i];
      const el = document.createElement("div");
      const potClass = plant ? "pot" : "pot pot--empty";
      el.className = potClass;

      if (!plant) {
        const note = document.createElement("div");
        note.textContent = i === 0 ? "Complete a focus session to plant your first seed." : "Empty pot";
        el.appendChild(note);
      } else {
        const stage = document.createElement("div");
        stage.className = "pot-stage";

        const soil = document.createElement("div");
        soil.className = "pot__soil";

        const info = PLANT_TYPES.find((p) => p.id === plant.type) || PLANT_TYPES[0];
        const plantEl = document.createElement("div");
        plantEl.className = "pot-plant plant-" + (plant.growth === 3 ? "bloom" : plant.growth === 2 ? "grow" : "sprout");
        plantEl.style.setProperty("--plant", info.plant);
        plantEl.style.setProperty("--plant-dark", info.dark);
        plantEl.style.setProperty("--bloom", info.bloom);

        stage.appendChild(soil);
        stage.appendChild(plantEl);
        el.appendChild(stage);

        const label = document.createElement("div");
        label.className = "pot__name";
        label.textContent = info.name + (plant.growth >= 3 ? " (bloomed)" : " (" + Math.round((plant.growth / 3) * 100) + "%)");
        el.appendChild(label);
      }

      grid.appendChild(el);
    }
  }

  function renderAchievements() {
    const list = qs("#achievements-list");
    list.textContent = "";
    ACHIEVEMENTS.forEach((a) => {
      const unlocked = state.achievements.indexOf(a.id) !== -1;
      const li = document.createElement("li");
      li.className = "achievement " + (unlocked ? "is-unlocked" : "is-locked");

      const badge = document.createElement("span");
      badge.className = "achievement__badge";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML = ACHIEVEMENT_ICONS[a.id] || "";

      const text = document.createElement("div");
      text.className = "achievement__text";
      const name = document.createElement("span");
      name.className = "achievement__name";
      name.textContent = a.name;
      const req = document.createElement("span");
      req.className = "achievement__req";
      req.textContent = unlocked ? "Unlocked" : a.requirement;
      text.appendChild(name);
      text.appendChild(req);

      li.appendChild(badge);
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function renderApp() {
    renderHeader();
    renderProgress();
    renderTimer();
    renderPet();
    renderShop();
    renderGarden();
    renderAchievements();
    syncMotion();
    syncTheme();
  }

  function showReward(title, detail) {
    const region = qs("#reward-region");
    const toast = document.createElement("div");
    toast.className = "reward-toast";
    toast.textContent = title + (detail ? " - " + detail : "");
    region.appendChild(toast);
    window.setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 6000);
  }

  function announce(text) {
    const petMessage = qs("#pet-message");
    if (petMessage) {
      petMessage.textContent = text;
    }
  }

  function ensureAudio() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  }

  function tone(freq, start, duration, type, gainValue) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(gainValue || 0.12, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  const SOUNDS = {
    "ui-select": () => tone(660, 0, 0.08, "sine", 0.08),
    "timer-start": () => {
      tone(523.25, 0, 0.16, "sine", 0.1);
      tone(659.25, 0.09, 0.2, "sine", 0.1);
    },
    "timer-complete": () => {
      tone(523.25, 0, 0.18, "sine", 0.12);
      tone(659.25, 0.14, 0.18, "sine", 0.12);
      tone(783.99, 0.28, 0.32, "sine", 0.12);
    },
    coins: () => {
      tone(987.77, 0, 0.08, "triangle", 0.1);
      tone(1318.51, 0.07, 0.14, "triangle", 0.09);
    },
    "daily-bonus": () => {
      tone(523.25, 0, 0.12, "triangle", 0.1);
      tone(659.25, 0.1, 0.12, "triangle", 0.1);
      tone(783.99, 0.2, 0.12, "triangle", 0.1);
      tone(1046.5, 0.3, 0.3, "triangle", 0.11);
    },
    evolve: () => {
      [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.12, 0.22, "sine", 0.1));
      tone(1046.5, 0.5, 0.5, "sine", 0.09);
      tone(1308, 0.5, 0.5, "sine", 0.05);
    }
  };

  function playSound(name) {
    if (!state.settings.soundEnabled) return;
    const play = SOUNDS[name];
    if (!play) return;
    try {
      ensureAudio();
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      play();
    } catch (e) {
      console.warn("Sound playback blocked:", e);
    }
  }

  function vibrate(pattern) {
    if (!state.settings.hapticsEnabled) return;
    if (!("vibrate" in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }

  function trackEvent(name, properties) {
    properties = properties || {};
    const event = {
      name: name,
      properties: Object.assign(
        {
          petStage: getPetStageFn(state.level),
          level: state.level,
          totalSessions: state.totalSessions,
          streakDays: state.streak,
          todaySessions: state.todaySessions,
          appVersion: APP_VERSION
        },
        properties
      ),
      occurredAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || "[]");
      let next = existing;
      if (!Array.isArray(next)) next = [];
      next = next.concat([event]).slice(-MAX_LOCAL_EVENTS);
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  function clearEvents() {
    try {
      localStorage.removeItem(EVENT_LOG_KEY);
    } catch (e) {}
  }

  function exportEvents() {
    let events = [];
    try {
      events = JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || "[]");
    } catch (e) {
      events = [];
    }
    downloadJson(events, "pomodoro-pet-events.json");
  }

  function downloadJson(data, filename) {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportSave() {
    downloadJson(state, "pomodoro-pet-save.json");
  }

  function importSave(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !isFiniteNumber(parsed.version)) {
          throw new Error("missing version field");
        }
        state = normalizeState(parsed);
        petViewState = null;
        stopTimer(false);
        saveState();
        renderApp();
        announce("Save imported successfully.");
      } catch (e) {
        window.alert("Could not import this save. The file was not recognized.");
      }
    };
    reader.readAsText(file);
  }

  function syncMotion() {
    const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reduce = state.settings.reducedMotion === "reduce" || prefersReduce;
    document.documentElement.dataset.motion = reduce ? "reduced" : "full";
  }

  function syncTheme() {
    document.documentElement.dataset.theme = state.settings.theme === "dark" ? "dark" : "light";
  }

  function openSettings() {
    qs("#settings-dialog").hidden = false;
    qs("#set-focus").value = state.settings.focusMinutes;
    qs("#set-short").value = state.settings.shortBreakMinutes;
    qs("#set-long").value = state.settings.longBreakMinutes;
    qs("#set-name").value = state.petName || "Sprout";
    qs("#set-sound").checked = state.settings.soundEnabled;
    qs("#set-haptics").checked = state.settings.hapticsEnabled;
    qs("#set-motion").value = state.settings.reducedMotion;
    window.setTimeout(() => qs("#set-name").focus(), 30);
  }

  function closeSettings() {
    qs("#settings-dialog").hidden = true;
    qs("#settings-open").focus();
  }

  function saveSettingsFromForm() {
    state.settings.focusMinutes = clampMinutes(parseInt(qs("#set-focus").value, 10) || 25, MODE_RANGE.focus);
    state.settings.shortBreakMinutes = clampMinutes(parseInt(qs("#set-short").value, 10) || 5, MODE_RANGE.short);
    state.settings.longBreakMinutes = clampMinutes(parseInt(qs("#set-long").value, 10) || 15, MODE_RANGE.long);
    state.petName = (qs("#set-name").value || "Sprout").slice(0, 20);
    state.settings.soundEnabled = qs("#set-sound").checked;
    state.settings.hapticsEnabled = qs("#set-haptics").checked;
    state.settings.reducedMotion = qs("#set-motion").value;

    updateLevel(state);
    fillTimerOnMode(false);
    saveState();
    renderApp();
    announce("Settings saved.");
  }

  const STAGE_LEVEL = { sprout: 1, bloom: 3, sage: 8 };

  function jumpToLevel(targetLevel) {
    state.xp = (targetLevel - 1) * 50;
    updateLevel(state);
    fillTimerOnMode(false);
    saveState();
    renderApp();
    announce("Pet set to Level " + targetLevel + ".");
  }

  function addDevCoins() {
    state.coins += 100;
    saveState();
    renderHeader();
    showReward("+100 coins", "From the dev stash.");
  }

  const ONBOARDING_STEPS = [
    {
      key: "meet",
      title: "Meet your Focus Sprout",
      body: "<p>Meet your Focus Sprout. It grows whenever you complete a focus session.</p>",
      pet: true,
      input: true
    },
    {
      key: "loop",
      title: "Small focus sessions help you grow",
      body:
        '<div class="loop-icons">' +
        '<div class="loop-icon"><span aria-hidden="true">\u23F1</span>Focus</div>' +
        '<div class="loop-arrow" aria-hidden="true">\u2192</div>' +
        '<div class="loop-icon"><span aria-hidden="true">\u2728</span>Grow</div>' +
        '<div class="loop-arrow" aria-hidden="true">\u2192</div>' +
        '<div class="loop-icon"><span aria-hidden="true">\u2726</span>Customize</div>' +
        "</div>" +
        "<p>Earn XP and coins, unlock accessories, and evolve your Sprout. No pressure - one session at a time.</p>",
      pet: false,
      input: false
    },
    {
      key: "duration",
      title: "Classic Pomodoro",
      body: "<p>Your first focus session will be 25 minutes. You can change this later in Settings.</p>",
      pet: true,
      input: false
    }
  ];

  const ONBOARDING_PRIMARY_LABEL = {
    meet: "Nice to meet you",
    loop: "Got it",
    duration: "Start with 25 minutes"
  };

  function showOnboarding(step) {
    qs("#onboarding").hidden = false;
    renderOnboardingStep(step);
  }

  function renderOnboardingStep(stepKey) {
    const order = ["meet", "loop", "duration"];
    const index = order.indexOf(stepKey);
    const step = order[index === -1 ? 0 : index];

    qsa(".ob-step").forEach((el, i) => {
      el.classList.toggle("is-active", i === index);
    });

    const body = qs("#ob-body");
    body.textContent = "";
    const info = ONBOARDING_STEPS.find((s) => s.key === step);

    const h = document.createElement("h2");
    h.textContent = info.title;
    body.appendChild(h);

    const temp = document.createElement("div");
    temp.innerHTML = info.body;
    while (temp.firstChild) body.appendChild(temp.firstChild);

    if (info.pet) {
      const petWrap = document.createElement("div");
      petWrap.className = "ob-pet";
      petWrap.innerHTML =
        '<div class="pet pet--tiny-sprout" data-stage="tiny-sprout" data-state="ready">' +
        '<span class="pet-aura" aria-hidden="true"></span>' +
        '<span class="pet-shadow" aria-hidden="true"></span>' +
        '<div class="pet-art" role="img" aria-label="Sprout, Tiny Sprout, ready">' +
        '<svg class="pet-svg pet-svg--tiny-sprout" viewBox="0 0 220 240" aria-hidden="true">' +
        '<defs>' +
        '<linearGradient id="ob-sg-body" x1="0" y1="0" x2="0.9" y2="1">' +
        '<stop offset="0" stop-color="#cdf3d4"></stop>' +
        '<stop offset="0.55" stop-color="#a8ddb5"></stop>' +
        '<stop offset="1" stop-color="#8bc99b"></stop>' +
        '</linearGradient>' +
        '<linearGradient id="ob-sg-leaf" x1="0.1" y1="0" x2="0.9" y2="1">' +
        '<stop offset="0" stop-color="#ecfff0"></stop>' +
        '<stop offset="0.55" stop-color="#d2f3d8"></stop>' +
        '<stop offset="1" stop-color="#a9ddb0"></stop>' +
        '</linearGradient>' +
        '<linearGradient id="ob-sg-foot" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#bde9c6"></stop>' +
        '<stop offset="1" stop-color="#93d0a1"></stop>' +
        '</linearGradient>' +
        '</defs>' +
        '<path class="pf-stem" d="M110 98 C110 84 108 74 104 62" fill="none" stroke="#68aa7a" stroke-width="5" stroke-linecap="round"></path>' +
        '<g class="pf-leaf pf-leaf--one">' +
        '<path d="M104 94 C85 83 82 56 96 37 C99 32 104 31 107 34 C125 47 128 72 111 92 C109 94 106 95 104 94Z" fill="url(#ob-sg-leaf)" stroke="#57936a" stroke-width="3" stroke-linejoin="round"></path>' +
        '<path d="M106 86 C104 73 102 60 99 49" fill="none" stroke="#75b985" stroke-width="2.5" stroke-linecap="round" opacity="0.8"></path>' +
        '</g>' +
        '<path class="pf-body" d="M67 158 C67 119 89 98 110 98 C131 98 153 119 153 158 L153 191 C153 213 131 225 110 225 C89 225 67 213 67 191Z" fill="url(#ob-sg-body)" stroke="#57936a" stroke-width="3.5" stroke-linejoin="round"></path>' +
        '<path class="pf-body-hi" d="M81 127 C89 112 98 105 110 104" fill="none" stroke="#eafff0" stroke-width="5" stroke-linecap="round" opacity="0.5"></path>' +
        '<path class="pf-foot" d="M84 198 C84 192 89 189 96 189 C103 189 108 194 108 201 L108 211 C108 218 103 222 96 222 C89 222 84 218 84 211Z" fill="url(#ob-sg-foot)" stroke="#57936a" stroke-width="3"></path>' +
        '<path class="pf-foot" d="M124 201 C124 194 129 189 136 189 C143 189 148 193 148 200 L148 211 C148 218 143 222 136 222 C129 222 124 218 124 211Z" fill="url(#ob-sg-foot)" stroke="#57936a" stroke-width="3"></path>' +
        '<g class="pf-face pf-face--ready">' +
        '<ellipse class="pf-eye pf-eye--l" cx="92" cy="151" rx="6.5" ry="9"></ellipse>' +
        '<ellipse class="pf-eye pf-eye--r" cx="128" cy="151" rx="6.5" ry="9"></ellipse>' +
        '<circle class="pf-eye-shine" cx="90" cy="147" r="2.2" fill="#ffffff"></circle>' +
        '<circle class="pf-eye-shine" cx="126" cy="147" r="2.2" fill="#ffffff"></circle>' +
        '<path class="pf-mouth" d="M102 172 C106 178 114 178 118 172"></path>' +
        '<ellipse class="pf-cheek" cx="79" cy="168" rx="7" ry="4.5"></ellipse>' +
        '<ellipse class="pf-cheek" cx="141" cy="168" rx="7" ry="4.5"></ellipse>' +
        '</g>' +
        '</svg>' +
        '</div>' +
        '</div>';
      body.appendChild(petWrap);
    }

    if (info.input) {
      const input = document.createElement("input");
      input.className = "ob-name-input";
      input.type = "text";
      input.maxLength = 20;
      input.value = state.petName === "Sprout" ? "" : state.petName;
      input.placeholder = "Name your Sprout (optional)";
      input.autocomplete = "off";
      body.appendChild(input);
    }

    qs("#ob-primary").textContent = ONBOARDING_PRIMARY_LABEL[step];
  }

  function onObPrimary() {
    const current = state.onboarding.step;
    if (current === "meet") {
      const input = qs(".ob-name-input");
      if (input && input.value.trim()) {
        state.petName = input.value.trim().slice(0, 20);
      }
      state.onboarding.step = "loop";
    } else if (current === "loop") {
      state.onboarding.step = "duration";
    } else if (current === "duration") {
      completeOnboarding(true);
      return;
    }
    saveState();
    renderOnboardingStep(state.onboarding.step);
  }

  function completeOnboarding(startNow) {
    state.onboarding.complete = true;
    state.onboarding.step = "meet";
    saveState();
    trackEvent(startNow ? "onboarding_completed" : "onboarding_skipped");
    qs("#onboarding").hidden = true;
    renderApp();
    announce("Welcome, " + (state.petName || "Sprout") + "!");
    playSound("ui-select");
    if (startNow) startTimer();
  }

  function skipOnboarding() {
    completeOnboarding(false);
  }

  function setupDev() {
    if (!DEV_MODE) return;
    const panel = qs("#dev-panel");
    panel.hidden = false;
    state.dev = state.dev || {};
    state.dev.dateOffsetDays = state.dev.dateOffsetDays || 0;
    state.dev.focusOverrideSeconds = state.dev.focusOverrideSeconds || null;

    qs("#dev-10s").checked = !!state.dev.focusOverrideSeconds;
    qs("#dev-date-offset").value = String(state.dev.dateOffsetDays || 0);

    qs("#dev-10s").addEventListener("change", (e) => {
      state.dev.focusOverrideSeconds = e.target.checked ? 10 : null;
      fillTimerOnMode(true);
      saveState();
      renderTimer();
    });

    qs("#dev-date-offset").addEventListener("change", (e) => {
      state.dev.dateOffsetDays = parseInt(e.target.value, 10) || 0;
      saveState();
      reconcileDailyFields();
      renderApp();
    });

    qsa(".dev-stage").forEach((btn) => {
      btn.addEventListener("click", () => {
        jumpToLevel(STAGE_LEVEL[btn.dataset.stage] || 1);
      });
    });

    qs("#dev-coins").addEventListener("click", addDevCoins);

    qs("#dev-export-events").addEventListener("click", () => exportEvents());
    qs("#dev-clear-events").addEventListener("click", () => clearEvents());
  }

  function setupTabs() {
    qsa(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const panelName = tab.dataset.panel;
        qsa(".tab").forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        qsa(".panel").forEach((p) => {
          p.classList.toggle("is-open", p.id === "panel-" + panelName);
        });
      });
    });
  }

  function setupEvents() {
    qs("#timer-primary").addEventListener("click", () => {
      if (state.timer.isRunning) pauseTimer();
      else startTimer();
    });

    qs("#timer-reset").addEventListener("click", () => {
      stopTimer(true);
      announce("Timer reset.");
    });

    const dialRuler = qs("#time-dial-ruler");
    let dialSuppressClick = false;

    dialRuler.addEventListener("click", (e) => {
      if (dialSuppressClick) {
        dialSuppressClick = false;
        return;
      }
      const tick = e.target.closest(".time-dial__tick");
      if (tick && !tick.disabled) commitDialValue(parseInt(tick.dataset.value, 10));
    });

    const dialPeek = (value) => {
      const range = MODE_RANGE[state.timer.mode];
      const v = Math.min(Math.max(Math.floor(value), range.min), range.max);
      const ticks = dialRuler.querySelectorAll(".time-dial__tick");
      for (const t of ticks) {
        const sel = parseInt(t.dataset.value, 10) === v;
        t.classList.toggle("is-active", sel);
        t.setAttribute("aria-selected", sel ? "true" : "false");
      }
      const caption = qs("#time-dial-caption");
      if (caption) caption.textContent = MODE_LABEL[state.timer.mode] + " " + v + " min";
    };

    let dialDrag = null;
    dialRuler.addEventListener("pointerdown", (e) => {
      if (state.timer.isRunning) return;
      if (!e.isPrimary) return;
      dialRuler.scrollTo({ left: dialRuler.scrollLeft, behavior: "auto" });
      dialDrag = { startX: e.clientX, startLeft: dialRuler.scrollLeft, pointerId: e.pointerId };
      try { dialRuler.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      dialRuler.classList.add("is-dragging");
    });
    dialRuler.addEventListener("pointermove", (e) => {
      if (!dialDrag || dialDrag.pointerId !== e.pointerId) return;
      const dx = e.clientX - dialDrag.startX;
      if (Math.abs(dx) > 5) dialSuppressClick = true;
      dialRuler.scrollLeft = dialDrag.startLeft - dx;
      const range = MODE_RANGE[state.timer.mode];
      dialPeek(range.min + Math.round(dialRuler.scrollLeft / TICK_STEP));
    });
    const endDialDrag = (e) => {
      if (!dialDrag || dialDrag.pointerId !== e.pointerId) return;
      dialDrag = null;
      dialRuler.classList.remove("is-dragging");
      settleDial();
    };
    dialRuler.addEventListener("pointerup", endDialDrag);
    dialRuler.addEventListener("pointercancel", endDialDrag);

    let dialScrollTimer = null;
    const settleDial = () => {
      if (state.timer.isRunning) return;
      const range = MODE_RANGE[state.timer.mode];
      const v = Math.min(Math.max(range.min + Math.round(dialRuler.scrollLeft / TICK_STEP), range.min), range.max);
      const target = (v - range.min) * TICK_STEP;
      if (Math.abs(dialRuler.scrollLeft - target) > 0.5) {
        dialRuler.scrollTo({ left: target, behavior: state.settings.reducedMotion === "reduce" ? "auto" : "smooth" });
      }
      commitDialValue(v);
    };
    dialRuler.addEventListener("scroll", () => {
      positionDialBar();
      window.clearTimeout(dialScrollTimer);
      dialScrollTimer = window.setTimeout(settleDial, 300);
    });
    dialRuler.addEventListener("scrollend", () => {
      window.clearTimeout(dialScrollTimer);
      settleDial();
    });
    dialRuler.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const behavior = state.settings.reducedMotion === "reduce" ? "auto" : "smooth";
      dialRuler.scrollTo({ left: dialRuler.scrollLeft + delta, behavior });
    }, { passive: false });

    const bindDialArrow = (btnId, dir) => {
      const btn = qs(btnId);
      if (!btn) return;
      btn.addEventListener("pointerdown", (e) => {
        if (state.timer.isRunning) return;
        e.preventDefault();
        stepDial(dir);
        window.clearTimeout(btn._holdTimer);
        btn._holdTimer = window.setTimeout(() => {
          btn._repeatTimer = window.setInterval(() => stepDial(dir), 90);
        }, 380);
      });
      btn.addEventListener("pointerup", () => {
        window.clearTimeout(btn._holdTimer);
        window.clearInterval(btn._repeatTimer);
      });
      btn.addEventListener("pointercancel", () => {
        window.clearTimeout(btn._holdTimer);
        window.clearInterval(btn._repeatTimer);
      });
      btn.addEventListener("pointerleave", () => {
        window.clearTimeout(btn._holdTimer);
        window.clearInterval(btn._repeatTimer);
      });
      btn.addEventListener("click", (e) => {
        if (e.detail === 0) stepDial(dir);
      });
    };
    bindDialArrow("#time-dial-prev", -1);
    bindDialArrow("#time-dial-next", 1);

    ["focus", "short", "long"].forEach((mode) => {
      qs("#mode-btn-" + mode).addEventListener("click", () => switchMode(mode));
    });

    qs("#sound-toggle").addEventListener("click", () => {
      state.settings.soundEnabled = !state.settings.soundEnabled;
      saveState();
      renderHeader();
      if (state.settings.soundEnabled) playSound("ui-select");
    });

    qs("#theme-toggle").addEventListener("click", () => {
      state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
      syncTheme();
      saveState();
      renderHeader();
      playSound("ui-select");
    });

    qs("#settings-open").addEventListener("click", openSettings);
    qs("#settings-close").addEventListener("click", closeSettings);
    qs("#settings-dialog").addEventListener("click", (e) => {
      if (e.target === qs("#settings-dialog")) closeSettings();
    });

    qs("#settings-form").addEventListener("change", saveSettingsFromForm);
    qs("#settings-form").addEventListener("input", (e) => {
      if (e.target.id === "set-name") {
        state.petName = (e.target.value || "Sprout").slice(0, 20);
        saveState();
        renderHeader();
      }
    });

    qs("#reset-progress").addEventListener("click", resetProgress);
    qs("#export-save").addEventListener("click", exportSave);
    qs("#import-save").addEventListener("click", () => qs("#import-file").click());
    qs("#import-file").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importSave(file);
      e.target.value = "";
    });

    qs("#ob-primary").addEventListener("click", onObPrimary);
    qs("#ob-skip").addEventListener("click", skipOnboarding);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && qs("#settings-dialog").hidden === false) {
        closeSettings();
      }
      if (e.key === " " && qs("#timer-primary") === document.activeElement) {
        e.preventDefault();
        if (state.timer.isRunning) pauseTimer();
        else startTimer();
      }
    });
  }

  function init() {
    state = loadState();
    setupDev();
    reconcileDailyFields();
    setupEvents();
    setupTabs();
    syncMotion();
    syncTheme();

    finishInterruptedTimer();

    renderApp();

    if (!state.onboarding.complete) {
      showOnboarding(state.onboarding.step);
    } else {
      trackEvent("app_opened");
    }

    if (state.timer.isRunning) {
      startTickLoop();
      tickTimer();
    } else {
      renderTimer();
    }
  }

  function finishInterruptedTimer() {
    if (!state.timer.isRunning || !state.timer.endTime) {
      if (state.timer.endTime === null && state.timer.isRunning) {
        state.timer.isRunning = false;
        saveState();
      }
      return false;
    }
    const remaining = Math.max(0, Math.ceil((state.timer.endTime - Date.now()) / 1000));
    if (remaining <= 0 && !state.timer.completionHandled) {
      state.timer.completionHandled = true;
      state.timer.isRunning = false;
      state.timer.remainingSeconds = 0;
      state.timer.endTime = null;
      saveState();
      handleTimerComplete();
      return true;
    }
    if (remaining > 0) {
      state.timer.remainingSeconds = remaining;
      saveState();
    }
    return false;
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.timer && state.timer.isRunning) {
      tickTimer();
    }
  });

  document.addEventListener("pointerdown", () => {
    if (state.settings && state.settings.soundEnabled) {
      try {
        ensureAudio();
      } catch (e) {}
    }
  }, { once: false });

  init();
})();