# Pomodoro Pet — Implementation Plan

## 1. Project Goal

Build a simple, cozy, single-page Pomodoro web app where completing focus sessions rewards the user with XP and coins. Coins can be spent on cosmetic accessories for a virtual pet. The app requires no account, backend, database, or cloud sync; all progress is stored locally in the browser with `localStorage`.

## 2. Recommended MVP

The first version should focus on one small, complete gameplay loop:

1. The user starts a focus timer.
2. The user completes a focus session.
3. The app awards XP and coins.
4. The user's daily streak and session count are updated.
5. The pet reacts, levels up, and evolves at defined milestones.
6. The user spends coins on a small cosmetic accessory shop.
7. Progress is automatically saved and restored on reload.

### Suggested default settings

| Setting | Value |
|---|---:|
| Focus session | 25 minutes |
| Short break | 5 minutes |
| Long break | 15 minutes |
| XP per completed focus session | 10 XP |
| Coins per completed focus session | 5 coins |
| Daily bonus after 4 sessions | 25 coins |
| Sessions required for a level | 5 sessions, or use an XP curve |

For testing, add a development-only option that uses a 10-second focus timer. Do not ship it enabled in the production UI.

## 3. Canonical Pet Evolution Stages

Use one Focus Sprout species with three MVP forms. The refined three-stage system below is authoritative; the earlier six-stage concepts are deferred and should not be implemented in the first release.

| Stage | Unlock | Visual identity | Personality |
|---|---:|---|---|
| **Tiny Sprout** | Level 1 | Small round body, one leaf, sleepy eyes | Curious and gentle |
| **Focus Bloom** | Level 3 | Taller body, two leaves, brighter face, tiny notebook | Encouraging and energetic |
| **Study Sage** | Level 8 | Leaf crown, soft aura, clock charm or glasses | Calm and accomplished |

Use one inline SVG or CSS-based pet and change its body color, leaf shapes, expression, aura, and small props at each stage. Do not create separate full illustrations for each accessory.

Future forms such as Focus Guardian and Time Master may be considered after the MVP is validated, but they are explicitly out of scope for the first release.

## 4. Accessory Unlock Ideas

Accessories should be cosmetic only. Avoid giving purchased items gameplay advantages so the app remains easy to balance.

### Head accessories

| Accessory | Cost | Unlock condition |
|---|---:|---|
| Paper crown | 15 coins | Available from the start |
| Cozy beanie | 30 coins | Level 2 |
| Round glasses | 45 coins | Level 3 |
| Cat-ear headphones | 60 coins | Level 5 |
| Wizard hat | 100 coins | Level 8 |
| Golden clock crown | 200 coins | Level 12 |

### Body and handheld items

| Accessory | Cost | Unlock condition |
|---|---:|---|
| Tiny backpack | 25 coins | Level 2 |
| Scarf | 35 coins | Complete 3 sessions in one day |
| Notebook | 50 coins | Level 4 |
| Coffee mug | 60 coins | Complete 10 total sessions |
| Star wand | 90 coins | Maintain a 7-day streak |
| Mini trophy | 150 coins | Complete 50 total sessions |

### Backgrounds and environments

| Background | Cost | Unlock condition |
|---|---:|---|
| Sunny desk | Free | Available from the start |
| Rainy window | 50 coins | Complete 10 sessions |
| Cozy library | 100 coins | Reach Level 5 |
| Night sky | 150 coins | Maintain a 7-day streak |
| Magical study room | 250 coins | Reach Level 12 |

### Reward types

Use three kinds of unlocks:

1. **Coin purchases** — give the user a reason to keep completing sessions.
2. **Milestone rewards** — awarded automatically for levels, total sessions, or streaks.
3. **Rare streak rewards** — reserved for achievements such as a 7-day or 30-day streak.

## 5. Canonical MVP Data Model

Store one JSON object under a single key. This is the authoritative MVP state model; later sections must extend it only through deliberate migrations.

```js
const STORAGE_KEY = "pomodoroPetState";

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
  selectedBackground: "sunny-desk",
  achievements: [],
  gardenPlants: [],
  settings: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    soundEnabled: true,
    hapticsEnabled: true,
    reducedMotion: "system"
  },
  onboarding: {
    complete: false,
    step: "welcome"
  },
  timer: {
    mode: "focus",
    remainingSeconds: 25 * 60,
    endTime: null,
    isRunning: false,
    completionHandled: false
  }
};
```

The MVP intentionally excludes hunger, health, energy decay, inventory food, minigame statistics, weekly challenges, mystery boxes, and cloud data. Add those only in a later version with a separate schema decision.

### Why keep `lastSessionDate`?

The date is needed to determine whether a completed session continues the streak, starts a new streak, or was completed on the same day. Store dates as local calendar dates in `YYYY-MM-DD` format rather than full timestamps, so the streak follows the user's local day.

## 6. Loading and Saving `localStorage`

```js
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);

    const saved = JSON.parse(raw);

    // Merge defaults so new fields can be added in future versions.
    return {
      ...structuredClone(DEFAULT_STATE),
      ...saved,
      settings: {
        ...structuredClone(DEFAULT_STATE.settings),
        ...(saved.settings || {})
      },
      onboarding: {
        ...structuredClone(DEFAULT_STATE.onboarding),
        ...(saved.onboarding || {})
      },
      timer: {
        ...structuredClone(DEFAULT_STATE.timer),
        ...(saved.timer || {})
      },
      ownedAccessories: Array.isArray(saved.ownedAccessories)
        ? saved.ownedAccessories
        : [],
      equippedAccessories: Array.isArray(saved.equippedAccessories)
        ? saved.equippedAccessories
        : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      gardenPlants: Array.isArray(saved.gardenPlants) ? saved.gardenPlants : []
    };
  } catch (error) {
    console.warn("Could not load saved pet data:", error);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // This can happen if storage is disabled or full.
    console.warn("Could not save pet data:", error);
  }
}

let state = loadState();
```

`structuredClone()` is supported in modern browsers. If older-browser support is required, replace it with `JSON.parse(JSON.stringify(DEFAULT_STATE))`.

## 7. Date Helpers for Streak Tracking

```js
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyToUtcDay(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function daysBetween(dateKeyA, dateKeyB) {
  return Math.abs(dateKeyToUtcDay(dateKeyA) - dateKeyToUtcDay(dateKeyB));
}
```

Using UTC only for the difference avoids daylight-saving-time errors. The date keys themselves remain based on the user's local calendar.

## 8. Updating the Streak After a Completed Session

Call `recordCompletedSession()` only when a focus timer reaches zero. Do not call it when the user pauses or manually resets the timer.

```js
function recordCompletedSession() {
  const today = getLocalDateKey();
  const previousDate = state.lastSessionDate;

  // Reset daily counters and daily-only rewards when a new local day begins.
  if (previousDate !== today) {
    state.todaySessions = 0;
    state.dailyBonusClaimed = false;
  }

  if (!previousDate) {
    state.streak = 1;
  } else if (previousDate === today) {
    // Same-day sessions do not increase the streak more than once.
    state.streak = Math.max(state.streak, 1);
  } else if (daysBetween(previousDate, today) === 1) {
    state.streak += 1;
  } else {
    // Missing one or more calendar days breaks the streak.
    state.streak = 1;
  }

  state.lastSessionDate = today;
  state.todaySessions += 1;
  state.totalSessions += 1;
  state.coins += 5;
  state.xp += 10;

  if (state.todaySessions === 4 && !state.dailyBonusClaimed) {
    state.coins += 25;
    state.dailyBonusClaimed = true;
  }

  updateLevel();
  saveState(state);
  renderApp();
}
```

### Important edge case: opening the app after missing days

The streak does not need to be reset on page load. It is enough to compare `lastSessionDate` with today when the next session is completed. This avoids mutating data merely because the user opened the app.

## 9. XP and Level Calculation

Use one predictable formula for the MVP: each completed focus session awards 10 XP, and every 50 XP advances the pet by one level.

```js
function updateLevel() {
  state.level = Math.floor(state.xp / 50) + 1;
}

function getXpIntoCurrentLevel() {
  return state.xp % 50;
}

function getLevelProgressPercent() {
  return (getXpIntoCurrentLevel() / 50) * 100;
}
```

Evolution thresholds are fixed: Tiny Sprout at Level 1, Focus Bloom at Level 3, and Study Sage at Level 8. Do not use an increasing XP curve in the MVP.

## 10. Accessories and Purchases

Define the shop inventory in JavaScript so it is easy to render and update.

```js
const ACCESSORIES = [
  { id: "paper-crown", name: "Paper Crown", cost: 15, minLevel: 1 },
  { id: "cozy-beanie", name: "Cozy Beanie", cost: 30, minLevel: 2 },
  { id: "round-glasses", name: "Round Glasses", cost: 45, minLevel: 3 },
  { id: "wizard-hat", name: "Wizard Hat", cost: 100, minLevel: 8 }
];

function buyAccessory(accessoryId) {
  const accessory = ACCESSORIES.find(item => item.id === accessoryId);
  if (!accessory) return;
  if (state.level < accessory.minLevel) return;
  if (state.ownedAccessories.includes(accessoryId)) return;
  if (state.coins < accessory.cost) return;

  state.coins -= accessory.cost;
  state.ownedAccessories.push(accessoryId);
  saveState(state);
  renderApp();
}

function equipAccessory(accessoryId) {
  if (!state.ownedAccessories.includes(accessoryId)) return;

  const isEquipped = state.equippedAccessories.includes(accessoryId);
  state.equippedAccessories = isEquipped
    ? state.equippedAccessories.filter(id => id !== accessoryId)
    : [...state.equippedAccessories, accessoryId];

  saveState(state);
  renderApp();
}
```

For a first version, allow one accessory per category. Store accessories as objects with a `category` field if category restrictions are needed.

## 11. Rendering and Timer Integration

Keep state changes separate from visual rendering:

```js
function renderApp() {
  document.querySelector("#coins").textContent = state.coins;
  document.querySelector("#streak").textContent = state.streak;
  document.querySelector("#level").textContent = state.level;
  document.querySelector("#today-sessions").textContent = state.todaySessions;
  document.querySelector("#xp-fill").style.width = `${getLevelProgressPercent()}%`;

  renderPet(state);
  renderShop(state);
}

function onFocusTimerComplete() {
  recordCompletedSession();
  showRewardMessage("Focus session complete! +10 XP and +5 coins");
}

renderApp();
```

The timer should call `onFocusTimerComplete()` exactly once. Disable the completion callback after it fires or reset the timer state immediately to prevent duplicate rewards from double clicks or repeated interval callbacks.

## 12. Reset and Backup Controls

Because all data is local, include a small settings menu with:

- **Reset progress** button
- Optional **Export save** button
- Optional **Import save** button

Reset should be explicit and visually separated from normal controls:

```js
function resetProgress() {
  state = structuredClone(DEFAULT_STATE);
  saveState(state);
  renderApp();
}
```

For the MVP, a browser confirmation dialog is sufficient before resetting. Never reset data automatically because of malformed or missing storage; fall back to defaults and let the user decide.

## 13. Suggested File Structure

```text
pomodoro-pet/
├── index.html
├── styles.css
└── app.js
```

No server is required. The app can be opened locally or hosted as a static site.

## 14. Development Order

1. Create the static layout with onboarding, timer, pet, stats, and shop sections.
2. Implement the focus, short-break, and long-break timer using timestamp-based completion.
3. Add the canonical state object, `loadState()`, normalization, and `saveState()`.
4. Award XP and coins exactly once when a focus session completes.
5. Add local-date streak logic and test same-day, next-day, and missed-day cases.
6. Add the three pet stages and event-based pet states.
7. Add six cosmetic accessories and one background.
8. Add the Focus Garden and a small achievement list.
9. Add onboarding, reset progress, sound toggle, and reduced-motion support.
10. Test refreshes, hidden tabs, duplicate completion, invalid storage, accessibility, and mobile layout.
11. Polish only the animations and sounds that support the core loop.

## 15. Acceptance Checklist

- [ ] A completed focus session awards rewards exactly once.
- [ ] Coins and XP remain after a page refresh.
- [ ] An active timer uses timestamps so hidden-tab throttling does not add time.
- [ ] Multiple sessions on the same day increase `todaySessions` but not the streak multiple times.
- [ ] A session on the following calendar day increases the streak by one.
- [ ] Missing calendar days resets the streak to one after the next completed session.
- [ ] The four-session daily bonus is granted only once per day.
- [ ] Users cannot buy locked, already-owned, or unaffordable accessories.
- [ ] Level and evolution update when XP crosses a threshold.
- [ ] Evolution uses only Tiny Sprout, Focus Bloom, and Study Sage in the MVP.
- [ ] The Focus Garden and achievements work without a backend.
- [ ] Reset progress returns the app to a clean initial state.
- [ ] The UI remains usable on mobile-sized screens.

## 16. Recommended MVP Scope

The canonical first release is a static HTML/CSS/JavaScript app with no backend or database. It contains one Focus Sprout species, three evolution stages, focus/short-break/long-break timers, XP, coins, streaks, daily sessions, six cosmetic accessories, one background, one Focus Garden reward system, a small achievement list, optional three-screen onboarding, sound and reduced-motion preferences, `localStorage` persistence, and a reset-progress control. The key experience is immediate feedback after a focus session: celebrate with the pet, show XP and coin rewards, update the streak, grow the garden, and visibly fill the progress bar.

## 17. Evolution Sound Effects and CSS Animations

Evolution should feel exciting while remaining calm enough for a focus app. Keep the complete celebration around two to four seconds, use short layered sounds, and provide controls to disable audio and motion.

### Sound effect ideas

| Event | Suggested sound |
|---|---|
| Timer starts | Soft chime or gentle ticking sound |
| Timer pauses | Muted click or fabric-like puff |
| Timer completes | Three-note ascending melody |
| Coins earned | Light coin jingle |
| XP gained | Quick sparkle or positive blip |
| Streak continued | Warm bell chord |
| Daily bonus unlocked | Short fanfare with a bright final note |
| Pet evolution | Low magical hum, rising sparkle tones, soft whoosh, then a warm celebratory chord |

Give each evolution stage a slightly different musical identity:

| Stage | Sound style |
|---|---|
| Curious Buddy | Playful two-note chime |
| Focused Friend | Confident orchestral pluck |
| Study Sage | Magical bell arpeggio |
| Focus Guardian | Deep shimmer with a soft impact |
| Time Master | Brief celestial chord |

Avoid loud explosions or long victory music. Sound effects should support concentration rather than interrupt it. Browsers may block audio before user interaction, so trigger sounds only after a user gesture and include a visible sound toggle.

### Pre-evolution anticipation

Use a gentle scale-and-glow animation while the pet charges up:

```css
.pet.evolving {
  animation: petCharge 1.2s ease-in-out infinite alternate;
}

@keyframes petCharge {
  from {
    transform: scale(1);
    filter: brightness(1);
  }
  to {
    transform: scale(1.08);
    filter: brightness(1.5) drop-shadow(0 0 18px #ffd86b);
  }
}
```

### Floating particles

Create several `.spark` elements around the pet and vary their position, delay, and color:

```css
.spark {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffe27a;
  animation: sparkleRise 1.8s ease-out forwards;
}

@keyframes sparkleRise {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.4);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-90px) scale(1.2);
  }
}
```

### Transformation flash

Place a temporary glowing circle over the pet during the form swap:

```css
.evolution-flash {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: white;
  pointer-events: none;
  animation: evolutionFlash 700ms ease-out forwards;
}

@keyframes evolutionFlash {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  45% {
    opacity: 0.95;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}
```

### Pet reveal and celebration ring

After the flash, reveal the new form with a soft bounce and expand a ring behind it:

```css
.pet.revealed {
  animation: revealPet 900ms cubic-bezier(.2, 1.5, .4, 1) both;
}

@keyframes revealPet {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  65% {
    opacity: 1;
    transform: scale(1.12) rotate(4deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

.evolution-ring {
  position: absolute;
  inset: 0;
  border: 3px solid #ffd86b;
  border-radius: 50%;
  animation: ringBurst 900ms ease-out forwards;
}

@keyframes ringBurst {
  from {
    opacity: 0.9;
    transform: scale(0.6);
  }
  to {
    opacity: 0;
    transform: scale(1.8);
  }
}
```

### Accessory unlock animation

Use a small drop-and-pop effect when a new accessory becomes available:

```css
.accessory.unlocked {
  animation: accessoryPop 600ms ease-out both;
}

@keyframes accessoryPop {
  0% {
    opacity: 0;
    transform: translateY(-24px) scale(0.5) rotate(-12deg);
  }
  70% {
    opacity: 1;
    transform: translateY(4px) scale(1.1) rotate(5deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0);
  }
}
```

### Recommended evolution sequence

1. Pause the timer and temporarily disable interaction.
2. Make the pet gently bounce and begin glowing.
3. Play a rising three-note sound.
4. Spawn spark particles around the pet.
5. Show a bright transformation flash.
6. Swap the pet's appearance.
7. Animate the new form into view.
8. Play the evolution chord.
9. Display `Evolution unlocked!` with the new stage name.
10. Award a small bonus, such as 25 coins or a new accessory.

### Accessibility and user preferences

Respect reduced-motion preferences and provide equivalent text feedback:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

Also follow these rules:

- Save the sound on/off preference in `localStorage`.
- Do not rely on color or animation alone; show the unlocked stage name in text.
- Use an element with `aria-live="polite"` for reward and evolution announcements.
- Allow users to skip or shorten the celebration if they want to return to the timer quickly.
- Test the animation on mobile devices and keep it performant by animating `transform` and `opacity` instead of layout properties.

The recommended MVP sequence is **gentle glow → rising particles → transformation flash → bounce reveal → three-note evolution chord**.

## 18. Minigames and Extra Reward Features

Minigames should be short, optional, and rewarding without undermining the app's focus purpose. A good rule is to make each activity take between 15 seconds and two minutes, and never require a minigame before the user can claim the normal focus-session reward.

### Minigame ideas

#### Pet Snack Catch

After completing a focus session, give the user an optional 20-second round in which snacks fall around the pet.

- Clicking a snack earns coins.
- Missed snacks disappear without penalty.
- Faster snacks can unlock at higher pet levels.
- The user can skip the minigame and keep the normal session rewards.

#### Memory Match

Create a small card-matching game featuring the pet, accessories, and evolution forms.

- Completing a round awards bonus coins.
- Fewer moves produce a better score.
- New card designs unlock as the pet evolves.
- Store the user's best score in `localStorage`.

#### Focus Garden

After each completed session, let the user plant or water a seed.

- Plants progress through several visual growth stages.
- A fully grown plant becomes a permanent garden decoration.
- Missing a day pauses growth rather than destroying the garden.
- Different plants can be associated with different session milestones.

#### Pet Reaction Game

The pet displays an emotion or need, and the user chooses the matching response.

Examples include choosing food when the pet is hungry, a pillow when it is sleepy, or a toy when it is excited. This is easy to implement and gives the pet more personality.

#### Tiny Typing Challenge

After a session, show a short focus-related phrase for the user to type.

- Award coins based primarily on accuracy.
- Give a small bonus for speed.
- Save the user's personal best locally.
- Keep it optional rather than showing it after every session.

#### Star Collector

Give the user 15 to 30 seconds to move a pet or cursor around the screen and collect stars.

- Avoid simple obstacles.
- Use the score to determine a small bonus.
- Unlock new obstacle and background themes at higher levels.

#### Daily Puzzle

Offer one small local puzzle per calendar day, such as a memory sequence, pattern completion, word scramble, or simple arithmetic challenge.

- Save the daily puzzle result in `localStorage`.
- Give a separate puzzle streak without affecting the focus streak.
- Prevent repeated rewards if the user refreshes the page.

#### Accessory Dress-Up Challenge

Show a theme such as `Rainy Day`, `Cozy Library`, or `Space Explorer` and ask the user to dress the pet using owned items.

- Award a badge for a matching outfit.
- Unlock new themes at higher levels.
- Use a simple list of required item IDs rather than complex scoring.

### Extra reward features

#### Session combo rewards

Reward consecutive completed sessions during the same local calendar day:

| Session | Reward |
|---|---:|
| First session | 5 coins + 10 XP |
| Second session | 7 coins + 10 XP |
| Third session | 10 coins + 10 XP |
| Fourth session | 25 bonus coins |
| Fifth or later | 10 coins + 15 XP |

Store a `todaySessions` count and reset the combo when the calendar date changes. Keep the reward schedule visible so it feels fair and understandable.

#### Mystery reward boxes

Occasionally award a mystery box after a completed session. Possible contents include coins, food, temporary backgrounds, accessory fragments, or bonus XP cards.

Use a transparent reward table in the code and keep rewards cosmetic or modest. Avoid rewards that feel punishing when the user receives a common item.

#### Pet mood system

Give the pet a mood based on recent activity:

| Mood | Example trigger |
|---|---|
| Happy | Complete at least one session today |
| Excited | Complete three sessions today |
| Sleepy | Return after several inactive days |
| Proud | Reach a streak milestone |

Mood can change the pet's expression, idle animation, background particles, or speech bubble without changing the core productivity rewards.

#### Collection book

Add a collection screen containing:

- Pet evolution forms
- Accessories
- Backgrounds
- Garden plants
- Achievement badges
- Minigame trophies

The collection book creates a long-term goal beyond accumulating coins and makes cosmetic rewards feel meaningful.

#### Achievement badges

Suggested achievements include:

| Badge | Requirement |
|---|---|
| First Focus | Complete one session |
| Getting Started | Complete five sessions |
| Early Bird | Complete a session before 9:00 AM |
| Night Owl | Complete a session after 9:00 PM |
| Steady Mind | Maintain a three-day streak |
| Focus Master | Complete 50 sessions |
| Full Wardrobe | Unlock ten accessories |
| Perfect Round | Win a minigame without mistakes |

Store unlocked achievement IDs in an array and award each badge only once.

#### Random encouragement cards

After a completed session, show a short supportive message such as `Your pet is proud of you`, `One focused session at a time`, or `The garden is growing because of you`.

Use a small local message list and occasionally show a rarer animated card. The card should be celebratory but unobtrusive so it does not interrupt the next timer.

#### Weekly challenge board

Create a weekly challenge that resets using the local week number rather than a server. Example challenges include:

- Complete eight focus sessions.
- Earn 100 XP.
- Play three minigames.
- Buy one accessory.
- Maintain a three-day streak.

Completing the board can award a special badge, background, or plant. Save the week identifier and progress in `localStorage` so a refresh does not reset the challenge.

### Recommended MVP combination

Start with only these two reward additions:

1. **Focus Garden** for a persistent visual reward after each session.
2. **Achievements** for long-term progress.

The accessory shop and pet evolution already provide customization and progression. Defer Pet Snack Catch, Memory Match, typing, star collection, daily puzzles, dress-up challenges, mystery boxes, collection books, and weekly challenges until the core loop has been tested.

### Suggested state additions

The MVP only needs the `gardenPlants` and `achievements` fields already present in the canonical state model:

```js
const MVP_REWARD_DEFAULTS = {
  gardenPlants: [],
  achievements: []
};
```

Merge these defaults during `loadState()` so existing users do not lose progress when the MVP is updated. Each achievement and garden reward action must be idempotent: record completion before awarding a bonus, then call `saveState(state)` so a page refresh cannot grant the same reward repeatedly.

### Balance and accessibility guidelines

- Provide keyboard controls where possible and label interactive elements clearly.
- Respect `prefers-reduced-motion` and provide a reduced visual mode.
- Avoid flashing effects or rapid animations.
- Use an `aria-live="polite"` region to announce results such as `Your garden grew a new plant`.
- Test every reward path against refreshes, repeated clicks, and changing calendar dates.

## 19. Concrete UI and Color-Palette Plan

The interface should balance **calm productivity** with **playful pet feedback**. The timer and current task must always be the visual priority, while color, expressions, and reward animations provide the cute layer.

### 19.1 Design goals

Build the interface around these goals:

1. Make the active timer understandable within one second.
2. Keep the primary focus action obvious and easy to reach.
3. Use the pet to provide encouragement without distracting during a session.
4. Reserve the brightest colors and strongest animations for rewards.
5. Hide secondary features until the user asks for them.
6. Maintain readable contrast, keyboard accessibility, and mobile usability.

### 19.2 Page structure

Use a responsive three-part layout on desktop and a single-column layout on mobile.

```text
Desktop:
┌──────────────────────────────────────────────────────────────┐
│ Header: pet name | level | coins | sound | settings          │
├───────────────────────────────┬──────────────────────────────┤
│ Pet and timer                  │ Progress and session stats  │
│ Large pet illustration         │ XP bar                      │
│ Circular Pomodoro timer        │ Streak                      │
│ Start Focus button             │ Today's sessions            │
├───────────────────────────────┴──────────────────────────────┤
│ Tabs: Garden | Shop | Collection | Minigames | Achievements │
└──────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────────┐
│ Header and compact stats      │
│ Pet                           │
│ Timer                         │
│ Start Focus                   │
│ XP and streak                 │
│ Expandable feature sections   │
└──────────────────────────────┘
```

#### Header

Include:

- Pet name and small evolution icon
- Current level
- Coin balance
- Sound toggle
- Settings button

Keep the header compact. On narrow screens, place settings in a menu and retain only the coin balance and level beside the pet name.

#### Main focus panel

Make this the largest card on the page. It should contain:

- Pet illustration centered above or beside the timer
- Timer mode label: `Focus`, `Short Break`, or `Long Break`
- Large remaining-time display
- Circular progress ring
- One prominent action button
- Small pause and reset controls

#### Progress panel

Show progress at a glance:

- XP progress bar with current level
- Current streak
- Sessions completed today
- Optional daily-combo indicator

Use labels alongside icons so meaning is not dependent on color alone.

#### Secondary feature navigation

Use tabs or expandable cards for Garden, Shop, Collection, Minigames, and Achievements. Keep only one secondary panel open at a time. During focus mode, collapse or visually dim these panels.

### 19.3 Color system

Define all colors as CSS custom properties so the palette can be changed consistently:

```css
:root {
  --color-bg: #FFF8F0;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F3E8FF;
  --color-primary: #8B7CF6;
  --color-primary-dark: #6658D6;
  --color-success: #8BCB88;
  --color-reward: #F6C85F;
  --color-pet: #FF9F9F;
  --color-text: #38354A;
  --color-text-muted: #77738A;
  --color-border: #E8DFF0;
  --color-focus: #F6C85F;
  --shadow-soft: 0 10px 30px rgba(56, 53, 74, 0.10);
}
```

Apply colors by semantic role:

| UI role | Token | Usage |
|---|---|---|
| Page background | `--color-bg` | Main page and focus mode |
| Card background | `--color-surface` | Timer and content cards |
| Secondary card | `--color-surface-alt` | Shop, garden, and collection areas |
| Primary action | `--color-primary` | Start, pause, and selected tabs |
| Primary hover | `--color-primary-dark` | Hover and pressed states |
| Growth/success | `--color-success` | Garden growth and completed tasks |
| Reward | `--color-reward` | Coins, XP, unlocks, and evolution |
| Pet accent | `--color-pet` | Pet details and friendly highlights |
| Main text | `--color-text` | Headings and body text |
| Secondary text | `--color-text-muted` | Hints and supporting labels |

Use bright reward colors sparingly. The timer and primary action should be prominent through scale and placement, not through a rainbow of competing colors.

### 19.4 Typography and spacing

Use a friendly heading font and a highly readable system or sans-serif body font. Avoid decorative type for the timer.

```css
:root {
  --font-body: Inter, system-ui, sans-serif;
  --font-display: Nunito, system-ui, sans-serif;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --radius-card: 20px;
  --radius-button: 12px;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.5;
}

h1,
h2,
h3,
.pet-name {
  font-family: var(--font-display);
}

.timer-display {
  font-size: clamp(3rem, 10vw, 6rem);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
}
```

Use a consistent spacing scale. Give the timer and pet generous empty space so the interface feels calm rather than crowded.

### 19.5 Component specifications

#### Timer card

- Use a maximum width of approximately 620px.
- Place the timer in the center of a circular progress ring.
- Use a clear `Start Focus` button at least 48px high.
- Keep pause and reset visually secondary.
- Preview the reward beneath the button: `Complete this session to earn 10 XP + 5 coins.`

#### Pet display

- Use a fixed-size illustration area so the layout does not jump between evolution forms.
- Add subtle idle breathing and blinking when not focusing.
- Reduce movement during an active focus session.
- Show a small speech bubble only for important feedback or encouragement.

#### Buttons

```css
.button-primary {
  min-height: 48px;
  padding: 12px 24px;
  border: 0;
  border-radius: var(--radius-button);
  background: var(--color-primary);
  color: #FFFFFF;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(139, 124, 246, 0.25);
  transition: transform 160ms ease, background 160ms ease;
}

.button-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(1px);
}

button:focus-visible,
[role="button"]:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}
```

Use text labels on important controls. Icons may supplement labels but should not replace them for the primary action.

#### Progress indicators

Use a lavender or indigo XP bar with a gold highlight only when XP is newly awarded. Use a warm orange or coral accent for streaks and sage green for completed garden growth.

#### Locked content

Show locked accessories and features with:

- Muted colors
- A visible lock icon
- The unlock requirement in text
- No misleading disabled button state if the item can be inspected

### 19.6 Focus mode behavior

When the user starts a focus session, add a `focus-mode` class to the root element:

```css
.focus-mode .secondary-navigation,
.focus-mode .secondary-panels {
  opacity: 0.35;
  pointer-events: none;
}

.focus-mode .pet {
  animation-duration: 4s;
}

.focus-mode .timer-card {
  box-shadow: 0 14px 40px rgba(139, 124, 246, 0.16);
}
```

Focus mode should:

1. Keep the timer, pet, pause control, and session status visible.
2. Minimize or collapse the shop, collection, and minigame panels.
3. Reduce decorative animation and avoid particle effects.
4. Display a quiet message such as `Your pet is focusing with you.`
5. Restore the normal interface when the timer is paused, reset, or completed.

Do not block access to essential settings such as sound or an emergency stop.

### 19.7 Reward mode behavior

After a completed session, switch briefly into reward mode:

1. Animate the pet celebration.
2. Show XP and coin gains in separate, readable labels.
3. Update the streak and daily session count.
4. Grow the garden or reveal another persistent reward.
5. Check for a level-up, evolution, badge, or accessory unlock.
6. Offer an optional minigame with a clear `Skip` button.
7. Return the user to the break timer or the normal idle state.

Use a single reward area so updates do not compete across the whole page.

### 19.8 Responsive breakpoints

Use a mobile-first layout:

```css
.app-shell {
  width: min(100% - 32px, 1180px);
  margin: 0 auto;
}

.main-grid {
  display: grid;
  gap: var(--space-5);
}

@media (min-width: 860px) {
  .main-grid {
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
    align-items: start;
  }
}
```

On mobile:

- Stack the pet above the timer and stats.
- Make the primary action full width.
- Use horizontally scrollable tabs or accordion sections.
- Keep touch targets at least 44–48px high.
- Avoid fixed elements that cover the timer or controls.

### 19.9 Accessibility requirements

- Maintain readable contrast between text and backgrounds.
- Use visible `:focus-visible` outlines.
- Provide text labels in addition to icons and color signals.
- Add `aria-live="polite"` for rewards, streak changes, and evolution announcements.
- Respect `prefers-reduced-motion` and disable nonessential animation when requested.
- Provide a sound toggle and save it locally.
- Ensure the entire timer workflow is usable with a keyboard.
- Do not autoplay sounds before the user interacts with the page.

### 19.10 Implementation sequence

1. Create semantic HTML sections for the header, timer, pet, progress, and secondary navigation.
2. Add the CSS variable palette and spacing tokens.
3. Implement the mobile-first single-column layout.
4. Add the desktop two-column layout at the responsive breakpoint.
5. Style the timer card and make `Start Focus` the primary action.
6. Add the pet illustration area with a stable fixed height.
7. Add XP, streak, and session progress components.
8. Implement the secondary feature tabs and keep them collapsed during focus mode.
9. Add hover, active, focus, locked, completed, and disabled states.
10. Add focus-mode and reward-mode classes to control visual density and animation.
11. Test the palette for contrast and the layout at mobile, tablet, and desktop widths.
12. Test keyboard navigation, reduced motion, sound preferences, and screen-reader announcements.

### 19.11 UI acceptance checklist

- [ ] The timer is the first visual element users notice.
- [ ] `Start Focus` is clearly the primary action.
- [ ] The pet is cute and expressive but calmer during focus mode.
- [ ] The palette uses cream, lavender, sage, coral, gold, and deep purple-gray consistently.
- [ ] Bright reward colors are reserved for meaningful feedback.
- [ ] Secondary features do not compete with the timer.
- [ ] The interface works in a single-column mobile layout.
- [ ] Touch targets are at least 44–48px high.
- [ ] Keyboard focus is visible on every interactive control.
- [ ] Reward announcements are available as text and through `aria-live`.
- [ ] Reduced-motion users are not forced to watch elaborate animations.
- [ ] Sound can be disabled and the preference persists locally.

The final visual direction is a **cozy study room**: calm cream surfaces and lavender panels for structure, sage green for growth, coral for the pet, gold for rewards, and deep purple-gray text for readable contrast.

## 20. Simple-App Guardrails and Final Implementation Details

The app should remain a lightweight static website. Do not add accounts, a backend, a database, cloud synchronization, or complicated simulation systems for the MVP. Every feature should support the core loop: **focus → earn rewards → care for the pet → return to focus**.

### 20.1 Keep the first release small

The first usable release should include only:

- One pet with three evolution stages.
- Focus, short-break, and long-break timer modes.
- XP, coins, streak, and daily session count.
- Six accessories and one or two backgrounds.
- One simple garden reward.
- One optional minigame, preferably Pet Snack Catch.
- A small achievement list.
- Sound and motion preferences.
- Reset progress control.

Defer multiplayer features, leaderboards, accounts, cloud saves, complex pet needs, procedural content, and multiple minigames until the basic experience has been tested with real use.

### 20.2 Timer edge cases

Use one timer controller and one completion path. A completed focus session should be rewarded exactly once.

Recommended behavior:

- `Start` begins the selected timer mode.
- `Pause` freezes the remaining seconds without awarding a reward.
- `Reset` stops the timer and returns to the selected mode's full duration.
- Reaching zero calls the completion handler once, then immediately marks the timer as complete.
- Only focus mode completion awards XP, coins, streak progress, and daily-session progress.
- Break completion changes the mode but does not award productivity rewards.
- If the page is refreshed, restore the timer only if an active timer was intentionally saved; otherwise return to an idle state.
- If the browser tab is hidden, calculate elapsed time from timestamps rather than counting only visible interval callbacks.

A straightforward timer state is enough:

```js
const timer = {
  mode: "focus",
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  startedAt: null,
  completionHandled: false
};
```

For a simple version, save only `mode`, `remainingSeconds`, `isRunning`, and `startedAt`. On reload, calculate the elapsed time and either restore the remaining time or complete the timer once if the end time has passed.

### 20.3 Minimal settings panel

Add one small settings panel rather than a large preferences system. Include:

- Focus duration: 25 minutes by default.
- Short break duration: 5 minutes by default.
- Long break duration: 15 minutes by default.
- Sound effects: on/off.
- Reduced motion: system preference by default, with an optional override.
- Pet name: optional custom name.

Store settings in the same versioned state object. Keep the standard durations visible as a quick-reset option so users cannot accidentally create confusing timer values.

### 20.4 Safe local saves

Because there is no account or cloud backup, be transparent about local-only storage:

- Show a small note in settings: `Progress is saved in this browser only.`
- Explain that clearing browser data can remove progress.
- Never silently overwrite valid data with malformed data.
- Merge new default fields when the app is updated.
- Include a reset button with a confirmation step.

Optional export and import can be added as a simple JSON file flow after the MVP:

```js
function exportSave() {
  const file = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pomodoro-pet-save.json";
  link.click();
  URL.revokeObjectURL(url);
}
```

Import should validate that the file contains expected fields before replacing the current state. Do not make export/import a dependency for the first release.

### 20.5 Offline-first static behavior

The app should work when opened as a static site with no network connection after its files have loaded. Avoid remote APIs and make core assets local.

Recommended file structure:

```text
pomodoro-pet/
├── index.html
├── styles.css
├── app.js
└── assets/
    ├── pet.svg
    ├── accessories.svg
    └── sounds/
```

A service worker and installable PWA mode are optional enhancements. Do not add them until the normal static site works reliably, because caching can make development and debugging more confusing.

### 20.6 Simple content model

Use data arrays instead of a database for pet forms, accessories, achievements, and messages:

```js
const PET_STAGES = [
  { id: "sprout", name: "Tiny Sprout", level: 1 },
  { id: "buddy", name: "Curious Buddy", level: 3 },
  { id: "sage", name: "Study Sage", level: 8 }
];

const ACHIEVEMENTS = [
  { id: "first-focus", name: "First Focus", requirement: "Complete one session" },
  { id: "steady-mind", name: "Steady Mind", requirement: "Reach a three-day streak" },
  { id: "focus-master", name: "Focus Master", requirement: "Complete 50 sessions" }
];
```

This makes balancing and content updates easy without adding a content-management system.

### 20.7 Basic testing plan

Before considering the MVP complete, manually test the following:

- Start, pause, reset, and complete each timer mode.
- Refresh the page before and after a completed focus session.
- Complete multiple sessions on the same day.
- Continue a streak on the next day using a temporary test date helper.
- Break a streak after a missed day.
- Reload after buying and equipping an accessory.
- Attempt to buy an item with insufficient coins.
- Click a completion control repeatedly and confirm only one reward is granted.
- Disable sound and confirm the preference remains after refresh.
- Enable reduced motion and confirm major animations are minimized.
- Use the timer and shop with keyboard-only navigation.
- Check the layout at mobile and desktop widths.

For development, temporarily use a ten-second focus duration. Keep this test setting out of the production interface.

### 20.8 Privacy and user expectations

The app does not need a privacy-heavy account system because it stores progress locally and collects no user data. Still, explain the limitation clearly:

> Your progress is saved locally in this browser. It is not synced across devices and may be lost if browser storage is cleared.

Do not add analytics, external accounts, or tracking to the simple MVP unless they become a deliberate future requirement.

### 20.9 Definition of done for the simple MVP

The first release is complete when:

- A user can open the site and start a focus timer immediately.
- Completing a focus session updates the pet, coins, XP, streak, and session count.
- Progress survives a page refresh.
- The pet can evolve and equip at least a few accessories.
- The user can see one clear garden or collection reward.
- The interface remains calm during focus mode.
- The app works without a backend or database.
- Reset progress works safely.
- The timer does not duplicate rewards.
- The app is usable on mobile and with a keyboard.

The guiding rule is **polish the core loop before adding more systems**. A small app with a reliable timer, charming pet feedback, and clear rewards will feel more complete than a large app with unfinished minigames and settings.

## 21. Refined Pet Design System

The existing pet stages are charming but too broad for a simple first release. Six full evolution forms would create unnecessary art and implementation work. Refine the MVP around **one recognizable creature, three meaningful forms, and a small set of expressive states**.

### 21.1 Core pet concept: the Focus Sprout

Use a rounded, plant-like study companion with a simple silhouette:

- Soft oval body
- Two expressive eyes
- Small leaf or ear shapes on top
- Tiny feet and optional tail
- One prop or accessory slot
- A small leaf mark that changes as the pet evolves

The plant-like design connects naturally to the Focus Garden, is easy to draw with SVG or CSS, and can evolve without replacing the entire illustration.

Avoid using hunger, health, or decay systems in the MVP. They create pressure and extra state without improving the core focus loop. The pet should respond to the user's progress, not punish inactivity.

### 21.2 MVP evolution stages

Use three stages in the first release. Each stage should change the silhouette, expression, and one visible detail so the evolution feels real even with simple vector art.

| Stage | Unlock | Visual identity | Personality |
|---|---:|---|---|
| **Tiny Sprout** | Level 1 | Small round body, one leaf, sleepy eyes | Curious and gentle |
| **Focus Bloom** | Level 3 | Taller body, two leaves, brighter face, tiny notebook | Encouraging and energetic |
| **Study Sage** | Level 8 | Leaf crown, soft aura, small clock charm or glasses | Calm and wise |

Reserve **Focus Guardian** and **Time Master** as future expansions. Do not build their assets until the three-stage loop has been tested.

### 21.3 Visual language

Keep the pet readable at a glance:

- Use one dominant body color per stage.
- Preserve the same eyes and face placement across forms.
- Add only one or two new shapes at each evolution.
- Use a dark outline or shadow so the pet remains visible on light backgrounds.
- Keep accessories visually separate from the base body.
- Use gold and lavender only for evolution effects, not as permanent visual noise.

Suggested stage palette:

| Stage | Body | Detail | Mood |
|---|---|---|---|
| Tiny Sprout | Warm mint `#A8DDB5` | Soft coral `#FF9F9F` | Sleepy and cozy |
| Focus Bloom | Sky blue `#9CCBEB` | Sage `#78B987` | Cheerful and active |
| Study Sage | Lavender `#B9A7E8` | Gold `#F6C85F` | Calm and accomplished |

### 21.4 Expression states

Do not model complex needs. Use a small finite set of visual states driven by app events:

| State | Trigger | Expression or animation |
|---|---|---|
| Idle | App open, no timer | Slow breathing and occasional blink |
| Ready | Timer is configured | Open eyes and small smile |
| Focusing | Focus timer running | Calm eyes, reduced movement, tiny leaf sway |
| Break | Break timer running | Relaxed face and gentle stretch |
| Celebrating | Session completed | Bounce, closed happy eyes, sparkles |
| Proud | Level-up or streak milestone | Smile, raised leaf, short glow |
| Sleepy | No session today or late idle state | Slow blink and small yawn; never deduct rewards |

Switch states with data attributes rather than separate complicated components:

```html
<div class="pet pet--focus-bloom" data-state="focusing" aria-label="Your Focus Bloom pet is focusing with you">
  <!-- SVG or CSS pet layers -->
</div>
```

```css
.pet[data-state="focusing"] .pet-body {
  animation: pet-breathe 4s ease-in-out infinite;
}

.pet[data-state="celebrating"] .pet-body {
  animation: pet-celebrate 700ms cubic-bezier(.2, 1.4, .4, 1) both;
}

@keyframes pet-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.015); }
}

@keyframes pet-celebrate {
  0% { transform: translateY(0) rotate(0); }
  40% { transform: translateY(-12px) rotate(-4deg) scale(1.06); }
  70% { transform: translateY(0) rotate(4deg) scale(1.02); }
  100% { transform: translateY(0) rotate(0) scale(1); }
}
```

### 21.5 Personality and microcopy

Give the pet a consistent voice: short, warm, and never guilt-inducing. Use a small local message array rather than a dialogue engine.

```js
const PET_MESSAGES = {
  ready: ["Ready when you are.", "Let's grow a little today."],
  focusing: ["I'm focusing with you.", "Nice and steady."],
  complete: ["You did it!", "Our garden grew a little more."],
  streak: ["We're building a rhythm!", "Another day, another bloom."],
  missedDay: ["Welcome back.", "A fresh streak starts today."]
};
```

Show one message at a time in a small speech bubble. Keep it on screen for a few seconds and do not make the user dismiss it. Avoid messages such as `You failed`, `You broke your streak`, or `Your pet is disappointed`.

### 21.6 Lightweight implementation model

Build the pet as one inline SVG with named groups instead of importing an illustration framework:

```html
<svg class="pet-art" viewBox="0 0 240 240" role="img" aria-labelledby="pet-title pet-description">
  <title id="pet-title">Focus Bloom</title>
  <desc id="pet-description">A cheerful plant-like focus companion</desc>
  <g class="pet-aura"></g>
  <g class="pet-body"></g>
  <g class="pet-face"></g>
  <g class="pet-stage-details"></g>
  <g class="pet-accessories"></g>
</svg>
```

Use CSS classes or small DOM updates to change the stage and state. Do not generate or redraw complex artwork during every timer tick. Update the pet only when the mode, reward, level, or equipped accessory changes.

A simple renderer is sufficient:

```js
function getPetStage(level) {
  if (level >= 8) return "study-sage";
  if (level >= 3) return "focus-bloom";
  return "tiny-sprout";
}

function setPetState(stateName) {
  const pet = document.querySelector(".pet");
  if (!pet) return;
  pet.dataset.state = stateName;
}

function renderPet(state) {
  const pet = document.querySelector(".pet");
  if (!pet) return;
  pet.className = `pet pet--${getPetStage(state.level)}`;
  pet.dataset.state = state.timerMode === "focus" && state.timerRunning
    ? "focusing"
    : "idle";
}
```

Adapt the exact state property names to the final app state. The important rule is to keep pet rendering event-driven and small.

### 21.7 Accessory rules

Accessories should enhance the same silhouette rather than cover it:

- One head accessory
- One body or handheld accessory
- One background

For the MVP, include six accessories: paper crown, cozy beanie, round glasses, tiny backpack, notebook, and clock charm. Each item should have a clear icon and category. Do not create separate pet art for every accessory; place accessory SVG groups above the base pet layers.

### 21.8 Evolution reveal behavior

Use the existing sound and animation plan, but keep the implementation short:

1. Freeze normal pet interaction.
2. Add the `evolving` class for a soft glow.
3. Spawn three to five lightweight spark elements.
4. Swap the stage class after the flash.
5. Add the `revealed` class for the bounce.
6. Announce the new form in text, such as `Focus Bloom unlocked!`.
7. Save the new level and stage through the normal state save.

Do not use a large particle library. CSS pseudo-elements or a handful of generated `<span>` elements are enough.

### 21.9 Refined pet acceptance checklist

- [ ] The pet has one consistent silhouette across all three MVP stages.
- [ ] Each stage changes at least two visible traits.
- [ ] The pet remains recognizable at small mobile sizes.
- [ ] Idle animation is subtle and does not compete with the timer.
- [ ] Focus mode reduces pet motion.
- [ ] Completion and evolution states provide stronger feedback.
- [ ] The pet never shames users for missing sessions.
- [ ] Accessories use layered SVG or CSS elements rather than duplicate illustrations.
- [ ] The pet works without external animation libraries.
- [ ] Screen readers receive a useful pet label and text announcement for evolution.

The refined direction is intentionally modest: **one Focus Sprout species, three stages, seven event states, six accessories, and a handful of supportive messages**. This gives the pet personality without turning a simple Pomodoro app into a full virtual-pet simulator.

## 22. Quick User Onboarding Flow

Onboarding should introduce the Focus Sprout without turning into a tutorial. Keep it to three short screens plus one optional setup action, and get the user to the timer within 30–60 seconds.

### 22.1 Screen 1: Meet the pet

Show the Tiny Sprout with a gentle idle animation.

**Message:**

> Meet your Focus Sprout. It grows whenever you complete a focus session.

Primary button: `Nice to meet you`

Optional field: `Give your Sprout a name`

Use `Sprout` as the default name. Do not require naming; users should be able to continue immediately.

### 22.2 Screen 2: Explain the core loop

Show three simple illustrations or icons:

1. **Focus** — Complete a Pomodoro session.
2. **Grow** — Earn XP and coins.
3. **Customize** — Unlock accessories and evolve the Sprout.

**Message:**

> Small focus sessions help your Sprout grow. No pressure—just one session at a time.

Primary button: `Got it`

Do not explain every achievement, minigame, accessory, or garden feature during onboarding. Reveal those features naturally as the user explores the app.

### 22.3 Screen 3: Confirm the starting duration

Keep onboarding simple by presenting the canonical default rather than another feature choice:

> Your first focus session will be 25 minutes.

Show `Classic Pomodoro` as the selected duration and provide a small `Change later in Settings` note. The user can continue without making another decision.

Primary button: `Start with 25 minutes`

For development, a temporary ten-second timer may be used for testing, but it should never appear in the production onboarding UI.

### 22.4 First-session handoff

After the duration is chosen, return the user to the main timer with the start button highlighted.

**Message:**

> Your first goal: complete one focus session. Sprout will be waiting for you.

Primary button: `Start First Session`

Secondary button: `Explore first`

The primary path should start the selected timer. The secondary option should dismiss onboarding and show the normal idle app without starting a session.

### 22.5 First-session reward

After the user's first focus session completes:

- Award the normal XP and coins.
- Play the standard completion feedback.
- Trigger a short pet celebration.
- Unlock the `First Focus` achievement.
- Show the message: `You and Sprout completed your first session together!`

Do not trigger the first evolution after the first session. Let the user understand the focus-and-reward loop before introducing the next major milestone.

### 22.6 Onboarding state

Store onboarding progress locally. Use a completion flag and a step value so a refresh does not force the user to repeat the entire flow.

```js
const ONBOARDING_COMPLETE_KEY = "pomodoroPetOnboardingComplete";
const ONBOARDING_STEP_KEY = "pomodoroPetOnboardingStep";

function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

function saveOnboardingStep(step) {
  localStorage.setItem(ONBOARDING_STEP_KEY, step);
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
  localStorage.removeItem(ONBOARDING_STEP_KEY);
}

function getOnboardingStep() {
  return localStorage.getItem(ONBOARDING_STEP_KEY) || "welcome";
}
```

At startup:

```js
if (!hasCompletedOnboarding()) {
  showOnboarding(getOnboardingStep());
} else {
  showMainApp();
}
```

If the user closes the page during onboarding, resume from the last completed step. Include a visible `Skip setup` action; skipping should call `completeOnboarding()` and open the main app without awarding any session rewards.

### 22.7 Onboarding UI rules

- Use one message and one main action per screen.
- Include a visible progress indicator such as `1 of 3`.
- Include `Skip setup` as a low-emphasis secondary action.
- Reuse the main palette: cream background, lavender panels, sage growth accents, coral pet details, and gold rewards.
- Use gentle pet motion during onboarding and reserve the strongest celebration for the first completed session.
- Keep all controls keyboard accessible with visible focus states.
- Use `aria-live="polite"` for important onboarding announcements.
- Do not request accounts, email addresses, notifications, permissions, or external services.
- Do not block access to the timer if the user chooses to skip.

### 22.8 Onboarding flow

```text
New user
   ↓
Meet Tiny Sprout
   ↓
Explain Focus → Grow → Customize
   ↓
Choose timer duration
   ↓
Start first session
   ↓
Complete session
   ↓
First Focus achievement + normal reward
   ↓
Main app
```

The key principle is to introduce only what the user needs to begin focusing. Let the pet, garden, accessories, minigames, and evolution system teach the remaining features through use.

### 22.9 Onboarding acceptance checklist

- [ ] A new user can reach the timer in under one minute.
- [ ] The user understands the Focus → Grow → Customize loop.
- [ ] Classic Pomodoro is preselected.
- [ ] Naming the pet is optional.
- [ ] The user can skip onboarding at any point.
- [ ] Onboarding progress survives a page refresh.
- [ ] Skipping does not grant rewards.
- [ ] The first completed session grants the normal reward exactly once.
- [ ] The `First Focus` achievement is awarded only once.
- [ ] Returning users go directly to the main app.
- [ ] The flow works with keyboard navigation and reduced motion.

## 23. Onboarding Sound Effects and Haptic Feedback

Onboarding should feel welcoming rather than noisy. Use short, soft feedback and reserve the strongest sound for the first completed focus session. Sound and haptics are enhancements only; every state must remain understandable visually and through text.

### 23.1 Sound effect map

| Moment | Sound | Target duration |
|---|---|---:|
| Screen appears | Warm two-note chime | 0.5–0.8 seconds |
| Pet idle | Occasional tiny chirp or leaf rustle | 0.2–0.4 seconds |
| Pet name confirmed | Soft pop or sparkle | About 0.2 seconds |
| Continue button | Quiet wooden click | About 0.1 seconds |
| Duration selected | Gentle tick or tonal blip | 0.1–0.2 seconds |
| Recommended duration | Subtle shimmer | About 0.3 seconds |
| Start first session | Calm rising three-note tone | About 1 second |
| Skip onboarding | Quiet tap without a celebration | About 0.1 seconds |
| First session completed | Warm four-note melody | 1.5–2 seconds |

### 23.2 Suggested onboarding sound sequence

1. **Meet Tiny Sprout:** play one warm arrival chime when the pet appears.
2. **Name the pet:** play a small sparkle when an optional name is accepted.
3. **Explain the loop:** use at most one soft sound per deliberate step; do not sound automatic transitions.
4. **Choose duration:** play a subtle tone when a duration is selected.
5. **Start first session:** play a calm rising three-note sequence.
6. **Complete the first session:** play the strongest onboarding sound, a gentle celebratory chord or four-note melody.

Reuse the same sound palette in the main app so onboarding establishes a consistent audio identity.

### 23.3 Haptic feedback map

Haptics should be brief and optional:

| Moment | Haptic pattern |
|---|---|
| Button press | One very short tap |
| Duration selection | One light tap |
| Start timer | One light tap |
| First-session reward | Two light pulses |
| Evolution or major unlock | One medium pulse followed by one light pulse |

Do not vibrate for automatic screen transitions, idle pet animation, text-field keystrokes, repeated timer ticks, or minor hover and focus states.

### 23.4 Lightweight Web Vibration API

Use the native browser API as a progressive enhancement. Do not import a haptics library.

```js
function vibrate(pattern) {
  const settings = state.settings || {};

  if (!settings.hapticsEnabled) return;
  if (!("vibrate" in navigator)) return;

  navigator.vibrate(pattern);
}

// Button tap
vibrate(10);

// First-session reward
vibrate([12, 40, 12]);
```

Call `vibrate()` only from user-triggered actions or a reward callback directly resulting from a user action. Browser support varies, and some mobile browsers may not implement `navigator.vibrate`, so the feature must fail silently.

### 23.5 Sound and haptic preferences

Add separate settings to the existing state object:

```js
settings: {
  soundEnabled: true,
  hapticsEnabled: true
}
```

Recommended behavior:

- Let users disable sound and haptics independently.
- Do not autoplay audio when onboarding opens.
- Enable sound only after the user has interacted with the page, if required by browser autoplay rules.
- Respect reduced-motion preferences for visual effects.
- Never make audio or vibration necessary to understand a state.
- Save both preferences in the existing versioned `localStorage` object.

### 23.6 Simple audio implementation

For a static app, use a small set of local audio files or short Web Audio API tones. Avoid a full audio engine. Keep files compressed and short, with descriptive names:

```text
assets/sounds/
├── onboarding-arrive.mp3
├── ui-select.mp3
├── timer-start.mp3
└── first-session-reward.mp3
```

Create one guarded playback helper:

```js
function playSound(name) {
  if (!state.settings.soundEnabled) return;

  const audio = document.querySelector(`[data-sound="${name}"]`);
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    // Playback may be blocked until the user interacts with the page.
  });
}
```

Do not overlap multiple copies of the same sound. Reset `currentTime` for short UI sounds and keep the volume low enough that the timer remains comfortable in a quiet workspace.

### 23.7 MVP scope

For the first version, implement only:

1. A warm arrival chime.
2. A soft selection click.
3. A calm start-timer tone.
4. A short first-session reward melody.
5. One light haptic for important button presses.
6. A double pulse for the first-session reward.
7. Separate sound and haptic toggles.

Defer pet idle sounds, evolution-specific audio, audio volume sliders, background music, and complex audio mixing until the core flow has been tested. This keeps the app lightweight and avoids making onboarding distracting.

### 23.8 Audio and haptic acceptance checklist

- [ ] No sound plays before the user has interacted with the page.
- [ ] Sound and haptics can be disabled separately.
- [ ] Unsupported vibration APIs fail without errors.
- [ ] Sound playback failures do not interrupt onboarding.
- [ ] First-session rewards play only once.
- [ ] Haptics are brief and never required for comprehension.
- [ ] Audio files are local, short, and lightweight.
- [ ] Reduced-motion users receive less visual motion while retaining text feedback.
- [ ] The complete onboarding experience remains comfortable in a quiet workspace.

## 24. Canonical MVP Specification

This section is authoritative when earlier exploratory sections offer alternatives. The MVP must stay small, static, and understandable. Earlier ideas that are not listed here are deferred rather than required.

### 24.1 Final feature list

The first release includes:

- Static HTML, CSS, and JavaScript only.
- No backend, database, account, cloud sync, analytics, or external API.
- One Focus Sprout species.
- Three pet stages: Tiny Sprout, Focus Bloom, and Study Sage.
- Focus, short-break, and long-break timer modes.
- Default durations of 25, 5, and 15 minutes.
- XP, coins, daily session count, and daily streak.
- Six cosmetic accessories and one background.
- One Focus Garden reward system.
- A small achievement list.
- Optional three-screen onboarding.
- Sound on/off and haptics on/off settings.
- Reduced-motion support.
- `localStorage` persistence and a reset-progress control.

### 24.2 Final progression rules

Use these values everywhere in the app:

| Rule | Value |
|---|---:|
| XP per completed focus session | 10 XP |
| Coins per completed focus session | 5 coins |
| Daily bonus | 25 coins after the fourth session of the day |
| XP per level | 50 XP |
| Focus Bloom evolution | Level 3 |
| Study Sage evolution | Level 8 |

The daily bonus is granted once per local calendar day. A break timer never grants focus rewards. The same completion event must never grant rewards twice.

### 24.3 Final pet rules

The pet responds to app events but has no hunger, health, energy decay, or punishment system. Use these states:

- `idle`
- `ready`
- `focusing`
- `break`
- `celebrating`
- `proud`
- `sleepy`

The pet should encourage the user after progress and welcome them back after inactivity. Missing a day resets the streak when the next session is completed, but it never damages the pet or garden.

### 24.4 Timestamp-based timer rule

Use an absolute `endTime` so the timer remains accurate when a tab is hidden or throttled:

```js
function startTimer() {
  state.timer.isRunning = true;
  state.timer.endTime = Date.now() + state.timer.remainingSeconds * 1000;
  saveState(state);
  renderApp();
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
    state.timer.completionHandled = true;
    state.timer.isRunning = false;
    state.timer.endTime = null;
    saveState(state);
    handleTimerComplete();
    return;
  }

  renderTimer();
}
```

Run a lightweight interval only to refresh the display. The timestamp, not the interval count, is the source of truth. On page load, call `tickTimer()` once before starting the display interval.

### 24.5 Final save normalization rules

Merging defaults is not enough; normalize untrusted local data before using it:

```js
function nonNegativeNumber(value, fallback) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeState(saved) {
  const merged = {
    ...structuredClone(DEFAULT_STATE),
    ...(saved || {})
  };

  merged.coins = nonNegativeNumber(merged.coins, 0);
  merged.xp = nonNegativeNumber(merged.xp, 0);
  merged.level = Math.max(1, Math.floor(nonNegativeNumber(merged.level, 1)));
  merged.totalSessions = Math.floor(nonNegativeNumber(merged.totalSessions, 0));
  merged.todaySessions = Math.floor(nonNegativeNumber(merged.todaySessions, 0));
  merged.streak = Math.floor(nonNegativeNumber(merged.streak, 0));
  merged.ownedAccessories = Array.isArray(merged.ownedAccessories)
    ? merged.ownedAccessories.filter(id => ACCESSORIES.some(item => item.id === id))
    : [];
  merged.equippedAccessories = Array.isArray(merged.equippedAccessories)
    ? merged.equippedAccessories.filter(id => merged.ownedAccessories.includes(id))
    : [];
  merged.achievements = Array.isArray(merged.achievements) ? merged.achievements : [];
  merged.gardenPlants = Array.isArray(merged.gardenPlants) ? merged.gardenPlants : [];

  return merged;
}
```

If parsing fails, load a fresh default state and show a non-blocking warning in settings. Never silently replace a valid save with defaults. Save versions should be migrated explicitly when the schema changes.

### 24.6 Final accessory scope

Implement six cosmetic accessories only:

- Paper crown
- Cozy beanie
- Round glasses
- Tiny backpack
- Notebook
- Clock charm

Allow one head item, one body or handheld item, and one background. Accessories must not affect XP, coins, timer length, or streaks.

### 24.7 Final reward scope

The MVP includes:

- XP and coin rewards after focus sessions.
- Daily streak and fourth-session bonus.
- Focus Garden growth after sessions.
- Small achievements such as First Focus, Steady Mind, and Focus Master.
- Pet evolution at Levels 3 and 8.
- Cosmetic accessory purchases.

Defer Pet Snack Catch, Memory Match, typing challenges, Star Collector, Daily Puzzle, Dress-Up Challenges, mystery boxes, weekly challenges, collection books, and leaderboards. These are future ideas, not MVP requirements.

### 24.8 Final onboarding scope

Onboarding has three short screens:

1. Meet Tiny Sprout.
2. Explain Focus → Grow → Customize.
3. Confirm the 25-minute starting duration.

Pet naming is optional and can be moved to Settings if it slows onboarding. The user can skip onboarding, and returning users go directly to the main app.

### 24.9 Browser and failure behavior

Target current Chrome, Edge, Firefox, and Safari on desktop and mobile. The app must remain usable when optional capabilities are unavailable:

- If `localStorage` is unavailable, show a clear warning and allow a temporary in-memory session.
- If audio playback is blocked, continue silently.
- If vibration is unsupported, continue without haptics.
- If reduced motion is requested, remove nonessential animation.
- If the browser is offline, the already-loaded static app must continue working.

Do not add a service worker or installable PWA until the normal static app is stable.

### 24.10 Final definition of done

The canonical MVP is complete when:

- A new user can begin a 25-minute focus session within one minute.
- Timer completion remains accurate after tab hiding and page refresh.
- A completed focus session grants exactly 10 XP and 5 coins, plus the valid daily bonus when applicable.
- Streaks handle same-day, next-day, and missed-day cases correctly.
- The pet visibly celebrates and evolves at the defined levels.
- Six accessories can be purchased and equipped safely.
- The garden and achievements persist after reload.
- Onboarding can be completed, resumed, or skipped.
- Sound, haptics, and reduced motion are optional enhancements.
- Corrupt or outdated local data does not crash the app or silently destroy valid state.
- The app works without a backend, database, account, or network request.
- Mobile, keyboard, reduced-motion, and unsupported-feature cases are tested.

Any feature not required by this definition of done should wait until the core experience has been implemented and tested.

## 25. Analytics Event Tracking Plan

The canonical MVP has no backend, accounts, or analytics service. Use this plan in two phases:

1. **MVP:** Use an optional, bounded local event log for development and usability testing.
2. **Future:** Add anonymous aggregate analytics only after explicit consent and a server-side collection system exist.

Analytics must never control rewards, block the timer, or interrupt the user experience.

### 25.1 Measurement goals

Track whether users:

- Complete onboarding.
- Start and complete focus sessions.
- Earn XP and coins.
- Maintain or recover a daily streak.
- Reach Tiny Sprout, Focus Bloom, and Study Sage.
- See and continue after an evolution unlock.
- Use the garden, achievements, and cosmetic shop.
- Drop out at a specific progression step.

### 25.2 Evolution funnel

```text
App opened
   ↓
Onboarding completed or skipped
   ↓
First focus session started
   ↓
First focus session completed
   ↓
Level 3 reached
   ↓
Focus Bloom unlocked
   ↓
Focus session completed as Focus Bloom
   ↓
Level 8 reached
   ↓
Study Sage unlocked
   ↓
Focus session completed as Study Sage
```

Important future aggregate rates include:

- App open to first session started.
- First session started to first session completed.
- First completed session to Focus Bloom.
- Focus Bloom to Study Sage.
- Evolution unlock to the next completed session.
- Evolution unlock to return within seven days.

### 25.3 Event taxonomy

Use lowercase `snake_case` names. Emit events from state transitions, not merely from rendering a visible component.

#### App and onboarding events

| Event | Trigger | Important properties |
|---|---|---|
| `app_opened` | App loads | `current_stage`, `is_first_open` |
| `onboarding_started` | First onboarding screen appears | `entry_step` |
| `onboarding_completed` | User finishes onboarding | `selected_duration`, `pet_named` |
| `onboarding_skipped` | User skips onboarding | `step_skipped_from` |
| `settings_changed` | User changes a setting | `setting_name`, `setting_value` |

#### Focus-session events

| Event | Trigger | Important properties |
|---|---|---|
| `focus_started` | Focus timer starts | `duration_minutes`, `pet_stage`, `level` |
| `focus_paused` | User pauses timer | `elapsed_seconds`, `pet_stage` |
| `focus_reset` | User resets timer | `elapsed_seconds`, `pet_stage` |
| `focus_completed` | Focus timer reaches zero | `duration_minutes`, `pet_stage`, `level`, `coins_awarded`, `xp_awarded` |
| `break_started` | Break timer starts | `break_type`, `duration_minutes` |
| `break_completed` | Break timer reaches zero | `break_type`, `duration_minutes` |

Only `focus_completed` counts toward progression. Break events are diagnostic and never award XP, coins, or streak progress.

#### Progression events

| Event | Trigger | Important properties |
|---|---|---|
| `xp_awarded` | XP is granted | `amount`, `source`, `total_xp`, `level` |
| `coins_awarded` | Coins are granted | `amount`, `source`, `balance_after` |
| `level_reached` | User enters a new level | `level`, `previous_level`, `total_sessions` |
| `evolution_unlocked` | Pet changes stage | `from_stage`, `to_stage`, `level`, `total_sessions` |
| `evolution_viewed` | User sees the evolution notice | `stage`, `display_duration_ms` |
| `evolution_dismissed` | User dismisses the notice | `stage`, `dismiss_method` |

#### Retention and reward events

| Event | Trigger | Important properties |
|---|---|---|
| `streak_started` | First completed focus session | `streak_days` |
| `streak_continued` | Session continues a streak | `streak_days`, `pet_stage` |
| `streak_broken` | New session follows missed days | `previous_streak_days`, `new_streak_days` |
| `daily_bonus_awarded` | Fourth daily session completes | `today_sessions`, `amount` |
| `achievement_unlocked` | Achievement is earned | `achievement_id`, `pet_stage` |
| `garden_reward_unlocked` | Garden item is added | `plant_id`, `pet_stage` |
| `accessory_purchased` | Cosmetic item is purchased | `accessory_id`, `cost`, `pet_stage` |
| `accessory_equipped` | Cosmetic item is equipped | `accessory_id`, `category`, `pet_stage` |

### 25.4 Shared event properties

Use a small shared property set:

```js
const commonEventProperties = {
  petStage: getPetStage(state.level),
  level: state.level,
  totalSessions: state.totalSessions,
  streakDays: state.streak,
  todaySessions: state.todaySessions,
  appVersion: APP_VERSION
};
```

A future server-side system may add an anonymous user ID, session ID, event ID, occurrence time, and timezone. Do not collect names, email addresses, task text, personal notes, browsing history, or exact productivity content.

### 25.5 Local-only MVP event logger

Use a capped local log for development and testing. It must not affect progression.

```js
const EVENT_LOG_KEY = "pomodoroPetEventLog";
const MAX_LOCAL_EVENTS = 250;

function trackEvent(name, properties = {}) {
  const event = {
    name,
    properties: {
      ...commonEventProperties,
      ...properties
    },
    occurredAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(
      localStorage.getItem(EVENT_LOG_KEY) || "[]"
    );
    const next = [...existing, event].slice(-MAX_LOCAL_EVENTS);
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(next));
  } catch {
    // Tracking must never interrupt the app.
  }
}
```

Keep local tracking behind a development flag if it is not needed in the production build. If an export control is provided for QA, label it as a development tool and do not expose personal data.

### 25.6 Event ordering

For a completed focus session, use this logical order:

1. Read the previous stage and previous level.
2. Update session, streak, XP, and coin state.
3. Calculate the new level and stage.
4. Save the updated state.
5. Emit `focus_completed`.
6. Emit `xp_awarded`, `coins_awarded`, and any streak or bonus events.
7. Emit `level_reached` if the level changed.
8. Emit `evolution_unlocked` if the stage changed.
9. Render the reward and evolution UI.
10. Emit `evolution_viewed` only when the notice is actually shown.

Events should be idempotent. Refreshing, repeated clicks, or repeated timer callbacks must not create duplicate progression events.

### 25.7 MVP event subset

Implement these events first:

```text
app_opened
onboarding_completed
onboarding_skipped
focus_started
focus_completed
streak_started
streak_continued
streak_broken
level_reached
evolution_unlocked
achievement_unlocked
garden_reward_unlocked
```

Add pause, reset, break, shop, and evolution-view events only if they answer a specific testing question.

## 26. Analytics QA and Testing Checklist

The purpose of this checklist is to verify that analytics events trigger exactly once, carry correct properties, and remain independent from reward and UI failures across Tiny Sprout, Focus Bloom, and Study Sage.

### 26.1 Test setup

Prepare a development build with:

- A visible local event-log inspector or JSON export.
- A development-only ten-second focus timer.
- A test-date helper for same-day, next-day, and missed-day cases.
- A way to seed state at Level 1, Level 2, Level 3, Level 7, and Level 8.
- Browser console warnings enabled.
- Local storage clear and reset controls.
- Sound, haptics, and reduced-motion toggles available for independent testing.

Before each isolated scenario:

1. Clear the event log.
2. Seed or reset the required state.
3. Record the expected event sequence.
4. Perform only the described user action.
5. Inspect event names, order, count, timestamps, and properties.
6. Refresh the page and confirm no duplicate event is created.

### 26.2 Event contract checks

For every event, verify:

- [ ] The event name uses lowercase `snake_case`.
- [ ] The event is emitted from a real state transition.
- [ ] The event has an ISO timestamp.
- [ ] `appVersion` is present.
- [ ] `petStage` matches the stage before or after the transition as specified.
- [ ] `level` is numeric and non-negative.
- [ ] `totalSessions` is numeric and correct.
- [ ] `streakDays` is numeric and correct when relevant.
- [ ] The event is not emitted twice after one action.
- [ ] Missing optional properties do not crash tracking.
- [ ] Tracking failure does not interrupt the timer or reward flow.
- [ ] Unknown extra properties do not break event inspection.

### 26.3 App and onboarding event tests

#### App open

- [ ] Fresh state emits one `app_opened` event.
- [ ] Returning state emits one `app_opened` event.
- [ ] `is_first_open` is `true` only for the first open.
- [ ] `current_stage` is `tiny-sprout` at Level 1.
- [ ] `current_stage` is `focus-bloom` at Level 3.
- [ ] `current_stage` is `study-sage` at Level 8.
- [ ] Refreshing does not incorrectly reclassify the first open.

#### Onboarding

- [ ] Opening onboarding emits one `onboarding_started` event.
- [ ] Completing onboarding emits one `onboarding_completed` event.
- [ ] The selected duration property is correct.
- [ ] Pet naming status is correct.
- [ ] Skipping from each onboarding step emits one `onboarding_skipped` event.
- [ ] Completing onboarding after a refresh does not emit completion twice.
- [ ] Skipping onboarding does not emit a focus or reward event.

### 26.4 Timer event tests

#### Focus start

- [ ] Starting an idle focus timer emits one `focus_started` event.
- [ ] The event records the configured focus duration.
- [ ] The event records the current pet stage and level.
- [ ] Clicking Start repeatedly does not emit multiple starts.
- [ ] Starting a break emits `break_started`, not `focus_started`.
- [ ] Resetting before completion does not emit `focus_completed`.

#### Pause and reset

- [ ] Pausing emits one `focus_paused` event if pause tracking is enabled.
- [ ] Repeated pause clicks do not duplicate the event.
- [ ] Resetting emits one `focus_reset` event if reset tracking is enabled.
- [ ] A paused timer does not award XP, coins, or streak progress.
- [ ] A reset timer does not award XP, coins, or streak progress.

#### Hidden-tab behavior

- [ ] Start a timer and hide the tab.
- [ ] Return after the test duration has elapsed.
- [ ] The timestamp-based timer completes once.
- [ ] Exactly one `focus_completed` event is emitted.
- [ ] The event duration and reward values remain correct.
- [ ] No duplicate event is emitted by the display interval.

#### Focus completion

- [ ] Completing a focus timer emits exactly one `focus_completed` event.
- [ ] `duration_minutes` matches the configured focus duration.
- [ ] `coins_awarded` is 5 before any fourth-session bonus.
- [ ] `xp_awarded` is 10.
- [ ] A break completion never emits `focus_completed`.
- [ ] Refreshing after completion does not emit another completion event.
- [ ] Double-clicking completion controls cannot create a duplicate.

### 26.5 Tiny Sprout progression tests

Seed Level 1 with zero sessions and complete one focus session.

Expected result:

```text
focus_started
focus_completed
xp_awarded
coins_awarded
streak_started
achievement_unlocked: first-focus
garden_reward_unlocked: first garden item
```

Verify:

- [ ] `petStage` is `tiny-sprout` for the completed session.
- [ ] The first session sets the streak to 1.
- [ ] XP becomes 10.
- [ ] Coins become 5.
- [ ] First Focus is unlocked once.
- [ ] The pet celebrates without an evolution event.
- [ ] Refreshing does not duplicate First Focus or the garden reward.

Complete additional sessions on the same day.

- [ ] Same-day sessions emit `streak_continued` only if the event definition treats same-day activity as continued activity; otherwise emit no streak transition.
- [ ] `todaySessions` increments for every completed focus session.
- [ ] The streak day count does not increment multiple times on the same date.
- [ ] The fourth session emits one `daily_bonus_awarded` event.
- [ ] A fifth session does not emit a second daily bonus.

### 26.6 Focus Bloom unlock tests

Seed the state at Level 2 with 40 XP and complete one focus session.

Expected progression:

```text
focus_started
focus_completed
xp_awarded
coins_awarded
level_reached: level 3
evolution_unlocked: tiny-sprout → focus-bloom
```

Verify:

- [ ] The completed session event identifies the previous stage as `tiny-sprout`.
- [ ] XP becomes 50 and level becomes 2 if the implementation calculates level after the award, or reaches the defined Level 3 threshold according to the canonical progression model.
- [ ] The final implementation uses one consistent threshold calculation.
- [ ] `level_reached` is emitted once for the actual new level.
- [ ] `evolution_unlocked` is emitted once.
- [ ] `from_stage` is `tiny-sprout`.
- [ ] `to_stage` is `focus-bloom`.
- [ ] `level` is 3 when Focus Bloom unlocks.
- [ ] The unlock notice is rendered once.
- [ ] `evolution_viewed` is emitted only after the notice is shown.
- [ ] Dismissing the notice emits at most one `evolution_dismissed` event.
- [ ] Refreshing after the unlock renders Focus Bloom without replaying `evolution_unlocked`.

> **Implementation note:** With 10 XP per session and 50 XP per level, Level 3 requires 100 XP, not 40 XP. The test fixture must therefore seed 90 XP at Level 2, or the progression formula must be updated. Use the canonical formula consistently in code and test data.

Recommended corrected fixture:

```text
Seed: level 2, xp 90
Complete one focus session: xp 100, level 3
Expected: evolution_unlocked tiny-sprout → focus-bloom
```

### 26.7 Focus Bloom steady-state tests

Seed the state at Level 3 with Focus Bloom already unlocked.

- [ ] Starting a session emits `focus_started` with `pet_stage: focus-bloom`.
- [ ] Completing a session emits `focus_completed` with `pet_stage: focus-bloom`.
- [ ] XP and coins are awarded normally.
- [ ] No `evolution_unlocked` event occurs for ordinary sessions.
- [ ] Garden and achievement events use `pet_stage: focus-bloom`.
- [ ] The Focus Bloom unlock notice does not show again.
- [ ] The event log remains bounded after repeated test sessions.

### 26.8 Study Sage unlock tests

Seed the state at Level 7 with 40 XP into the current level and complete one focus session, using the canonical level calculation.

Expected result:

```text
focus_started
focus_completed
xp_awarded
coins_awarded
level_reached: level 8
evolution_unlocked: focus-bloom → study-sage
```

Verify:

- [ ] The completed session identifies the previous stage as `focus-bloom`.
- [ ] `level_reached` is emitted once for Level 8.
- [ ] `evolution_unlocked` is emitted once.
- [ ] `from_stage` is `focus-bloom`.
- [ ] `to_stage` is `study-sage`.
- [ ] `level` is 8.
- [ ] The Study Sage notice is shown once.
- [ ] `evolution_viewed` occurs only after the notice renders.
- [ ] Refreshing after the unlock does not replay the unlock event.
- [ ] Later sessions use `pet_stage: study-sage`.

### 26.9 Stage-boundary and edge-case tests

- [ ] A session one XP below an evolution threshold does not emit an evolution event.
- [ ] A session exactly at the threshold emits one evolution event.
- [ ] A single reward that crosses more than one level emits each required `level_reached` event or follows the documented one-level rule.
- [ ] A stage cannot move backward if local data is edited or reloaded.
- [ ] Corrupt XP values do not generate false evolution events.
- [ ] Negative levels and XP are normalized before tracking.
- [ ] Unknown stage values fall back safely to `tiny-sprout`.
- [ ] A malformed event log does not prevent the app from loading.
- [ ] Clearing the event log does not clear progression state.
- [ ] Reset Progress clears progression and event log only if that behavior is explicitly documented.

### 26.10 Streak and retention event tests

#### Streak start

- [ ] First completed focus session emits one `streak_started` event.
- [ ] `streak_days` equals 1.
- [ ] A second same-day session does not emit another `streak_started` event.

#### Streak continuation

- [ ] Complete a session on Day 1.
- [ ] Advance the test date to Day 2.
- [ ] Complete one session.
- [ ] Emit one `streak_continued` event with `streak_days: 2`.
- [ ] The event carries the current pet stage.

#### Streak break

- [ ] Complete a session on Day 1.
- [ ] Advance the test date by at least two missed calendar days.
- [ ] Complete one session.
- [ ] Emit one `streak_broken` event.
- [ ] `previous_streak_days` is correct.
- [ ] `new_streak_days` equals 1.
- [ ] XP, coins, accessories, garden plants, and achievements remain intact.
- [ ] No negative pet or punishment event is emitted.

### 26.11 Reward event tests

- [ ] `xp_awarded` amount is exactly 10 for a normal focus completion.
- [ ] `coins_awarded` amount is exactly 5 for a normal focus completion.
- [ ] The fourth session emits one `daily_bonus_awarded` event for 25 coins.
- [ ] The bonus does not change the base `coins_awarded` value unexpectedly.
- [ ] `achievement_unlocked` emits once per achievement ID.
- [ ] `garden_reward_unlocked` emits once per garden item ID.
- [ ] Buying or equipping an accessory does not emit progression events.
- [ ] Rewards are saved before their UI animation starts.
- [ ] Refreshing after a reward does not duplicate the event.

### 26.12 Analytics failure tests

- [ ] Disable or mock `localStorage` and confirm the timer still works.
- [ ] Fill the event log to its maximum and confirm old events are removed safely.
- [ ] Insert malformed JSON into the event-log key and confirm the app still loads.
- [ ] Make `trackEvent()` throw and confirm rewards still save.
- [ ] Remove optional event properties and confirm the logger does not crash.
- [ ] Use an unknown app version and confirm the event remains inspectable.
- [ ] Confirm analytics never changes coins, XP, level, streak, or stage.
- [ ] Confirm no external network request is made by the MVP build.

### 26.13 Accessibility and preference tests

- [ ] Events trigger the same way with sound disabled.
- [ ] Events trigger the same way with haptics disabled.
- [ ] Events trigger the same way with reduced motion enabled.
- [ ] Evolution text announcements remain visible or available to assistive technology.
- [ ] Keyboard-only completion produces the same event sequence as pointer interaction.
- [ ] Screen-reader users receive the stage change without relying on animation.

### 26.14 QA event matrix

| Scenario | Expected primary event | Stage before | Stage after | Duplicate allowed? |
|---|---|---|---|---|
| Open fresh app | `app_opened` | None | Tiny Sprout | No |
| Start first focus | `focus_started` | Tiny Sprout | Tiny Sprout | No |
| Complete first focus | `focus_completed` | Tiny Sprout | Tiny Sprout | No |
| Reach Level 3 | `evolution_unlocked` | Tiny Sprout | Focus Bloom | No |
| Complete normal Focus Bloom session | `focus_completed` | Focus Bloom | Focus Bloom | No |
| Reach Level 8 | `evolution_unlocked` | Focus Bloom | Study Sage | No |
| Complete normal Study Sage session | `focus_completed` | Study Sage | Study Sage | No |
| Complete fourth daily session | `daily_bonus_awarded` | Any | Same stage | No |
| Return after missed days | `streak_broken` | Any | Same stage | No |
| Refresh after evolution | No new evolution event | New stage | Same stage | No |

### 26.15 Release gate

Do not ship the analytics implementation until:

- [ ] All event names and required properties are documented.
- [ ] Tiny Sprout, Focus Bloom, and Study Sage boundary tests pass.
- [ ] Duplicate completion tests pass.
- [ ] Hidden-tab timer tests pass.
- [ ] Same-day, next-day, and missed-day tests pass.
- [ ] Corrupt local event-log tests pass.
- [ ] Analytics failure cannot interrupt rewards or timer completion.
- [ ] No external analytics request is made by the no-backend MVP.
- [ ] The progression formula and fixtures agree on Level 3 and Level 8 thresholds.
- [ ] A local event export, if present, is clearly marked as a development tool.

## 27. Tiny Sprout Frontend Implementation

This section provides a lightweight native HTML, CSS, and JavaScript implementation for the Tiny Sprout component. It uses no framework, component library, animation library, or external API. It assumes the canonical app state and timer functions defined earlier in this plan.

### 27.1 Component responsibilities

The Tiny Sprout component must:

- Render the current pet name and stage.
- Display the pet in a fixed-size viewport.
- Support `idle`, `ready`, `focusing`, `break`, `celebrating`, `proud`, and `sleepy` states.
- Display one supportive message at a time.
- React to timer and reward events without owning timer logic.
- Remain accessible when sound, haptics, or motion are disabled.
- Avoid changing layout dimensions when the pet state changes.

The component should not manage coins, XP, streak calculations, or `localStorage` directly. The application state remains the source of truth; the pet component only renders state and emits no progression rewards.

### 27.2 HTML markup

```html
<section class="card pet-card" aria-labelledby="pet-title">
  <div class="card-heading pet-card__heading">
    <div>
      <p class="eyebrow">Your companion</p>
      <h1 id="pet-title">Tiny Sprout</h1>
    </div>
    <span class="stage-icon" aria-hidden="true">✦</span>
  </div>

  <div class="pet-viewport">
    <div
      class="pet pet--tiny-sprout"
      data-stage="tiny-sprout"
      data-state="ready"
    >
      <span class="pet-aura" aria-hidden="true"></span>
      <span class="pet-shadow" aria-hidden="true"></span>

      <div
        class="pet-art"
        role="img"
        aria-label="Tiny Sprout, your focus companion"
      >
        <span class="pet-leaf" aria-hidden="true"></span>

        <span class="pet-body" aria-hidden="true">
          <span class="pet-face" aria-hidden="true">
            <span class="pet-eye pet-eye--left"></span>
            <span class="pet-eye pet-eye--right"></span>
            <span class="pet-mouth"></span>
          </span>
          <span class="pet-cheek pet-cheek--left"></span>
          <span class="pet-cheek pet-cheek--right"></span>
        </span>

        <span class="pet-foot pet-foot--left" aria-hidden="true"></span>
        <span class="pet-foot pet-foot--right" aria-hidden="true"></span>
      </div>

      <span class="pet-accessories" aria-hidden="true"></span>
    </div>
  </div>

  <p
    class="pet-message"
    id="pet-message"
    role="status"
    aria-live="polite"
  >
    Ready when you are.
  </p>
</section>
```

Use real buttons for timer and settings controls outside this component. Decorative pet layers use `aria-hidden="true"` because the parent `.pet-art` supplies the accessible label.

### 27.3 Tiny Sprout component CSS

```css
:root {
  --pet-body: #a8ddb5;
  --pet-body-dark: #68aa7a;
  --pet-body-light: #dff4df;
  --pet-cheek: #ff9f9f;
  --pet-text: #38354a;
  --pet-shadow: rgba(56, 53, 74, 0.12);
  --pet-aura: rgba(168, 221, 181, 0.2);
  --pet-transition: 180ms ease;
}

.pet-card {
  position: relative;
  min-height: 430px;
  overflow: hidden;
  padding: 24px;
  border: 1px solid rgba(235, 227, 241, 0.9);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(223, 244, 223, 0.7),
      transparent 11rem
    ),
    #ffffff;
  box-shadow: 0 12px 30px rgba(56, 53, 74, 0.09);
}

.pet-card::after {
  position: absolute;
  right: -40px;
  bottom: -70px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(243, 232, 255, 0.62);
  content: "";
  pointer-events: none;
}

.pet-card__heading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 2px;
  color: #77738a;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pet-card h1 {
  margin: 0;
  color: #38354a;
  font-family: Nunito, ui-rounded, system-ui, sans-serif;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.15;
}

.stage-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 12px;
  background: var(--pet-body-light);
  color: var(--pet-body-dark);
}

.pet-viewport {
  position: relative;
  display: grid;
  min-height: 280px;
  place-items: center;
  isolation: isolate;
}

.pet {
  position: relative;
  width: 220px;
  height: 240px;
  transform-origin: center bottom;
}

.pet-aura,
.pet-shadow,
.pet-art,
.pet-accessories {
  position: absolute;
  inset: 0;
}

.pet-aura {
  z-index: -2;
  top: 18px;
  right: 20px;
  bottom: 32px;
  left: 20px;
  border-radius: 50%;
  background: var(--pet-aura);
  opacity: 0;
}

.pet-shadow {
  z-index: -1;
  top: auto;
  right: 34px;
  bottom: 18px;
  left: 34px;
  height: 18px;
  border-radius: 50%;
  background: var(--pet-shadow);
  filter: blur(5px);
}

.pet-art {
  display: block;
}

.pet-body {
  position: absolute;
  top: 76px;
  left: 32px;
  width: 156px;
  height: 126px;
  border: 3px solid var(--pet-body-dark);
  border-radius: 48% 48% 43% 43%;
  background: var(--pet-body);
  box-shadow:
    0 12px 22px rgba(104, 170, 122, 0.22),
    inset 0 -10px 0 rgba(104, 170, 122, 0.1);
}

.pet-body::before,
.pet-body::after {
  position: absolute;
  bottom: -20px;
  width: 34px;
  height: 24px;
  border: 3px solid var(--pet-body-dark);
  border-top: 0;
  border-radius: 0 0 50% 50%;
  background: var(--pet-body);
  content: "";
}

.pet-body::before {
  left: 24px;
}

.pet-body::after {
  right: 24px;
}

.pet-leaf {
  position: absolute;
  z-index: 2;
  top: 38px;
  left: 87px;
  width: 42px;
  height: 62px;
  border: 3px solid var(--pet-body-dark);
  border-radius: 100% 0 100% 0;
  background: var(--pet-body-light);
  box-shadow: inset 5px -4px 0 rgba(104, 170, 122, 0.12);
  transform: rotate(-20deg);
  transform-origin: bottom center;
}

.pet-leaf::after {
  position: absolute;
  top: 11px;
  left: 18px;
  width: 3px;
  height: 40px;
  border-radius: 999px;
  background: rgba(104, 170, 122, 0.55);
  content: "";
  transform: rotate(20deg);
}

.pet-face {
  position: absolute;
  top: 42px;
  right: 0;
  left: 0;
  height: 60px;
}

.pet-eye {
  position: absolute;
  top: 5px;
  width: 12px;
  height: 16px;
  border-radius: 50%;
  background: var(--pet-text);
}

.pet-eye--left {
  left: 45px;
}

.pet-eye--right {
  right: 45px;
}

.pet-mouth {
  position: absolute;
  top: 30px;
  left: calc(50% - 9px);
  width: 18px;
  height: 10px;
  border-bottom: 3px solid var(--pet-text);
  border-radius: 0 0 50% 50%;
}

.pet-cheek {
  position: absolute;
  top: 66px;
  width: 17px;
  height: 9px;
  border-radius: 50%;
  background: var(--pet-cheek);
  opacity: 0.72;
}

.pet-cheek--left {
  left: 25px;
}

.pet-cheek--right {
  right: 25px;
}

.pet-foot {
  position: absolute;
  z-index: 1;
  bottom: 17px;
  width: 34px;
  height: 25px;
  border: 3px solid var(--pet-body-dark);
  border-top: 0;
  border-radius: 0 0 50% 50%;
  background: var(--pet-body);
}

.pet-foot--left {
  left: 55px;
}

.pet-foot--right {
  right: 55px;
}

.pet[data-state="idle"] .pet-art,
.pet[data-state="ready"] .pet-art {
  animation: tiny-sprout-breathe 4s ease-in-out infinite;
}

.pet[data-state="focusing"] .pet-art {
  animation: tiny-sprout-breathe 5s ease-in-out infinite;
}

.pet[data-state="focusing"] .pet-leaf {
  animation: tiny-sprout-leaf-sway 5s ease-in-out infinite;
}

.pet[data-state="celebrating"] .pet-art,
.pet[data-state="proud"] .pet-art {
  animation: tiny-sprout-celebrate 760ms cubic-bezier(.2, 1.35, .4, 1) both;
}

.pet[data-state="celebrating"] .pet-aura,
.pet[data-state="proud"] .pet-aura {
  animation: tiny-sprout-aura 900ms ease-out both;
}

@keyframes tiny-sprout-breathe {
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-3px) scale(1.015);
  }
}

@keyframes tiny-sprout-leaf-sway {
  0%, 100% {
    transform: rotate(-20deg);
  }

  50% {
    transform: rotate(-14deg);
  }
}

@keyframes tiny-sprout-celebrate {
  0% {
    transform: translateY(0) rotate(0) scale(1);
  }

  38% {
    transform: translateY(-13px) rotate(-4deg) scale(1.06);
  }

  72% {
    transform: translateY(0) rotate(4deg) scale(1.02);
  }

  100% {
    transform: translateY(0) rotate(0) scale(1);
  }
}

@keyframes tiny-sprout-aura {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }

  50% {
    opacity: 1;
    transform: scale(1.04);
  }

  100% {
    opacity: 0.25;
    transform: scale(1);
  }
}

.pet-message {
  position: relative;
  z-index: 1;
  width: fit-content;
  max-width: 260px;
  margin: 0 auto;
  padding: 9px 14px;
  border: 1px solid #ebe3f1;
  border-radius: 14px 14px 14px 4px;
  background: #f7f0ff;
  color: #77738a;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 600px) {
  .pet-card {
    min-height: 390px;
    padding: 16px;
  }

  .pet-viewport {
    min-height: 240px;
  }

  .pet {
    transform: scale(0.86);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pet[data-state] .pet-art,
  .pet[data-state] .pet-leaf,
  .pet[data-state] .pet-aura {
    animation: none !important;
    transition: none !important;
  }
}

html[data-motion="reduced"] .pet[data-state] .pet-art,
html[data-motion="reduced"] .pet[data-state] .pet-leaf,
html[data-motion="reduced"] .pet[data-state] .pet-aura {
  animation: none !important;
  transition: none !important;
}
```

### 27.4 State-to-view JavaScript

The renderer keeps progression and timer logic outside the component. It updates attributes and text only when application state changes.

```js
const PET_MESSAGES = {
  idle: "Ready when you are.",
  ready: "Ready when you are.",
  focusing: "I'm focusing with you.",
  break: "A good break supports the next step.",
  celebrating: "You and Sprout did it together!",
  proud: "Small steps become steady progress.",
  sleepy: "Welcome back. A fresh streak starts today."
};

function getPetStage(level) {
  if (level >= 8) return "study-sage";
  if (level >= 3) return "focus-bloom";
  return "tiny-sprout";
}

function getPetMessage(stateName) {
  return PET_MESSAGES[stateName] || PET_MESSAGES.idle;
}

function getPetState(appState) {
  if (appState.timer?.isRunning) {
    return appState.timer.mode === "focus" ? "focusing" : "break";
  }

  if (appState.ui?.petState) {
    return appState.ui.petState;
  }

  if (appState.lastSessionDate && appState.streak === 0) {
    return "sleepy";
  }

  return "ready";
}

function renderTinySprout(appState) {
  const pet = document.querySelector(".pet");
  const title = document.querySelector("#pet-title");
  const message = document.querySelector("#pet-message");
  const stageBadge = document.querySelector(".stage-badge");

  if (!pet || !title || !message) return;

  const stage = getPetStage(appState.level);
  const petState = getPetState(appState);
  const isTinySprout = stage === "tiny-sprout";

  // This component is designed for Tiny Sprout. Later stages use their own
  // stage renderer or the shared renderer with different detail layers.
  if (!isTinySprout) return;

  pet.dataset.stage = stage;
  pet.dataset.state = petState;
  pet.setAttribute(
    "aria-label",
    `${appState.petName || "Sprout"}, Tiny Sprout, ${petState}`
  );

  title.textContent = appState.petName || "Tiny Sprout";
  if (stageBadge) stageBadge.textContent = "Tiny Sprout";

  const nextMessage = getPetMessage(petState);
  if (message.textContent !== nextMessage) {
    message.textContent = nextMessage;
  }
}
```

The `ui.petState` value is temporary view state and should not be persisted as progression. If the app does not use a `ui` object, pass the transient state as a separate render argument.

### 27.5 Pet event helpers

Use explicit helpers to connect timer and reward events to pet states.

```js
function setPetViewState(name) {
  const pet = document.querySelector(".pet");
  const message = document.querySelector("#pet-message");

  if (!pet || !message) return;

  pet.dataset.state = name;
  message.textContent = getPetMessage(name);
}

function onFocusStarted() {
  setPetViewState("focusing");
}

function onBreakStarted() {
  setPetViewState("break");
}

function onFocusCompleted() {
  setPetViewState("celebrating");

  window.setTimeout(() => {
    setPetViewState("proud");
  }, 800);
}

function onEvolutionOrMilestone() {
  setPetViewState("proud");
}

function onResetOrIdle() {
  setPetViewState("ready");
}
```

The completion handler must be called only after the timer has been marked complete and the reward transaction has been saved. This prevents a visual celebration from implying rewards that were not committed.

### 27.6 Progress and accessibility integration

The pet component should be rendered together with progress state:

```js
function renderProgress(appState) {
  const level = document.querySelector("#level");
  const coins = document.querySelector("#coins");
  const streak = document.querySelector("#streak");
  const todaySessions = document.querySelector("#today-sessions");
  const xpCurrent = document.querySelector("#xp-current");
  const xpFill = document.querySelector("#xp-fill");

  if (level) level.textContent = appState.level;
  if (coins) coins.textContent = appState.coins;
  if (streak) streak.textContent = appState.streak;
  if (todaySessions) todaySessions.textContent = appState.todaySessions;

  const currentXp = appState.xp % 50;
  const percent = (currentXp / 50) * 100;

  if (xpCurrent) xpCurrent.textContent = currentXp;
  if (xpFill) xpFill.style.width = `${percent}%`;

  const progressBar = document.querySelector("[role='progressbar']");
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", String(currentXp));
  }
}

function renderApp(appState) {
  renderTinySprout(appState);
  renderProgress(appState);
}
```

Use `role="status"` for the pet message and evolution/reward notices. Do not set the timer itself to `aria-live="assertive"`; frequent second-by-second announcements are disruptive.

### 27.7 Initialization

```js
const appState = loadState();

renderApp(appState);

if (appState.timer?.isRunning) {
  setPetViewState(
    appState.timer.mode === "focus" ? "focusing" : "break"
  );
}
```

In the actual app, use one shared state reference rather than a disconnected `const appState` copy. After every state-changing action:

1. Update state.
2. Save state.
3. Render the pet and related UI.
4. Trigger optional sound or haptics.

### 27.8 Tiny Sprout implementation acceptance checklist

- [ ] The component uses native HTML, CSS, and JavaScript only.
- [ ] The pet viewport remains stable on desktop and mobile.
- [ ] Tiny Sprout uses one leaf, a mint body, coral cheeks, and a gentle face.
- [ ] `idle`, `ready`, `focusing`, `break`, `celebrating`, `proud`, and `sleepy` states render correctly.
- [ ] Focus mode reduces animation and hides the aura.
- [ ] Completion produces a visible celebration without awarding rewards inside the component.
- [ ] The pet message is available through `role="status"` and `aria-live="polite"`.
- [ ] Reduced-motion users receive a static but understandable pet.
- [ ] The component does not write to `localStorage` directly.
- [ ] The component does not own timer, streak, XP, coin, or evolution calculations.
- [ ] The pet remains recognizable at the mobile viewport size.
- [ ] The renderer safely handles missing DOM elements.
- [ ] The renderer does not duplicate event listeners on repeated renders.

## 28. Focus Bloom Frontend Implementation

**Naming note:** “Blooming Sprout” is the requested visual alias for the canonical MVP stage **Focus Bloom**. Use `focus-bloom` as the code identifier, saved stage value, CSS modifier, and analytics value.

Focus Bloom reuses the Tiny Sprout component contract. It changes the visual layers and stage-specific messages but does not own progression, timer, streak, coin, or XP logic.

### 28.1 Focus Bloom HTML markup

```html
<section
  class="card pet-card pet-card--focus-bloom"
  aria-labelledby="pet-title"
>
  <div
    class="stage-announcement"
    id="focus-bloom-announcement"
    role="status"
    aria-live="polite"
    hidden
  >
    Focus Bloom unlocked! Your Sprout grew through steady focus.
  </div>

  <div class="card-heading pet-card__heading">
    <div>
      <p class="eyebrow">Your companion</p>
      <h1 id="pet-title">Focus Bloom</h1>
    </div>
    <span class="stage-icon stage-icon--bloom" aria-hidden="true">
      <span class="stage-icon__leaf stage-icon__leaf--left"></span>
      <span class="stage-icon__leaf stage-icon__leaf--right"></span>
    </span>
  </div>

  <div class="pet-viewport">
    <div
      class="pet pet--focus-bloom"
      data-stage="focus-bloom"
      data-state="ready"
    >
      <span class="pet-aura" aria-hidden="true"></span>
      <span class="pet-shadow" aria-hidden="true"></span>

      <div
        class="pet-art"
        role="img"
        aria-label="Focus Bloom, your encouraging focus companion"
      >
        <span class="pet-leaf pet-leaf--left" aria-hidden="true"></span>
        <span class="pet-leaf pet-leaf--right" aria-hidden="true"></span>

        <span class="pet-body" aria-hidden="true">
          <span class="pet-face" aria-hidden="true">
            <span class="pet-eye pet-eye--left"></span>
            <span class="pet-eye pet-eye--right"></span>
            <span class="pet-mouth"></span>
          </span>
          <span class="pet-cheek pet-cheek--left"></span>
          <span class="pet-cheek pet-cheek--right"></span>
          <span class="pet-notebook" aria-hidden="true"></span>
        </span>

        <span class="pet-foot pet-foot--left" aria-hidden="true"></span>
        <span class="pet-foot pet-foot--right" aria-hidden="true"></span>
      </div>

      <span class="pet-accessories" aria-hidden="true"></span>
    </div>
  </div>

  <p class="pet-message" id="pet-message" role="status" aria-live="polite">
    Let’s make a little progress.
  </p>
</section>
```

### 28.2 Focus Bloom CSS

The following CSS assumes the shared card, viewport, face, and base pet styles from Section 27. Only the stage-specific layers are overridden.

```css
:root {
  --bloom-body: #9ccbeb;
  --bloom-body-dark: #639bbf;
  --bloom-body-light: #d9f0ff;
  --bloom-leaf: #8bcb88;
  --bloom-leaf-dark: #5fa56a;
  --bloom-notebook: #fff1bf;
  --bloom-notebook-line: #d9b849;
  --bloom-glow: rgba(156, 203, 235, 0.34);
}

.pet-card--focus-bloom {
  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(217, 240, 255, 0.72),
      transparent 11rem
    ),
    #ffffff;
}

.pet-card--focus-bloom .stage-announcement {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(139, 203, 136, 0.65);
  border-radius: 14px;
  background: #eef9ee;
  color: #397244;
  font-size: 0.88rem;
  font-weight: 700;
}

.pet-card--focus-bloom .stage-announcement:not([hidden]) {
  animation: bloom-announcement-in 360ms ease-out both;
}

.stage-icon--bloom {
  position: relative;
  background: #e5f5ed;
  color: var(--bloom-leaf-dark);
}

.stage-icon__leaf {
  position: absolute;
  width: 12px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 100% 0 100% 0;
  background: var(--bloom-leaf);
}

.stage-icon__leaf--left {
  transform: translateX(-5px) rotate(-30deg);
}

.stage-icon__leaf--right {
  transform: translateX(5px) scaleX(-1) rotate(-30deg);
}

.pet--focus-bloom {
  width: 220px;
  height: 240px;
}

.pet--focus-bloom .pet-body {
  top: 68px;
  left: 28px;
  width: 164px;
  height: 134px;
  border-color: var(--bloom-body-dark);
  border-radius: 48% 48% 42% 42%;
  background: var(--bloom-body);
  box-shadow:
    0 12px 22px rgba(99, 155, 191, 0.2),
    inset 0 -10px 0 rgba(99, 155, 191, 0.1);
}

.pet--focus-bloom .pet-body::before,
.pet--focus-bloom .pet-body::after,
.pet--focus-bloom .pet-foot {
  border-color: var(--bloom-body-dark);
  background: var(--bloom-body);
}

.pet--focus-bloom .pet-foot--left {
  left: 52px;
}

.pet--focus-bloom .pet-foot--right {
  right: 52px;
}

.pet--focus-bloom .pet-leaf {
  z-index: 2;
  top: 24px;
  width: 44px;
  height: 68px;
  border: 3px solid var(--bloom-leaf-dark);
  border-radius: 100% 0 100% 0;
  background: var(--bloom-leaf);
  transform-origin: bottom center;
}

.pet--focus-bloom .pet-leaf::after {
  position: absolute;
  top: 11px;
  left: 19px;
  width: 3px;
  height: 43px;
  border-radius: 999px;
  background: rgba(95, 165, 106, 0.58);
  content: "";
  transform: rotate(20deg);
}

.pet--focus-bloom .pet-leaf--left {
  left: 62px;
  transform: rotate(-34deg);
}

.pet--focus-bloom .pet-leaf--right {
  right: 62px;
  transform: scaleX(-1) rotate(-34deg);
}

.pet--focus-bloom .pet-face {
  top: 46px;
}

.pet--focus-bloom .pet-notebook {
  position: absolute;
  right: 19px;
  bottom: 12px;
  width: 34px;
  height: 27px;
  border: 2px solid var(--bloom-notebook-line);
  border-radius: 4px;
  background: var(--bloom-notebook);
  box-shadow: inset 0 -5px 0 rgba(217, 184, 73, 0.16);
  transform: rotate(9deg);
}

.pet--focus-bloom .pet-notebook::before,
.pet--focus-bloom .pet-notebook::after {
  position: absolute;
  right: 5px;
  left: 5px;
  height: 2px;
  border-radius: 999px;
  background: rgba(217, 184, 73, 0.58);
  content: "";
}

.pet--focus-bloom .pet-notebook::before {
  top: 8px;
}

.pet--focus-bloom .pet-notebook::after {
  top: 15px;
}

.pet--focus-bloom .pet-aura {
  background: var(--bloom-glow);
}

.pet--focus-bloom[data-state="idle"] .pet-art,
.pet--focus-bloom[data-state="ready"] .pet-art {
  animation: bloom-breathe 4s ease-in-out infinite;
}

.pet--focus-bloom[data-state="focusing"] .pet-art {
  animation: bloom-breathe 5s ease-in-out infinite;
}

.pet--focus-bloom[data-state="focusing"] .pet-leaf--left {
  animation: bloom-leaf-left 5s ease-in-out infinite;
}

.pet--focus-bloom[data-state="focusing"] .pet-leaf--right {
  animation: bloom-leaf-right 5s ease-in-out infinite;
}

.pet--focus-bloom[data-state="celebrating"] .pet-art,
.pet--focus-bloom[data-state="proud"] .pet-art {
  animation: bloom-celebrate 760ms cubic-bezier(.2, 1.35, .4, 1) both;
}

.pet--focus-bloom[data-state="celebrating"] .pet-aura,
.pet--focus-bloom[data-state="proud"] .pet-aura {
  animation: bloom-aura 900ms ease-out both;
}

@keyframes bloom-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.018); }
}

@keyframes bloom-leaf-left {
  0%, 100% { transform: rotate(-34deg); }
  50% { transform: rotate(-28deg); }
}

@keyframes bloom-leaf-right {
  0%, 100% { transform: scaleX(-1) rotate(-34deg); }
  50% { transform: scaleX(-1) rotate(-28deg); }
}

@keyframes bloom-celebrate {
  0% { transform: translateY(0) rotate(0) scale(1); }
  35% { transform: translateY(-15px) rotate(-3deg) scale(1.07); }
  70% { transform: translateY(0) rotate(3deg) scale(1.02); }
  100% { transform: translateY(0) rotate(0) scale(1); }
}

@keyframes bloom-aura {
  0% { opacity: 0; transform: scale(0.7); }
  45% { opacity: 0.9; transform: scale(1.08); }
  100% { opacity: 0.24; transform: scale(1); }
}

@keyframes bloom-announcement-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.focus-mode .pet--focus-bloom .pet-aura {
  opacity: 0 !important;
  animation: none !important;
}

.focus-mode .pet--focus-bloom .pet-art {
  animation-duration: 5s;
}

@media (prefers-reduced-motion: reduce) {
  .pet--focus-bloom .pet-art,
  .pet--focus-bloom .pet-leaf,
  .pet--focus-bloom .pet-aura,
  .pet-card--focus-bloom .stage-announcement {
    animation: none !important;
    transition: none !important;
  }
}

html[data-motion="reduced"] .pet--focus-bloom .pet-art,
html[data-motion="reduced"] .pet--focus-bloom .pet-leaf,
html[data-motion="reduced"] .pet--focus-bloom .pet-aura {
  animation: none !important;
  transition: none !important;
}
```

### 28.3 Focus Bloom renderer

```js
const FOCUS_BLOOM_MESSAGES = {
  idle: "Let’s make a little progress.",
  ready: "Ready when you are.",
  focusing: "Nice and steady.",
  break: "A good break supports the next step.",
  celebrating: "Our rhythm is growing!",
  proud: "Focus Bloom is here!",
  sleepy: "Welcome back. A fresh streak starts today."
};

function renderFocusBloom(appState, viewState = {}) {
  const pet = document.querySelector(".pet");
  const title = document.querySelector("#pet-title");
  const stageBadge = document.querySelector(".stage-badge");
  const message = document.querySelector("#pet-message");

  if (!pet || !title || !message) return;
  if (getPetStage(appState.level) !== "focus-bloom") return;

  const stateName = viewState.petState || getPetState(appState);
  const petName = appState.petName || "Sprout";

  pet.className = "pet pet--focus-bloom";
  pet.dataset.stage = "focus-bloom";
  pet.dataset.state = stateName;
  pet.setAttribute(
    "aria-label",
    `${petName}, Focus Bloom, ${stateName}`
  );

  title.textContent = "Focus Bloom";
  if (stageBadge) stageBadge.textContent = "Focus Bloom";
  message.textContent = FOCUS_BLOOM_MESSAGES[stateName] || FOCUS_BLOOM_MESSAGES.idle;
}

function showFocusBloomUnlock() {
  const notice = document.querySelector("#focus-bloom-announcement");
  if (!notice) return;

  notice.hidden = false;
  notice.textContent =
    "Focus Bloom unlocked! Your Sprout grew through steady focus.";
}
```

Only call `showFocusBloomUnlock()` after the state has been saved and the stage transition has been recorded. If the user refreshes after unlocking, render Focus Bloom directly without replaying the unlock notice.

### 28.4 Focus Bloom implementation checklist

- [ ] The code identifier is `focus-bloom`.
- [ ] “Blooming Sprout” is treated as a display alias only.
- [ ] The pet uses two leaves, a blue body, sage details, and a notebook.
- [ ] The component shares the Tiny Sprout viewport and timer layout.
- [ ] Focus mode hides the aura and reduces movement.
- [ ] The stage announcement is text-based and announced once.
- [ ] The renderer does not modify XP, coins, streaks, or `localStorage`.
- [ ] Reduced-motion users receive a static but understandable Focus Bloom.

## 29. Study Sage Frontend Implementation

**Naming note:** “Majestic Tree” is the requested visual alias for the canonical final stage **Study Sage**. Use `study-sage` as the code identifier, saved stage value, CSS modifier, and analytics value. The tree concept is represented by a branching leaf crown and grounded posture, not by a separate fourth stage.

Study Sage uses the same pet component contract as Tiny Sprout and Focus Bloom. Its visual changes are intentionally restrained because it is the calm final evolution.

### 29.1 Study Sage HTML markup

```html
<section
  class="card pet-card pet-card--study-sage"
  aria-labelledby="pet-title"
>
  <div
    class="stage-announcement stage-announcement--sage"
    id="study-sage-announcement"
    role="status"
    aria-live="polite"
    hidden
  >
    Study Sage unlocked! Your Sprout grew through steady focus.
  </div>

  <div class="card-heading pet-card__heading">
    <div>
      <p class="eyebrow">Final evolution</p>
      <h1 id="pet-title">Study Sage</h1>
    </div>
    <span class="stage-icon stage-icon--sage" aria-hidden="true">
      <span class="sage-icon-branch"></span>
      <span class="sage-icon-leaf sage-icon-leaf--left"></span>
      <span class="sage-icon-leaf sage-icon-leaf--right"></span>
    </span>
  </div>

  <div class="pet-viewport">
    <div
      class="pet pet--study-sage"
      data-stage="study-sage"
      data-state="ready"
    >
      <span class="pet-aura" aria-hidden="true"></span>
      <span class="pet-shadow" aria-hidden="true"></span>

      <div
        class="pet-art"
        role="img"
        aria-label="Study Sage, your calm focus companion"
      >
        <span class="sage-crown" aria-hidden="true">
          <span class="sage-branch sage-branch--left"></span>
          <span class="sage-branch sage-branch--right"></span>
          <span class="sage-leaf sage-leaf--one"></span>
          <span class="sage-leaf sage-leaf--two"></span>
          <span class="sage-leaf sage-leaf--three"></span>
        </span>

        <span class="pet-body" aria-hidden="true">
          <span class="pet-face" aria-hidden="true">
            <span class="pet-eye pet-eye--left"></span>
            <span class="pet-eye pet-eye--right"></span>
            <span class="pet-mouth"></span>
          </span>
          <span class="pet-glasses" aria-hidden="true"></span>
          <span class="pet-clock-charm" aria-hidden="true"></span>
        </span>

        <span class="pet-foot pet-foot--left" aria-hidden="true"></span>
        <span class="pet-foot pet-foot--right" aria-hidden="true"></span>
      </div>

      <span class="pet-accessories" aria-hidden="true"></span>
    </div>
  </div>

  <p class="pet-message" id="pet-message" role="status" aria-live="polite">
    Steady and present.
  </p>
</section>
```

### 29.2 Study Sage CSS

The following CSS assumes the shared card, viewport, face, body, and base pet styles from Section 27.

```css
:root {
  --sage-body: #b9a7e8;
  --sage-body-dark: #806db8;
  --sage-body-light: #e9e2ff;
  --sage-leaf: #8bcb88;
  --sage-leaf-dark: #5fa56a;
  --sage-gold: #f6c85f;
  --sage-gold-dark: #c59a2d;
  --sage-glow: rgba(185, 167, 232, 0.28);
}

.pet-card--study-sage {
  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(233, 226, 255, 0.82),
      transparent 11rem
    ),
    #ffffff;
}

.stage-icon--sage {
  position: relative;
  background: var(--sage-body-light);
  color: var(--sage-body-dark);
}

.sage-icon-branch {
  position: absolute;
  bottom: 7px;
  width: 22px;
  height: 17px;
  border: 2px solid currentColor;
  border-bottom: 0;
  border-radius: 50% 50% 0 0;
}

.sage-icon-leaf {
  position: absolute;
  width: 10px;
  height: 15px;
  border: 2px solid var(--sage-leaf-dark);
  border-radius: 100% 0 100% 0;
  background: var(--sage-leaf);
}

.sage-icon-leaf--left {
  top: 7px;
  left: 7px;
  transform: rotate(-35deg);
}

.sage-icon-leaf--right {
  top: 7px;
  right: 7px;
  transform: scaleX(-1) rotate(-35deg);
}

.pet--study-sage {
  width: 220px;
  height: 240px;
}

.pet--study-sage .pet-body {
  top: 73px;
  left: 27px;
  width: 166px;
  height: 133px;
  border: 3px solid var(--sage-body-dark);
  border-radius: 45% 45% 38% 38%;
  background: var(--sage-body);
  box-shadow:
    0 13px 24px rgba(128, 109, 184, 0.2),
    inset 0 -11px 0 rgba(128, 109, 184, 0.1);
}

.pet--study-sage .pet-body::before,
.pet--study-sage .pet-body::after,
.pet--study-sage .pet-foot {
  border-color: var(--sage-body-dark);
  background: var(--sage-body);
}

.pet--study-sage .pet-foot--left {
  left: 49px;
}

.pet--study-sage .pet-foot--right {
  right: 49px;
}

.sage-crown {
  position: absolute;
  z-index: 2;
  top: 18px;
  left: 28px;
  width: 164px;
  height: 80px;
}

.sage-branch {
  position: absolute;
  bottom: 6px;
  width: 74px;
  height: 48px;
  border: 5px solid var(--sage-leaf-dark);
  border-bottom: 0;
  border-radius: 60% 60% 0 0;
}

.sage-branch--left {
  left: 10px;
  transform: rotate(-25deg);
}

.sage-branch--right {
  right: 10px;
  transform: scaleX(-1) rotate(-25deg);
}

.sage-leaf {
  position: absolute;
  width: 36px;
  height: 50px;
  border: 3px solid var(--sage-leaf-dark);
  border-radius: 100% 0 100% 0;
  background: var(--sage-leaf);
  transform-origin: bottom center;
}

.sage-leaf--one {
  top: 1px;
  left: 63px;
  transform: rotate(-2deg);
}

.sage-leaf--two {
  top: 15px;
  left: 24px;
  transform: rotate(-35deg);
}

.sage-leaf--three {
  top: 15px;
  right: 24px;
  transform: scaleX(-1) rotate(-35deg);
}

.sage-leaf::after {
  position: absolute;
  top: 8px;
  left: 15px;
  width: 3px;
  height: 31px;
  border-radius: 999px;
  background: rgba(95, 165, 106, 0.55);
  content: "";
  transform: rotate(20deg);
}

.pet--study-sage .pet-face {
  top: 45px;
}

.pet--study-sage .pet-glasses {
  position: absolute;
  z-index: 3;
  top: 48px;
  left: 37px;
  width: 92px;
  height: 28px;
  border: 2px solid var(--sage-body-dark);
  border-radius: 16px;
  opacity: 0.78;
}

.pet--study-sage .pet-glasses::before,
.pet--study-sage .pet-glasses::after {
  position: absolute;
  top: -2px;
  width: 34px;
  height: 24px;
  border: 2px solid var(--sage-body-dark);
  border-radius: 50%;
  content: "";
}

.pet--study-sage .pet-glasses::before {
  left: 4px;
}

.pet--study-sage .pet-glasses::after {
  right: 4px;
}

.pet--study-sage .pet-clock-charm {
  position: absolute;
  right: 25px;
  bottom: 14px;
  width: 24px;
  height: 24px;
  border: 3px solid var(--sage-gold-dark);
  border-radius: 50%;
  background: var(--sage-gold);
}

.pet--study-sage .pet-clock-charm::before,
.pet--study-sage .pet-clock-charm::after {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 2px;
  border-radius: 999px;
  background: var(--sage-gold-dark);
  content: "";
  transform-origin: top center;
}

.pet--study-sage .pet-clock-charm::before {
  height: 7px;
  transform: rotate(0deg);
}

.pet--study-sage .pet-clock-charm::after {
  height: 5px;
  transform: rotate(115deg);
}

.pet--study-sage .pet-aura {
  background: var(--sage-glow);
}

.pet--study-sage[data-state="idle"] .pet-art,
.pet--study-sage[data-state="ready"] .pet-art {
  animation: sage-breathe 5s ease-in-out infinite;
}

.pet--study-sage[data-state="focusing"] .pet-art {
  animation: sage-breathe 6s ease-in-out infinite;
}

.pet--study-sage[data-state="focusing"] .sage-leaf--one {
  animation: sage-leaf-center 6s ease-in-out infinite;
}

.pet--study-sage[data-state="celebrating"] .pet-art,
.pet--study-sage[data-state="proud"] .pet-art {
  animation: sage-celebrate 800ms cubic-bezier(.2, 1.35, .4, 1) both;
}

.pet--study-sage[data-state="celebrating"] .pet-aura,
.pet--study-sage[data-state="proud"] .pet-aura {
  animation: sage-aura 1s ease-out both;
}

@keyframes sage-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2px) scale(1.012); }
}

@keyframes sage-leaf-center {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(3deg); }
}

@keyframes sage-celebrate {
  0% { transform: translateY(0) rotate(0) scale(1); }
  35% { transform: translateY(-10px) rotate(-2deg) scale(1.04); }
  70% { transform: translateY(0) rotate(2deg) scale(1.015); }
  100% { transform: translateY(0) rotate(0) scale(1); }
}

@keyframes sage-aura {
  0% { opacity: 0; transform: scale(0.76); }
  45% { opacity: 0.76; transform: scale(1.05); }
  100% { opacity: 0.2; transform: scale(1); }
}

.focus-mode .pet--study-sage .pet-aura {
  opacity: 0 !important;
  animation: none !important;
}

.focus-mode .pet--study-sage .pet-art {
  animation-duration: 6s;
}

@media (prefers-reduced-motion: reduce) {
  .pet--study-sage .pet-art,
  .pet--study-sage .sage-leaf,
  .pet--study-sage .pet-aura {
    animation: none !important;
    transition: none !important;
  }
}

html[data-motion="reduced"] .pet--study-sage .pet-art,
html[data-motion="reduced"] .pet--study-sage .sage-leaf,
html[data-motion="reduced"] .pet--study-sage .pet-aura {
  animation: none !important;
  transition: none !important;
}
```

### 29.3 Study Sage renderer

```js
const STUDY_SAGE_MESSAGES = {
  idle: "Steady and present.",
  ready: "A calm session starts here.",
  focusing: "Steady and present.",
  break: "A good break supports the next step.",
  celebrating: "That was thoughtful work.",
  proud: "Your steady work is growing.",
  sleepy: "Welcome back. A fresh streak starts today."
};

function renderStudySage(appState, viewState = {}) {
  const pet = document.querySelector(".pet");
  const title = document.querySelector("#pet-title");
  const stageBadge = document.querySelector(".stage-badge");
  const message = document.querySelector("#pet-message");

  if (!pet || !title || !message) return;
  if (getPetStage(appState.level) !== "study-sage") return;

  const stateName = viewState.petState || getPetState(appState);
  const petName = appState.petName || "Sprout";

  pet.className = "pet pet--study-sage";
  pet.dataset.stage = "study-sage";
  pet.dataset.state = stateName;
  pet.setAttribute(
    "aria-label",
    `${petName}, Study Sage, ${stateName}`
  );

  title.textContent = "Study Sage";
  if (stageBadge) stageBadge.textContent = "Study Sage";
  message.textContent = STUDY_SAGE_MESSAGES[stateName] || STUDY_SAGE_MESSAGES.idle;
}

function showStudySageUnlock() {
  const notice = document.querySelector("#study-sage-announcement");
  if (!notice) return;

  notice.hidden = false;
  notice.textContent =
    "Study Sage unlocked! Your Sprout grew through steady focus.";
}
```

Save the new level and stage before showing the notice. If the page reloads after the saved transition, render Study Sage directly without replaying the unlock sequence.

### 29.4 Shared stage renderer

Use one stage selector so the app does not render multiple pet components at once.

```js
function renderPetStage(appState, viewState = {}) {
  const stage = getPetStage(appState.level);

  switch (stage) {
    case "study-sage":
      renderStudySage(appState, viewState);
      break;
    case "focus-bloom":
      renderFocusBloom(appState, viewState);
      break;
    default:
      renderTinySprout(appState, viewState);
      break;
  }
}

function renderApp(appState, viewState = {}) {
  renderPetStage(appState, viewState);
  renderProgress(appState);
}
```

If the DOM contains stage-specific markup, render the selected template before applying the stage renderer. The MVP may instead keep one shared markup tree and toggle stage-specific layers with classes.

### 29.5 Final-stage evolution handler

```js
function handleStageTransition(previousLevel, nextLevel, appState) {
  const previousStage = getPetStage(previousLevel);
  const nextStage = getPetStage(nextLevel);

  if (previousStage === nextStage) return;

  renderPetStage(appState, { petState: "proud" });

  if (nextStage === "focus-bloom") {
    showFocusBloomUnlock();
  }

  if (nextStage === "study-sage") {
    showStudySageUnlock();
  }
}
```

The progression transaction should call this only after saving the new state and recording the `evolution_unlocked` event. The renderer must not award XP, coins, streaks, or achievements.

### 29.6 Final-stage implementation checklist

- [ ] The code identifier is `study-sage`.
- [ ] “Majestic Tree” is treated as a display concept only.
- [ ] The pet uses a lavender body, branching leaf crown, glasses detail, and clock charm.
- [ ] Study Sage remains the same species and uses the shared viewport.
- [ ] The final form is calmer than Focus Bloom during active focus.
- [ ] The Level 8 notice is announced once and saved before animation.
- [ ] Refreshing after unlock does not replay the unlock event.
- [ ] The renderer does not modify progression state directly.
- [ ] Reduced-motion users receive a static but understandable Study Sage.
- [ ] The final stage works with sound and haptics disabled.

### 29.7 Combined evolution implementation test cases

```text
Level 1  → render Tiny Sprout
Level 3  → save state → emit evolution_unlocked → render Focus Bloom → show notice
Level 8  → save state → emit evolution_unlocked → render Study Sage → show notice
Refresh  → render saved stage only; do not replay unlock event
```

For every stage:

- [ ] `data-stage` matches the canonical saved stage.
- [ ] The visible stage title matches the saved stage.
- [ ] The accessible label names the correct pet stage.
- [ ] The timer layout remains unchanged.
- [ ] The message is available as text.
- [ ] Focus mode reduces nonessential animation.
- [ ] Reduced-motion mode removes nonessential animation.

## 30. Development-Only Cheat Mode for Testing

Cheats are useful for quickly testing evolution stages, rewards, streak recovery, and edge cases. They must be treated as a development tool, not a user-facing feature.

### 30.1 Safety rules

- Enable cheats only in development or local preview builds.
- Never expose the cheat panel in a production build.
- Do not award fake analytics events from cheat actions unless the event is explicitly marked as a test event.
- Do not allow cheat actions to contact external services.
- Keep cheat state separate from real progression state where practical.
- Display a visible `DEV MODE` label whenever cheats are enabled.
- Do not use URL query parameters as the only protection in a deployed build.
- Remove or tree-shake cheat code during production builds.

A safe default is:

```js
const IS_DEV =
  import.meta?.env?.DEV === true ||
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

const CHEATS_ENABLED = IS_DEV && localStorage.getItem("pomodoroPetDevMode") === "true";
```

For a plain static app without a bundler, replace `import.meta.env.DEV` with a manually injected build flag:

```js
const BUILD_MODE = "development"; // Replace during production build.
const IS_DEV = BUILD_MODE === "development" &&
  ["localhost", "127.0.0.1"].includes(location.hostname);
const CHEATS_ENABLED = IS_DEV &&
  localStorage.getItem("pomodoroPetDevMode") === "true";
```

Do not set `BUILD_MODE` from user-controlled query parameters.

### 30.2 Developer activation

Use a deliberate local activation step rather than rendering cheats for everyone on localhost.

```js
function enableDevMode() {
  if (!IS_DEV) return false;

  localStorage.setItem("pomodoroPetDevMode", "true");
  window.location.reload();
  return true;
}

function disableDevMode() {
  localStorage.removeItem("pomodoroPetDevMode");
  window.location.reload();
}
```

Possible activation methods during development:

- A hidden settings gesture documented for developers.
- A development-only keyboard shortcut such as `Ctrl+Shift+D`.
- A console command in local development.
- A visible developer toolbar enabled by the build configuration.

Avoid shipping an obvious public cheat code. If a keyboard shortcut is used, require `IS_DEV` and show a confirmation label.

```js
document.addEventListener("keydown", (event) => {
  if (!IS_DEV) return;
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
    enableDevMode();
  }
});
```

### 30.3 Cheat panel markup

```html
<aside
  id="dev-cheat-panel"
  class="dev-cheat-panel"
  aria-labelledby="dev-cheat-title"
  hidden
>
  <div class="dev-cheat-panel__header">
    <div>
      <p class="dev-eyebrow">Development only</p>
      <h2 id="dev-cheat-title">Cheat controls</h2>
    </div>
    <button id="dev-cheat-close" type="button" aria-label="Close cheat controls">
      ×
    </button>
  </div>

  <p class="dev-warning">
    These controls modify local test data. They are unavailable in production.
  </p>

  <div class="dev-cheat-group">
    <h3>Evolution stages</h3>
    <button type="button" data-cheat="stage" data-value="tiny-sprout">
      Tiny Sprout
    </button>
    <button type="button" data-cheat="stage" data-value="focus-bloom">
      Focus Bloom
    </button>
    <button type="button" data-cheat="stage" data-value="study-sage">
      Study Sage
    </button>
  </div>

  <div class="dev-cheat-group">
    <h3>Progress</h3>
    <button type="button" data-cheat="add-xp" data-value="10">+10 XP</button>
    <button type="button" data-cheat="add-xp" data-value="100">+100 XP</button>
    <button type="button" data-cheat="add-coins" data-value="50">+50 coins</button>
    <button type="button" data-cheat="set-streak" data-value="7">Set 7-day streak</button>
  </div>

  <div class="dev-cheat-group">
    <h3>Timer and state</h3>
    <button type="button" data-cheat="complete-focus">Complete focus session</button>
    <button type="button" data-cheat="break-streak">Simulate missed days</button>
    <button type="button" data-cheat="reset-state">Reset local progress</button>
    <button type="button" data-cheat="clear-events">Clear event log</button>
  </div>

  <output id="dev-cheat-status" class="dev-status" role="status" aria-live="polite"></output>
</aside>

<button
  id="dev-cheat-open"
  class="dev-cheat-open"
  type="button"
  hidden
>
  DEV MODE
</button>
```

The `Reset local progress` control must be clearly labeled as destructive to test data. It should reset only local app state, never external data.

### 30.4 Cheat panel CSS

```css
.dev-cheat-panel {
  position: fixed;
  z-index: 100;
  right: 16px;
  bottom: 16px;
  width: min(360px, calc(100vw - 32px));
  max-height: min(720px, calc(100vh - 32px));
  overflow: auto;
  padding: 18px;
  border: 2px solid #bd5965;
  border-radius: 16px;
  background: #fff8f8;
  box-shadow: 0 16px 42px rgba(56, 53, 74, 0.22);
}

.dev-cheat-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dev-cheat-panel h2,
.dev-cheat-panel h3,
.dev-cheat-panel p {
  margin-top: 0;
}

.dev-cheat-panel h2 {
  margin-bottom: 0;
  color: #38354a;
  font-size: 1.15rem;
}

.dev-cheat-panel h3 {
  margin-bottom: 8px;
  color: #38354a;
  font-size: 0.86rem;
}

.dev-eyebrow {
  margin-bottom: 2px;
  color: #bd5965;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dev-warning {
  padding: 9px 10px;
  border-radius: 9px;
  background: #ffe8e8;
  color: #7d343d;
  font-size: 0.78rem;
}

.dev-cheat-group {
  display: grid;
  gap: 7px;
  margin-top: 16px;
}

.dev-cheat-group button,
.dev-cheat-panel__header button,
.dev-cheat-open {
  min-height: 38px;
  border: 1px solid #d99aa1;
  border-radius: 9px;
  background: #ffffff;
  color: #7d343d;
  cursor: pointer;
  font-weight: 700;
}

.dev-cheat-group button:hover,
.dev-cheat-panel__header button:hover,
.dev-cheat-open:hover {
  border-color: #bd5965;
  background: #fff0f0;
}

.dev-cheat-panel__header button {
  width: 34px;
  min-height: 34px;
  font-size: 1.2rem;
}

.dev-status {
  display: block;
  min-height: 20px;
  margin-top: 16px;
  color: #397244;
  font-size: 0.8rem;
  font-weight: 700;
}

.dev-cheat-open {
  position: fixed;
  z-index: 99;
  right: 16px;
  bottom: 16px;
  padding: 8px 12px;
  background: #fff0f0;
}

@media (max-width: 600px) {
  .dev-cheat-panel {
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
  }

  .dev-cheat-open {
    right: 8px;
    bottom: 8px;
  }
}
```

### 30.5 State helpers

Keep the cheat implementation behind a guard and use the same normalization and save functions as the real app.

```js
function assertCheatsEnabled() {
  if (!CHEATS_ENABLED) {
    throw new Error("Development cheats are disabled.");
  }
}

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStateForCheat(nextState) {
  const normalized = normalizeState(nextState);

  normalized.level = Math.max(1, Number(normalized.level) || 1);
  normalized.xp = Math.max(0, Number(normalized.xp) || 0);
  normalized.coins = Math.max(0, Number(normalized.coins) || 0);
  normalized.streak = Math.max(0, Number(normalized.streak) || 0);
  normalized.todaySessions = Math.max(
    0,
    Number(normalized.todaySessions) || 0
  );

  return normalized;
}

function saveCheatState(nextState) {
  const normalized = normalizeStateForCheat(nextState);
  saveState(normalized);
  return normalized;
}
```

If the app uses immutable state updates, replace these helpers with the existing reducer or state-store API. Do not create a second source of truth.

### 30.6 Stage cheat implementation

A stage cheat should place the app at a valid boundary state rather than setting only the visible CSS class. This ensures the timer, progress labels, renderer, and analytics QA all see a consistent state.

```js
const STAGE_FIXTURES = {
  "tiny-sprout": {
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    totalSessions: 0,
    todaySessions: 0,
    lastSessionDate: null,
    achievements: [],
    accessories: [],
    garden: []
  },
  "focus-bloom": {
    level: 3,
    xp: 100,
    coins: 25,
    streak: 3,
    totalSessions: 10,
    todaySessions: 1,
    lastSessionDate: getLocalDateKey(),
    achievements: ["first-focus", "steady-mind"],
    accessories: [],
    garden: ["first-sprout"]
  },
  "study-sage": {
    level: 8,
    xp: 400,
    coins: 100,
    streak: 7,
    totalSessions: 40,
    todaySessions: 2,
    lastSessionDate: getLocalDateKey(),
    achievements: ["first-focus", "steady-mind", "focus-master"],
    accessories: [],
    garden: ["first-sprout", "sunny-pot", "lavender-bed"]
  }
};

function setCheatStage(stage) {
  assertCheatsEnabled();

  const fixture = STAGE_FIXTURES[stage];
  if (!fixture) throw new Error(`Unknown test stage: ${stage}`);

  const nextState = normalizeStateForCheat({
    ...cloneState(state),
    ...cloneState(fixture),
    timer: {
      ...cloneState(state.timer || {}),
      isRunning: false,
      mode: "focus",
      remainingSeconds: 25 * 60
    },
    ui: {
      ...(state.ui || {}),
      petState: "ready"
    }
  });

  // A stage fixture is test setup, not real progression.
  saveCheatState(nextState);
  Object.assign(state, nextState);
  renderApp(state);
  setDevStatus(`Loaded ${stage} test fixture.`);
}
```

Do not call normal `evolution_unlocked` analytics when loading a fixture. If the QA suite needs to verify the unlock event itself, use the session-completion cheat described below.

### 30.7 XP, coin, and streak cheats

```js
function addCheatXp(amount) {
  assertCheatsEnabled();

  const numericAmount = Math.max(0, Number(amount) || 0);
  const previousLevel = state.level;
  const nextState = normalizeStateForCheat({
    ...state,
    xp: state.xp + numericAmount
  });

  // Use the canonical progression calculation used by real sessions.
  nextState.level = calculateLevel(nextState.xp);
  saveCheatState(nextState);
  Object.assign(state, nextState);
  renderApp(state);

  setDevStatus(
    `Added ${numericAmount} XP. Level ${previousLevel} → ${state.level}.`
  );
}

function addCheatCoins(amount) {
  assertCheatsEnabled();

  const numericAmount = Math.max(0, Number(amount) || 0);
  const nextState = normalizeStateForCheat({
    ...state,
    coins: state.coins + numericAmount
  });

  saveCheatState(nextState);
  Object.assign(state, nextState);
  renderApp(state);
  setDevStatus(`Added ${numericAmount} coins.`);
}

function setCheatStreak(days) {
  assertCheatsEnabled();

  const numericDays = Math.max(0, Number(days) || 0);
  const nextState = normalizeStateForCheat({
    ...state,
    streak: numericDays,
    lastSessionDate: getLocalDateKey()
  });

  saveCheatState(nextState);
  Object.assign(state, nextState);
  renderApp(state);
  setDevStatus(`Set streak to ${numericDays} days.`);
}
```

These controls change local data directly and should not emit normal reward events. The status text should identify the operation as a test fixture when useful.

### 30.8 Complete-session cheat

Use this cheat to test the real completion pipeline, including XP, coins, streak changes, achievements, and evolution events. It should invoke the same function as a real timer completion rather than manually duplicating business logic.

```js
function completeCheatFocusSession() {
  assertCheatsEnabled();

  if (state.timer?.isRunning) {
    stopTimer();
  }

  // The test flag allows the UI to show that this completion was simulated.
  completeFocusSession({
    source: "dev-cheat",
    emitAnalytics: true,
    markAsTest: true
  });

  setDevStatus("Completed a simulated focus session through the real reward flow.");
}
```

If the production function does not accept options yet, add a narrow optional parameter:

```js
function completeFocusSession(options = {}) {
  const source = options.source || "timer";
  const markAsTest = options.markAsTest === true;

  // Existing progression transaction remains unchanged.
  recordCompletedSession();
  saveState(state);

  trackEvent("focus_completed", {
    source,
    is_test: markAsTest,
    duration_minutes: state.settings.focusMinutes,
    pet_stage: getPetStage(state.level)
  });
}
```

For production analytics, either omit `is_test` events or filter all `is_test: true` events from reports. Never mix simulated completions into real retention metrics.

### 30.9 Streak-break simulation

```js
function simulateCheatMissedDays(days = 2) {
  assertCheatsEnabled();

  const safeDays = Math.max(1, Number(days) || 1);
  const date = new Date();
  date.setDate(date.getDate() - safeDays);

  const nextState = normalizeStateForCheat({
    ...state,
    lastSessionDate: date.toISOString().slice(0, 10)
  });

  saveCheatState(nextState);
  Object.assign(state, nextState);
  renderApp(state);
  setDevStatus(`Simulated a ${safeDays}-day gap. Complete a session to test recovery.`);
}
```

The next real or simulated completion should pass through the normal streak-break logic. Do not directly set `streak = 0` if the goal is to test the `streak_broken` event.

### 30.10 Reset and event-log controls

```js
function resetCheatProgress() {
  assertCheatsEnabled();

  const confirmed = window.confirm(
    "Reset all local Pomodoro Pet test progress?"
  );
  if (!confirmed) return;

  const freshState = createDefaultState();
  saveState(freshState);
  Object.assign(state, freshState);
  renderApp(state);
  setDevStatus("Local test progress reset.");
}

function clearCheatEventLog() {
  assertCheatsEnabled();

  localStorage.removeItem(EVENT_LOG_KEY);
  setDevStatus("Local analytics event log cleared.");
}
```

Do not use `resetCheatProgress()` as a production account deletion flow. It is only a local development reset.

### 30.11 Cheat event binding

```js
function setDevStatus(message) {
  const status = document.querySelector("#dev-cheat-status");
  if (status) status.textContent = message;
}

function initializeCheatPanel() {
  const panel = document.querySelector("#dev-cheat-panel");
  const openButton = document.querySelector("#dev-cheat-open");
  const closeButton = document.querySelector("#dev-cheat-close");

  if (!panel || !openButton || !closeButton || !CHEATS_ENABLED) return;

  panel.hidden = true;
  openButton.hidden = false;

  openButton.addEventListener("click", () => {
    panel.hidden = false;
    openButton.hidden = true;
  });

  closeButton.addEventListener("click", () => {
    panel.hidden = true;
    openButton.hidden = false;
  });

  panel.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-cheat]");
    if (!button) return;

    const cheat = button.dataset.cheat;
    const value = button.dataset.value;

    try {
      switch (cheat) {
        case "stage":
          setCheatStage(value);
          break;
        case "add-xp":
          addCheatXp(value);
          break;
        case "add-coins":
          addCheatCoins(value);
          break;
        case "set-streak":
          setCheatStreak(value);
          break;
        case "complete-focus":
          completeCheatFocusSession();
          break;
        case "break-streak":
          simulateCheatMissedDays();
          break;
        case "reset-state":
          resetCheatProgress();
          break;
        case "clear-events":
          clearCheatEventLog();
          break;
        default:
          setDevStatus(`Unknown cheat: ${cheat}`);
      }
    } catch (error) {
      console.error(error);
      setDevStatus("Cheat failed. Check the developer console.");
    }
  });
}

if (CHEATS_ENABLED) {
  initializeCheatPanel();
}
```

Initialize the panel after the main DOM is ready. Do not attach event listeners from inside `renderApp()`, because repeated renders would duplicate clicks.

### 30.12 Test scenarios enabled by cheats

#### Tiny Sprout

1. Load the Tiny Sprout fixture.
2. Start a simulated session.
3. Verify `focus_started` and `focus_completed`.
4. Verify XP, coins, streak, First Focus, and garden reward.
5. Refresh and verify no duplicate rewards.

#### Focus Bloom

1. Load the Focus Bloom fixture for steady-state UI testing.
2. Separately seed the level-boundary fixture required by the canonical XP formula.
3. Complete a simulated session through the real completion flow.
4. Verify `level_reached` and `evolution_unlocked` exactly once.
5. Verify the Focus Bloom announcement and renderer.
6. Refresh and confirm the unlock notice does not replay.

#### Study Sage

1. Load the Study Sage fixture for final-stage UI testing.
2. Separately seed the Level 8 boundary fixture.
3. Complete a simulated session through the real completion flow.
4. Verify the Study Sage announcement, renderer, and accessible label.
5. Verify `evolution_unlocked` is emitted once.
6. Refresh and confirm the final stage remains saved.

#### Streak recovery

1. Load any stage fixture with a nonzero streak.
2. Simulate two missed days.
3. Complete a simulated session.
4. Verify `streak_broken` and a new streak of 1.
5. Verify XP, coins, achievements, garden, and accessories remain intact.

### 30.13 Production removal checklist

- [ ] `CHEATS_ENABLED` is false in production builds.
- [ ] The cheat panel markup is excluded or hidden from production output.
- [ ] The developer activation shortcut is excluded or inert.
- [ ] Stage, XP, coin, streak, reset, and completion cheat functions are tree-shaken or removed.
- [ ] No `is_test: true` events are sent to production analytics.
- [ ] No dev-mode label appears in production.
- [ ] A production build search finds no active cheat entry point.
- [ ] Local progress reset remains separate from any future account deletion flow.
- [ ] QA has tested the production build, not only the development build.

### 30.14 Recommended MVP approach

For this simple no-backend app, implement only the following first:

```text
Development flag
   ↓
Stage fixture buttons
   ↓
+XP / +coins buttons
   ↓
Complete simulated focus session
   ↓
Reset local test state
   ↓
Clear local analytics log
```

This provides enough coverage to test all three evolution stages and the progression events without building a broad cheat system. Keep cheats local, obvious, reversible, and impossible to activate in a production build.
