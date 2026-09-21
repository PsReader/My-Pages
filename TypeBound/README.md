# Type Bound

Type Bound is a browser-based typing challenge that now supports both offline mode and optional Supabase cloud accounts.

The main play loop has been refined around immediate feedback: a clearer live-session marker, accessible time progress, Space-to-start support, stronger input focus, larger coarse-pointer targets, mobile-friendly controls, and reduced-motion support.

## InfinityFree deployment

1. Create an InfinityFree account and a hosting account.
2. Open the InfinityFree **Online File Manager** or connect with FTP.
3. Open the `htdocs` directory.
4. Upload the contents of this package directly into `htdocs`.
5. Make sure `index.html` is directly inside `htdocs`, not inside an extra `type-bound` folder.
6. Open the free hosting URL assigned by InfinityFree.

This is a static site, so there is no PHP or build command required. The Supabase database is hosted separately and is accessed by the browser through its public client API.

## Supabase cloud account

The real `src/supabase-config.js` (configured with the Supabase project URL and publishable key) is git-ignored and only exists on the deploy machine. A clone ships `src/supabase-config.example.js` instead — copy it to `src/supabase-config.js` and fill in the values for local cloud development. The browser loads the Supabase JavaScript library from jsDelivr, then loads the local cloud client and sync helper.

Users can optionally create an account or sign in. Completed runs are always saved locally. Signed-in runs are also submitted to Supabase, and the online leaderboard replaces the local leaderboard when cloud results are available. If Supabase is unreachable or the user is signed out, the local leaderboard remains available.

Before using cloud features, run `database-schema.sql` in the Supabase SQL Editor and add the InfinityFree site URL under **Authentication → URL Configuration**. Do not put a Supabase `service_role` key or database password in the package.

## Included files

- `index.html` — app structure, cloud account form, logo, favicon, and multiplayer controls
- `styles.css` — responsive visual design and mobile layout
- `script.js` — game logic, local storage, cloud run submission, and online leaderboard loading
- `src/supabase-config.example.js` — template for the public Supabase client settings (real config is git-ignored)
- `src/supabase-client.js` — Supabase browser initialization
- `src/cloud-sync.js` — authentication, run submission, leaderboard queries, and local-history sync
- `README.md` — InfinityFree deployment instructions

## Local mode

Scores, history, leaderboard records, typing analytics, avatar uploads, separate custom keypress and winning-alert sounds, selected theme, and preferences are stored in browser `localStorage`. Use **Export data** and **Import data** to back up or restore records as JSON.

## Cloud mode

Cloud runs store the authenticated user, mode, score, letters per second, accuracy, duration, daily challenge date, and timestamp. The browser uses only the public Supabase key. Database access is protected by the Row Level Security policies in the supplied schema.

## Multiplayer WebRTC race

The multiplayer panel uses Supabase Realtime for short-lived signaling and a direct peer-to-peer WebRTC data channel for live race traffic. If players on different networks remain stuck on `Joining room…`, configure a TURN relay in `src/supabase-config.js`:

```js
turn: {
  urls: ['turn:turn.example.com:3478'],
  username: 'TURN_USERNAME',
  credential: 'TURN_PASSWORD'
}
```

The frontend does not contain any Supabase secret key. Use a TURN provider that gives browser-safe, scoped credentials; do not put a database password or Supabase `service_role` key in this file. The app now reports a connection failure after 25 seconds instead of waiting indefinitely.

## Automated end-to-end tests

The original development package includes Playwright tests. The InfinityFree upload package is intended to be uploaded as-is and does not require Node.js, npm, or a build step.
