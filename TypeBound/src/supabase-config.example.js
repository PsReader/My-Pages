// Public Supabase browser configuration for Type Bound.
// Copy this file to src/supabase-config.js and fill in the values.
// The real src/supabase-config.js is git-ignored: credentials never leave this machine
// and are included only in the manual deploy zip (Deploy/).
window.TYPE_BOUND_SUPABASE = {
  url: 'https://YOUR-PROJECT.supabase.co',
  publishableKey: 'sb_publishable_YOUR_KEY',
  // Metered TURN relay for strict NATs/firewalls.
  turn: {
    urls: [],
    username: '',
    credential: ''
  }
};