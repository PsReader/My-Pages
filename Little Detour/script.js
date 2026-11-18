const activities = [
  { category: "MAKE SOMETHING", overline: "ONE MINUTE OF CREATIVE CHAOS", title: "Draw the nearest object with your non-dominant hand.", description: "Keep it gloriously wonky. One minute, one object, absolutely no artistic standards.", kind: "creative" },
  { category: "SLOW DOWN", overline: "A TINY RESET FOR YOUR BRAIN", title: "Put on one song and give it your full attention.", description: "No scrolling, no multitasking. Just listen until the last note fades.", kind: "cozy" },
  { category: "GET MOVING", overline: "A CHANGE OF SCENERY COUNTS", title: "Take a tiny walk to the nearest window, doorway, or mailbox.", description: "A short wander is still a wander. Notice one thing you usually pass by.", kind: "movement" },
  { category: "BE SILLY", overline: "A VERY IMPORTANT NAMING TASK", title: "Invent a dramatic name for today's weather.", description: "Give the forecast a movie-title treatment. Extra points for a plot twist.", kind: "play" },
  { category: "CONNECT", overline: "SEND A LITTLE GOOD THING", title: "Text someone one thing you genuinely appreciate about them.", description: "Specific is lovely. It can be one sentence and take ten seconds.", kind: "social" },
  { category: "GET COZY", overline: "SNACK TIME, BUT MAKE IT EASY", title: "Make a snack with only three ingredients you already have.", description: "No shopping, no recipe rabbit hole. Use what is already within reach.", kind: "cozy" },
  { category: "GET CURIOUS", overline: "A SMALL RABBIT HOLE", title: "Learn one surprising fact about an animal you like.", description: "Pick a favorite and look up one fact you have never heard before.", kind: "curious" },
  { category: "SLOW DOWN", overline: "CHANGE YOUR POINT OF VIEW", title: "Change seats and pretend you have entered a new café.", description: "Bring your drink along. The new scenery is the whole adventure.", kind: "cozy" },
  { category: "MAKE SOMETHING", overline: "COLLECT A COLOR", title: "Take a photo of the most interesting color nearby.", description: "Look close, look far, or find a color hiding in plain sight.", kind: "creative" },
  { category: "GET MOVING", overline: "ONE SONG, ONE STRETCH", title: "Stretch your shoulders and hands through one song.", description: "Keep it gentle. Stop if anything feels uncomfortable.", kind: "movement" },
  { category: "BE SILLY", overline: "A SOUND HUNT", title: "Find three things around you that make a satisfying sound.", description: "A click, a crinkle, a tap. The world's a tiny percussion section.", kind: "play" },
  { category: "BE SILLY", overline: "A FIVE-STAR REVIEW", title: "Write a tiny review of your last drink, like a food critic.", description: "One sentence is enough. Mention the flavor, the vibe, and the imaginary price.", kind: "play" },
  { category: "SLOW DOWN", overline: "A MINI TIDY, NOT A PROJECT", title: "Clear one small surface—the size of a book is plenty.", description: "A corner, a nightstand, a single patch of desk. Then call it done.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "SOUNDTRACK YOUR MOMENT", title: "Make a three-song soundtrack for the next ten minutes.", description: "Pick a mood and let the playlist do the rest. No perfect sequencing required.", kind: "creative" },
  { category: "CONNECT", overline: "BORROW SOME GOOD TASTE", title: "Ask someone for a recommendation and save it for later.", description: "A song, snack, show, or book. You do not have to try it today.", kind: "social" },
  { category: "GET CURIOUS", overline: "OPEN A NEW PAGE", title: "Read the first page of a book or article you have meant to try.", description: "Only the first page. You are allowed to stop there.", kind: "curious" },
  { category: "GET COZY", overline: "CHECK IN WITH SOMETHING GROWING", title: "Water a plant or check on something growing.", description: "A little water, a closer look, or just a friendly hello will do.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "LOOK UP FOR A MINUTE", title: "Look at the sky and give one cloud a name.", description: "No need to find a shape. Make up a name and let the moment pass.", kind: "cozy" },
  { category: "BE SILLY", overline: "ENGINEERING, SORT OF", title: "Build the smallest tower you can from three nearby objects.", description: "Stack gently, use whatever is safe, and admire your tiny architecture.", kind: "play" },
  { category: "GET CURIOUS", overline: "A FUTURE WANDER", title: "Open a map and pick a place you would like to wander someday.", description: "Zoom in, explore a street, and save the spot for a daydream.", kind: "curious" },
  { category: "GET MOVING", overline: "A SLOW LITTLE LAP", title: "Walk one lap around the room and notice five details.", description: "A book spine, a shadow, a color. No pace or step count required.", kind: "movement" },
  { category: "BE SILLY", overline: "A RESTAURANT NAMING CHALLENGE", title: "Name a restaurant after the last thing you ate.", description: "Imagine its specialty, its décor, and the one dish everyone orders.", kind: "play" },
  { category: "CONNECT", overline: "PASS ALONG A SONG", title: "Send someone a song that reminds you of them.", description: "Add a tiny note if you like. The song can do most of the talking.", kind: "social" },
  { category: "MAKE SOMETHING", overline: "DRAW YOUR CURRENT VIBE", title: "Doodle a ridiculous mascot for your current mood.", description: "Give it a name and one unnecessary accessory. Stick figures welcome.", kind: "creative" },
  { category: "SLOW DOWN", overline: "ONE SMALL WIN", title: "Put one item back where it belongs, then call it a win.", description: "One item means one item. You are officially done after that.", kind: "reset" },
  { category: "GET CURIOUS", overline: "FOLLOW ONE WORD", title: "Choose a random word and find out where it came from.", description: "A quick dictionary detour can turn into a surprisingly good story.", kind: "curious" },
  { category: "GET COZY", overline: "MAKE A FAVORITE DRINK", title: "Make your favorite drink and enjoy it without scrolling.", description: "Take a few slow sips. This is a very small, very valid plan.", kind: "cozy" },
  { category: "GET COZY", overline: "A TINY DIGITAL TIDY", title: "Sort five photos into an album you would revisit.", description: "Pick five, make one album, and leave the rest for another day.", kind: "reset" },
  { category: "GET MOVING", overline: "A GENTLE BALANCE CHALLENGE", title: "Try balancing on one foot for 30 seconds near something steady.", description: "Skip it if balance is not right for you. A gentle stretch works too.", kind: "movement" },
  { category: "SLOW DOWN", overline: "MAKE ROOM FOR A DAYDREAM", title: "Write down three things you would do with a free afternoon.", description: "No calendar or budget needed. Just imagine a good afternoon.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "A TINY PAPER PROJECT", title: "Fold a scrap of paper into the simplest boat you can.", description: "Float it in a sink or just admire the tiny vessel. Fancy folds are optional.", kind: "creative" },
  { category: "GET CURIOUS", overline: "NOTICE THE ORDINARY", title: "Pick an object nearby and guess how it was made.", description: "Make up a theory, then check the label or look it up if you feel like it.", kind: "curious" },
  { category: "GET MOVING", overline: "WAKE UP YOUR HANDS", title: "Shake out your hands, then make five slow fist-to-palm stretches.", description: "Keep it gentle and easy. This is a reset, not a workout.", kind: "movement" },
  { category: "BE SILLY", overline: "THE MOST SPECIFIC PARADE", title: "Give a two-minute parade to an object on your desk.", description: "March it across the room, narrate the event, or simply give it a ceremonial wave.", kind: "play" },
  { category: "CONNECT", overline: "A LITTLE HELLO", title: "Send someone a message made of three cheerful words.", description: "No explanation required. Just three good words and a little lift in their day.", kind: "social" },
  { category: "GET COZY", overline: "SOFTEN THE SCENE", title: "Change one light or lamp to make the room feel different.", description: "Try a warmer corner, a lower glow, or the most dramatic shadow you can find.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE QUIETEST MINUTE", title: "Sit still and listen for the farthest sound you can notice.", description: "Let nearby noises pass. See if you can catch one sound from beyond the room.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "DESIGN A STICKER", title: "Invent a tiny sticker for something you use every day.", description: "Give it a name, a color, and one line of copy. Sketch it or describe it aloud.", kind: "creative" },
  { category: "GET CURIOUS", overline: "A TINY LANGUAGE TOUR", title: "Learn how to say “thank you” in a language you do not speak.", description: "Say it once out loud, then keep the new phrase in your back pocket.", kind: "curious" },
  { category: "GET MOVING", overline: "FOLLOW THE EDGES", title: "Trace the edges of the room with your eyes while you take ten steps.", description: "Look for corners, lines, and little details that usually disappear into the background.", kind: "movement" },
  { category: "BE SILLY", overline: "A VERY TINY AWARD", title: "Give yourself an award for something you did today.", description: "Name the award, make an acceptance speech, and accept it with dignity.", kind: "play" },
  { category: "CONNECT", overline: "SHARE A SMALL MEMORY", title: "Tell someone a one-sentence memory you still like.", description: "It can be ordinary, funny, or wonderfully specific. Small stories count.", kind: "social" },
  { category: "GET COZY", overline: "THE GOOD TEXTURE HUNT", title: "Find the nicest texture within arm’s reach.", description: "Notice the fabric, grain, fuzz, or smoothness for a few unhurried seconds.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "MAKE A MINI LIST", title: "Write down five things that are currently going okay.", description: "They can be tiny: a good chair, a charged phone, a quiet minute. Tiny is the point.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "A MICRO COMIC", title: "Draw a three-panel comic about a very minor problem.", description: "A missing sock, a stubborn lid, a late snack—the smaller the drama, the better.", kind: "creative" },
  { category: "GET CURIOUS", overline: "LOOK CLOSER", title: "Read the back of a package you have never inspected.", description: "Find one detail, ingredient, instruction, or odd little sentence you had missed.", kind: "curious" },
  { category: "GET MOVING", overline: "THE SLOW-MOTION ERRAND", title: "Walk to the next room in exaggerated slow motion.", description: "Move carefully, have a laugh, and return to normal speed whenever you like.", kind: "movement" },
  { category: "CONNECT", overline: "A QUICK THANK-YOU", title: "Thank someone who makes an ordinary day easier.", description: "Say it in person or send a short note. Specific thanks are always welcome.", kind: "social" },
  { category: "MAKE SOMETHING", overline: "A POCKET POSTER", title: "Design a tiny poster for an imaginary event.", description: "Give it a title, a date, and one dramatic tagline. A napkin-sized poster still counts.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE LABEL DETECTIVE", title: "Find the oldest date or smallest print on something nearby.", description: "Inspect a book, package, or object and see what tiny detail has been hiding in plain sight.", kind: "curious" },
  { category: "GET MOVING", overline: "THE DOORWAY STRETCH", title: "Reach both arms up in a doorway and take three easy breaths.", description: "Keep your shoulders relaxed and stop if anything feels uncomfortable.", kind: "movement" },
  { category: "BE SILLY", overline: "A NEW SPECIES", title: "Invent an animal that could live in your room.", description: "Name it, give it one unusual skill, and decide what it eats.", kind: "play" },
  { category: "CONNECT", overline: "PASS THE QUESTION", title: "Ask someone what small thing made them smile today.", description: "Listen to the answer without rushing to solve or improve the moment.", kind: "social" },
  { category: "GET COZY", overline: "THE COMFORT CORNER", title: "Make one spot more comfortable with a pillow, blanket, or cushion.", description: "You are not redecorating. You are making a tiny landing place.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THREE SLOW SIPS", title: "Take three sips of your drink more slowly than usual.", description: "Notice temperature, texture, and the moment each sip disappears.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "THE TYPOGRAPHY GAME", title: "Write your name in three completely different styles.", description: "Try neat, enormous, tiny, wiggly, or suspiciously official lettering.", kind: "creative" },
  { category: "GET CURIOUS", overline: "A LOCAL MYSTERY", title: "Look up one fact about the street or neighborhood you are in.", description: "Find a small piece of local history, a name origin, or a detail you never knew.", kind: "curious" },
  { category: "GET MOVING", overline: "THE TOE-TAP LOOP", title: "Tap each foot to a song for one full minute.", description: "Let the rhythm be as subtle or dramatic as the room allows.", kind: "movement" },
  { category: "BE SILLY", overline: "THE ROYAL DECREE", title: "Write a royal decree about a very ordinary household rule.", description: "For example: all mugs must be greeted before use. Sign it with a grand title.", kind: "play" },
  { category: "CONNECT", overline: "THE GOOD QUESTION", title: "Ask someone which meal they would happily eat every week.", description: "Trade answers and let the conversation wander toward the best part: why.", kind: "social" },
  { category: "GET COZY", overline: "THE WARM HANDS RESET", title: "Warm your hands and notice how quickly the feeling changes.", description: "Use a warm mug, a pocket, or a gentle rub. Keep it comfortable, never hot.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE WINDOW FRAME", title: "Look through a window and notice the farthest visible thing.", description: "Stay with it for a few breaths and let the view be enough.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "A NEW FLAG", title: "Design a flag for your current mood.", description: "Choose three colors and one symbol. There are no rules about what a mood flag should mean.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE NUMBER STORY", title: "Choose a number you can see and make up a story about it.", description: "A receipt total, a page number, or a clock minute can all become a clue.", kind: "curious" },
  { category: "GET MOVING", overline: "THE SHOULDER ROLL", title: "Roll your shoulders slowly forward five times and backward five times.", description: "Keep the motion gentle and let your neck stay relaxed.", kind: "movement" },
  { category: "BE SILLY", overline: "THE DRAMATIC EXIT", title: "Leave the room like you are ending a very important scene.", description: "Choose a soundtrack in your head and make the exit last exactly five seconds.", kind: "play" },
  { category: "CONNECT", overline: "A SHARED FAVORITE", title: "Tell someone about a tiny thing you are looking forward to.", description: "It can be a snack, a walk, a show, or simply getting into bed later.", kind: "social" },
  { category: "GET COZY", overline: "THE SOCK UPGRADE", title: "Put on the coziest socks or slippers you have.", description: "Notice the small difference, then continue your day with upgraded feet.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE ONE-LINE JOURNAL", title: "Write one honest sentence about how today feels.", description: "No polishing, no lesson, no follow-up required. One sentence is complete.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "THE INVENTED INGREDIENT", title: "Invent an ingredient for a meal from a fictional world.", description: "Name it, describe its taste, and decide what happens when it is cooked.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE OBJECT TIMELINE", title: "Pick an object and imagine three places it has been before you owned it.", description: "Stay playful: a shop shelf, a delivery van, an earlier desk. Make a tiny timeline.", kind: "curious" },
  { category: "GET MOVING", overline: "THE HIGH-FIVE STRETCH", title: "Reach one hand high, then the other, as if high-fiving the ceiling.", description: "Alternate slowly for ten reaches and keep your feet planted.", kind: "movement" },
  { category: "BE SILLY", overline: "THE WEATHER REPORT", title: "Give a live weather report for the room you are in.", description: "Include temperature, wind, and one completely invented warning.", kind: "play" },
  { category: "CONNECT", overline: "THE RECOMMENDATION SWAP", title: "Trade one recommendation with someone nearby.", description: "A snack, a song, a shortcut, or a place to sit all qualify.", kind: "social" },
  { category: "GET COZY", overline: "THE SMALLER SOUND", title: "Turn down one sound source and notice what appears underneath it.", description: "A fan, a video, or background music can make space for a different layer of quiet.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE PAUSE BUTTON", title: "Before your next task, pause for ten seconds with both feet on the floor.", description: "Feel the floor, breathe once, and begin without making the pause into a project.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "A MINI MAP", title: "Draw a map from where you are to something nearby.", description: "Include one landmark, one imaginary shortcut, and a compass rose if you feel fancy.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE COLOR NAME", title: "Give the nearest color a name it does not already have.", description: "‘Almost avocado’ and ‘rainy blue’ are both valid. Look for a surprisingly specific shade.", kind: "curious" },
  { category: "GET MOVING", overline: "THE BALANCE SWITCH", title: "Stand with your weight on the other foot for one minute.", description: "Hold something steady if needed and switch back whenever your body asks.", kind: "movement" },
  { category: "BE SILLY", overline: "THE OBJECT INTERVIEW", title: "Interview an object as if it has had a very long day.", description: "Ask what it saw, what it wants, and whether it has any complaints.", kind: "play" },
  { category: "CONNECT", overline: "THE KINDNESS RECEIPT", title: "Write down one kind thing someone did for you recently.", description: "You do not need to send it anywhere. Keep the receipt of the good moment.", kind: "social" },
  { category: "GET COZY", overline: "THE FAVORITE CORNER", title: "Choose your favorite corner of the room and explain why it wins.", description: "Give it a title like ‘best light’ or ‘most trustworthy wall.’", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE BREATH COUNT", title: "Take five breaths and count only the exhales.", description: "Let the inhales happen naturally. The counting is the only job.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "THE TINY MENU", title: "Write a three-item menu for the mood you want tonight.", description: "Call the courses something dramatic, even if dinner is leftovers.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE SOUND SOURCE", title: "Close your eyes and identify the nearest sound you can hear.", description: "Then identify one farther away. Open your eyes when you are ready.", kind: "curious" },
  { category: "GET MOVING", overline: "THE HANDS-ON-HEAD RESET", title: "Place your hands on top of your head and stretch your elbows wide.", description: "Hold for three comfortable breaths, then let your arms drop.", kind: "movement" },
  { category: "BE SILLY", overline: "THE PETTY AWARDS", title: "Give awards to three objects in the room.", description: "Categories can include best shape, most dependable, and strongest supporting role.", kind: "play" },
  { category: "CONNECT", overline: "THE EASY INVITE", title: "Invite someone to share a small break with you later.", description: "A walk, a tea, or ten minutes of sitting nearby is plenty.", kind: "social" },
  { category: "GET COZY", overline: "THE FRESH AIR CHECK", title: "Open a window or step outside for a moment if it feels comfortable.", description: "Notice the air on your face and one sound from outdoors.", kind: "cozy" },
  { category: "SLOW DOWN", overline: "THE UNFINISHED THOUGHT", title: "Write down one thought you can return to later.", description: "Parking it on paper gives your brain permission to stop holding it for now.", kind: "reset" },
  { category: "MAKE SOMETHING", overline: "THE ALBUM COVER", title: "Design an album cover for the last hour of your day.", description: "Choose a title, a color, and one strangely specific image.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE FIRST IMPRESSION", title: "Look at an everyday object as if you have never seen it before.", description: "Describe its shape, purpose, and possible alternate uses.", kind: "curious" },
  { category: "GET MOVING", overline: "THE SIDE-TO-SIDE", title: "Take ten gentle side steps in one direction, then ten back.", description: "Keep the pace easy and leave plenty of room around you.", kind: "movement" },
  { category: "BE SILLY", overline: "THE SECRET HANDSHAKE", title: "Invent a secret handshake with yourself.", description: "Give it three moves and a ridiculous finishing flourish.", kind: "play" },
  { category: "CONNECT", overline: "THE MEMORY SONG", title: "Send someone a song that belongs to a shared memory.", description: "Add one sentence explaining the moment if you want to make it extra thoughtful.", kind: "social" },
  { category: "GET COZY", overline: "THE PLEASANT DETAIL", title: "Find one pleasant detail you can enjoy without changing anything.", description: "A patch of sun, a familiar smell, or the way a cup feels in your hand all count.", kind: "cozy" },
  { category: "MAKE SOMETHING", overline: "THE TINY TROPHY", title: "Draw a trophy for something wonderfully ordinary.", description: "Award it to a good sip of water, a comfy chair, or any small win from today.", kind: "creative" },
  { category: "GET CURIOUS", overline: "THE NEAREST DETAIL", title: "Find the smallest detail you can see without moving closer.", description: "A scratch, thread, shadow, or tiny mark can become the star of this round.", kind: "curious" },
  { category: "GET MOVING", overline: "THE RESET WALK", title: "Walk to the nearest doorway and back with a relaxed stride.", description: "Let your arms swing naturally and notice how the room looks when you return.", kind: "movement" },
  { category: "BE SILLY", overline: "THE GRAND ANNOUNCEMENT", title: "Announce your next snack like it is a headline event.", description: "Use your most official voice, add a sponsor, and make the entrance memorable.", kind: "play" },
  { category: "CONNECT", overline: "THE TINY CHEER", title: "Send someone a message that simply says you are rooting for them.", description: "No advice or big speech needed. A little support can be wonderfully lightweight.", kind: "social" }
];

const spinButton = document.querySelector("#spin-button");
const spinButtonLabel = document.querySelector("#spin-button-label");
const activityCard = document.querySelector("#activity-card");
const categoryElement = document.querySelector("#activity-category");
const overlineElement = document.querySelector("#activity-overline");
const titleElement = document.querySelector("#activity-title");
const descriptionElement = document.querySelector("#activity-description");
const roundCountElement = document.querySelector("#round-count");
const deckCounterElement = document.querySelector("#deck-counter");
const soundToggle = document.querySelector("#sound-toggle");
const soundLabel = document.querySelector("#sound-label");
const deckProgressElement = document.querySelector("#deck-progress");
const deckProgressLabel = document.querySelector("#deck-progress-label");
const deckProgressFill = document.querySelector("#deck-progress-fill");
const vibeNoteElement = document.querySelector("#vibe-note");
const vibeButtons = [...document.querySelectorAll(".vibe-option")];
const wheelElement = document.querySelector("#roulette-wheel");
const spinHintElement = document.querySelector("#spin-hint");
const totalIdeas = activities.length;
const ideaTotalElement = document.querySelector("#idea-total");
const initialProgressLabel = document.querySelector("#deck-progress-label");
const initialProgressElement = document.querySelector("#deck-progress");
if (ideaTotalElement) ideaTotalElement.textContent = String(totalIdeas);
if (initialProgressLabel) initialProgressLabel.textContent = `0 OF ${totalIdeas} IDEAS TRIED`;
if (initialProgressElement) initialProgressElement.setAttribute("aria-valuemax", String(totalIdeas));
const wheelKinds = ["creative", "cozy", "movement", "play", "social", "curious", "reset"];
const vibeMessages = {
  all: "All categories are in the mix.",
  creative: "Creative activities only this round.",
  cozy: "Only cozy ideas this round.",
  movement: "Movement activities only this round.",
  play: "Silly activities only this round.",
  social: "Social activities only this round.",
  curious: "Only curious ideas this round.",
  reset: "Only tiny-reset ideas this round."
};
let remaining = activities.map((_, index) => index);
let lastIndex = -1;
let activeVibe = "all";
let isSpinning = false;
let soundEnabled = true;
let wheelRotation = 0;
let audioContext;
let revealTimer;
let soundTimers = [];

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!soundEnabled || !AudioContextConstructor) return null;
  try {
    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  } catch {
    return null;
  }
}

function updateSoundToggle() {
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.dataset.sound = soundEnabled ? "on" : "off";
  soundToggle.title = soundEnabled ? "Sound effects on" : "Sound effects off";
  soundLabel.textContent = soundEnabled ? "SFX ON" : "SFX OFF";
  soundToggle.disabled = isSpinning;
}

function clearSoundTimers() {
  for (const timer of soundTimers) window.clearTimeout(timer);
  soundTimers = [];
}

function playTone(context, frequency, duration, volume, type, delay = 0) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.012);
}

function scheduleSpinSounds(reducedMotion) {
  clearSoundTimers();
  const context = getAudioContext();
  if (!context) return;
  const delays = reducedMotion ? [12] : [35, 85, 145, 215, 295, 385, 485, 595, 715, 845, 985, 1135, 1285];
  delays.forEach((delay, index) => {
    const timer = window.setTimeout(() => {
      playTone(context, 1180 - index * 36, 0.028, 0.028, "triangle");
      soundTimers = soundTimers.filter((activeTimer) => activeTimer !== timer);
    }, delay);
    soundTimers.push(timer);
  });
}

function playStopSound() {
  const context = getAudioContext();
  if (!context) return;
  [[523.25, 0], [659.25, 0.08], [783.99, 0.16]].forEach(([frequency, delay]) => {
    playTone(context, frequency, 0.25, 0.045, "sine", delay);
  });
}

function playQuestLandedSound() {
  const context = getAudioContext();
  if (!context) return;
  [[880, 0], [1108.73, 0.07], [1318.51, 0.14]].forEach(([frequency, delay]) => {
    playTone(context, frequency, 0.18, 0.035, "triangle", delay);
  });
}

function updateVibeOptions(note = "") {
  for (const button of vibeButtons) {
    const vibe = button.dataset.vibe;
    const hasIdeas = vibe === "all" || remaining.some((index) => activities[index].kind === vibe);
    button.disabled = isSpinning || (remaining.length > 0 && !hasIdeas);
    button.classList.toggle("is-selected", vibe === activeVibe);
    button.setAttribute("aria-pressed", String(vibe === activeVibe));
  }
  if (note) {
    vibeNoteElement.textContent = note;
  } else if (remaining.length === 0) {
    vibeNoteElement.textContent = activeVibe === "all" ? "Full deck done. Spin again to reshuffle." : `${vibeMessages[activeVibe]} Spin again to reshuffle.`;
  } else {
    vibeNoteElement.textContent = vibeMessages[activeVibe];
  }
}

function selectNextActivity() {
  if (remaining.length === 0) {
    remaining = activities.map((_, index) => index);
    lastIndex = -1;
  }
  updateVibeOptions();
  let pool = activeVibe === "all" ? remaining : remaining.filter((index) => activities[index].kind === activeVibe);
  if (pool.length === 0) {
    activeVibe = "all";
    pool = remaining;
    updateVibeOptions("That vibe's all out for now—mixing it up.");
  }
  const available = pool.filter((index) => index !== lastIndex);
  const choices = available.length > 0 ? available : pool;
  const chosenIndex = choices[Math.floor(Math.random() * choices.length)];
  remaining = remaining.filter((index) => index !== chosenIndex);
  lastIndex = chosenIndex;
  return activities[chosenIndex];
}

function spinWheelTo(kind) {
  const slice = 360 / wheelKinds.length;
  const sliceIndex = wheelKinds.indexOf(kind);
  const desiredAngle = (360 - sliceIndex * slice) % 360;
  const currentAngle = ((wheelRotation % 360) + 360) % 360;
  const alignment = (desiredAngle - currentAngle + 360) % 360;
  const extraTurns = 4 + Math.floor(Math.random() * 3);
  wheelRotation += extraTurns * 360 + alignment;
  wheelElement.style.transform = `rotate(${wheelRotation}deg)`;
}

function updateDeckProgress() {
  const ideasTried = totalIdeas - remaining.length;
  const progressPercent = (ideasTried / totalIdeas) * 100;
  deckCounterElement.textContent = remaining.length === 0 ? "DECK COMPLETE" : `${remaining.length} ${remaining.length === 1 ? "IDEA" : "IDEAS"} LEFT`;
  deckProgressLabel.textContent = `${ideasTried} OF ${totalIdeas} IDEAS TRIED`;
  deckProgressElement.setAttribute("aria-valuenow", String(ideasTried));
  deckProgressElement.setAttribute("aria-valuetext", `${ideasTried} of ${totalIdeas} ideas tried`);
  deckProgressFill.style.width = `${progressPercent}%`;
  roundCountElement.innerHTML = `${String(ideasTried || 1).padStart(2, "0")} <span>/ ${totalIdeas}</span>`;
}

function revealActivity(activity) {
  categoryElement.textContent = activity.category;
  overlineElement.textContent = activity.overline;
  titleElement.textContent = activity.title;
  descriptionElement.textContent = activity.description;
  activityCard.dataset.kind = activity.kind;
  activityCard.classList.remove("is-revealing", "is-landed");
  void activityCard.offsetWidth;
  activityCard.classList.add("is-revealing", "is-landed");
  updateDeckProgress();

  const selectedVibeIsEmpty = activeVibe !== "all" && remaining.length > 0 && !remaining.some((index) => activities[index].kind === activeVibe);
  if (selectedVibeIsEmpty) {
    activeVibe = "all";
    updateVibeOptions("That vibe's tapped out—mixing the rest of the deck.");
  } else if (remaining.length === 0) {
    updateVibeOptions();
    spinHintElement.textContent = "That's the whole deck! Spin again to reshuffle.";
  } else {
    updateVibeOptions();
    spinHintElement.textContent = "No repeats until the whole deck has landed.";
  }
}

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) clearSoundTimers();
  updateSoundToggle();
});
updateSoundToggle();

for (const button of vibeButtons) {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    activeVibe = button.dataset.vibe;
    updateVibeOptions();
  });
}

spinButton.addEventListener("click", () => {
  if (spinButton.disabled) return;
  const activity = selectNextActivity();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  isSpinning = true;
  spinButton.disabled = true;
  spinButton.setAttribute("aria-busy", "true");
  spinButton.classList.add("is-spinning");
  activityCard.classList.add("is-spinning");
  updateVibeOptions();
  updateSoundToggle();
  window.clearTimeout(revealTimer);
  spinWheelTo(activity.kind);
  scheduleSpinSounds(reducedMotion);
  revealTimer = window.setTimeout(() => {
    isSpinning = false;
    revealActivity(activity);
    spinButtonLabel.textContent = "Spin again";
    spinButton.classList.remove("is-spinning");
    activityCard.classList.remove("is-spinning");
    spinButton.removeAttribute("aria-busy");
    spinButton.disabled = false;
    updateSoundToggle();
    playStopSound();
    playQuestLandedSound();
  }, reducedMotion ? 80 : 1410);
});
