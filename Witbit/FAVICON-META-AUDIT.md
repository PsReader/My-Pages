# Witbit favicon and metadata compatibility audit

**Checked:** 2026-10-19. **Conclusion:** The source HTML is now well covered for modern browsers and search metadata, but production cannot be called fully optimized until the host serves the homepage and icon files to crawlers. The live origin still returns a JavaScript challenge for `/` and does not serve the tested icon and robots endpoints correctly.

## What was checked and changed

The homepage has a descriptive 53-character title and a unique 142-character description. Google recommends descriptive, concise titles and relevant descriptions, but does not promise a fixed character count or that its search snippet will use the exact meta description. Search snippets can be generated from page content instead. The social preview now declares a large image card with image format, dimensions, and alt text. The `meta keywords` field was removed because it is not among Google Search Central's supported meta tags. Its presence is not needed for Google SEO.

The former HTML head declared only `favicon.svg`. Google Search Central's current favicon guidance lists BMP, GIF, ICO, PNG, JPEG, PPM, and TIFF—not SVG—and recommends a square icon larger than 48 × 48 pixels. The page now declares a 96 × 96 PNG for search compatibility and the SVG for browsers that support it, plus a multi-resolution ICO fallback and an Apple touch icon. The manifest now includes 192 × 192 and 512 × 512 PNG icons, and an SVG `any` icon. It no longer labels the ordinary paper-label mark as `maskable`; that designation is intended for artwork composed for an operating-system mask and safe zone.

Source files checked locally: the title, description, canonical, structured data, image metadata, manifest JSON and image declarations, SVG parse, and generated raster dimensions. Browser selection among multiple `rel="icon"` resources is guided by their declared type and sizes; iOS uses `apple-touch-icon` for web clips rather than selecting ordinary `rel="icon"` links.

## Live-deployment blocker

A direct check of `https://witbit.site.je/` still received an 841-byte JavaScript cookie-challenge page rather than the site HTML. `/favicon.svg` and `/apple-touch-icon.png` returned 404; `/favicon.ico`, `/robots.txt`, and `/sitemap.xml` returned challenge HTML or errors instead of the expected icon or crawler document. Therefore the new source bundle is ready, but these improvements are **not live** until it is deployed and the host/CDN serves those exact files without an interstitial challenge to normal visitors and search crawlers. After publication, test the homepage, each icon URL, `/robots.txt`, and `/sitemap.xml` directly and verify their content types.

## References

[1]: https://developers.google.com/search/docs/appearance/favicon-in-search "Google Search Central favicon guidelines"
[2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#icon "MDN documentation for rel=icon and Apple touch icons"
[3]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons "MDN Web App Manifest icon documentation"
[4]: https://developers.google.com/search/docs/appearance/title-link "Google Search Central title-link guidance"
[5]: https://developers.google.com/search/docs/appearance/snippet "Google Search Central snippet and meta-description guidance"
[6]: https://developers.google.com/search/docs/crawling-indexing/special-tags "Google Search Central supported meta tags"
