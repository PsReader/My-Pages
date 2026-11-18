# Witbit

Witbit is a static idea generator site. The generators use local templates and word lists. They do not need an account, API, or server-side code.

## Files

- `index.html`, `styles.css`, and `script.js` are the site.
- `robots.txt` and `sitemap.xml` are the crawler files.
- `site.webmanifest` holds the browser install metadata.
- `400.html`, `401.html`, `403.html`, `404.html`, `500.html`, and `503.html` are standalone hosting error documents.

## Run locally

Open `index.html` in a browser or serve the `Witbit` folder over HTTP. Clipboard access requires a secure context, such as HTTPS or localhost.

## Hosting errors

Upload the six status pages to the site document root. In the hosting panel, assign each HTTP status to its matching file. The files render the message; the host must return the corresponding HTTP status code.

## Deployment

`Deploy/deploy-Witbit-root.zip` contains the site files at archive root. Update it after changing the site.
