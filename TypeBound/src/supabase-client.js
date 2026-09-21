(() => {
  const config = window.TYPE_BOUND_SUPABASE;
  if (!config?.url || !config?.publishableKey || config.url.includes('YOUR_PROJECT_REF')) {
    console.warn('Type Bound cloud sync is disabled: configure src/supabase-config.js first.');
    window.typeBoundSupabase = null;
    return;
  }
  if (!window.supabase?.createClient) {
    console.error('Type Bound cloud sync is disabled: Supabase JS library did not load.');
    window.typeBoundSupabase = null;
    return;
  }
  window.typeBoundSupabase = window.supabase.createClient(
    config.url,
    config.publishableKey,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
})();
