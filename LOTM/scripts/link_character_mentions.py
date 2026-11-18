from pathlib import Path
from urllib.parse import quote, unquote
from bs4 import BeautifulSoup, NavigableString
import re

ROOT = Path(__file__).resolve().parents[1]
CHARACTERS = [
    'Klein Moretti', 'Audrey Hall', 'Alger Wilson', 'Derrick Berg',
    'Fors Wall', 'Emlyn White', 'Cattleya', 'Leonard Mitchell',
    'Xio Derecha', 'Lumian Lee', 'Sharron', 'Franca Roland', 'Jenna',
    'Anthony Reid', 'Maric', 'Will Auceptin', 'Pallez Zoroast',
    'Azik Eggers', 'Reinette Tinekerr',
]
URLS = {name: quote(f'{name}.html', safe='._-') for name in CHARACTERS}
URLS['Klein Moretti'] = 'Mc_Profile.html'
PATTERN = re.compile('|'.join(re.escape(name) for name in sorted(CHARACTERS, key=len, reverse=True)))
SKIP_PARENTS = {'a', 'script', 'style', 'title', 'textarea', 'option'}


def current_profile(path):
    return path.name[:-5] if path.name.endswith('.html') and path.name[:-5] in URLS else None


def decorate_existing_links(soup):
    changed = False
    for link in soup.find_all('a', href=True):
        href_name = Path(unquote(link['href'].split('#', 1)[0].lstrip('/'))).name
        character = next((name for name, url in URLS.items() if unquote(url) == href_name), None)
        visible_text = link.get_text(' ', strip=True)
        if not character:
            character = next((name for name in CHARACTERS if name in visible_text), None)
        if not character:
            continue
        classes = link.get('class', [])
        if 'character-link' not in classes:
            classes.append('character-link')
            link['class'] = classes
            changed = True
        if link.get('data-character') != character:
            link['data-character'] = character
            changed = True
    return changed


def linkify_file(path):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    changed = decorate_existing_links(soup)
    for node in list(soup.find_all(string=True)):
        if not isinstance(node, NavigableString):
            continue
        if any(parent.name in SKIP_PARENTS for parent in node.parents):
            continue
        text = str(node)
        matches = list(PATTERN.finditer(text))
        if not matches:
            continue
        # Link every visible mention, including headings, captions, tables, buttons,
        # and the current profile page itself. Existing links are skipped above.
        parts = []
        cursor = 0
        replaced = False
        for match in matches:
            name = match.group(0)
            if match.start() > cursor:
                parts.append(NavigableString(text[cursor:match.start()]))
            link = soup.new_tag('a', href=URLS[name])
            link['class'] = ['character-link']
            link['data-character'] = name
            link.string = name
            parts.append(link)
            cursor = match.end()
            replaced = True
        if not replaced:
            continue
        if cursor < len(text):
            parts.append(NavigableString(text[cursor:]))
        for part in parts:
            node.insert_before(part)
        node.extract()
        changed = True
    if changed:
        path.write_text(str(soup), encoding='utf-8')
    return changed


changed = 0
for page in sorted(ROOT.glob('*.html')):
    if linkify_file(page):
        changed += 1
print(f'Linked character mentions in {changed} HTML pages.')
