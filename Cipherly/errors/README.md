# Cipherly hosting error pages

These pages cover the six statuses shown in the hosting panel: **400, 401, 403, 404, 500, and 503**. Each HTML file is standalone: it has inline styling, no remote fonts or scripts, and no dependencies on the main site’s CSS.

## cPanel / hosting control panel

1. Upload the six `.html` files in this folder to a folder named `errors` in your site’s document root (often `public_html/errors`).
2. In the host’s **Error Pages** screen, edit each status and point it to the matching file: `400.html`, `401.html`, `403.html`, `404.html`, `500.html`, or `503.html`.
3. Test a missing URL for 404. Test the other codes only with the host’s preview/test feature, if available; avoid deliberately triggering 500/503 on a live site.

If the panel asks you to paste HTML rather than choose a file, open the matching `.html` file and paste its complete contents.

## Apache / LiteSpeed alternative

If your host uses Apache-compatible `.htaccess` routing, copy the lines in [`apache-error-documents.txt`](apache-error-documents.txt) into your existing document-root `.htaccess`. **Append** them; do not replace the host’s existing file. Then upload this folder as `/errors/`.

If your site is installed below the domain root (for example, `/my-site/`), change each `/errors/...` mapping to `/my-site/errors/...` and change each page’s `href="/"` home link to the correct site path.

## Notes

- These pages do not set HTTP status codes themselves. The hosting control panel or server mapping must associate each page with its matching status.
- Keep the actual 401/403/500/503 access and server configuration unchanged; customize only the displayed error document.
- The pages intentionally avoid technical stack traces and private server details.
