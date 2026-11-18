# Witbit SEO and AI-discovery audit

**Audit date:** 2026-10-19  
**Scope:** Supplied static-site bundle and a read-only check of `https://witbit.site.je/` and its crawler-facing files.

## Findings and changes

The homepage already contains useful, meaningful generator descriptions in its initial HTML, so the core content does not depend on JavaScript for indexing. The supplied page also had a canonical URL, robots instructions, sitemap, and a valid single-page route declaration. The main metadata gap was that its poetic title and generic description did not identify the product's seven generators. Open Graph and Twitter descriptions differed, there was no social preview image or structured data, the web manifest had stale descriptive text, and no AI-oriented plain-text overview existed.

The updated homepage uses a descriptive title and meta description, seven focused keyword phrases, matching Open Graph and Twitter copy, a new 1200 × 630 social image, and JSON-LD `WebApplication` data listing all seven generators. The self-contained SVG favicon now uses a lowercase serif `w` mark, red period, folded paper corner, and pencil-like underline drawn from Witbit's wordmark and paper-and-ink palette; it is referenced by the page and web manifest. The web manifest's name, description, and theme color now match the page. The route manifest title has been synchronized. `llms.txt` gives AI assistants a concise overview and cautions that culturally specific generated material is for inspiration, not factual authority. `robots.txt` and the canonical sitemap remain aligned with the single public homepage.

`llms.txt` is an optional, emerging convention: its presence is not a search-ranking signal or a guarantee that any AI service will consume or cite the site. Structured data likewise helps machines interpret the page but cannot guarantee rankings or AI-search inclusion.

## Verification

Local checks passed for the title length (53 characters), meta description length (142 characters), seven keywords, one concise H1, unique HTML IDs, resolving in-page links, matching canonical and Open Graph URLs, parseable JSON-LD describing seven features, well-formed SVG/XML, sitemap and manifest validity, synchronized route title, 1200 × 630 social image, local HTTP delivery of the homepage and crawler-facing files, and `node --check script.js`.

## Production limitation

The read-only check of the configured live domain did **not** return a normal crawler-ready site: the homepage returned a JavaScript cookie challenge, `/robots.txt` returned 404, `/sitemap.xml` returned challenge HTML instead of XML, and `/favicon.svg` returned 404. This means the domain's live crawlability and favicon are not fixed until the updated bundle is deployed and the host/CDN is configured to serve the files directly to visitors and crawlers. The archive contains the corrected files, but it was not deployed because no publishing access was included with the attachment. After deployment, confirm that `/`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/llms.txt`, and `/social-card.png` return their actual content and correct MIME types without the challenge page.
