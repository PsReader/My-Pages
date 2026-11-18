from pathlib import Path
import html
import json
import re
import time
import requests

ROOT = Path(__file__).resolve().parents[1]
API = "https://lordofthemysteries.fandom.com/api.php"
PAGES = {
    "Alger Wilson.html": "Alger_Wilson",
    "Anthony Reid.html": "Anthony_Reid",
    "Audrey Hall.html": "Audrey_Hall",
    "Azik Eggers.html": "Azik_Eggers",
    "Cattleya.html": "Cattleya",
    "Derrick Berg.html": "Derrick_Berg",
    "Emlyn White.html": "Emlyn_White",
    "Fors Wall.html": "Fors_Wall",
    "Franca Roland.html": "Franca_Roland",
    "Jenna.html": "Jenna",
    "Leonard Mitchell.html": "Leonard_Mitchell",
    "Lumian Lee.html": "Lumian_Lee",
    "Maric.html": "Maric",
    "Pallez Zoroast.html": "Pallez_Zoroast",
    "Reinette Tinekerr.html": "Reinette_Tinekerr",
    "Sharron.html": "Sharron",
    "Will Auceptin.html": "Will_Auceptin",
    "Xio Derecha.html": "Xio_Derecha",
}

SYMBOLS = {
    "Tyrant": "Tyrant_Symbol2.webp",
    "Hanged Man": "Chained_Symbol2.webp",
    "Visionary": "Visionary_Symbol2.webp",
    "Spectator": "Visionary_Symbol2.webp",
    "Death": "Darkness_Symbol2.webp",
    "Darkness": "Darkness_Symbol2.webp",
    "Hermit": "Hermit_Symbol2.webp",
    "Sun": "Sun_Symbol2.webp",
    "Moon": "Moon_Symbol2.webp",
    "Door": "Door_Symbol2_hd.webp",
    "Demoness": "Demoness_Symbol2.webp",
    "Fool": "Fool_Symbol2_hd.webp",
    "Error": "Error_Symbol2_hd.webp",
    "Chained": "Chained_Symbol2.webp",
    "Justiciar": "Justiciar_Symbol2.webp",
    "Red Priest": "Red_Priest_Symbol2.webp",
    "Calamity": "Red_Priest_Symbol2.webp",
}


def matching_template(text, start):
    depth = 0
    i = start
    while i < len(text) - 1:
        token = text[i:i+2]
        if token == "{{":
            depth += 1
            i += 2
        elif token == "}}":
            depth -= 1
            i += 2
            if depth == 0:
                return text[start:i]
        else:
            i += 1
    return text[start:]


def parse_template(block):
    body = block[2:-2]
    lines = body.splitlines()
    fields = {}
    key = None
    buf = []
    for line in lines[1:]:
        m = re.match(r"^\|\s*([^=]+?)\s*=\s?(.*)$", line)
        if m:
            if key is not None:
                fields[key] = "\n".join(buf).strip()
            key = m.group(1).strip()
            buf = [m.group(2)]
        elif key is not None:
            buf.append(line)
    if key is not None:
        fields[key] = "\n".join(buf).strip()
    return fields


def strip_markup(value):
    if not value:
        return ""
    value = re.sub(r"<!--.*?-->", "", value, flags=re.S)
    value = re.sub(r"<ref[^>]*>.*?</ref>", "", value, flags=re.S | re.I)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"\{\{Date\|([^|}]+)(?:\|[^}]*)?\}\}", r"\1", value, flags=re.I)
    value = re.sub(r"\{\{Height\|m=([^|}]+)(?:\|[^}]*)?\}\}", r"\1 m", value, flags=re.I)
    value = re.sub(r"\{\{(?:Pathway|pathway)\|([^|}]+)(?:\|[^}]*)?\}\}", r"\1", value)
    value = value.replace("{{ScrollBox|", "").replace("{{scrollbox|", "")
    for _ in range(5):
        value = re.sub(r"\{\{[^{}]*\}\}", "", value)
    value = value.replace("}}", "")
    value = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", value)
    value = re.sub(r"\[\[([^\]]+)\]\]", r"\1", value)
    value = re.sub(r"\[https?://[^ ]+ ([^\]]+)\]", r"\1", value)
    value = re.sub(r"''+", "", value)
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s*;\s*", "; ", value)
    return html.unescape(value).strip(" \n*-")


def list_value(value):
    if not value:
        return []
    out = []
    for line in value.splitlines():
        clean = strip_markup(line)
        clean = re.sub(r"\s+", " ", clean).strip(" -")
        if clean and clean not in out:
            out.append(clean)
    if not out:
        clean = strip_markup(value)
        if clean:
            out = [clean]
    return out


def first_intro(text, name):
    # The Char temp is the first top-level template on these pages.
    start_match = re.search(r"\{\{Char[_ ]temp", text)
    start = start_match.start() if start_match else -1
    if start < 0:
        return f"{name} is a character in the Lord of the Mysteries universe."
    block = matching_template(text, start)
    rest = text[start + len(block):]
    intro_match = re.search(r"\[\[" + re.escape(name) + r"\]\]\s+is\b.*?(?=\n==)", rest, flags=re.S)
    if intro_match:
        clean = strip_markup(intro_match.group(0))
        clean = re.sub(r"\bof the ([A-Za-z ]+) \.", r"of the \1 Pathway.", clean)
        if len(clean) > 45 and " of the ." not in clean and "related to the ." not in clean and "|source" not in clean:
            return clean
    rest = rest.split("==", 1)[0]
    rest = re.sub(r"\{\{SpoilerToggle/context\|", "", rest)
    paragraphs = []
    for part in re.split(r"\n\s*\n", rest):
        clean = strip_markup(part)
        if clean and len(clean) > 45 and not clean.startswith("{{"):
            paragraphs.append(clean)
    if not paragraphs:
        return f"{name} is a character in the Lord of the Mysteries universe."
    return paragraphs[0]


def sequence_label(fields):
    path = strip_markup(fields.get("sequence_type", ""))
    rank = strip_markup(fields.get("sequence_rank", ""))
    name = strip_markup(fields.get("sequence_name", ""))
    if path and rank and name:
        return f"Sequence {rank}: {name} ({path} Pathway)"
    if path and name:
        return f"{name} ({path} Pathway)"
    if path:
        return f"{path} Pathway"
    return "Not listed"


def path_label(fields):
    vals = [strip_markup(fields.get("sequence_type", ""))]
    b2 = strip_markup(fields.get("sequence_type(book2)", ""))
    if b2 and b2 not in vals:
        vals.append(b2)
    vals = [v for v in vals if v]
    return " / ".join(vals) if vals else "Not listed"


def symbol_for(path):
    for key, image in SYMBOLS.items():
        if key.lower() in path.lower():
            return image, key
    return "LOTM.webp", "Lord of Mysteries"


def esc(s):
    return html.escape(s, quote=True)


def li(items):
    if not items:
        return "<p class=\"muted\">Not listed in the source infobox.</p>"
    return "<ul>" + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>"


def build_page(filename, slug, source_text):
    name = filename[:-5]
    start_match = re.search(r"\{\{Char[_ ]temp", source_text)
    start = start_match.start() if start_match else -1
    fields = parse_template(matching_template(source_text, start)) if start >= 0 else {}
    aliases = list_value(fields.get("aliases"))
    affiliations = list_value(fields.get("affiliation(s)"))
    occupations = list_value(fields.get("occupation(s)"))
    religions = list_value(fields.get("religion"))
    status = strip_markup(fields.get("vital_status")) or "Not listed"
    sex = strip_markup(fields.get("sex")) or "Not listed"
    birth = strip_markup(fields.get("date_of_birth")) or "Not listed"
    origin = strip_markup(fields.get("origin")) or strip_markup(fields.get("nationality")) or "Not listed"
    residence = strip_markup(fields.get("residence")) or "Not listed"
    hair = strip_markup(fields.get("hair_color")) or "Not listed"
    eyes = strip_markup(fields.get("eye_color")) or "Not listed"
    path = path_label(fields)
    sequence = sequence_label(fields)
    intro = first_intro(source_text, name)
    portrait = f"images/character-{re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-')}.webp"
    symbol, symbol_label = symbol_for(path)
    source_url = f"https://lordofthemysteries.fandom.com/wiki/{slug}"
    aliases_text = ", ".join(aliases) if aliases else "Not listed"
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(name)} | Lord of the Mysteries Wiki</title>
  <meta name="description" content="{esc(name)} character profile: aliases, pathway, sequence, affiliations, appearance, and source notes.">
  <link rel="manifest" href="site.webmanifest"><link rel="icon" type="image/png" href="images/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tarotclub-style.css"><link rel="stylesheet" href="css/dynamic-styles.css"><link rel="stylesheet" href="css/member-profile.css">
</head>
<body class="member-page">
  <div class="topnav"><a href="index.html">Home</a><a href="Mc_Profile.html">MC</a><a href="Novel.html">Novel</a><a href="Author.html">Author</a><a href="Songs.html">Songs</a></div>
  <main class="member-shell">
    <div class="member-breadcrumb"><a href="TarotClub_Members.html">Tarot Club</a><span>›</span><span>{esc(name)}</span></div>
    <header class="member-article-header"><span class="member-kicker">Character archive · source-checked</span><h1>{esc(name)}</h1><p class="member-subtitle">{esc(path)} · {esc(sequence)}</p></header>
    <div class="member-layout">
      <article class="member-article">
        <div class="member-lead"><p>{esc(intro)}</p><span class="spoiler-note">This page includes major-spoiler information from the linked source article. The fact fields below are transcribed from that article’s character infobox.</span></div>
        <section id="overview"><h2>Overview</h2><p>{esc(intro)}</p><p class="source-note">The page uses the source article’s current naming, status, and progression terminology rather than the older roster shorthand.</p></section>
        <section id="appearance"><h2>Appearance</h2><div class="fact-grid"><div><span>Sex</span><strong>{esc(sex)}</strong></div><div><span>Hair</span><strong>{esc(hair)}</strong></div><div><span>Eyes</span><strong>{esc(eyes)}</strong></div><div><span>Origin / nationality</span><strong>{esc(origin)}</strong></div><div><span>Residence</span><strong>{esc(residence)}</strong></div></div></section>
        <section id="role"><h2>Role &amp; affiliations</h2><h3>Aliases and titles</h3>{li(aliases)}<h3>Affiliations</h3>{li(affiliations)}<h3>Occupation(s)</h3>{li(occupations)}<h3>Religion(s)</h3>{li(religions)}</section>
        <section id="abilities"><h2>Pathway &amp; abilities</h2><p><strong>Pathway:</strong> {esc(path)}</p><p><strong>Recorded progression:</strong> {esc(sequence)}</p><div class="pathway-callout"><img src="images/{esc(symbol)}" alt="{esc(symbol_label)} symbol"><div><span class="member-kicker">Pathway reference</span><strong>{esc(symbol_label)}</strong><p>Compare sequence names and pathway symbols in the <a href="Pathways.html">Pathways reference</a>.</p></div></div></section>
        <section id="gallery"><h2>Image gallery</h2><div class="member-gallery"><figure><img src="{esc(portrait)}" alt="{esc(name)} character artwork" loading="lazy"><figcaption>Character portrait · local archive asset</figcaption></figure><figure><img src="images/{esc(symbol)}" alt="{esc(symbol_label)} pathway symbol" loading="lazy"><figcaption>{esc(symbol_label)} pathway symbol</figcaption></figure></div></section>
        <section id="references"><h2>References &amp; source notes</h2><p>Profile facts were checked against the <a href="{esc(source_url)}">{esc(name)} article on the Lord of the Mysteries Wiki</a>. The linked source is fan-maintained and may change; it also contains spoilers for <em>Lord of Mysteries</em> and <em>Circle of Inevitability</em>.</p><p class="source-note">Local portrait and pathway images are retained from the supplied archive and are presented here as fan-reference media.</p></section>
      </article>
      <aside class="member-infobox" aria-label="{esc(name)} infobox">
        <h2>{esc(name)}</h2><figure><img src="{esc(portrait)}" alt="{esc(name)} character artwork"><figcaption>{esc(name)} · {esc(path)}</figcaption></figure>
        <dl><div><dt>Aliases</dt><dd>{esc(aliases_text)}</dd></div><div><dt>Status</dt><dd>{esc(status)}</dd></div><div><dt>Birth</dt><dd>{esc(birth)}</dd></div><div><dt>Pathway</dt><dd>{esc(path)}</dd></div><div><dt>Sequence</dt><dd>{esc(sequence)}</dd></div><div><dt>Affiliation</dt><dd>{esc('; '.join(affiliations) if affiliations else 'Not listed')}</dd></div></dl>
        <p class="infobox-source"><a href="{esc(source_url)}">View source article ↗</a></p>
      </aside>
    </div>
    <nav class="member-next"><a href="TarotClub.html">Tarot Club overview</a><a href="TarotClub_Members.html">Member directory</a><a href="TarotClub_Gatherings.html">Gatherings</a></nav>
  </main>
  <footer class="member-footer"><p>Unofficial fan reference. Always check the linked source article for later updates and spoiler context.</p></footer>
  <button id="scrollToTop" aria-label="Back to top">↑</button><script src="js/script.js"></script>
</body></html>
'''

session = requests.Session()
session.headers.update({"User-Agent": "LOTM-Fan-Wiki archive updater/1.0"})
cache = ROOT / "scripts" / "verified-wiki-cache"
cache.mkdir(exist_ok=True)
for i, (filename, slug) in enumerate(PAGES.items()):
    cache_file = cache / f"{slug}.txt"
    if cache_file.exists():
        text = cache_file.read_text()
    else:
        data = session.get(API, params={"action": "parse", "page": slug, "prop": "wikitext", "format": "json"}, timeout=30).json()
        text = data["parse"]["wikitext"]["*"]
        cache_file.write_text(text)
        time.sleep(0.15)
    (ROOT / filename).write_text(build_page(filename, slug, text))
print(f"Rebuilt {len(PAGES)} character pages from the wiki API.")
