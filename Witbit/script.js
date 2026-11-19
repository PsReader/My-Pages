const tools = [...document.querySelectorAll("[data-tool]")];
const panels = [...document.querySelectorAll("[data-panel]")];
const resultCard = document.querySelector(".result-card");
const resultText = document.querySelector("#result-text");
const resultStatus = document.querySelector("#result-status");
const copyButton = document.querySelector("#copy-button");
const saveButton = document.querySelector("#save-button");
const againButton = document.querySelector("#again-button");
const soundButton = document.querySelector("#sound-button");
const resultContext = document.querySelector("#result-context");
const contextEtymology = document.querySelector("#context-etymology");
const contextHeading = document.querySelector("#context-heading");
const cardIndex = document.querySelector("#card-index");
const particleLayer = document.querySelector("#particle-layer");
const shelfList = document.querySelector("#shelf-list");
const shelfEmpty = document.querySelector("#shelf-empty");
const shelfCount = document.querySelector("#shelf-count");
const shelfStorageKey = "witbit.saved-ideas.v1";
const drawerNames = Object.fromEntries(tools.map((tool) => [tool.dataset.tool, tool.querySelector(".entry-title")?.textContent.trim() || tool.dataset.tool]));

let activeTool = "quest";
let lastResult = "";
let generationTimer;

function readSavedIdeas() {
  try {
    const saved = JSON.parse(localStorage.getItem(shelfStorageKey) || "[]");
    return Array.isArray(saved) ? saved.filter((idea) => idea && typeof idea.id === "string" && typeof idea.text === "string" && typeof idea.tool === "string").slice(0, 100) : [];
  } catch {
    return [];
  }
}

let savedIdeas = readSavedIdeas();

function renderShelf() {
  shelfCount.textContent = `${savedIdeas.length} kept`;
  shelfEmpty.hidden = savedIdeas.length > 0;
  shelfList.replaceChildren(...savedIdeas.map((idea) => {
    const item = document.createElement("li");
    item.className = "shelf-item";
    const copy = document.createElement("p");
    copy.className = "shelf-item-text";
    copy.textContent = idea.text;
    const meta = document.createElement("span");
    meta.className = "shelf-item-meta";
    meta.textContent = `${drawerNames[idea.tool] || "An idea"} · ${new Date(idea.savedAt).toLocaleDateString()}`;
    const actions = document.createElement("div");
    actions.className = "shelf-item-actions";
    const copyItem = document.createElement("button");
    copyItem.type = "button";
    copyItem.dataset.shelfAction = "copy";
    copyItem.textContent = "Copy";
    copyItem.setAttribute("aria-label", "Copy saved idea");
    const removeItem = document.createElement("button");
    removeItem.type = "button";
    removeItem.dataset.shelfAction = "remove";
    removeItem.textContent = "Remove";
    removeItem.setAttribute("aria-label", "Remove saved idea");
    actions.append(copyItem, removeItem);
    item.append(meta, copy, actions);
    item.dataset.ideaId = idea.id;
    return item;
  }));
}

function saveCurrentIdea() {
  if (!lastResult) return;
  if (savedIdeas.some((idea) => idea.text === lastResult && idea.tool === activeTool)) {
    resultStatus.textContent = "That thought is already on your shelf.";
    return;
  }
  const nextSaved = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text: lastResult, tool: activeTool, savedAt: new Date().toISOString() }, ...savedIdeas].slice(0, 100);
  try {
    localStorage.setItem(shelfStorageKey, JSON.stringify(nextSaved));
    savedIdeas = nextSaved;
    renderShelf();
    resultStatus.textContent = "Kept on your shelf on this device.";
  } catch {
    resultStatus.textContent = "The shelf could not save here. Check this browser's storage settings.";
  }
}

async function copyShelfIdea(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = text;
    temporaryField.setAttribute("readonly", "");
    temporaryField.style.position = "fixed";
    temporaryField.style.opacity = "0";
    document.body.append(temporaryField);
    temporaryField.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { /* Clipboard access may be unavailable. */ }
    temporaryField.remove();
    return copied;
  }
}

function handleShelfAction(event) {
  const button = event.target.closest("button[data-shelf-action]");
  const item = button?.closest(".shelf-item");
  if (!button || !item) return;
  const idea = savedIdeas.find((entry) => entry.id === item.dataset.ideaId);
  if (!idea) return;
  if (button.dataset.shelfAction === "copy") {
    void copyShelfIdea(idea.text).then((copied) => {
      resultStatus.textContent = copied ? "Copied from your shelf." : "Copying is unavailable here. Select the idea text to keep it.";
    });
    return;
  }
  const nextSaved = savedIdeas.filter((entry) => entry.id !== idea.id);
  try {
    localStorage.setItem(shelfStorageKey, JSON.stringify(nextSaved));
    savedIdeas = nextSaved;
    renderShelf();
    resultStatus.textContent = "Removed from your shelf.";
  } catch {
    resultStatus.textContent = "Could not update the shelf. Check this browser's storage settings.";
  }
}

renderShelf();
shelfList.addEventListener("click", handleShelfAction);
saveButton.addEventListener("click", saveCurrentIdea);

const choice = (items) => items[Math.floor(Math.random() * items.length)];

const particleGlyphs = { drawer: ["✳", "·", "✦", "↝"], trap: ["!", "✳", "×", "⚠"] };

function burstParticles(kind = "drawer", count = kind === "trap" ? 24 : 14) {
  if (!particleLayer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const glyphs = particleGlyphs[kind] ?? particleGlyphs.drawer;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.55;
    const distance = (kind === "trap" ? 90 : 55) + Math.random() * (kind === "trap" ? 125 : 85);
    particle.className = `particle particle-${kind}`;
    particle.textContent = choice(glyphs);
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--rotate", `${Math.round(Math.random() * 260 - 130)}deg`);
    particle.style.setProperty("--delay", `${Math.round(Math.random() * 90)}ms`);
    fragment.append(particle);
  }
  particleLayer.replaceChildren(fragment);
  window.setTimeout(() => particleLayer.replaceChildren(), kind === "trap" ? 1200 : 980);
}

function animateTrap() {
  resultCard.classList.remove("is-trap-triggered");
  void resultCard.offsetWidth;
  resultCard.classList.add("is-trap-triggered");
  window.setTimeout(() => resultCard.classList.remove("is-trap-triggered"), 620);
  burstParticles("trap");
}

const questOpeners = {
  gentle: "A quiet afternoon becomes an adventure when you decide to",
  mysterious: "A folded note invites you to",
  whimsical: "Before the kettle boils, you are challenged to",
  adventurous: "At first light, you set out to",
  tender: "Someone has left a little space in the day for you to",
  eerie: "Just after the last light, you notice you must",
  sunny: "With the kind of grin that causes trouble, you decide to",
  stormy: "While the rain rehearses against the windows, you set out to",
};

const questTasks = {
  kindness: ["return a lost mitten", "leave a lantern for a traveler", "deliver a warm loaf to the lighthouse keeper", "mend a neighbor's wind chime", "water the window box of someone away", "mail a letter with no return address"],
  discovery: ["find who has been leaving tiny doors in tree trunks", "follow a trail of blue petals", "discover why the town bell rings at noon", "map the warmest stone in the whole town", "learn why gulls gather at the empty pier", "find the staircase chalked behind the market"],
  challenge: ["beat the runaway wheelbarrow to the bridge", "collect three unusual stories", "teach a sleepy dragon to whistle", "cross town without stepping on a single crack", "build the tallest tower from found objects", "win a staring contest with the statue in the square"],
  promise: ["return a library book borrowed long ago", "find the name missing from an old map", "deliver a pressed flower to its sender", "keep watch for the first star", "replace the missing button on a stranger's coat", "finish the walk someone started years ago"],
  mischief: ["swap the labels in the baker's pantry", "leave a trail of paper stars", "teach the clock one new chime", "hide a tiny crown in plain sight", "put a bow on the most ordinary object you can find", "invent a secret handshake for strangers"],
  making: ["build a weather vane from scraps", "draw a map of the neighborhood's sounds", "stitch a flag for an imaginary country", "make a gift from the things in your pockets", "bake something shaped like the moon", "carve a sign for a place that does not exist"],
};

const questCompanions = [
  "on your own",
  "with a friend",
  "with an overly confident pigeon",
  "with the quiet neighbor",
  "with an old dog",
  "with a child carrying a red umbrella",
  "with the person who left the note",
  "with three very determined ducks",
];

function buildQuest(form) {
  const kind = form.elements.kind.value;
  const place = form.elements.place.value;
  const mood = form.elements.mood.value;
  const companion = form.elements.companion?.value ?? choice(questCompanions);
  return `${questOpeners[mood] ?? questOpeners.gentle} ${choice(questTasks[kind] ?? questTasks.kindness)} ${place} ${companion}.`;
}

const nameParts = {
  whimsical: {
    first: ["Pippa", "Bramble", "Milo", "Tansy", "Wicket", "Clover", "Puddle", "Marnie"],
    second: ["Button", "Bumble", "Thimble", "Muffin", "Pebble", "Noodle", "Doodle", "Pip"],
    game: ["Button Moon", "Puddle Parade", "Muffin Quest", "Bumble Garden", "Noodle Knights", "Doodle Cove"],
  },
  mysterious: {
    first: ["Morrow", "Vesper", "Sable", "Orin", "Hollow", "Nyx", "Vale", "Briar"],
    second: ["Hush", "Gloam", "Rook", "Mist", "Moth", "Fable", "Shiver", "Wren"],
    game: ["The Hollow Signal", "Moth at Midnight", "The Gloam Door", "Rook & Ruin", "The Vesper Map", "House of Hush"],
  },
  cozy: {
    first: ["Maple", "Honey", "Marlow", "Juniper", "Mabel", "Sunday", "Fern", "Poppy"],
    second: ["Cottage", "Mittens", "Crumb", "Lantern", "Kettle", "Hearth", "Mallow", "Button"],
    game: ["Lantern & Kettle", "Maplewood Days", "The Mallow House", "Sunday at Fern Hill", "Hearthside", "Poppy's Attic"],
  },
  grand: {
    first: ["Aurelia", "Magnus", "Celestine", "Octavian", "Belladonna", "Maximilian", "Seraphina", "Cornelius"],
    second: ["the Unfathomable", "of the Far Shore", "the Radiant", "of Seven Hills", "the Unreasonably Tall", "of the Moonlit Vale", "the Magnificent", "of the Last Teacup"],
    game: ["The Last Teacup", "Seven Hills", "The Far Shore", "The Radiant Kingdom", "A Most Magnificent Quest", "The Unfathomable"],
  },
  japanese: {
    first: ["Haru", "Aiko", "Ren", "Yuki", "Sora", "Kaito", "Emi", "Nori"],
    second: ["Mori", "Hoshi", "Kawa", "Tanaka", "Watanabe", "Arai", "Sato", "Kurosawa"],
    game: ["Yume no Tabi", "Tsuki no Michi", "Hoshi no Kage", "Kitsune no Mori", "Sora no Hibana", "Umi no Kioku"],
  },
  chinese: {
    first: ["Mei", "Wei", "Lin", "Jun", "Xiu", "Tao", "Lan", "Ming"],
    second: ["Chen", "Zhao", "Li", "Wang", "Qiao", "Shen", "Xu", "Zhang"],
    game: ["Yue Guang Zhi Lu", "Xing He Zhi Men", "Feng Zhi Gu", "Long De Meng", "Hua Hai Mi Jing", "Tao Hua Yuan"],
  },
  korean: {
    first: ["Hana", "Joon", "Min", "Ara", "Dae", "Soo", "Nari", "Jiho"],
    second: ["Han", "Park", "Choi", "Yoon", "Seo", "Kang", "Baek", "Hwang"],
    game: ["Dalbit Gil", "Byeolui Norae", "Baramui Maeum", "Gumiho-ui Bimil", "Haneul Yeon", "Bichui Gijeok"],
  },
  latin: {
    first: ["Aurelia", "Lucius", "Cassia", "Felix", "Octavia", "Marcellus", "Livia", "Titus"],
    second: ["Valerius", "Severus", "Marinus", "Faustus", "Drusus", "Sabinus", "Maximus", "Rufus"],
    game: ["Via Astrum", "Luna Aeterna", "Mare Tenebris", "Regnum Umbrae", "Silva Arcana", "Fatum Novum"],
  },
  greek: {
    first: ["Thalia", "Nikos", "Eleni", "Orion", "Daphne", "Leon", "Calliope", "Theo"],
    second: ["Aster", "Pappas", "Dorian", "Selene", "Lysander", "Photius", "Helios", "Kallias"],
    game: ["Asteri Nychta", "Dromos Helios", "Nisi Ton Asteron", "Skia Kai Fos", "Mytos", "Kipos Ton Theon"],
  },
  german: {
    first: ["Greta", "Otto", "Anika", "Klaus", "Liesel", "Emil", "Hilda", "Friedrich"],
    second: ["Berg", "Adler", "Falk", "Stein", "Vogel", "Keller", "Bauer", "Winter"],
    game: ["Nachtwald", "Sternenpfad", "Wolkenhafen", "Fuchstal", "Mondgarten", "Eisenherz"],
  },
  french: {
    first: ["Colette", "Lucien", "Mireille", "Marcel", "Anais", "Remy", "Solene", "Gaston"],
    second: ["Moreau", "Bellamy", "Laurent", "Beaufort", "Delacroix", "Duvall", "Fontaine", "Mercier"],
    game: ["La Nuit des Étoiles", "Le Jardin Perdu", "Sous la Lune", "La Dernière Clé", "Rêve d'Été", "Le Petit Royaume"],
  },
  italian: {
    first: ["Bianca", "Luca", "Giulia", "Enzo", "Chiara", "Matteo", "Lucia", "Dante"],
    second: ["Rossi", "Moretti", "Bellini", "Ferraro", "Marino", "Conti", "Romano", "Fiore"],
    game: ["Via della Luna", "Il Giardino Segreto", "La Città Perduta", "Sotto le Stelle", "Il Cuore del Bosco", "L'Ultima Porta"],
  },
  spanish: {
    first: ["Alba", "Mateo", "Lucia", "Diego", "Ines", "Rafael", "Pilar", "Tomas"],
    second: ["Sol", "Vega", "Cruz", "Navarro", "Marquez", "Castillo", "Reyes", "Valera"],
    game: ["Camino de Luna", "La Isla Perdida", "Bajo las Estrellas", "El Jardín Secreto", "Corazón del Bosque", "La Última Puerta"],
  },
};

const regionalTraditions = new Set(["japanese", "chinese", "korean", "latin", "greek", "german", "french", "italian", "spanish"]);
const familyNameFirstTraditions = new Set(["japanese", "chinese", "korean"]);


const nameMeanings = {
  whimsical: { Pippa: "small and bright", Bramble: "a wild, protective thicket", Milo: "merciful and gentle", Tansy: "immortality; a golden flower", Wicket: "a little gate", Clover: "good fortune", Puddle: "a small pool", Marnie: "of the sea", Button: "a tiny fastener", Bumble: "to buzz and bustle", Thimble: "a small maker's shield", Muffin: "a warm little cake", Pebble: "a smooth stone", Noodle: "a wonderfully wobbly thing", Doodle: "a playful sketch", Pip: "a tiny seed", "Button Moon": "a small moon made for keeping" },
  mysterious: { Morrow: "the day that comes next", Vesper: "evening star or prayer", Sable: "black; dark-furred", Orin: "pale green; pine tree", Hollow: "an empty place with an echo", Nyx: "night", Vale: "a sheltered valley", Briar: "a thorny wild rose", Hush: "silence", Gloam: "twilight", Rook: "a clever black bird", Mist: "fine suspended rain", Moth: "one drawn to the hidden light", Fable: "a story with a lesson", Shiver: "a small tremor", Wren: "a tiny songbird" },
  cozy: { Maple: "a tree with sweet sap", Honey: "sweetness and care", Marlow: "driftwood by the water", Juniper: "a young evergreen", Mabel: "lovable", Sunday: "a day of rest", Fern: "a shade-loving green", Poppy: "a red flower of remembrance", Cottage: "a small country home", Mittens: "warm hands", Crumb: "a little piece left over", Lantern: "a portable light", Kettle: "a vessel for warmth", Hearth: "the heart of the home", Mallow: "soft and soothing", Button: "a tiny fastener" },
  grand: { Aurelia: "golden", Magnus: "great", Celestine: "heavenly", Octavian: "eighth-born", Belladonna: "beautiful lady", Maximilian: "the greatest", Seraphina: "fiery and angelic", Cornelius: "of the horn", Unfathomable: "too deep to measure", Radiant: "shining brightly", "Seven Hills": "a city or realm raised on seven heights", "Far Shore": "the distant edge of the known world", Magnificent: "splendid beyond ordinary scale" },
  japanese: { Haru: "spring", Aiko: "beloved child", Ren: "lotus", Yuki: "snow or happiness", Sora: "sky", Kaito: "ocean flight", Emi: "beautiful blessing", Nori: "law or tradition", Mori: "forest", Hoshi: "star", Kawa: "river", Tanaka: "in the middle of the rice fields", Watanabe: "crossing the boundary", Arai: "new well", Sato: "village wisteria", Kurosawa: "black marsh" },
  chinese: { Mei: "beautiful", Wei: "greatness or protective power", Lin: "forest", Jun: "handsome or truthful", Xiu: "elegant", Tao: "peach or way", Lan: "orchid", Ming: "bright", Chen: "morning", Zhao: "to shine", Li: "plum or strength", Wang: "king", Qiao: "tall and graceful", Shen: "deep", Xu: "slowly rising", Zhang: "to stretch or open" },
  korean: { Hana: "one", Joon: "talented", Min: "clever or quick", Ara: "beautiful", Dae: "great", Soo: "excellent or water", Nari: "lily", Jiho: "wisdom and greatness", Han: "great or one", Park: "gourd", Choi: "high or pinnacle", Yoon: "allowing light", Seo: "auspicious", Kang: "strong", Baek: "white", Hwang: "yellow or bright" },
  latin: { Aurelia: "golden", Lucius: "light", Cassia: "cinnamon", Felix: "fortunate", Octavia: "eighth-born", Marcellus: "little warrior", Livia: "blue or envious", Titus: "honorable", Valerius: "strong and healthy", Severus: "stern", Marinus: "of the sea", Faustus: "fortunate", Drusus: "strong", Sabinus: "of the Sabines", Maximus: "greatest", Rufus: "red-haired" },
  greek: { Thalia: "to blossom", Nikos: "victory of the people", Eleni: "bright light", Orion: "hunter", Daphne: "laurel", Leon: "lion", Calliope: "beautiful voice", Theo: "gift of the gods", Aster: "star", Pappas: "priest or father", Dorian: "of Doris", Selene: "moon", Lysander: "liberator", Photius: "light", Helios: "sun", Kallias: "beautiful" },
  german: { Greta: "pearl", Otto: "wealth and fortune", Anika: "grace", Klaus: "victory of the people", Liesel: "pledged to the divine", Emil: "rival or eager", Hilda: "battle maid", Friedrich: "peaceful ruler", Berg: "mountain", Adler: "eagle", Falk: "falcon", Stein: "stone", Vogel: "bird", Keller: "cellar keeper", Bauer: "farmer", Winter: "winter" },
  french: { Colette: "victory of the people", Lucien: "light", Mireille: "to admire", Marcel: "little warrior", Anais: "grace", Remy: "oarsman", Solene: "solemn or dignified", Gaston: "guest or stranger", Moreau: "dark-haired", Bellamy: "beautiful friend", Laurent: "laurel", Beaufort: "beautiful fortress", Delacroix: "of the cross", Duvall: "from the valley", Fontaine: "fountain", Mercier: "merchant" },
  italian: { Bianca: "white and bright", Luca: "light", Giulia: "youthful", Enzo: "home ruler", Chiara: "clear and bright", Matteo: "gift of God", Lucia: "light", Dante: "enduring", Rossi: "red-haired", Moretti: "dark-haired", Bellini: "beautiful", Ferraro: "worker in iron", Marino: "of the sea", Conti: "count or nobleman", Romano: "Roman", Fiore: "flower" },
  spanish: { Alba: "dawn", Mateo: "gift of God", Lucia: "light", Diego: "teacher or supplanter", Ines: "pure", Rafael: "God has healed", Pilar: "pillar", Tomas: "twin", Sol: "sun", Vega: "meadow", Cruz: "cross", Navarro: "from Navarre", Marquez: "son of Marcos", Castillo: "castle", Reyes: "kings", Valera: "strong or healthy" },
};


function meaningFor(flavor, words) {
  const bank = nameMeanings[flavor] ?? {};
  const meanings = words.map((word) => bank[word]).filter(Boolean);
  return meanings.length ? meanings.join(" + ") : "a name with its own little story";
}

let currentContext = null;
let soundEnabled = false;
let audioContext;

const soundProfiles = { quest: [220, 330], name: [392, 494], story: [262, 196], team: [165, 247], lore: [174, 261], loot: [294, 440], encounter: [110, 207] };
const regionalTimbres = { japanese: 1.18, chinese: 1.05, korean: 0.94, latin: 0.82, greek: 0.76, german: 0.68, french: 1.28, italian: 1.12, spanish: 0.88, folkloric: 1 };
const drawerVoices = { quest: "The afternoon has a loose thread.", name: "A name is waiting to be overheard.", story: "The first sentence is pretending not to be a doorway.", team: "Someone has already made a badge.", lore: "The past left something in the margins.", loot: "The pocket is heavier than it was a moment ago.", encounter: "The road has opinions." };
const encounterRegionNote = document.querySelector("#encounter-region-note");

function updateEncounterPreview(tradition) {
  const profile = encounterTraditions[tradition] ?? encounterTraditions.folkloric;
  if (!encounterRegionNote) return;
  encounterRegionNote.dataset.tradition = tradition;
  encounterRegionNote.querySelector("strong").textContent = profile.label;
  encounterRegionNote.querySelector("span:last-child").textContent = profile.note;
}


function playDrawerCue(tool = activeTool, tradition = "folkloric") {
  if (!soundEnabled && tool !== activeTool) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const profile = soundProfiles[tool] ?? soundProfiles.quest;
  const scale = regionalTimbres[tradition] ?? 1;
  profile.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = tool === "encounter" ? "sawtooth" : tool === "loot" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency * scale, now + index * 0.09);
    gain.gain.setValueAtTime(0.0001, now + index * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.065, now + index * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.32);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * 0.09);
    oscillator.stop(now + index * 0.09 + 0.34);
  });
}


function buildName(form) {
  const kind = form.elements.kind.value;
  const flavor = form.elements.flavor.value;
  const parts = nameParts[flavor] ?? nameParts.whimsical;
  const first = choice(parts.first);
  const second = choice(parts.second);
  let name;
  let words;

  if (kind === "game") {
    name = choice(parts.game ?? [`${first} ${second}`]);
    words = [name];
  } else if (regionalTraditions.has(flavor)) {
    const orderedParts = familyNameFirstTraditions.has(flavor) ? [second, first] : [first, second];
    name = orderedParts.join(" ");
    words = orderedParts;
  } else if (kind === "place") {
    const suffix = choice(["Harbor", "Hollow", "Meadow", "Market", "Isle", "Crossing", "Falls", "Glen"]);
    name = `${first} ${suffix}`;
    words = [first, suffix];
  } else if (kind === "pet") {
    name = choice([`Sir ${first} ${second}`, `Captain ${first}`, `${first} the ${second}`, `Little ${first}`]);
    words = [first, second];
  } else if (kind === "band") {
    name = choice([`The ${first} ${second}s`, `${first} & the ${second}s`, `The ${first} Parade`, `${first} After Dark`]);
    words = [first, second];
  } else if (kind === "group") {
    name = choice([`The ${first} Society`, `${first} Enthusiasts`, `The ${second} Committee`, `${first}'s Spare Room`]);
    words = [first, second];
  } else {
    name = choice([`${first} ${second}`, `${first} ${choice(["Ashford", "Merribell", "Underbough", "Widdershins", "Northcott", "Fableton"])}`, `${first} ${second} ${choice(["III", "the Bold", "of Nowhere", "Next Door"])}`]);
    words = [first, second];
  }

  const meaning = meaningFor(flavor, words);
  const explanation = kind === "game" && meaning === "a name with its own little story"
    ? `generated ${flavor}-inspired title; translation unavailable`
    : meaning;
  currentContext = regionalTraditions.has(flavor) ? { note: `"${name}": ${explanation}.` } : null;
  return `${name} — meaning: ${meaning}.`;
}

const storyBits = {
  "science fiction": {
    places: ["a station where nobody remembers arriving", "the last greenhouse on Mars", "a moon that has started sending postcards"],
    events: ["finds a message hidden inside a meteor", "is asked to return a borrowed star", "discovers the ship's vending machine can predict tomorrow"],
  },
  fantasy: {
    places: ["a village that moves one mile every midnight", "a library built inside a sleeping giant", "a kingdom where the rivers flow uphill"],
    events: ["is hired to return a dragon's library book", "finds a map that only shows places that are missing", "is invited to a royal wedding by mistake"],
  },
  mystery: {
    places: ["a hotel with one extra room on every floor", "a seaside town where every clock is five minutes slow", "a museum after the lights go out"],
    events: ["receives a thank-you note for a deed they haven't done yet", "notices that every portrait is looking at the same empty chair", "finds a key inside a perfectly ordinary loaf of bread"],
  },
  "everyday magic": {
    places: ["a laundromat that returns clothes from next week", "an apartment building with one impossible staircase", "a corner shop where the plants know everyone's name"],
    events: ["finds a tiny weather system living in a teacup", "gets a voicemail from their houseplant", "discovers the neighborhood cat has been organizing the mail"],
  },
};

const moodOpeners = {
  hopeful: "A small kindness changes everything when",
  eerie: "Something is quietly wrong when",
  adventurous: "A chance detour becomes a quest when",
  ridiculous: "A perfectly normal Tuesday derails when",
};

function buildStory(form) {
  const genre = form.elements.genre.value;
  const mood = form.elements.mood.value;
  const bits = storyBits[genre] ?? storyBits.fantasy;
  return `${moodOpeners[mood] ?? moodOpeners.hopeful} ${choice(["a mapmaker", "a retired magician", "two rival bakers", "an apprentice astronomer", "a very polite ghost"])} ${choice(bits.events)} at ${choice(bits.places)}.`;
}

const teamThemes = {
  "deep sea": ["Submarine", "Coral", "Barnacle", "Abyssal", "Kelp", "Tidal"],
  space: ["Lunar", "Comet", "Nebula", "Orbiting", "Meteor", "Starlight"],
  garden: ["Dandelion", "Greenhouse", "Turnip", "Mossy", "Marigold", "Thistle"],
  snacks: ["Biscuit", "Pickle", "Popcorn", "Wobbly Jelly", "Nacho", "Crumb"],
  mystery: ["Secret", "Midnight", "Curious", "Unsolved", "Hidden", "Velvet"],
  weather: ["Thunder", "Drizzle", "Sunbeam", "Gale", "Cloudbank", "Rainbow"],
  folklore: ["Goblin", "Moonlit", "Witchy", "Lantern", "Dragon", "Troll"],
  workshop: ["Copper", "Sawdust", "Brass", "Button", "Clockwork", "Pencil"],
};

const teamMoods = {
  silly: ["Detectives", "Spoons", "Adventurers", "Pigeons", "Committee", "Club"],
  heroic: ["Guardians", "Champions", "Voyagers", "Defenders", "Alliance", "Order"],
  mysterious: ["Society", "Order", "Keepers", "Collective", "Circle", "File"],
  fancy: ["Ensemble", "Assembly", "Association", "Consortium", "League", "Coterie"],
  cozy: ["Tea Table", "Neighbors", "Friends", "Book Club", "Cottage", "Circle"],
  rebellious: ["Outlaws", "Rascals", "Renegades", "Troublemakers", "Misfits", "Union"],
  scholarly: ["Archive", "Guild", "Seminar", "Correspondence", "Institute", "Society"],
  dramatic: ["Company", "Theatre", "Legion", "Revue", "Cavalcade", "Fellowship"],
};

function buildTeam(form) {
  const theme = form.elements.theme.value;
  const style = form.elements.style.value;
  const themeWord = choice(teamThemes[theme] ?? teamThemes.space);
  const styleWord = choice(teamMoods[style] ?? teamMoods.silly);
  return choice([
    `The ${themeWord} ${styleWord}`,
    `${themeWord} ${styleWord}`,
    `The ${themeWord} Club`,
    `${themeWord} & The ${styleWord}`,
    `The ${styleWord} of ${themeWord}`,
  ]);
}

const loreTraditions = {
  japanese: ["a fox shrine that never casts a shadow", "a bell that rings only for the missing", "a paper charm that refuses to burn"],
  chinese: ["a river dragon who collects names", "an ink landscape that changes with the moon", "a jade seal passed through seven hands"],
  korean: ["a moonlit gate that opens once a year", "a household spirit that keeps receipts", "a song that remembers every promise"],
  latin: ["a bronze oath carried between fallen cities", "a road marked by stars instead of milestones", "a household god with unfinished business"],
  greek: ["a sea oracle who answers in riddles", "a laurel crown that remembers every victory", "a thread said to have escaped the underworld"],
  german: ["a bell buried beneath the forest floor", "a winter road that moves when no one is watching", "a house whose windows face the wrong century"],
  french: ["a blue door that appears only in rain", "a letter sealed with a sleeping moth", "a garden that keeps one chair empty"],
  italian: ["a fresco that changes after midnight", "a bell tower with one extra hour", "a family recipe written in disappearing ink"],
  spanish: ["a sunlit courtyard where shadows gather", "a red thread tied to a missing saint", "a guitar that plays for the absent"],
  folkloric: ["a road that only appears when someone is lost", "a pocket-sized moon passed from hand to hand", "a story that grows one detail every time it is told"],
};

const loreToneClosers = {
  tender: "No one agrees whether it was a blessing or a debt.",
  ominous: "The people who know the ending do not speak above a whisper.",
  mythic: "Even now, the oldest stones lean closer when the name is spoken.",
  playful: "Naturally, the official record leaves out the part with the ducks.",
  bittersweet: "It saved the day, but never got to see what came after.",
};

function buildLore(form) {
  const subject = form.elements.subject.value;
  const tradition = form.elements.tradition.value;
  const setting = form.elements.setting.value;
  const secret = form.elements.secret.value;
  const tone = form.elements.tone.value;
  const detail = choice(loreTraditions[tradition] ?? loreTraditions.folkloric);
  return `In ${setting}, ${subject} became known for ${detail}. The truth is that ${secret}. ${loreToneClosers[tone] ?? loreToneClosers.tender}`;
}

const lootTraditions = {
  japanese: {
    names: ["Tsukikage", "Kitsune no Kagi", "Hoshi no Fuda", "Kaze no Kōri", "Mizukagami", "Yoru no Hana"],
    details: ["wrapped in indigo cloth", "found beneath a shrine step", "left beside a bowl of salt"],
  },
  chinese: {
    names: ["Yueguang Yin", "Longyu Pei", "Xingchen Deng", "Fengyin", "Shui Jing", "Hongxian"],
    details: ["sealed in red thread", "found beneath a bridge with no shadow", "carried in a lacquered box"],
  },
  korean: {
    names: ["Dalbit Norigae", "Gumiho-ui Kkori", "Byeolbit Jangsin", "Baram-ui Fuda", "Haneul Gyeol", "Bichui Gyeol"],
    details: ["tied with five-colored thread", "left on a moon gate at dawn", "kept in a silk pouch marked with a crane"],
  },
  latin: {
    names: ["Lumen Lunae", "Aquila Sigil", "Vox Aeterna", "Ferro Vitae", "Corona Noctis", "Manus Fati"],
    details: ["recovered from a fallen city", "sealed beneath a household altar", "carried along an old military road"],
  },
  greek: {
    names: ["Asterion", "Helios' Eye", "Nyx's Veil", "Moirai Thread", "Thalassa", "Hermes Key"],
    details: ["lifted from a sea oracle's cave", "left beside a broken laurel crown", "found at the foot of a statue with no face"],
  },
  german: {
    names: ["Mondsplitter", "Sternensiegel", "Wolkenklinge", "Eisenherz", "Nachtfaden", "Frostlaterne"],
    details: ["forged during the longest winter", "found below a forest bell", "kept in a locked clockmaker's drawer"],
  },
  french: {
    names: ["Lune d'Argent", "La Clef Rouge", "Étoile Dormante", "Cœur de Brume", "Le Fil Bleu", "Miroir de Nuit"],
    details: ["sealed behind a blue door", "found in a garden after rain", "passed between three vanished salons"],
  },
  italian: {
    names: ["Lama Lunare", "Occhio del Sole", "Chiave del Vento", "Cuore del Bosco", "Anello delle Maree", "Velo di Stelle"],
    details: ["hidden beneath a fresco", "carried out of a bell tower at midnight", "wrapped in a recipe no one can finish"],
  },
  spanish: {
    names: ["Hoja de Luna", "Ojo del Sol", "Llave del Viento", "Corazón de Bruma", "Anillo de Mareas", "Velo de Estrellas"],
    details: ["found in a sunlit courtyard", "tied to a red thread at a crossroads", "kept beside a guitar for the absent"],
  },
  folkloric: {
    names: ["The Pocket Moon", "The Borrowed Key", "The Little Red Thread", "The Good Luck Bone", "The Last Match", "The Unfinished Compass"],
    details: ["found where the road forgets itself", "wrapped in a page torn from a fairytale", "left on a windowsill by someone who vanished"],
  },
};

const lootKinds = {
  weapon: ["blade", "bow", "spear", "hammer"],
  relic: ["relic", "seal", "tablet", "crown"],
  charm: ["charm", "talisman", "thread", "pendant"],
  tool: ["compass", "needle", "key", "lantern"],
  consumable: ["tea", "elixir", "sweet", "powder"],
  wearable: ["mask", "cloak", "ring", "glove"],
  oddity: ["coin", "marble", "music box", "button"],
};

function buildLoot(form) {
  const tradition = form.elements.tradition.value;
  const kind = form.elements.kind.value;
  const material = form.elements.material.value;
  const power = form.elements.power.value;
  const profile = lootTraditions[tradition] ?? lootTraditions.folkloric;
  const name = choice(profile.names);
  const object = choice(lootKinds[kind] ?? lootKinds.oddity);
  return `${name}: a ${material} ${object}, ${choice(profile.details)}. Its effect: ${power}.`;
}



const encounterTraditions = {
  japanese: { label: "Japanese-inspired", note: "A quiet omen is probably already watching.", scenes: ["a fox-masked pilgrim who asks for your true name", "a torii gate that appears one step closer each time you look away", "a paper lantern that lights only when someone lies"] },
  chinese: { label: "Chinese-inspired", note: "Look twice: the safest path may be the one with the oldest story.", scenes: ["a river spirit offering safe passage in exchange for a remembered face", "a jade guardian who has misplaced its oath", "a red-thread snare strung between two lucky stones"] },
  korean: { label: "Korean-inspired", note: "Something playful is hiding a very serious question.", scenes: ["a dokkaebi with a brass club and an honest question", "a moon gate that opens onto yesterday", "a household spirit hiding the key to the road"] },
  latin: { label: "Latin-inspired", note: "The road keeps receipts. So does the ghost.", scenes: ["a bronze shade demanding the password of a dead legion", "a milestone that points toward the place you fear most", "a laurel wreath that tightens around anyone who boasts"] },
  greek: { label: "Greek-inspired", note: "The prophecy is clear, except for the part that matters.", scenes: ["a one-eyed oracle who will answer one question incorrectly", "a bronze automaton guarding a thread of sea-blue light", "a laurel path that loops whenever someone speaks the hero's name"] },
  german: { label: "German-inspired", note: "Pack a lantern. The forest has added a new rule.", scenes: ["a forest bell that rings beneath the roots", "a black-iron huntsman offering a map with one road too many", "a clockwork snare hidden under a carpet of frost"] },
  french: { label: "French-inspired", note: "The danger has excellent manners and a reservation.", scenes: ["a blue-door ferryman asking for a secret instead of a coin", "a salon ghost who has kept the wrong invitation", "a ribbon bridge that knots itself around greedy hands"] },
  italian: { label: "Italian-inspired", note: "The fresco remembers who touched the door first.", scenes: ["a masked archivist guarding a fresco that changes the route", "a bell tower shadow that moves before its owner", "a marble hand offering a ring with a missing finger"] },
  spanish: { label: "Spanish-inspired", note: "Follow the music, but do not trust the final chord.", scenes: ["a sunlit saint's statue that turns to face whoever is lying", "a red-thread guide who leads somewhere beautiful and wrong", "a guitar whose final chord wakes the crossroads"] },
  folkloric: { label: "Unfiled folklore", note: "The road has made up its own rules again.", scenes: ["a talking roadside stone that knows what you left behind", "a little old woman with three impossible bargains", "a trail of breadcrumbs that leads to a trapdoor instead of home"] },
};

const encounterKinds = {
  encounter: "The trouble steps into your path",
  trap: "The danger is already waiting",
  omen: "The warning arrives before the danger",
  bargain: "The offer sounds kinder than it is",
};

const encounterStakes = {
  low: "The cost is mostly time, pride, or one useful secret.",
  medium: "A wrong choice will change the route and leave a mark.",
  high: "The safest answer may still demand a sacrifice.",
};

function buildEncounter(form) {
  const tradition = form.elements.tradition.value;
  const kind = form.elements.kind.value;
  const stakes = form.elements.stakes.value;
  const profile = encounterTraditions[tradition] ?? encounterTraditions.folkloric;
  const scene = choice(profile.scenes);
  return `${encounterKinds[kind] ?? encounterKinds.encounter}: ${scene}. ${encounterStakes[stakes] ?? encounterStakes.medium}`;
}

const builders = {
  quest: buildQuest,
  name: buildName,
  story: buildStory,
  team: buildTeam,
  lore: buildLore,
  loot: buildLoot,
  encounter: buildEncounter,
};

function currentPanel() {
  return document.querySelector(`[data-panel="${activeTool}"]`);
}

function setBusy(button, busy) {
  if (!button) return;
  button.setAttribute("aria-busy", String(busy));
  button.disabled = busy;
  if (button.classList.contains("generate-button")) {
    const label = button.querySelector("span:first-child");
    if (label) label.textContent = busy ? "Gathering an idea…" : button.dataset.defaultLabel;
  }
}

function generate(triggerButton) {
  const panel = currentPanel();
  if (!panel || typeof builders[activeTool] !== "function") {
    resultStatus.textContent = "That page seems to have gone missing. Choose another from the index.";
    return;
  }
  if (resultCard.getAttribute("aria-busy") === "true") return;

  currentContext = null;
  let next = builders[activeTool](panel);
  for (let attempt = 0; next === lastResult && attempt < 5; attempt += 1) {
    next = builders[activeTool](panel);
  }
  const button = triggerButton || panel.querySelector(".generate-button");
  const buttonLabel = button?.querySelector("span:first-child");
  const defaultLabel = button?.dataset.defaultLabel || buttonLabel?.textContent || "Set the words";
  if (button && !button.dataset.defaultLabel && buttonLabel) button.dataset.defaultLabel = defaultLabel;

  resultCard.setAttribute("aria-busy", "true");
  resultStatus.textContent = "Gathering a thought from the margins…";
  if (activeTool === "encounter" && panel.elements.kind?.value === "trap") animateTrap();
  if (soundEnabled) playDrawerCue(activeTool, panel.elements.tradition?.value);
  setBusy(button, true);
  window.clearTimeout(generationTimer);
  generationTimer = window.setTimeout(() => {
    lastResult = next;
    resultText.classList.remove("is-entering");
    resultText.textContent = next;
    if (currentContext) {
      contextHeading.textContent = "Name note";
      contextEtymology.textContent = currentContext.note;
      resultContext.hidden = false;
    } else {
      resultContext.hidden = true;
    }
    void resultText.offsetWidth;
    resultText.classList.add("is-entering");
    resultCard.setAttribute("aria-busy", "false");
    resultStatus.textContent = "Freshly pressed. Copy it or turn another leaf.";
    copyButton.disabled = false;
    saveButton.disabled = false;
    againButton.disabled = false;
    setBusy(button, false);
  }, 160);
}

function selectTool(toolName, shouldFocus = false) {
  if (!builders[toolName]) return;
  window.clearTimeout(generationTimer);
  resultCard.setAttribute("aria-busy", "false");
  activeTool = toolName;
  document.body.dataset.drawer = toolName;
  burstParticles("drawer");
  lastResult = "";
  currentContext = null;
  resultContext.hidden = true;
  contextHeading.textContent = "Name note";
  resultText.classList.remove("is-entering");
  resultText.textContent = "Choose a page, then let a small idea take shape.";
  resultStatus.textContent = drawerVoices[toolName] ?? "Ready when you are, reader.";
  copyButton.disabled = true;
  saveButton.disabled = true;
  againButton.disabled = true;

  tools.forEach((button, index) => {
    const selected = button.dataset.tool === toolName;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected) {
      cardIndex.innerHTML = `FOLIO 0${index + 1} <span aria-hidden="true">·</span> 07`;
      if (shouldFocus) button.focus();
    }
  });
  if (soundEnabled) playDrawerCue(toolName);
  panels.forEach((panel) => {
    const selected = panel.dataset.panel === toolName;
    panel.hidden = !selected;
    const generateButton = panel.querySelector(".generate-button");
    setBusy(generateButton, false);
  });
  if (toolName === "encounter") updateEncounterPreview(document.querySelector("#encounter-tradition")?.value);
}

tools.forEach((button) => {
  button.addEventListener("click", () => selectTool(button.dataset.tool));
  button.addEventListener("keydown", (event) => {
    const currentIndex = tools.indexOf(button);
    let nextIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tools.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tools.length) % tools.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tools.length - 1;
    else return;
    event.preventDefault();
    selectTool(tools[nextIndex].dataset.tool, true);
  });
});

document.querySelector("#encounter-tradition")?.addEventListener("change", (event) => {
  updateEncounterPreview(event.target.value);
  if (soundEnabled) playDrawerCue("encounter", event.target.value);
});

panels.forEach((panel) => panel.addEventListener("submit", (event) => {
  event.preventDefault();
  generate(event.submitter);
}));

againButton.addEventListener("click", () => generate(againButton));

async function copyGeneratedIdea() {
  if (!lastResult) return;
  resultStatus.textContent = "Copying that thought…";
  let timeoutId;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable");
    await Promise.race([
      navigator.clipboard.writeText(lastResult),
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error("Clipboard request timed out")), 1200);
      }),
    ]);
    resultStatus.textContent = "Copied. Keep that little thought.";
  } catch {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = lastResult;
    temporaryField.setAttribute("readonly", "");
    temporaryField.style.position = "fixed";
    temporaryField.style.opacity = "0";
    document.body.append(temporaryField);
    temporaryField.focus();
    temporaryField.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { /* Clipboard permissions may be unavailable. */ }
    temporaryField.remove();
    resultStatus.textContent = copied
      ? "Copied. Keep that little thought."
      : "Copying is unavailable here. Select the idea text to keep it.";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

copyButton.addEventListener("click", copyGeneratedIdea);

panels.forEach((panel) => {
  const button = panel.querySelector(".generate-button");
  const label = button?.querySelector("span:first-child");
  if (button && label) button.dataset.defaultLabel = label.textContent;
});


soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.firstChild.textContent = soundEnabled ? "Sound on " : "Sound cue ";
  playDrawerCue(activeTool);
});
