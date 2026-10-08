# Hosting error pages

These standalone pages cover HTTP 400, 401, 403, 404, 500, and 503. Upload this folder as /errors/ in the site document root.

Design read: Recovery pages for site visitors, retaining each project?s established visual language so the status and useful return links stay in focus. Dials E1/R1/M0.

For a hosting control panel, assign each status to its matching HTML file. For Apache or LiteSpeed, append the directives in apache-error-documents.txt to the existing document-root .htaccess file. Do not replace existing host rules.

The pages do not set HTTP status codes by themselves. The host must map each code to its matching document. The 404.html at the project root remains available for hosts that require that location.
