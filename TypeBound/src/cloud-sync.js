(() => {
  const client = () => window.typeBoundSupabase;
  const localHistoryKey = 'type-bound-history';
  const allowedModes = new Set(['easy','medium','hard','hardcore','speed','custom','drill','daily']);
  const cloud = {};

  cloud.isConfigured = () => Boolean(client());

  cloud.getUser = async () => {
    if (!client()) return null;
    const { data } = await client().auth.getUser();
    return data?.user || null;
  };

  cloud.getProfile = async () => {
    const user = await cloud.getUser();
    if (!client() || !user) return { data: null, error: new Error('Sign in to load your profile.') };
    return client().from('profiles').select('id, username, avatar_path, updated_at').eq('id', user.id).maybeSingle();
  };

  cloud.signUp = async (email, password, username = 'Anonymous typist') => {
    if (!client()) return { data: null, error: new Error('Supabase is not configured.') };
    return client().auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
  };

  cloud.signIn = async (email, password) => {
    if (!client()) return { data: null, error: new Error('Supabase is not configured.') };
    return client().auth.signInWithPassword({ email, password });
  };

  cloud.signOut = async () => {
    if (!client()) return { error: null };
    return client().auth.signOut();
  };

  cloud.saveProfileName = async (username) => {
    const user = await cloud.getUser();
    if (!client() || !user) return { data: null, error: new Error('Sign in to save your name online.') };
    const value = String(username || '').trim().replace(/\s+/g, ' ');
    if (!/^[\p{L}0-9][\p{L}0-9 _-]{1,23}$/u.test(value)) {
      return { data: null, error: new Error('Use a display name 2–24 characters long.') };
    }
    return client().from('profiles').upsert({
      id: user.id,
      username: value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' }).select().single();
  };

  cloud.saveRun = async (run) => {
    const user = await cloud.getUser();
    if (!client() || !user) return { data: null, error: new Error('Sign in to save runs online.') };
    if (!allowedModes.has(run?.mode)) return { data: null, error: new Error('Invalid run mode.') };
    const score = Number(run.score), lettersPerSecond = Number(run.lettersPerSecond), accuracy = Number(run.accuracy), duration = Number(run.duration);
    if (![score, lettersPerSecond, accuracy, duration].every(Number.isFinite) || score < 0 || lettersPerSecond < 0 || accuracy < 0 || accuracy > 100 || duration < 0 || duration > 3600) return { data: null, error: new Error('Invalid run values.') };
    return client().from('runs').insert({
      user_id: user.id,
      mode: run.mode,
      score: Math.min(1000000000, Math.round(score)),
      letters_per_second: Math.min(1000, lettersPerSecond),
      accuracy,
      duration,
      challenge_date: run.challengeDate || null
    }).select().single();
  };

  cloud.getLeaderboard = async (mode, limit = 50) => {
    if (!client()) return { data: [], error: new Error('Supabase is not configured.') };
    if (!allowedModes.has(mode)) return { data: [], error: new Error('Invalid leaderboard mode.') };
    const speedMode = mode === 'speed' || mode === 'custom';
    return client().from('leaderboard_runs')
      .select('id, mode, score, letters_per_second, accuracy, duration, challenge_date, created_at, username, avatar_path')
      .eq('mode', mode)
      .order(speedMode ? 'letters_per_second' : 'score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(Math.min(50, Math.max(1, Number(limit) || 5)));
  };

  cloud.syncLocalHistory = async () => {
    const user = await cloud.getUser();
    if (!client() || !user) return { imported: 0, error: new Error('Sign in to sync local history.') };
    const syncMarker = `type-bound-cloud-history-synced-${user.id}`;
    if (localStorage.getItem(syncMarker) === 'yes') return { imported: 0, error: null, alreadySynced: true };
    let localRuns = [];
    try { localRuns = JSON.parse(localStorage.getItem(localHistoryKey) || '[]'); } catch { localRuns = []; }
    if (!localRuns.length) return { imported: 0, error: null };
    const payload = localRuns.map(run => ({
      user_id: user.id,
      mode: run.mode,
      score: Math.max(0, Math.round(run.score || 0)),
      letters_per_second: Math.max(0, Number(run.lps || 0)),
      accuracy: Math.min(100, Math.max(0, Number(run.accuracy || 0))),
      duration: Math.max(0, Number(run.time || 0)),
      challenge_date: run.mode === 'daily' ? (run.at || '').slice(0, 10) || null : null
    }));
    const { data, error } = await client().from('runs').insert(payload).select('id');
    if (!error) localStorage.setItem(syncMarker, 'yes');
    return { imported: data?.length || 0, error };
  };

  window.typeBoundCloud = cloud;
})();
