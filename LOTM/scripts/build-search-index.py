#!/usr/bin/env python3
"""Build the browser-side search index from the static wiki HTML pages."""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "search-index.json"
ERROR_PAGES = {"400.html", "401.html", "403.html", "404.html", "500.html", "503.html"}
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
SKIP_TAGS = {"head", "script", "style", "noscript", "nav", "footer", "button"}
SKIP_CLASSES = {"topnav", "back-button", "wiki-search-browser"}

CATEGORIES = {
    "characters": "Characters",
    "pathways": "Pathways & Powers",
    "organizations": "Organizations",
    "volumes": "Volumes",
    "lore": "Novel & Lore",
    "media": "Quotes & Media",
    "reference": "Reference",
    "overview": "Overview",
}

PAGE_CATEGORIES = {
    "Klein Moretti.html": "characters",
    "Audrey Hall.html": "characters",
    "Alger Wilson.html": "characters",
    "Derrick Berg.html": "characters",
    "Fors Wall.html": "characters",
    "Emlyn White.html": "characters",
    "Cattleya.html": "characters",
    "Leonard Mitchell.html": "characters",
    "Xio Derecha.html": "characters",
    "Lumian Lee.html": "characters",
    "Sharron.html": "characters",
    "Franca Roland.html": "characters",
    "Jenna.html": "characters",
    "Anthony Reid.html": "characters",
    "Maric.html": "characters",
    "Will Auceptin.html": "characters",
    "Pallez Zoroast.html": "characters",
    "Azik Eggers.html": "characters",
    "Reinette Tinekerr.html": "characters",
    "Mc_Profile.html": "characters",
    "identities.html": "characters",
    "Pathways.html": "pathways",
    "Abilities.html": "pathways",
    "Church.html": "organizations",
    "TarotClub.html": "organizations",
    "TarotClub_Achievements.html": "organizations",
    "TarotClub_Gatherings.html": "organizations",
    "TarotClub_Members.html": "organizations",
    "TarotClub_Rituals.html": "organizations",
    "Novel.html": "lore",
    "Quotes.html": "media",
    "Songs.html": "media",
    "Gallery.html": "media",
    "Author.html": "reference",
    "index.html": "overview",
}

PAGE_TITLES = {
    "Klein Moretti.html": "Klein Moretti — The Fool / The World",
    "Audrey Hall.html": "Audrey Hall — Justice",
    "Alger Wilson.html": "Alger Wilson — The Hanged Man",
    "Derrick Berg.html": "Derrick Berg — The Sun",
    "Fors Wall.html": "Fors Wall — The Magician",
    "Emlyn White.html": "Emlyn White — The Moon",
    "Cattleya.html": "Cattleya — The Hermit",
    "Leonard Mitchell.html": "Leonard Mitchell — The Star",
    "Xio Derecha.html": "Xio Derecha — Judgement",
    "Lumian Lee.html": "Lumian Lee — The Chariot",
    "Sharron.html": "Sharron — Temperance",
    "Franca Roland.html": "Franca Roland — The Empress",
    "Jenna.html": "Jenna — Seven of Cups",
    "Anthony Reid.html": "Anthony Reid — Four of Swords",
    "Maric.html": "Maric — Knight of Swords",
    "Will Auceptin.html": "Will Auceptin — Auxiliary member",
    "Pallez Zoroast.html": "Pallez Zoroast — Auxiliary member",
    "Azik Eggers.html": "Azik Eggers — Auxiliary member",
    "Reinette Tinekerr.html": "Reinette Tinekerr — Auxiliary member",
    "index.html": "Home & Overview",
    "Mc_Profile.html": "Klein Moretti — Character Profile",
    "identities.html": "Identities & Aliases",
    "Pathways.html": "Fool Pathway",
    "Pathways_Index.html": "Pathway Directory",
    "Abilities.html": "Abilities",
    "Church.html": "Church of the Fool",
    "TarotClub.html": "Tarot Club",
    "TarotClub_Achievements.html": "Tarot Club Achievements",
    "TarotClub_Gatherings.html": "Tarot Club Gatherings",
    "TarotClub_Members.html": "Tarot Club Members",
    "TarotClub_Rituals.html": "Tarot Club Rituals",
    "Novel.html": "Novel Overview",
    "Quotes.html": "Quotes",
    "Songs.html": "Songs",
    "Gallery.html": "Gallery",
    "Author.html": "Author & Project Notes",
}

PAGE_SUMMARIES = {
    "Klein Moretti.html": "Klein Moretti, The Fool / The World of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Audrey Hall.html": "Audrey Hall, Justice of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Alger Wilson.html": "Alger Wilson, The Hanged Man of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Derrick Berg.html": "Derrick Berg, The Sun of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Fors Wall.html": "Fors Wall, The Magician of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Emlyn White.html": "Emlyn White, The Moon of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Cattleya.html": "Cattleya, The Hermit of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Leonard Mitchell.html": "Leonard Mitchell, The Star of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Xio Derecha.html": "Xio Derecha, Judgement of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Lumian Lee.html": "Lumian Lee, The Chariot of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Sharron.html": "Sharron, Temperance of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Franca Roland.html": "Franca Roland, The Empress of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Jenna.html": "Jenna, Seven of Cups of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Anthony Reid.html": "Anthony Reid, Four of Swords of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Maric.html": "Maric, Knight of Swords of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Will Auceptin.html": "Will Auceptin, Auxiliary member of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Pallez Zoroast.html": "Pallez Zoroast, Auxiliary member of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Azik Eggers.html": "Azik Eggers, Auxiliary member of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "Reinette Tinekerr.html": "Reinette Tinekerr, Auxiliary member of the Tarot Club: pathway, sequence, affiliations, and profile notes.",
    "index.html": "Main archive landing page, volumes, featured content, and wiki links.",
    "Mc_Profile.html": "Klein Moretti, the main character and central character hub.",
    "identities.html": "Klein's identities, aliases, disguises, and related names.",
    "Pathways.html": "The Fool Pathway: sequence progression, themes, and abilities.",
    "Pathways_Index.html": "Browse all 22 standard pathways grouped by their pathway families.",
    "Abilities.html": "Powers and abilities associated with the Fool Pathway.",
    "Church.html": "Factions, churches, and organizations in the novel.",
    "TarotClub.html": "Tarot Club lore, rules, members, and commissions.",
    "TarotClub_Achievements.html": "Milestones and achievements of the Tarot Club.",
    "TarotClub_Gatherings.html": "Tarot Club gatherings and participant records.",
    "TarotClub_Members.html": "Tarot Club members and their details.",
    "TarotClub_Rituals.html": "Rituals and procedures associated with the Tarot Club.",
    "Novel.html": "Story overview, volumes, setting, and framing for Lord of the Mysteries.",
    "Quotes.html": "Memorable lines, quotes, and lore from the novel.",
    "Songs.html": "Fan songs and music inspired by Lord of the Mysteries.",
    "Gallery.html": "Art and visual tribute related to the novel.",
    "Author.html": "Creator information and project notes.",
}


class VisibleTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, bool]] = []
        self.parts: list[str] = []
        self.title_parts: list[str] = []
        self.meta_description = ""
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        parent_hidden = self.stack[-1][1] if self.stack else False
        hidden = parent_hidden or tag in SKIP_TAGS or bool(classes & SKIP_CLASSES)
        if tag == "title":
            self.in_title = True
        if tag == "meta" and (attributes.get("name") or "").lower() == "description":
            self.meta_description = attributes.get("content") or ""
        if tag not in VOID_TAGS:
            self.stack.append((tag, hidden))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if not (self.stack and self.stack[-1][1]):
            self.parts.append(data)


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def category_for(filename: str) -> str:
    if re.fullmatch(r"Volume \d+\.html", filename):
        return "volumes"
    if filename == "Pathways_Index.html" or filename == "Pathways.html" or filename.startswith("Pathway_"):
        return "pathways"
    return PAGE_CATEGORIES.get(filename, "reference")
def title_for(filename: str, parsed: VisibleTextParser) -> str:
    if filename in PAGE_TITLES:
        return PAGE_TITLES[filename]
    if re.fullmatch(r"Volume \d+\.html", filename):
        number = re.search(r"\d+", filename).group(0)
        match = re.search(rf"Volume\s*{number}\s*[:—-]?\s*([^|]+)", " ".join(parsed.title_parts), re.I)
        if match:
            return f"Volume {number}: {normalized(match.group(1))}"
        return f"Volume {number}"
    return normalized(" ".join(parsed.title_parts)) or Path(filename).stem.replace("_", " ")


def main() -> None:
    entries = []
    for page in sorted(ROOT.glob("*.html")):
        if page.name in ERROR_PAGES:
            continue
        parsed = VisibleTextParser()
        parsed.feed(page.read_text(encoding="utf-8-sig", errors="replace"))
        body_text = normalized(" ".join(parsed.parts))
        title = title_for(page.name, parsed)
        category = category_for(page.name)
        summary = PAGE_SUMMARIES.get(page.name) or normalized(parsed.meta_description) or body_text[:220]
        full_text = normalized(" ".join((title, CATEGORIES[category], summary, body_text)))
        entries.append({
            "title": title,
            "url": quote(page.name, safe="._-"),
            "category": category,
            "categoryLabel": CATEGORIES[category],
            "summary": summary,
            "searchText": full_text,
        })
    entries.sort(key=lambda item: (item["categoryLabel"].casefold(), item["title"].casefold()))
    OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} wiki pages to {OUTPUT.name} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
