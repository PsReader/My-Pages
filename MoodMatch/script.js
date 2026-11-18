const moodForm = document.querySelector("#mood-form");
let moodOptions = [...document.querySelectorAll('input[name="mood"]')];
const intensityInput = document.querySelector("#intensity");
const intensityValue = document.querySelector("#intensity-value");
const rangeLow = document.querySelector("#range-low");
const rangeHigh = document.querySelector("#range-high");
const secretUnlock = document.querySelector("#secret-unlock");
let endpointTimer = null;
let activeExtremeZone = null;
let lastRegularMood = "sunny";
const unlockedSecretMoods = new Set();
const board = document.querySelector(".moodboard");
const boardIntro = document.querySelector("#board-intro");
const boardTitle = document.querySelector("#board-title");
const boardSubtitle = document.querySelector("#board-subtitle");
const pickerMoodNote = document.querySelector("#picker-mood-note");
const boardContent = document.querySelector("#board-content");
const permissionSlip = document.querySelector("#permission-slip");
const permissionCopy = document.querySelector("#permission-copy");
const paletteBlock = document.querySelector("#palette-block");
const swatches = document.querySelector("#swatches");
const soundBlock = document.querySelector("#sound-block");
const soundtrack = document.querySelector("#soundtrack");
const trackRecommendation = document.querySelector("#track-recommendation");
const activityBlock = document.querySelector("#activity-block");
const activityAction = document.querySelector("#activity-action");
const activityReason = document.querySelector("#activity-reason");
const moodQuote = document.querySelector("#mood-quote");
const boardStatus = document.querySelector("#board-status");
const copyButton = document.querySelector("#copy-button");
const shareButton = document.querySelector("#share-button");
const againButton = document.querySelector("#again-button");
const soundToggle = document.querySelector("#sound-toggle");
const backgroundAudio = document.querySelector("#background-audio");
const moodAudio = document.querySelector("#mood-audio");
backgroundAudio.src = "audio/site-ambience.mp3";
const moodAudioFiles = {
  sunny: "audio/sunny-mood.mp3", soft: "audio/soft-mood.mp3", restless: "audio/restless-mood.mp3",
  main: "audio/main-mood.mp3", low: "audio/low-mood.mp3", hopeful: "audio/hopeful-mood.mp3",
  social: "audio/social-mood.mp3", chaos: "audio/chaos-mood.mp3",
  midnight: "audio/soft-mood.mp3", jolt: "audio/chaos-mood.mp3",
};
let musicEnabled = false;
let activeAudio = null;
let audioTransition = 0;
let effectContext = null;

const moods = {
  sunny: {
    label: "Bright & scattered",
    pickerPrompt: "Pick the thought with the best shoes. The other tabs can wait.",
    fieldNote: "Your brain has opened fourteen tabs. Somehow, the playlist is excellent.",
    activities: [
      { action: "Write down one idea before it escapes.", reason: "A bright, busy mood gets somewhere to land." },
      { action: "Choose one idea and give it five minutes.", reason: "A little focus lets the good energy move." },
      { action: "Start the smallest version of your favorite idea.", reason: "You can use the sunshine without opening fourteen more tabs." },
    ],
    permission: "Start three things. Finish one. Call it a trilogy.",
    names: ["The Sunshine Pinball", "The Daylight Collector", "The Happy Detour"],
    palette: [["Butter", "#f1cf4d"], ["Tomato", "#e75a3b"], ["Pool Tile", "#315bc6"]],
    sounds: ["brass-pop with the windows down", "handclaps, warm bass, and a late chorus", "sunny indie rock with one extra tambourine"],
    quotes: ["I have a plan. It has stickers and no middle.", "Today's forecast: new-tab weather with a chance of snacks.", "I am available for snacks and minor celebrations."],
    accent: "#e75a3b",
  },
  soft: {
    label: "Soft & sleepy",
    pickerPrompt: "Choose the gentlest setting. The blanket has final say.",
    fieldNote: "Soft edges. Lower expectations. The blanket has been promoted to management.",
    activities: [
      { action: "Put a glass of water within easy reach.", reason: "A little care can stay small and quiet." },
      { action: "Settle somewhere comfortable for one song.", reason: "A soft pause suits a low volume moment." },
      { action: "Take a slow lap around the room, then come back to cozy.", reason: "A gentle reset can add a little lift without rushing you." },
    ],
    permission: "Keep one small comfort within arm’s reach. Hydration counts as ambition.",
    names: ["The Blanket Fort Diplomat", "The Cloud in Slippers", "The Pillow Committee"],
    palette: [["Lilac Hour", "#c8b8e3"], ["Milk Glass", "#f2e6cf"], ["Blue Hush", "#7189b4"]],
    sounds: ["hazy piano over a very polite beat", "soft-focus dream pop and a kettle in the next room", "slow guitar with the volume turned down"],
    quotes: ["I am booked. The appointment is with this blanket.", "Please send all urgent matters to tomorrow-me.", "My ambition is currently horizontal."],
    accent: "#7189b4",
  },
  restless: {
    label: "Restless feet",
    pickerPrompt: "Give the extra energy one small place to go.",
    fieldNote: "Your energy has somewhere to be. The destination can remain a surprise.",
    activities: [
      { action: "Stand up and stretch your legs once.", reason: "A small change of position gives the foot tapping somewhere to go." },
      { action: "Take a short loop around your space.", reason: "A little movement can settle the urge to roam." },
      { action: "Walk one block or take the long way to your next stop.", reason: "The extra energy gets a route without needing a grand plan." },
    ],
    permission: "Take the scenic route, even if it is just around the block.",
    names: ["The Side-Quest Specialist", "The Human Pinball", "The Unfinished Errand"],
    palette: [["Track Red", "#e24c36"], ["Fast Lane", "#3152ba"], ["Warning Light", "#f3ce4d"]],
    sounds: ["drums that sound like catching the last train", "bright synths sprinting through a city", "garage rock with absolutely no outro"],
    quotes: ["I need a walk, a new hobby, and a different pen.", "My legs have scheduled a meeting without me.", "I came here to do one thing. The thing is now a rumor."],
    accent: "#3152ba",
  },
  main: {
    label: "Main-character hour",
    pickerPrompt: "Pick the scene you want to be in. The lighting is yours.",
    fieldNote: "The lighting is good and the plot, though unclear, appears to favor you.",
    activities: [
      { action: "Notice one detail you like about this moment.", reason: "A quiet cameo still gets its close-up." },
      { action: "Wear or use one thing that feels especially like you.", reason: "A small styling choice can make the scene feel yours." },
      { action: "Take a photo of one ordinary thing with excellent lighting.", reason: "The leading role deserves one very low-stakes shot." },
    ],
    permission: "Make an entrance. The room can catch up.",
    names: ["The Slow-Motion Entrance", "The Credits-Roll Celebrity", "The Sidewalk Icon"],
    palette: [["Marquee", "#e94d60"], ["Afterparty", "#6b54bd"], ["Flashbulb", "#efca49"]],
    sounds: ["a cinematic string section before a coffee order", "big pop drums and a suspiciously perfect walk", "orchestral drama with an unnecessary key change"],
    quotes: ["The lighting is doing a lot for me today.", "I accept this award on behalf of my excellent outfit.", "The plot is unclear, but my entrance was strong."],
    accent: "#6b54bd",
  },
  low: {
    label: "Low battery, good taste",
    pickerPrompt: "Choose the version that asks the least of you.",
    fieldNote: "A quiet day is still a day. Your sofa has excellent taste in company.",
    activities: [
      { action: "Put both feet on the floor, if that feels okay.", reason: "One small reset can be enough for a low battery." },
      { action: "Move a drink or snack within reach.", reason: "Care should not require a heroic quest today." },
      { action: "Spend two minutes on one task, then stop or continue by choice.", reason: "A short start leaves the rest of the day up to you." },
    ],
    permission: "Do the next thing at thirty percent. That still counts.",
    names: ["The Elegant Houseplant", "The Rechargeable Introvert", "The Lounge Chair Laureate"],
    palette: [["Moss Nap", "#536c55"], ["Tea Biscuit", "#c2a77b"], ["Warm Brick", "#b95240"]],
    sounds: ["a mellow bassline with nowhere to be", "dusty soul for a very small afternoon", "slow jazz played from another room"],
    quotes: ["I did one thing today. It was a good thing.", "Currently buffering. Please admire the wallpaper.", "My plans are to remain an excellent shape on this couch."],
    accent: "#536c55",
  },
  hopeful: {
    label: "Quietly hopeful",
    pickerPrompt: "Find one small maybe. No grand forecast required.",
    fieldNote: "A small opening. No grand promise needed; the next page is enough.",
    activities: [
      { action: "Write one thing you might look forward to.", reason: "A small maybe is plenty of horizon for now." },
      { action: "Add one line to a note for your future self.", reason: "A tiny promise gives hope somewhere to take root." },
      { action: "Take the first two minutes of a thing you want to begin.", reason: "A new chapter can start with one ungrand gesture." },
    ],
    permission: "Keep one tiny promise to future-you.",
    names: ["The Pocket-Sized Sunrise", "The Fresh Notebook", "The Maybe Machine"],
    palette: [["First Light", "#f2d56e"], ["New Leaf", "#659477"], ["Open Sky", "#6c8dc4"]],
    sounds: ["gentle guitar building into a tiny victory", "soft synths and the first day of spring", "a hopeful piano line with room to breathe"],
    quotes: ["I have a feeling the next page has better snacks.", "Small steps still count if you do a little wiggle.", "The future looks promising from this exact chair."],
    accent: "#659477",
  },
  social: {
    label: "Social, but slippery",
    pickerPrompt: "Pick your people setting. The exit stays unlocked.",
    fieldNote: "You like people. You also like doors. Both facts may be true at once.",
    activities: [
      { action: "Send one person a reaction or hello.", reason: "A small connection can keep the door comfortably open." },
      { action: "Send a kind message to someone you like.", reason: "You can be social without booking the whole evening." },
      { action: "Have one short chat and decide afterward if you want another.", reason: "You get company and keep your dimmer switch." },
    ],
    permission: "Leave while you still like everyone. A graceful exit is a skill.",
    names: ["The Guest List Escape Artist", "The Friendly Ghost", "The Party Comma"],
    palette: [["Garden Gate", "#50a78a"], ["Citrus Slice", "#e6bd49"], ["Exit Sign", "#df6849"]],
    sounds: ["disco that leaves before the encore", "funky bass with a quiet corner nearby", "bright pop with a built-in intermission"],
    quotes: ["I like everyone here. I also like my own hallway.", "Arriving warmly. Departing mysteriously.", "My social battery has a cute little dimmer switch."],
    accent: "#418b70",
  },
  chaos: {
    label: "Chaos, lightly seasoned",
    pickerPrompt: "Name the plot twist. It may keep its tiny hat.",
    fieldNote: "The plan has gone off-script, but at least it brought snacks.",
    activities: [
      { action: "Write down the one loose end you keep noticing.", reason: "Naming the chaos gives it a very small container." },
      { action: "Clear one small patch of space around you.", reason: "One visible win can make the plot a little easier to follow." },
      { action: "Set a five-minute timer and handle one loose end.", reason: "A short sprint gives the plot twist a beginning and an end." },
    ],
    permission: "Name the chaos. Give it a tiny hat. Proceed only if amusing.",
    names: ["The Loose Shopping Cart", "The Plot Twist in Sneakers", "The Unsupervised Confetti"],
    palette: [["Hot Sauce", "#df4b3f"], ["Blue Screen", "#556bd0"], ["Party Hat", "#edca48"]],
    sounds: ["a marching band falling down the stairs, musically", "breakbeat with a kazoo in the control room", "dance music from a parallel universe's food court"],
    quotes: ["I have connected three unrelated dots. They are now roommates.", "The plan has left the building. It waved on the way out.", "Somebody put a tiny hat on the situation."],
    accent: "#556bd0",
  },
  hush: {
    label: "Hush Mode",
    pickerPrompt: "Turn the world down a notch. Silence is allowed.",
    fieldNote: "The room can be smaller. You do not have to fill every silence.",
    activities: [
      { action: "Lower one sound or put one notification on quiet.", reason: "A softer room can make space without asking anything of you." },
      { action: "Turn your phone face down for one song.", reason: "A brief pause keeps the quiet yours." },
      { action: "Spend two minutes with no new input, if that feels good.", reason: "A little blank space can be the whole activity." },
    ],
    permission: "Cancel one thing. Keep the warm drink.",
    names: ["The Quiet Little Planet", "The Soft Exit", "The Blanket Observatory"],
    palette: [["Linen Hush", "#e8e0f3"], ["Blue Hour", "#6d789a"], ["Night Window", "#30374f"]],
    sounds: ["felt piano after everyone has gone home", "a slow synth glow and rain on a faraway window", "one guitar note, then plenty of room"],
    quotes: ["The meeting has been replaced by a lamp and a blanket.", "I am not ignoring the world. I am letting it buffer.", "Today I choose the small, quiet yes."],
    accent: "#6d789a",
  },
  confetti: {
    label: "Confetti Emergency",
    pickerPrompt: "Choose the fun idea before it schedules a meeting.",
    fieldNote: "The day has become a very small parade. Traffic rules are now interpretive.",
    activities: [
      { action: "Play a song you already know makes you grin.", reason: "A tiny parade can begin with one button." },
      { action: "Tell someone about one nice thing that happened.", reason: "Good news gets to travel without a full parade permit." },
      { action: "Take five minutes for the fun idea you keep postponing.", reason: "A little celebration gives the bright energy somewhere to go." },
    ],
    permission: "Do the fun idea before it turns into an email.",
    names: ["The Extremely Small Parade", "The Glitter Situation", "The Party Hat Protocol"],
    palette: [["Party Pop", "#ed4e52"], ["Electric Blue", "#395ae2"], ["Lemon Alert", "#f1ca4a"]],
    sounds: ["handclaps, bright brass, and a suspiciously festive kazoo", "a tiny marching band with excellent intentions", "upbeat synths doing cartwheels in the hallway"],
    quotes: ["This could have been a normal afternoon. It chose confetti.", "Alert: one good idea has escaped containment.", "Please remain calm. The party hats are under control."],
    accent: "#ed4e52",
  },
  midnight: {
    label: "Midnight Radio",
    pickerPrompt: "Tune in to the thought that sounds kindest right now.",
    fieldNote: "The world has turned its volume down. The good thoughts get the aux.",
    activities: [
      { action: "Turn on one small light or move closer to it.", reason: "A little signal can make the room feel easier to be in." },
      { action: "Write one thought down, then leave it there for now.", reason: "The radio can stop repeating once the thought has a place." },
      { action: "Set out one thing that would make tomorrow simpler.", reason: "A quiet signal to future-you is enough for tonight." },
    ],
    permission: "Keep one little light on. Everything else can wait for morning.",
    names: ["The Midnight Frequency", "The Lamp-Lit Broadcast", "The 2 A.M. Postcard"],
    palette: [["Ink Blue", "#343d65"], ["Moonmilk", "#dedcf0"], ["Signal Gold", "#d8b76a"]],
    sounds: ["a distant piano with the lights low", "slow synths drifting past a moonlit window", "a midnight broadcast between soft guitar notes"],
    quotes: ["The night shift is one lamp and a very good thought.", "Currently tuned to: no rush, just stars.", "Tomorrow can leave a message after the moon."],
    accent: "#596487",
  },
  jolt: {
    label: "Joy Jolt",
    pickerPrompt: "Catch the good spark. No choreography required.",
    fieldNote: "A bright little spark has taken the wheel. The day is trying to keep up.",
    activities: [
      { action: "Save the song that matches this little lift.", reason: "A spark is easier to find again when it has a soundtrack." },
      { action: "Move around for one chorus, however you like.", reason: "A small burst of joy can use a tiny dance floor." },
      { action: "Do one fun thing you can finish in five minutes.", reason: "A quick victory lap lets the good energy land." },
    ],
    permission: "Put the good song on immediately. Dancing is optional but encouraged.",
    names: ["The Pocket Disco", "The Sudden Good Mood", "The Tiny Victory Lap"],
    palette: [["Peel-Out Pink", "#ed5a87"], ["Lime Pop", "#9ebd42"], ["Electric Lilac", "#7956c8"]],
    sounds: ["bright synths and a bassline with excellent news", "a handclap parade with room to wiggle", "disco strings sprinting toward the good part"],
    quotes: ["The floor has been promoted to dance partner.", "A small win has acquired a very large soundtrack.", "Please hold. Joy is doing a lap around the room."],
    accent: "#c34d87",
  },
};

const moodTracks = {
  sunny: [{ title: "Lovely Day", artist: "Bill Withers" }, { title: "Walking on a Dream", artist: "Empire of the Sun" }, { title: "You Make My Dreams", artist: "Daryl Hall & John Oates" }],
  soft: [{ title: "Mystery of Love", artist: "Sufjan Stevens" }, { title: "Pink + White", artist: "Frank Ocean" }, { title: "Fade Into You", artist: "Mazzy Star" }],
  restless: [{ title: "1901", artist: "Phoenix" }, { title: "Lisztomania", artist: "Phoenix" }, { title: "Go!", artist: "The Chemical Brothers feat. Q-Tip" }],
  main: [{ title: "Dog Days Are Over", artist: "Florence + The Machine" }, { title: "Vogue", artist: "Madonna" }, { title: "Run the World (Girls)", artist: "Beyoncé" }],
  low: [{ title: "A Walk", artist: "Tycho" }, { title: "Tadow", artist: "Masego & FKJ" }, { title: "The Less I Know the Better", artist: "Tame Impala" }],
  hopeful: [{ title: "First Day of My Life", artist: "Bright Eyes" }, { title: "Here Comes the Sun", artist: "The Beatles" }, { title: "Put Your Records On", artist: "Corinne Bailey Rae" }],
  social: [{ title: "Music Sounds Better with You", artist: "Stardust" }, { title: "Murder on the Dancefloor", artist: "Sophie Ellis-Bextor" }, { title: "September", artist: "Earth, Wind & Fire" }],
  chaos: [{ title: "Block Rockin’ Beats", artist: "The Chemical Brothers" }, { title: "B.O.B.", artist: "OutKast" }, { title: "Sabotage", artist: "Beastie Boys" }],
  hush: [{ title: "Weightless", artist: "Marconi Union" }, { title: "An Ending (Ascent)", artist: "Brian Eno" }, { title: "Near Light", artist: "Ólafur Arnalds" }],
  confetti: [{ title: "D.A.N.C.E.", artist: "Justice" }, { title: "Hey Ya!", artist: "OutKast" }, { title: "Pump It", artist: "The Black Eyed Peas" }],
  midnight: [{ title: "An Ending (Ascent)", artist: "Brian Eno" }, { title: "Weightless", artist: "Marconi Union" }, { title: "Near Light", artist: "Ólafur Arnalds" }],
  jolt: [{ title: "September", artist: "Earth, Wind & Fire" }, { title: "D.A.N.C.E.", artist: "Justice" }, { title: "Lovely Day", artist: "Bill Withers" }],
};

const dialCopy = {
  sunny: { levels: ["barely a glimmer", "little spark", "sunny-side up", "all windows open", "confetti forecast"], ends: ["A tiny ray", "Maximum sunshine"] },
  soft: { levels: ["nearly a whisper", "gentle rustle", "cozy enough", "extra blanket", "hibernation mode"], ends: ["Barely stirring", "Deep in the duvet"] },
  restless: { levels: ["foot tapping", "one small lap", "ready to roam", "doorway pacing", "missed-train sprint"], ends: ["Can sit still", "Out the door"] },
  main: { levels: ["quiet cameo", "good lighting", "leading role", "red carpet walk", "final-scene close-up"], ends: ["Understated", "Cue the soundtrack"] },
  low: { levels: ["save mode", "one bar left", "tea is enough", "a little recharge", "surprisingly spry"], ends: ["Power saver", "Fully recharged"] },
  hopeful: { levels: ["a small maybe", "first green shoot", "looking up", "sun through clouds", "new chapter energy"], ends: ["Just a hint", "Bright horizon"] },
  social: { levels: ["wave from afar", "one good chat", "happy to be here", "stay for dessert", "dance-floor cameo"], ends: ["Quiet corner", "One more song"] },
  chaos: { levels: ["one loose thread", "mild plot twist", "organized-ish", "beautiful mayhem", "tiny hat on everything"], ends: ["Lightly seasoned", "Full confetti"] },
  hush: { levels: ["barely a breath", "soft corners", "quiet enough", "library-level hush", "vanished into a blanket"], ends: ["A soft landing", "Deep quiet"] },
  confetti: { levels: ["one sparkle", "party pending", "tiny parade", "confetti weather", "emergency kazoo"], ends: ["Just a shimmer", "Confetti alert"] },
  midnight: { levels: ["moon on the dial", "late-night glow", "radio hush", "after-hours drift", "stars in the static"], ends: ["One small lamp", "Night signal"] },
  jolt: { levels: ["one bright spark", "good-news tingle", "tiny victory dance", "joy on the move", "full happy sprint"], ends: ["A little lift", "Joy at full volume"] },
};
const endpointMoodKeys = { quiet: ["hush", "midnight"], bright: ["confetti", "jolt"] };
const secretMoodDetails = {
  hush: { number: "09", mark: "…", zone: "quiet" },
  confetti: { number: "10", mark: "!!!", zone: "bright" },
  midnight: { number: "11", mark: "☾", zone: "quiet" },
  jolt: { number: "12", mark: "✦", zone: "bright" },
};
let latestText = "";

function fadeAudio(audio, from, to, duration, transition) {
  const start = performance.now();
  const tick = (now) => {
    if (transition !== audioTransition) return;
    const progress = Math.min(1, (now - start) / duration);
    audio.volume = from + (to - from) * progress;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
async function crossfadeTo(target, source) {
  const transition = ++audioTransition;
  target.pause();
  target.currentTime = 0;
  target.volume = 0;
  try {
    await target.play();
  } catch {
    boardStatus.textContent = "Your browser blocked audio. Use the sound button to try again.";
    return;
  }
  if (source && source !== target && !source.paused) fadeAudio(source, source.volume, 0, 650, transition);
  fadeAudio(target, 0, 0.28, 650, transition);
  activeAudio = target;
  window.setTimeout(() => {
    if (transition !== audioTransition) return;
    if (source && source !== target) { source.pause(); source.currentTime = 0; }
  }, 700);
}
function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.textContent = enabled ? "Sound on" : "Sound off";
  soundToggle.setAttribute("aria-label", enabled ? "Turn music off" : "Turn music on");
}
async function startBackgroundMusic() {
  setMusicEnabled(true);
  await crossfadeTo(backgroundAudio, activeAudio);
}
function playMoodMusic(moodKey) {
  if (!musicEnabled) return;
  moodAudio.src = moodAudioFiles[moodKey];
  crossfadeTo(moodAudio, activeAudio);
}
function stopMusic() {
  const transition = ++audioTransition;
  [backgroundAudio, moodAudio].forEach((audio) => {
    if (audio.paused) return;
    fadeAudio(audio, audio.volume, 0, 450, transition);
    window.setTimeout(() => {
      if (transition !== audioTransition) return;
      audio.pause();
      audio.currentTime = 0;
    }, 500);
  });
  activeAudio = null;
}

function playExtremeSound(zone) {
  if (!musicEnabled) return;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;
  if (!effectContext) effectContext = new AudioContextConstructor();
  if (effectContext.state === "suspended") effectContext.resume().catch(() => {});

  const notes = zone === "quiet"
    ? [{ frequency: 587.33, delay: 0, duration: 0.58 }, { frequency: 392, delay: 0.16, duration: 0.72 }]
    : [{ frequency: 659.25, delay: 0, duration: 0.3 }, { frequency: 880, delay: 0.1, duration: 0.36 }, { frequency: 1174.66, delay: 0.2, duration: 0.48 }];
  const volume = zone === "quiet" ? 0.045 : 0.065;
  notes.forEach(({ frequency, delay, duration }) => {
    const oscillator = effectContext.createOscillator();
    const gain = effectContext.createGain();
    const start = effectContext.currentTime + delay;
    oscillator.type = zone === "quiet" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(effectContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  });
}

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function selectedMood() {
  const selected = moodForm.elements.mood.value;
  return moods[selected] ? selected : "sunny";
}

function updateDialCopy() {
  const copy = dialCopy[selectedMood()];
  const level = Number(intensityInput.value) - 1;
  intensityValue.value = `${intensityInput.value} / 5 · ${copy.levels[level]}`;
  intensityValue.textContent = intensityValue.value;
  rangeLow.textContent = copy.ends[0];
  rangeHigh.textContent = copy.ends[1];
  pickerMoodNote.textContent = moods[selectedMood()].pickerPrompt;
}
function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
function addSecretMoodOption(key) {
  if (unlockedSecretMoods.has(key)) return;
  unlockedSecretMoods.add(key);
  const details = secretMoodDetails[key];
  const option = document.createElement("label");
  option.className = `mood-option mood-secret mood-secret-${key}`;
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "mood";
  radio.value = key;
  const number = document.createElement("span");
  number.className = "mood-number";
  number.textContent = details.number;
  const label = document.createElement("span");
  label.className = "mood-label";
  label.textContent = moods[key].label;
  const mark = document.createElement("span");
  mark.className = "mood-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = details.mark;
  option.append(radio, number, label, mark);
  document.querySelector(".mood-options").append(option);
  moodOptions = [...document.querySelectorAll('input[name="mood"]')];
  radio.addEventListener("change", updateSelection);
}
function unlockExtremeMoods(zone) {
  const added = endpointMoodKeys[zone].filter((key) => {
    if (unlockedSecretMoods.has(key)) return false;
    addSecretMoodOption(key);
    return true;
  });
  if (!added.length) return;
  secretUnlock.hidden = false;
  const labels = added.map((key) => moods[key].label);
  const endLabel = zone === "quiet" ? "quiet end" : "bright end";
  secretUnlock.textContent = `Secret moods unlocked at the ${endLabel}: ${labels.join(" and ")}. Choose one if it fits; your current mood stays selected.`;
  replayAnimation(secretUnlock, "is-secret-unlocking");
}
function resetExtremeMoods(zone) {
  const keys = endpointMoodKeys[zone];
  const wasSelected = keys.includes(selectedMood());
  const removed = keys.filter((key) => unlockedSecretMoods.delete(key));
  removed.forEach((key) => {
    document.querySelector(`input[name="mood"][value="${key}"]`)?.closest(".mood-option")?.remove();
  });
  moodOptions = [...document.querySelectorAll('input[name="mood"]')];
  if (!removed.length) return;

  if (wasSelected) {
    const fallback = document.querySelector(`input[name="mood"][value="${lastRegularMood}"]`) || document.querySelector('input[name="mood"][value="sunny"]');
    fallback.checked = true;
  }
  const labels = removed.map((key) => moods[key].label);
  secretUnlock.hidden = false;
  secretUnlock.textContent = `${labels.join(" and ")} tucked away. Return to this dial extreme and hold for a moment to unlock them again.`;
  replayAnimation(secretUnlock, "is-secret-unlocking");
  if (wasSelected) updateSelection();
}
function currentExtremeZone() {
  const value = Number(intensityInput.value);
  return value === 1 ? "quiet" : value === 5 ? "bright" : null;
}
function updateExtremeDialState() {
  window.clearTimeout(endpointTimer);
  const nextZone = currentExtremeZone();
  if (nextZone !== activeExtremeZone) {
    const previousZone = activeExtremeZone;
    activeExtremeZone = nextZone;
    if (previousZone) resetExtremeMoods(previousZone);
    if (nextZone) playExtremeSound(nextZone);
  }
  if (!nextZone || endpointMoodKeys[nextZone].every((key) => unlockedSecretMoods.has(key))) return;
  endpointTimer = window.setTimeout(() => {
    if (activeExtremeZone === nextZone && currentExtremeZone() === nextZone) unlockExtremeMoods(nextZone);
  }, 700);
}
function updateSelection() {
  const selected = selectedMood();
  if (!secretMoodDetails[selected]) lastRegularMood = selected;
  moodOptions.forEach((input) => input.closest(".mood-option").classList.toggle("is-selected", input.checked));
  const mood = moods[selected];
  board.dataset.mood = selected;
  board.style.setProperty("--board-accent", mood.accent);
  replayAnimation(board, "is-mood-switching");
  updateDialCopy();
  replayAnimation(intensityValue, "is-dial-changing");
  boardStatus.textContent = latestText ? "Mood changed. Make a fresh board when ready." : "Mood picked. Set its volume, then make a board.";
}

function renderPalette(palette) {
  swatches.replaceChildren();
  palette.forEach(([name, color]) => {
    const item = document.createElement("li");
    item.className = "swatch";
    const chip = document.createElement("span");
    chip.className = "swatch-color";
    chip.style.backgroundColor = color;
    chip.setAttribute("aria-hidden", "true");
    const caption = document.createElement("span");
    caption.className = "swatch-name";
    caption.textContent = `${name} ${color}`;
    item.append(chip, caption);
    swatches.append(item);
  });
}

function plainResultText() {
  const paletteText = [...swatches.querySelectorAll(".swatch-name")].map((node) => node.textContent).join(", ");
  return `${boardTitle.textContent}\nField note: ${boardSubtitle.textContent}\nOne small thing: ${activityAction.textContent}\nWhy it fits: ${activityReason.textContent}\nPermission slip: ${permissionCopy.textContent}\nPalette: ${paletteText}\nSoundtrack: ${soundtrack.textContent}\nTrack recommendation: ${trackRecommendation.textContent}\n${moodQuote.textContent}`;
}

function generate() {
  const mood = moods[selectedMood()];
  const intensity = Math.min(5, Math.max(1, Number(intensityInput.value) || 3));
  const volume = dialCopy[selectedMood()].levels[intensity - 1];
  const activityBand = intensity <= 2 ? 0 : intensity === 3 ? 1 : 2;
  const activity = mood.activities[activityBand];

  board.dataset.mood = selectedMood();
  board.style.setProperty("--board-accent", mood.accent);
  boardIntro.textContent = `${mood.label} / ${volume.toUpperCase()}`;
  boardTitle.textContent = choose(mood.names);
  boardSubtitle.textContent = mood.fieldNote;
  permissionCopy.textContent = mood.permission;
  permissionSlip.hidden = false;
  activityAction.textContent = activity.action;
  activityReason.textContent = activity.reason;
  activityBlock.hidden = false;
  replayAnimation(boardContent, "is-result-arriving");
  renderPalette(mood.palette);
  soundtrack.textContent = `${volume} ${choose(mood.sounds)}`;
  const track = choose(moodTracks[selectedMood()]);
  trackRecommendation.textContent = `Try: “${track.title}”, by ${track.artist}`;
  moodQuote.textContent = `“${choose(mood.quotes)}”`;
  paletteBlock.hidden = false;
  soundBlock.hidden = false;
  moodQuote.hidden = false;
  latestText = plainResultText();
  boardStatus.textContent = musicEnabled ? "Your board is ready. Copy it or pass it along." : "Your board is ready. Turn sound on for its mood music.";
  playMoodMusic(selectedMood());
  copyButton.disabled = false;
  shareButton.disabled = false;
  againButton.disabled = false;
}

async function copyBoard() {
  if (!latestText) return false;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable");
    await navigator.clipboard.writeText(latestText);
    boardStatus.textContent = "Moodboard copied to your clipboard.";
    return true;
  } catch {
    boardStatus.textContent = "Clipboard access is unavailable. Select the board text to copy it.";
    return false;
  }
}

soundToggle.addEventListener("click", () => {
  if (musicEnabled) {
    setMusicEnabled(false);
    stopMusic();
  } else {
    startBackgroundMusic();
  }
});
moodOptions.forEach((input) => input.addEventListener("change", updateSelection));
intensityInput.addEventListener("input", () => {
  updateExtremeDialState();
  updateDialCopy();
  replayAnimation(intensityValue, "is-dial-changing");
  if (latestText) boardStatus.textContent = "Volume changed. Make a fresh board to update it.";
});
moodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});
againButton.addEventListener("click", generate);
copyButton.addEventListener("click", copyBoard);
shareButton.addEventListener("click", async () => {
  if (!latestText) return;
  if (typeof navigator.share !== "function") {
    const copied = await copyBoard();
    if (copied) boardStatus.textContent = "Sharing is unavailable here. Moodboard copied instead.";
    return;
  }
  try {
    await navigator.share({ title: "My MoodMatch board", text: latestText, url: "https://moodmatch.site.je/" });
    boardStatus.textContent = "Moodboard shared.";
  } catch (error) {
    if (error.name === "AbortError") {
      boardStatus.textContent = "Share closed. Your board is still here.";
      return;
    }
    await copyBoard();
  }
});

updateSelection();
