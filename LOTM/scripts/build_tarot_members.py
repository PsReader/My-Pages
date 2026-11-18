from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]

NAV = '''<div class="topnav">
  <a href="index.html">Home</a>
  <a href="Mc_Profile.html">MC</a>
  <a href="Novel.html">Novel</a>
  <a href="Author.html">Author</a>
  <a href="Songs.html">Songs</a>
</div>'''

PORTRAIT_MAP_PATH = ROOT / 'images' / 'portrait-map.json'
PORTRAITS = json.loads(PORTRAIT_MAP_PATH.read_text(encoding='utf-8')) if PORTRAIT_MAP_PATH.exists() else {}

MEMBERS = [
    dict(slug='klein-moretti', name='Klein Moretti', card='The Fool / The World', kind='Major Arcana · Founder', pathway='Lord of Mysteries · Fool Pathway', sequence='Above the Sequence: Half-Lord of Mysteries', join='The Fool: June 28, 1349 · The World: September 29, 1349', status='Active', affiliation='Sefirah Castle; Church of the Fool', image='Klein-N.jpg', symbol='Fool_Symbol2_hd.webp', summary='The mysterious leader of the Tarot Club and the owner of Sefirah Castle. Klein begins as a cautious transmigrator and becomes the figure at the center of the club’s growing web of alliances.', note='Klein’s Tarot identity is The Fool. His The World identity gave the club an adventurer it could trust before the truth behind the mask was known.'),
    dict(slug='audrey-hall', name='Audrey Hall', card='Justice', kind='Major Arcana', pathway='Visionary', sequence='Sequence 3: Dream Weaver', join='June 28, 1349', status='Active', affiliation='Psychology Alchemists (former)', image='Visionary_Symbol2.webp', symbol='Visionary_Symbol2.webp', summary='A noblewoman whose curiosity, empathy, and discipline lead her into the world of Beyonders. As Justice, Audrey brings observation and emotional intelligence to the Tarot Club.', note='Audrey’s early club role is closely tied to her work with the Psychology Alchemists and the Visionary Pathway.'),
    dict(slug='alger-wilson', name='Alger Wilson', card='The Hanged Man', kind='Major Arcana', pathway='Tyrant', sequence='Sequence 4: Cataclysmic Interrer', join='June 28, 1349', status='Active', affiliation='Church of the Sea God', image="Alger's-Tatoo.webp", symbol='Tyrant_Symbol2.webp', summary='A veteran sailor and believer whose caution is matched by a sharp instinct for survival. Alger is one of the club’s earliest members and an important link to the sea.', note='His pathway and his years at sea make Alger a natural guide to maritime factions, storms, and the politics of faith.'),
    dict(slug='derrick-berg', name='Derrick Berg', card='The Sun', kind='Major Arcana', pathway='Sun', sequence='Sequence 4: Unshadowed', join='August 19, 1349', status='Active', affiliation='Church of the Fool; City of Silver', image='Sun_Symbol2.webp', symbol='Sun_Symbol2.webp', summary='A survivor from the City of Silver whose straightforward courage and faith make him one of the Tarot Club’s clearest moral centers.', note='Derrick’s story connects the club to the Forsaken Land of the Gods and to a civilization that has lived beneath eternal darkness.'),
    dict(slug='fors-wall', name='Fors Wall', card='The Magician', kind='Major Arcana', pathway='Door', sequence='Sequence 4: Secrets Sorcerer', join='October 10, 1349', status='Active', affiliation='Abraham Family', image='Door_Symbol2_hd.webp', symbol='Door_Symbol2_hd.webp', summary='A writer with a talent for surviving situations she would rather avoid. Fors turns the Magician card into a study in hidden doors, improvisation, and reluctant courage.', note='Fors’s connection to the Abraham Family gives the Tarot Club access to one of the world’s most complicated pathway legacies.'),
    dict(slug='emlyn-white', name='Emlyn White', card='The Moon', kind='Major Arcana', pathway='Moon', sequence='Sequence 4: Shaman King', join='December 28, 1349', status='Active', affiliation='Sanguines; Rose School of Thought (former)', image='Moon_Symbol2.webp', symbol='Moon_Symbol2.webp', summary='A proud Sanguine whose early arrogance gradually gives way to responsibility. Emlyn brings the club a different perspective on faith, medicine, and the supernatural.', note='Emlyn’s place between the Sanguines and the Tarot Club makes him a useful bridge to the Moon Pathway’s wider history.'),
    dict(slug='cattleya', name='Cattleya', card='The Hermit', kind='Major Arcana', pathway='Hermit', sequence='Sequence 3: Clairvoyant', join='January 23, 1350', status='Active', affiliation='Moses Ascetic Order; Stars Pirates', image='Hermit_Symbol2.webp', symbol='Hermit_Symbol2.webp', summary='The Queen of Mysteries is an experienced leader with a scholar’s appetite for forbidden knowledge. Her presence gives the Tarot Club a direct line to the sea and its pirates.', note='Cattleya’s card reflects the club’s interest in knowledge that is useful, dangerous, and never complete.'),
    dict(slug='leonard-mitchell', name='Leonard Mitchell', card='The Star', kind='Major Arcana', pathway='Darkness', sequence='Sequence 4: Nightwatcher', join='July 1, 1350', status='Active', affiliation='Church of the Evernight Goddess', image='Darkness_Symbol2.webp', symbol='Darkness_Symbol2.webp', summary='A poet and Nighthawks member whose easygoing surface conceals a long history of duty, loss, and a dangerous companion close to his spirit.', note='Leonard’s relationship with the Church of the Evernight Goddess places the club close to one of the oldest major faiths.'),
    dict(slug='xio-derecha', name='Xio Derecha', card='Judgement', kind='Major Arcana', pathway='Justiciar', sequence='Sequence 4: Imperative Mage', join='July 2, 1350', status='Active', affiliation='MI9', image='Justiciar_Symbol2.webp', symbol='Justiciar_Symbol2.webp', summary='A bounty hunter and MI9 operative who values fairness even when the law is complicated. Xio represents the club’s connection to official investigations.', note='Xio’s role is a reminder that the Tarot Club is not isolated from governments, courts, or the consequences of public action.'),
    dict(slug='lumian-lee', name='Lumian Lee', card='The Chariot', kind='Major Arcana · Book Two', pathway='Calamity of Destruction · initially Red Priest', sequence='Above the Sequence: Calamity of Destruction', join='March, 1359', status='Departed', affiliation='Church of the Ruler of Calamity', image='Red_Priest_Symbol2.webp', symbol='Red_Priest_Symbol2.webp', summary='A determined survivor whose route through the second book widens the Tarot Club’s story into a new country, a new cycle, and a new kind of catastrophe.', note='The Chariot position was later left open when Lumian became a Great Old One during the Apocalypse.'),
    dict(slug='sharron', name='Sharron', card='Temperance', kind='Major Arcana · Book Two', pathway='Chained', sequence='Sequence 2: Ancient Bane', join='March, 1359', status='Active', affiliation='Rose School of Thought · Temperance faction', image='Chained_Symbol2.webp', symbol='Chained_Symbol2.webp', summary='A quiet and formidable member whose presence makes the Temperance card feel literal: restraint, control, and the discipline to survive corruption.', note='Sharron’s membership connects the Tarot Club to the temperance faction of the Rose School of Thought.'),
    dict(slug='franca-roland', name='Franca Roland', card='The Empress', kind='Major Arcana · Book Two', pathway='Demoness', sequence='Sequence 2: Catastrophe', join='Late July, 1360', status='Active', affiliation='Church of the Ruler of Calamity', image='Demoness_Symbol2.webp', symbol='Demoness_Symbol2.webp', summary='A sharp, adaptable Beyonder who rises from a Minor Arcana role to occupy the Empress seat after the Chariot leaves the organization.', note='Franca was formerly the Two of Cups and served under Judgement and later The Chariot before becoming The Empress.'),
    dict(slug='jenna', name='Jenna', card='Seven of Cups', kind='Minor Arcana', pathway='Demoness', sequence='Sequence 3: Unaging', join='Book Two · Trier', status='Active', affiliation='Under The Chariot', image='Demoness_Symbol2.webp', symbol='Demoness_Symbol2.webp', summary='A Minor Arcana member active in Trier. Jenna’s card places her inside the club’s wider network without giving her the same table seat as the Major Arcana.', note='The roster describes Jenna as one of the Minor Arcana members connected to The Chariot.'),
    dict(slug='anthony-reid', name='Anthony Reid', card='Four of Swords', kind='Minor Arcana', pathway='Visionary', sequence='Sequence 4: Manipulator', join='Book Two · Trier', status='Active', affiliation='Under The Chariot', image='Visionary_Symbol2.webp', symbol='Visionary_Symbol2.webp', summary='A Minor Arcana member whose Visionary Pathway places him within the club’s growing network in Trier.', note='Anthony is listed alongside Jenna and Maric as a known Minor Arcana member.'),
    dict(slug='maric', name='Maric', card='Knight of Swords', kind='Minor Arcana', pathway='Chained', sequence='Sequence 5: Wraith', join='Book Two · Trier', status='Active', affiliation='Under Temperance', image='Chained_Symbol2.webp', symbol='Chained_Symbol2.webp', summary='A Minor Arcana member connected to Temperance. Maric’s record is brief, but his card shows how the Tarot Club can extend beyond its central gathering.', note='Maric is listed as a Knight of Swords under Temperance in the current member roster.'),
    dict(slug='will-auceptin', name='Will Auceptin', card='Auxiliary member', kind='Tarot Club auxiliary', pathway='Not listed on the roster page', sequence='Not listed', join='Invited through The Magician', status='Auxiliary', affiliation='Worked with The Magician in Trier', image='Wil_Auceptin_Official.webp', symbol='Visionary_Symbol2.webp', summary='A child of the Wheel of Fortune Pathway whose help is valuable enough to be counted by Mr. Fool as part of the wider club.', note='Will was hired by The Magician to bestow fortune upon the Seven of Cups in Trier.'),
    dict(slug='pallez-zoroast', name='Pallez Zoroast', card='Auxiliary member', kind='Tarot Club auxiliary', pathway='Error', sequence='Not listed', join='Connected through The Star', status='Auxiliary', affiliation='Counsel to Leonard Mitchell', image='Pallez_Zoroast_cardgame.webp', symbol='Error_Symbol2_hd.webp', summary='An ancient and experienced figure who acts as The Star’s counsel. Pallez brings a deep knowledge of the Error Pathway and its dangers.', note='Pallez advised on The World’s revival ritual against Amon.'),
    dict(slug='azik-eggers', name='Azik Eggers', card='Auxiliary member', kind='Tarot Club auxiliary', pathway='Death', sequence='Not listed', join='Connected through the wider club', status='Auxiliary', affiliation='Independent history professor', image='Tianwen_Kadokawa_-_Mr._Azik.webp', symbol='Darkness_Symbol2.webp', summary='A history professor whose missing past reaches into death, rebirth, and the oldest layers of the world. The club counts on him without needing to place him at the table.', note='The churches believe Azik’s codename is Death. He also eliminated Qilangos.'),
    dict(slug='reinette-tinekerr', name='Reinette Tinekerr', card='Auxiliary member', kind='Tarot Club auxiliary', pathway='Chained', sequence='Not listed', join='The Fool’s messenger', status='Auxiliary', affiliation='Rose School of Thought · Temperance faction', image='Reinette_Tinekerr_Official.webp', symbol='Chained_Symbol2.webp', summary='The Fool’s messenger, carrying messages and presence between the gray fog and the world below.', note='Reinette is associated with the Temperance faction of the Rose School of Thought.'),
]


def member_filename(member: dict) -> str:
    return f"{member['name']}.html"


def member_url(member: dict) -> str:
    if member['name'] == 'Klein Moretti':
        return 'Mc_Profile.html'
    return quote(member_filename(member), safe='._-')


def profile_page(m: dict) -> str:
    esc = lambda value: html.escape(value)
    image = html.escape(PORTRAITS.get(m['name'], m['image']), quote=True)
    symbol = html.escape(m['symbol'], quote=True)
    source_slug = quote(m['name'].replace(' ', '_'))
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(m['name'])} | Lord of the Mysteries Wiki</title>
  <meta name="description" content="{esc(m['name'])}, {esc(m['card'])} of the Tarot Club: pathway, sequence, affiliations, relationships, and archive notes.">
  <link rel="manifest" href="site.webmanifest"><link rel="icon" type="image/png" href="images/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tarotclub-style.css"><link rel="stylesheet" href="css/dynamic-styles.css"><link rel="stylesheet" href="css/member-profile.css">
</head>
<body class="member-page">
  {NAV}
  <main class="member-shell">
    <div class="member-breadcrumb"><a href="TarotClub_Members.html">Tarot Club</a><span>›</span><span>{esc(m['name'])}</span></div>
    <header class="member-article-header"><span class="member-kicker">{esc(m['kind'])}</span><h1>{esc(m['name'])}</h1><p class="member-subtitle">{esc(m['card'])} · {esc(m['pathway'])}</p></header>
    <nav class="member-tabs" aria-label="Article sections"><a class="active" href="#overview">Overview</a><a href="#history">History</a><a href="#relationships">Relationships</a><a href="#abilities">Abilities</a><a href="#progress">Progress</a><a href="#quotes">Quotes</a></nav>
    <div class="member-layout">
      <article class="member-article">
        <div class="member-lead"><p>{esc(m['summary'])}</p><span class="spoiler-note">This page contains story information. The roster facts below follow the supplied member archive; the linked source page may contain later spoilers.</span></div>
        <section id="overview"><h2>Overview</h2><p>{esc(m['summary'])}</p></section>
        <section id="history"><h2>History</h2><p>{esc(m['note'])}</p><p>The member joined the Tarot Club as <strong>{esc(m['card'])}</strong>. Their recorded entry point is <strong>{esc(m['join'])}</strong>, and the club directory currently lists their status as <strong>{esc(m['status'])}</strong>.</p></section>
        <section id="relationships"><h2>Relationships & affiliation</h2><p>The archive records this member’s outside affiliation as <strong>{esc(m['affiliation'])}</strong>. The Tarot Club connection is the organizing thread of this page.</p></section>
        <section id="abilities"><h2>Pathway & abilities</h2><p>This member is associated with the <strong>{esc(m['pathway'])}</strong> pathway. The available roster record lists their progression as <strong>{esc(m['sequence'])}</strong>.</p><div class="pathway-callout"><img src="images/{symbol}" alt="{esc(m['pathway'])} symbol"><div><span class="member-kicker">Pathway symbol</span><strong>{esc(m['pathway'])}</strong><p>See the existing <a href="Pathways.html">Pathways reference</a> for the wider sequence system.</p></div></div></section>
        <section id="progress"><h2>Progress</h2><p>The profile is labeled for the Tarot Club roster rather than presented as a complete novel timeline. Use the chapter progress controls on the archive when you want spoiler-aware browsing.</p></section>
        <section id="quotes"><h2>Quotes & source notes</h2><blockquote>“A Major Arcana card symbolizes not just you personally, but also the forces you represent.”</blockquote><p class="source-note">Profile facts cross-checked against the supplied Tarot Club member roster and the <a href="https://lordofthemysteries.fandom.com/wiki/{source_slug}">Lord of the Mysteries Wiki article for {esc(m['name'])}</a>. Images are stored locally in this project’s <code>images</code> folder.</p></section>
      </article>
      <aside class="member-infobox" aria-label="{esc(m['name'])} infobox">
        <h2>{esc(m['name'])}</h2><figure><img src="images/{image}" alt="{esc(m['name'])} character artwork"><figcaption>{esc(m['name'])} · {esc(m['card'])}</figcaption></figure>
        <dl><div><dt>Card</dt><dd>{esc(m['card'])}</dd></div><div><dt>Pathway</dt><dd>{esc(m['pathway'])}</dd></div><div><dt>Sequence</dt><dd>{esc(m['sequence'])}</dd></div><div><dt>Joined</dt><dd>{esc(m['join'])}</dd></div><div><dt>Status</dt><dd>{esc(m['status'])}</dd></div><div><dt>Affiliation</dt><dd>{esc(m['affiliation'])}</dd></div></dl>
        <p class="infobox-source"><a href="https://lordofthemysteries.fandom.com/wiki/{source_slug}">View source article ↗</a></p>
      </aside>
    </div>
    <nav class="member-next"><a href="TarotClub.html">Tarot Club overview</a><a href="TarotClub_Members.html">Member directory</a><a href="TarotClub_Gatherings.html">Gatherings</a></nav>
  </main>
  <footer class="member-footer"><p>Unofficial fan reference. The Tarot Club roster and lore are adapted from the supplied LOTM fan-wiki material.</p></footer>
  <button id="scrollToTop" aria-label="Back to top">↑</button><script src="js/script.js"></script>
</body>
</html>'''


def directory_markup() -> str:
    groups = [('Major Arcana', [m for m in MEMBERS if 'Major Arcana' in m['kind'] or m['name'] == 'Klein Moretti']), ('Minor Arcana', [m for m in MEMBERS if 'Minor Arcana' in m['kind']]), ('Auxiliary members', [m for m in MEMBERS if 'auxiliary' in m['kind']])]
    parts = ['<section class="member-directory" aria-labelledby="member-directory-title"><div class="directory-heading"><span class="member-kicker">Individual records</span><h2 id="member-directory-title">Open a member page</h2><p>Choose a card to see that member’s role, pathway, status, affiliations, and a short archive note.</p></div>']
    for label, members in groups:
        parts.append(f'<h3 class="directory-group-title">{label}</h3><div class="member-card-grid">')
        for m in members:
            parts.append(f'''<a class="member-directory-card" href="{member_url(m)}"><img src="images/{m['symbol']}" alt="" loading="lazy"><span>{html.escape(m['card'])}</span><strong>{html.escape(m['name'])}</strong><small>{html.escape(m['pathway'])}</small></a>''')
        parts.append('</div>')
    parts.append('</section>')
    return ''.join(parts)


def update_nav() -> None:
    for path in ROOT.glob('*.html'):
        if path.name in {'400.html', '401.html', '403.html', '404.html', '500.html', '503.html'}:
            continue
        text = path.read_text(encoding='utf-8', errors='replace')
        updated, count = re.subn(r'<div class="topnav">.*?</div>', NAV, text, count=1, flags=re.S)
        if count:
            path.write_text(updated, encoding='utf-8')


def update_members_page() -> None:
    path = ROOT / 'TarotClub_Members.html'
    text = path.read_text(encoding='utf-8', errors='replace')
    if 'class="member-directory"' not in text:
        text, count = re.subn(r'(\s*<div class="tarot-fan"[^>]*>)', '\n\t\t' + directory_markup() + r'\n\t\t\1', text, count=1)
        if count == 0:
            raise RuntimeError('Could not find Tarot Club fan/table insertion point')
    text = text.replace('<link rel="stylesheet" href="css/dynamic-styles.css" />', '<link rel="stylesheet" href="css/dynamic-styles.css" />\n\t\t<link rel="stylesheet" href="css/member-profile.css" />')
    path.write_text(text, encoding='utf-8')


def update_search_builder() -> None:
    path = ROOT / 'scripts' / 'build-search-index.py'
    text = path.read_text(encoding='utf-8', errors='replace')
    if 'Klein Moretti.html' not in text:
        mapping = ''.join(f'    {member_filename(m)!r}: "characters",\n' for m in MEMBERS)
        text = text.replace('PAGE_CATEGORIES = {\n', 'PAGE_CATEGORIES = {\n' + mapping)
        titles = ''.join(f'    {member_filename(m)!r}: "{m["name"]} — {m["card"]}",\n' for m in MEMBERS)
        text = text.replace('PAGE_TITLES = {\n', 'PAGE_TITLES = {\n' + titles)
        summaries = ''.join(f'    {member_filename(m)!r}: "{m["name"]}, {m["card"]} of the Tarot Club: pathway, sequence, affiliations, and profile notes.",\n' for m in MEMBERS)
        text = text.replace('PAGE_SUMMARIES = {\n', 'PAGE_SUMMARIES = {\n' + summaries)
        path.write_text(text, encoding='utf-8')


def write_routes() -> None:
    routes = [{'path': '/', 'title': 'Home'}, {'path': '/index.html', 'title': 'Home'}]
    excluded = {'400.html', '401.html', '403.html', '404.html', '500.html', '503.html'}
    for path in sorted(ROOT.glob('*.html')):
        if path.name in excluded or path.name == 'index.html':
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
    for m in MEMBERS:
        loc = base + member_url(m)
        if loc not in text:
            additions.append(f'  <url><loc>{loc}</loc></url>')
    if additions:
        text = text.replace('</urlset>', '\n' + '\n'.join(additions) + '\n</urlset>')
        path.write_text(text, encoding='utf-8')


def main() -> None:
    # Character pages are maintained by rebuild_character_pages.py, which pulls
    # the source-checked infobox data and preserves the richer profile layout.
    # This generator owns the directory, search metadata, routes, and sitemap.
    update_nav()
    update_members_page()
    update_search_builder()
    write_routes()
    update_sitemap()
    print(f'Synchronized the Tarot Club directory and metadata for {len(MEMBERS)} member pages.')


if __name__ == '__main__':
    main()
