from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]

NAV = '''<div class="topnav">
  <a href="index.html">Home</a>
  <a href="Archive.html">Archive</a>
  <a href="Lore_Index.html">Lore</a>
  <a href="Mc_Profile.html">MC</a>
  <a href="Novel.html">Novel</a>
  <a href="Author.html">Author</a>
  <a href="Songs.html">Songs</a>
</div>'''

COMMON_HEAD = '''<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="manifest" href="site.webmanifest">
<link rel="icon" type="image/png" href="images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/dynamic-styles.css">
<link rel="stylesheet" href="css/archive-style.css">'''


def page(title: str, description: str, body: str, *, archive_script: bool = True) -> str:
    script = '<script src="js/archive.js"></script>' if archive_script else ''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  {COMMON_HEAD}
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="LOTM Fan Wiki">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
</head>
<body class="archive-body">
  {NAV}
  <main class="archive-shell">
    {body}
  </main>
  <footer class="archive-footer">
    <p>Unofficial fan reference for <i>Lord of the Mysteries</i>. Content is spoiler-labeled so you can choose how far into the fog to look.</p>
    <p><a href="index.html">Return to the home archive</a> · <a href="https://lordofthemysteries.fandom.com/wiki/Lord_of_Mysteries_Wiki">Source wiki</a> · <a href="https://thefoolsarchive.com/">Spoiler-sealed inspiration</a></p>
  </footer>
  <button id="scrollToTop" aria-label="Back to top">↑</button>
  <script src="js/script.js"></script>
  {script}
</body>
</html>'''


def icon_card(image: str, eyebrow: str, title: str, copy: str, href: str) -> str:
    return f'''<a class="archive-card archive-card--icon" href="{href}" data-filter-card>
  <img src="images/{image}" alt="" loading="lazy">
  <span class="archive-eyebrow">{eyebrow}</span>
  <h3>{title}</h3>
  <p>{copy}</p>
  <span class="archive-card-link">Open index →</span>
</a>'''


def text_card(title: str, eyebrow: str, copy: str, href: str = '#', *, chapter: int | None = None, tags: str = '') -> str:
    gate = f' data-spoiler-chapter="{chapter}"' if chapter is not None else ''
    return f'''<article class="archive-card spoiler-card" data-filter-card data-tags="{tags}"{gate}>
  <div class="spoiler-card__top"><span class="archive-eyebrow">{eyebrow}</span><span class="chapter-mark">{f'Ch. {chapter}' if chapter is not None else 'Reference'}</span></div>
  <h3>{title}</h3>
  <div class="spoiler-card__body"><p>{copy}</p>{f'<a class="archive-card-link" href="{href}">Read the entry →</a>' if href != '#' else ''}</div>
  <div class="spoiler-lock" aria-live="polite"><span>✦</span> Sealed beyond your progress</div>
</article>'''


def filter_bar(placeholder: str = 'Search this index…', filters: list[tuple[str, str]] | None = None) -> str:
    filters = filters or [('all', 'All entries')]
    buttons = ''.join(f'<button class="archive-filter" type="button" data-filter-value="{key}" aria-pressed="{str(key == "all").lower()}">{label}</button>' for key, label in filters)
    return f'''<div class="archive-tools">
  <label class="sr-only" for="archiveSearch">{placeholder}</label>
  <input id="archiveSearch" class="archive-search" type="search" data-filter-input placeholder="{placeholder}" autocomplete="off">
  <div class="archive-filter-row" role="group" aria-label="Filter entries">{buttons}</div>
  <p class="archive-tool-status" data-filter-status>Showing all entries.</p>
</div>'''


ARCHIVE_BODY = '''<header class="archive-hero">
  <div class="archive-hero__copy">
    <span class="archive-kicker">Before the gathering begins</span>
    <h1>The Spoiler-Sealed Archive</h1>
    <p class="archive-lede">State how far you have read. The archive will open only what the story has already revealed to you — later secrets remain above the gray fog.</p>
    <div class="archive-hero__actions"><a class="archive-button archive-button--primary" href="#progress">Set reading progress</a><a class="archive-button" href="Lore_Index.html">Browse the lore index</a></div>
  </div>
  <div class="archive-hero__sigil"><img src="images/Fool_Symbol2_hd.webp" alt="The Fool pathway symbol"><span>SEFIRAH CASTLE<br><b>ARCHIVE 0</b></span></div>
</header>

<section class="progress-panel" id="progress" data-archive-page>
  <div class="section-heading"><span class="archive-eyebrow">Your reading position</span><h2>How far has the fog lifted?</h2><p>Choose a chapter or use a volume shortcut. Your setting is saved only in this browser.</p></div>
  <div class="progress-controls">
    <label for="progressChapter">Last chapter finished</label>
    <div class="progress-input-row"><input id="progressChapter" type="number" min="0" max="1394" step="1" value="0"><span>Ch.</span><button class="archive-button archive-button--primary" type="button" data-save-progress>Open archive</button></div>
    <label for="volumeShortcut">Or choose the last volume finished</label>
    <select id="volumeShortcut"><option value="0">I · Clown · Ch. 1–213</option><option value="213">II · Faceless · Ch. 214–482</option><option value="482">III · Traveler · Ch. 483–732</option><option value="732">IV · Undying · Ch. 733–946</option><option value="946">V · Red Priest · Ch. 947–1150</option><option value="1150">VI · Lightseeker · Ch. 1151–1266</option><option value="1266">VII · The Hanged Man · Ch. 1267–1353</option><option value="1353">VIII · Fool · Ch. 1354–1394</option><option value="1432">✦ Side stories · Ch. 1432</option></select>
  </div>
  <div class="progress-readout"><div><span class="archive-eyebrow">Archive access</span><strong data-progress-label>At the threshold</strong></div><div class="progress-meter"><span data-progress-fill></span></div><p data-progress-status>Nothing is revealed yet. Enter your last finished chapter to begin.</p></div>
</section>

<section class="archive-section">
  <div class="section-heading"><span class="archive-eyebrow">Read at your own pace</span><h2>Open only the doors you are ready for</h2><p>Every entry carries a chapter threshold. Sealed cards show that something is waiting, without spoiling what lies beyond.</p></div>
  <div class="archive-card-grid" data-filter-scope>
    ''' + ''.join([
        text_card('A name beneath the gray fog', 'The threshold', 'The first signal from a world where identity is never quite as simple as it appears.', 'Mc_Profile.html', chapter=1, tags='characters overview'),
        text_card('The owner of the castle', 'Chapter 6', 'An ordinary young man discovers an impossible way to speak above the mist.', 'identities.html', chapter=6, tags='characters lore'),
        text_card('A gathering of strangers', 'Chapter 136', 'Eight seats, one table, and a new way for people across the world to exchange secrets.', 'TarotClub.html', chapter=136, tags='organizations lore'),
        text_card('The pathways begin to diverge', 'Chapter 214', 'The extraordinary is not a single ladder. Every pathway promises power and a different way to lose yourself.', 'Pathways_Index.html', chapter=214, tags='pathways abilities'),
        text_card('A city behind the curtains', 'Chapter 483', 'The sea opens into a wider map, where old faiths and newer gods share the same horizon.', 'Locations.html', chapter=483, tags='locations lore'),
        text_card('The age of angels', 'Chapter 946', 'At the edge of the known sequences, history becomes less like a record and more like a warning.', 'World_History.html', chapter=946, tags='history lore'),
        text_card('The final fool', 'Chapter 1353', 'The archive keeps its deepest entry sealed until the story has carried you to the last great turn.', 'World_History.html', chapter=1353, tags='history characters'),
    ]) + '''
  </div>
</section>

<section class="volume-rail">
  <div class="section-heading"><span class="archive-eyebrow">The original journey</span><h2>Eight lamps along the road</h2></div>
  <div class="volume-list">
    <a href="Volume%201.html"><b>I</b><span>Clown</span><small>1–213</small></a><a href="Volume%202.html"><b>II</b><span>Faceless</span><small>214–482</small></a><a href="Volume%203.html"><b>III</b><span>Traveler</span><small>483–732</small></a><a href="Volume%204.html"><b>IV</b><span>Undying</span><small>733–946</small></a><a href="Volume%205.html"><b>V</b><span>Red Priest</span><small>947–1150</small></a><a href="Volume%206.html"><b>VI</b><span>Lightseeker</span><small>1151–1266</small></a><a href="Volume%207.html"><b>VII</b><span>The Hanged Man</span><small>1267–1353</small></a><a href="Volume%208.html"><b>VIII</b><span>Fool</span><small>1354–1394</small></a>
  </div>
</section>'''

PATHWAYS = [
    ('Fool_Symbol2_hd.webp', 'Lord of Mysteries', 'Fool Pathway', 'Seer → Clown → Magician → Bizarro Sorcerer → Scholar of Yore → Miracle Invoker → Attendant of Mysteries → The Fool', 1, 'Pathways & Powers', 'pathways powers'),
    ('Error_Symbol2_hd.webp', 'Lord of Mysteries', 'Error Pathway', 'Marauder → Swindler → Cryptologist → Parasite → Mentor of Deceit → Worm of Time → Error', 214, 'Pathways & Powers', 'pathways powers'),
    ('Door_Symbol2_hd.webp', 'Lord of Mysteries', 'Door Pathway', 'Apprentice → Trickmaster → Astrologer → Scribe → Traveler → Secrets Sorcerer → Wanderer → Key of Stars', 214, 'Pathways & Powers', 'pathways powers'),
    ('Visionary_Symbol2.webp', 'God Almighty', 'Visionary Pathway', 'Spectator → Telepathist → Psychiatrist → Hypnotist → Dreamwalker → Manipulator → Author → Visionary', 300, 'Pathways & Powers', 'pathways powers'),
    ('Sun_Symbol2.webp', 'God Almighty', 'Sun Pathway', 'Bard → Light Suppliant → Solar High Priest → Notary → Priest of Light → Justice Mentor → Sun', 400, 'Pathways & Powers', 'pathways powers'),
    ('Tyrant_Symbol2.webp', 'God Almighty', 'Tyrant Pathway', 'Sailor → Folk of Rage → Seafarer → Wind-blessed → Ocean Songster → Cataclysmic Interrer → Tyrant', 483, 'Pathways & Powers', 'pathways powers'),
    ('Darkness_Symbol2.webp', 'Eternal Darkness', 'Darkness Pathway', 'Sleepless → Midnighter → Horror Bishop → Soul Assurer → Spirit Warlock → Nightwatcher → Knight of Misfortune → Darkness', 732, 'Pathways & Powers', 'pathways powers'),
    ('Red_Priest_Symbol2.webp', 'Calamity of Destruction', 'Red Priest Pathway', 'Hunter → Provoker → Pyromaniac → Conspirer → Reaper → Iron-blooded Knight → Weather Warlock → Red Priest', 946, 'Pathways & Powers', 'pathways powers'),
    ('Demoness_Symbol2.webp', 'Calamity of Destruction', 'Demoness Pathway', 'Assassin → Instigator → Witch → Pleasure → Affliction → Despair → Unaging → Demoness', 946, 'Pathways & Powers', 'pathways powers'),
    ('Moon_Symbol2.webp', 'Goddess of Origin', 'Moon Pathway', 'Apothecary → Beast Tamer → Vampire → Potions Professor → Scarlet Scholar → Shaman King → Beauty Goddess → Moon', 733, 'Pathways & Powers', 'pathways powers'),
    ('Chained_Symbol2.webp', 'Father of Devils', 'Chained Pathway', 'Prisoner → Lunatic → Werewolf → Zombie → Wraith → Puppet → Disciple of Silence → Abomination', 1150, 'Pathways & Powers', 'pathways powers'),
    ('Justiciar_Symbol2.webp', 'The Anarchy', 'Justiciar Pathway', 'Arbiter → Sheriff → Interrogator → Judge → Disciplinary Paladin → Imperative Mage → Justiciar', 1150, 'Pathways & Powers', 'pathways powers'),
]

CHARACTERS = [
    ('Klein-N.jpg', 'Main protagonist', 'Klein Moretti', 'A cautious and good-natured transmigrator who turns uncertainty into a method — and eventually becomes the center of a new faith.', 1, 'characters main'),
    ('Fool-G.webp', 'Identity', 'The Fool', 'The title used above the gray fog: distant, benevolent, and carefully mysterious.', 136, 'characters tarot'),
    ('Klein-T.jpg', 'Tarot Club', 'Gehrman Sparrow', 'An adventurer identity built for the sea, sharp edges, and the work that cannot be done as Klein Moretti.', 483, 'characters tarot'),
    ('Visionary_Symbol2.webp', 'Tarot Club', 'Audrey Hall', 'The Justice of the Tarot Club, whose empathy and observation become a disciplined extraordinary path.', 136, 'characters tarot'),
    ('Tyrant_Symbol2.webp', 'Tarot Club', 'Alger Wilson', 'The Hanged Man of the gathering: a sailor, believer, and survivor of storms both literal and divine.', 136, 'characters tarot'),
    ('Sun_Symbol2.webp', 'Tarot Club', 'Derrick Berg', 'The Sun, raised in the City of Silver and carrying the light of a world that forgot the sky.', 214, 'characters tarot'),
    ('Door_Symbol2_hd.webp', 'Tarot Club', 'Fors Wall', 'The Magician, a writer whose path keeps opening doors into places no ordinary traveler could reach.', 214, 'characters tarot'),
    ('Darkness_Symbol2.webp', 'Tarot Club', 'Leonard Mitchell', 'A Nighthawks poet with an old secret living close to his spirit and a loyalty that survives fear.', 1, 'characters tarot'),
    ('Moon_Symbol2.webp', 'Church & Club', 'Emlyn White', 'A proud Sanguine with a strange relationship to faith, medicine, and the responsibilities of being useful.', 300, 'characters club'),
    ('Tianwen_Kadokawa_-_Mr._Azik.webp', 'History', 'Azik Eggers', 'A history professor whose missing past reaches back toward death, rebirth, and a much older identity.', 214, 'characters history'),
]

ARTIFACTS = [
    ('Formal Ritual Altar.webp', 'Sealed Artifact', '0-08 · The Quill', 'A quill whose stories bend coincidence, turning small edits into elaborate tragedies.', 300, 'artifacts sealed'),
    ('Fool_Art.webp', 'Mystical item', 'The Antigonus Family Notebook', 'A notebook whose records and pathways are tied to the perilous history of the Hornacis Mountain Range.', 214, 'artifacts history'),
    ('Pallez_Zoroast_cardgame.webp', 'Sealed Artifact', 'Creeping Hunger', 'A glove-like artifact with a hunger for abilities, memories, and the souls that carry them.', 400, 'artifacts sealed'),
    ('Sacred.webp', 'Sacred emblem', 'The Fool’s Emblem', 'A pupil-less eye and contorted lines: a visual shorthand for secrecy and change.', 136, 'artifacts symbols'),
    ('Tarot_club.webp', 'Mystical space', 'Sefirah Castle', 'A palace above the gray fog, reached by a ritual and used as the Tarot Club’s impossible meeting room.', 6, 'artifacts places'),
    ('Alger\'s-Tatoo.webp', 'Mystical mark', 'Pathway Symbols', 'Symbols are not decoration in this world; they are shorthand for authorities, churches, and dangerous correspondences.', 1, 'artifacts symbols'),
]

ORGANIZATIONS = [
    ('Tarot_club.webp', 'Secret organization', 'The Tarot Club', 'A gathering held above the gray fog where members trade information, make requests, and slowly become a force in the world.', 136, 'organizations secret'),
    ('Fool_Symbol2_hd.webp', 'Church', 'Church of the Fool', 'A young church built around a mysterious god whose miracles began before most believers knew his name.', 946, 'organizations faith'),
    ('Darkness_Symbol2.webp', 'Church', 'Church of Evernight', 'One of the oldest and most powerful faiths of the Fifth Epoch, tied to night, concealment, and rest.', 1, 'organizations faith'),
    ('Tyrant_Symbol2.webp', 'Church', 'Church of Storms', 'A maritime power whose prayers travel with thunder, wind, and the authority of the Tyrant.', 1, 'organizations faith'),
    ('Visionary_Symbol2.webp', 'Secret society', 'Psychology Alchemists', 'A society devoted to the study of the mind, the collective subconscious sea, and the path of the Spectator.', 300, 'organizations secret'),
    ('Demoness_Symbol2.webp', 'Secret society', 'Rose School of Thought', 'A dangerous organization divided by its relationship to temperance, desire, and the corruption of living bodies.', 732, 'organizations secret'),
    ('Hermit_Symbol2.webp', 'Church', 'Church of the God of Knowledge', 'A scholarly faith that treats history, formulae, and hidden knowledge as routes toward the divine.', 483, 'organizations faith'),
    ('Justiciar_Symbol2.webp', 'Government', 'MI9 & the Intis Intelligence Service', 'State institutions that investigate extraordinary incidents while navigating a world where official records rarely tell the whole truth.', 214, 'organizations government'),
]

LOCATIONS = [
    ('LOTM.webp', 'Mystical space', 'Sefirah Castle', 'A palace above the gray fog, where a long table waits for a gathering that should not be possible.', 6, 'locations mystical'),
    ('Zhou-S.jpeg', 'City', 'Tingen City', 'A quiet city in the Kingdom of Loen becomes the first stage for a story full of divination, machinery, and midnight danger.', 1, 'locations cities'),
    ('Dwayne-M.webp', 'City', 'Backlund', 'The capital of Loen: crowded, stratified, ambitious, and full of invisible pressure beneath its polished surface.', 214, 'locations cities'),
    ('Alger\'s-Tatoo.webp', 'Port city', 'Bayam', 'A tropical port where churches, pirates, explorers, and old ruins meet at the edge of the sea.', 483, 'locations cities'),
    ('Dark.webp', 'Forbidden land', 'The Forsaken Land of the Gods', 'A land under an eternal darkness, where surviving a journey is inseparable from understanding why the light disappeared.', 732, 'locations forbidden'),
    ('crimson moon.webp', 'Mountain range', 'Hornacis Mountain Range', 'A place where old records, sealed histories, and the danger of losing control converge.', 214, 'locations history'),
    ('Merlin.webp', 'Town', 'Utopia', 'A small town with an impossible stillness, built as part of a ritual whose meaning only becomes clear later.', 946, 'locations cities'),
    ('Sherlock.jpeg', 'Foreign capital', 'Trier', 'The capital of Intis, where the second book widens the map and turns history toward a new cycle.', 1266, 'locations cities'),
]

HISTORY = [
    ('Before the First Epoch', 'The pre-epoch world', 'The oldest layer of history is not a clean beginning. It is the buried origin of gods, authorities, and the rules that make the extraordinary possible.', 1, 'history origins'),
    ('The Cataclysm', 'A world-breaking event', 'The Cataclysm rearranged civilizations and left behind ruins that remain more reliable than many living witnesses.', 214, 'history eras'),
    ('The First to Fourth Epochs', 'Lost civilizations', 'Four epochs of rise, collapse, and hidden inheritance shaped the churches, pathways, and artifacts known in the Fifth Epoch.', 483, 'history eras'),
    ('The Fifth Epoch', 'The present age', 'The era of steam, industry, churches, secret organizations, and the first steps of a new traveler into the world.', 1, 'history eras'),
    ('The Great Smog of Backlund', 'A historical turning point', 'A public disaster exposes the cost of power when institutions, rituals, and private ambitions collide in one crowded capital.', 300, 'history events'),
    ('The Forsaken Land Expedition', 'A journey into darkness', 'The people of the City of Silver search for a future beyond the darkness and force the wider world to confront an older history.', 732, 'history events'),
    ('The Apocalypse', 'The far horizon', 'The world’s oldest warnings and newest alliances begin pointing toward the same approaching crisis.', 1150, 'history prophecy'),
]


def make_icon_grid(items: list[tuple[str, str, str, str, int, str, str]], href: str) -> str:
    cards = []
    for image, eyebrow, title, copy, chapter, category, tags in items:
        cards.append(f'''<article class="archive-card archive-card--icon spoiler-card" data-filter-card data-tags="{tags}" data-spoiler-chapter="{chapter}">
  <img src="images/{image}" alt="" loading="lazy"><div class="spoiler-card__top"><span class="archive-eyebrow">{eyebrow}</span><span class="chapter-mark">Ch. {chapter}</span></div><h3>{title}</h3><div class="spoiler-card__body"><p>{copy}</p><a class="archive-card-link" href="{href}">Open the reference →</a></div><div class="spoiler-lock" aria-live="polite"><span>✦</span> Sealed beyond your progress</div>
</article>''')
    return '\n'.join(cards)


LORE_INDEX_BODY = '''<header class="archive-page-header"><span class="archive-kicker">The reference room</span><h1>LOTM Lore Index</h1><p>Move through the world by category: the pathways people climb, the characters who carry them, the artifacts that remember too much, and the places where history leaves a mark.</p></header>
<div class="index-note"><img src="images/emblem2.webp" alt="The Fool emblem"><div><strong>Spoiler-aware by default.</strong><p>Use <a href="Archive.html">The Spoiler-Sealed Archive</a> to set your chapter progress first. Index cards stay sealed until their threshold is reached.</p></div></div>
<section class="archive-section"><div class="archive-card-grid archive-card-grid--wide">
''' + ''.join([
    icon_card('Fool_Symbol2_hd.webp', 'Power system', 'Pathways & Sequences', 'Browse the known pathways, their sequence ladders, authorities, and neighboring routes.', 'Pathways_Index.html'),
    icon_card('Klein-N.jpg', 'People', 'Characters', 'Meet the Tarot Club, the churches, and the figures who make the world’s hidden history personal.', 'Characters.html'),
    icon_card('Formal Ritual Altar.webp', 'Objects', 'Artifacts', 'A field guide to sealed artifacts, mystical items, emblems, and places that behave like objects.', 'Artifacts.html'),
    icon_card('Tarot_club.webp', 'Factions', 'Organizations', 'Churches, secret societies, intelligence services, and the clubs that operate between them.', 'Organizations.html'),
    icon_card('LOTM.webp', 'World map', 'Locations', 'Cities, forbidden lands, mystical spaces, and the changing geography of the story.', 'Locations.html'),
    icon_card('crimson moon.webp', 'Chronicle', 'World History', 'Explore the epochs, disasters, and prophecies that make the present age feel temporary.', 'World_History.html'),
]) + '''</div></section>
<section class="reference-ribbon"><div><span class="archive-eyebrow">Already in the archive</span><h2>Go deeper into the original pages</h2></div><div class="ribbon-links"><a href="Pathways.html">The Fool Pathway</a><a href="Mc_Profile.html">Klein Moretti</a><a href="TarotClub.html">Tarot Club</a><a href="Novel.html">Novel overview</a></div></section>'''

PATHWAYS_INDEX_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">The extraordinary ladder</span><h1>Pathways & Sequences</h1><p>No pathway is only a list of powers. Each one carries a philosophy, a set of authorities, and a different answer to the question of what a person can become.</p></header>
{filter_bar('Search pathways…', [('all', 'All pathways'), ('pathways powers', 'Major pathways')])}
<section class="archive-card-grid archive-card-grid--three" data-filter-scope>{make_icon_grid(PATHWAYS, 'Pathways.html')}</section>'''

CHARACTERS_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">People behind the masks</span><h1>Characters</h1><p>Start with the people who sit around the table, then follow the identities, loyalties, and histories that make every name in this world provisional.</p></header>
{filter_bar('Search characters…', [('all', 'All characters'), ('characters tarot', 'Tarot Club'), ('characters history', 'History')])}
<section class="archive-card-grid archive-card-grid--three" data-filter-scope>{make_icon_grid(CHARACTERS, 'Mc_Profile.html')}</section>'''

ARTIFACTS_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">Objects with a cost</span><h1>Artifacts & Relics</h1><p>Mystical items preserve power in physical form. Some are tools. Some are traps. The most dangerous ones do not care whether you know the difference.</p></header>
{filter_bar('Search artifacts…', [('all', 'All artifacts'), ('artifacts sealed', 'Sealed artifacts'), ('artifacts symbols', 'Symbols & marks')])}
<section class="archive-card-grid archive-card-grid--three" data-filter-scope>{make_icon_grid(ARTIFACTS, 'Gallery.html')}</section>'''

ORGANIZATIONS_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">Faith, power, and secrecy</span><h1>Organizations</h1><p>Every institution in the world claims to protect something. The archive tracks what they worship, what they hide, and who is allowed to speak for them.</p></header>
{filter_bar('Search organizations…', [('all', 'All organizations'), ('organizations faith', 'Churches'), ('organizations secret', 'Secret groups'), ('organizations government', 'Governments')])}
<section class="archive-card-grid archive-card-grid--three" data-filter-scope>{make_icon_grid(ORGANIZATIONS, 'Church.html')}</section>'''

LOCATIONS_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">A map that refuses to stay still</span><h1>Locations</h1><p>From a capital’s crowded streets to a palace above the fog, places in the Mysteries are never only backdrops. They remember what happened there.</p></header>
{filter_bar('Search locations…', [('all', 'All locations'), ('locations cities', 'Cities'), ('locations mystical', 'Mystical spaces'), ('locations forbidden', 'Forbidden lands')])}
<section class="archive-card-grid archive-card-grid--three" data-filter-scope>{make_icon_grid(LOCATIONS, 'Novel.html')}</section>'''

HISTORY_BODY = f'''<header class="archive-page-header"><span class="archive-kicker">A chronicle of buried ages</span><h1>World History</h1><p>The world is built on overlapping histories. Read the entries in order, or let the archive reveal only the era your progress has earned.</p></header>
{filter_bar('Search the chronicle…', [('all', 'All eras'), ('history origins', 'Origins'), ('history eras', 'Epochs'), ('history events', 'Events'), ('history prophecy', 'Prophecy')])}
<section class="history-timeline" data-filter-scope>{''.join(f'''<article class="history-row spoiler-card" data-filter-card data-tags="{tags}" data-spoiler-chapter="{chapter}"><div class="history-marker"><span>{str(index+1).zfill(2)}</span></div><div class="history-copy"><div class="spoiler-card__top"><span class="archive-eyebrow">{eyebrow}</span><span class="chapter-mark">Ch. {chapter}</span></div><h2>{title}</h2><div class="spoiler-card__body"><p>{copy}</p></div><div class="spoiler-lock" aria-live="polite"><span>✦</span> Sealed beyond your progress</div></div></article>''' for index, (title, eyebrow, copy, chapter, tags) in enumerate(HISTORY))}</section>'''


def update_nav() -> None:
    for path in ROOT.glob('*.html'):
        if path.name in {'400.html', '401.html', '403.html', '404.html', '500.html', '503.html'}:
            continue
        text = path.read_text(encoding='utf-8', errors='replace')
        updated, count = re.subn(r'<div class="topnav">.*?</div>', NAV, text, count=1, flags=re.S)
        if count:
            path.write_text(updated, encoding='utf-8')


def update_home() -> None:
    path = ROOT / 'index.html'
    text = path.read_text(encoding='utf-8', errors='replace')
    marker = '    <!-- Featured Quote -->'
    if 'class="home-archive-callout"' not in text and marker in text:
        block = '''    <section class="home-archive-callout" aria-labelledby="archive-callout-title">
      <div class="home-archive-callout__copy"><span class="archive-eyebrow">New in the archive</span><h2 id="archive-callout-title">Read above the gray fog</h2><p>Set your last finished chapter, then browse characters, pathways, artifacts, organizations, locations, and history without stepping into spoilers you are not ready for.</p><div><a class="archive-button archive-button--primary" href="Archive.html">Open spoiler-sealed archive</a><a class="archive-button" href="Lore_Index.html">Explore lore index</a></div></div><img src="images/Fool_Art.webp" alt="The Fool symbol rendered in the archive style" loading="lazy">
    </section>
'''
        text = text.replace(marker, block + marker)
        text = text.replace('<link rel="stylesheet" href="css/wiki-search.css">', '<link rel="stylesheet" href="css/wiki-search.css">\n    <link rel="stylesheet" href="css/archive-style.css">')
        path.write_text(text, encoding='utf-8')


def write_pages() -> None:
    pages = {
        'Archive.html': page('The Spoiler-Sealed Archive | LOTM Fan Wiki', 'Choose a Lord of the Mysteries reading position and reveal only the archive entries that are safe for your progress.', ARCHIVE_BODY),
        'Lore_Index.html': page('LOTM Lore Index | Lord of the Mysteries Fan Wiki', 'A spoiler-aware index of Lord of the Mysteries pathways, characters, artifacts, organizations, locations, and world history.', LORE_INDEX_BODY),
        'Pathways_Index.html': page('Pathways & Sequences | LOTM Fan Wiki', 'Browse Lord of the Mysteries pathways and sequence progression with chapter-aware spoiler labels.', PATHWAYS_INDEX_BODY),
        'Characters.html': page('Characters | LOTM Fan Wiki', 'Browse the major characters and Tarot Club members of Lord of the Mysteries with chapter-aware spoiler labels.', CHARACTERS_BODY),
        'Artifacts.html': page('Artifacts & Relics | LOTM Fan Wiki', 'Browse mystical items, sealed artifacts, symbols, and relics from Lord of the Mysteries.', ARTIFACTS_BODY),
        'Organizations.html': page('Organizations | LOTM Fan Wiki', 'Browse the churches, secret societies, governments, and organizations of Lord of the Mysteries.', ORGANIZATIONS_BODY),
        'Locations.html': page('Locations | LOTM Fan Wiki', 'Browse the cities, mystical spaces, and forbidden lands of Lord of the Mysteries.', LOCATIONS_BODY),
        'World_History.html': page('World History | LOTM Fan Wiki', 'Explore the epochs, disasters, and prophecies that shape the world of Lord of the Mysteries.', HISTORY_BODY),
    }
    for name, content in pages.items():
        (ROOT / name).write_text(content, encoding='utf-8')


def write_routes() -> None:
    routes = [{'path': '/', 'title': 'Home'}, {'path': '/index.html', 'title': 'Home'}]
    for path in sorted(ROOT.glob('*.html')):
        if path.name in {'400.html', '401.html', '403.html', '404.html', '500.html', '503.html'} or path.name == 'index.html':
            continue
        routes.append({'path': '/' + quote(path.name, safe='._-'), 'title': path.stem.replace('_', ' ')})
    (ROOT / 'manus-routes.json').write_text(json.dumps({'routes': routes}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def update_sitemap() -> None:
    path = ROOT / 'sitemap.xml'
    if not path.exists():
        return
    text = path.read_text(encoding='utf-8', errors='replace')
    base = 'https://lotm-archive.site.je/'
    additions = []
    for name in ['Archive.html', 'Lore_Index.html', 'Pathways_Index.html', 'Characters.html', 'Artifacts.html', 'Organizations.html', 'Locations.html', 'World_History.html']:
        if f'>{base}{quote(name, safe="._-")}<' not in text:
            additions.append(f'  <url><loc>{base}{quote(name, safe="._-")}</loc></url>')
    if additions:
        text = text.replace('</urlset>', '\n' + '\n'.join(additions) + '\n</urlset>')
        path.write_text(text, encoding='utf-8')


def main() -> None:
    update_nav()
    update_home()
    write_pages()
    write_routes()
    update_sitemap()
    print('Expanded static archive pages and navigation.')


if __name__ == '__main__':
    main()
