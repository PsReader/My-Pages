# Completed: character profile redesign

- Rebuilt all 19 named character pages with a consistent Fandom-inspired article layout: breadcrumb, section tabs, spoiler notice, source-checked infobox, pathway callout, local character portrait, image gallery, and source notes.
- Replaced older roster shorthand with character infobox fields retrieved from the linked Lord of the Mysteries Wiki source articles, including current aliases, status, pathway, sequence, affiliations, appearance facts, and occupations where listed.
- Preserved the supplied local portraits and pathway symbols; added them to every character page’s infobox, pathway callout, and gallery.
- Preserved the existing static-site navigation, responsive behavior, search index, sitemap, and route manifest.

## Maintenance

- The source-checking generator is `scripts/rebuild_character_pages.py`.
- The generator caches retrieved source wikitext under `scripts/verified-wiki-cache/` for repeatable rebuilds.
- The source articles are fan-maintained and may change; each profile links back to its source article and carries a spoiler notice.
