(() => {
  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;
  const apply = (theme) => {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
    toggle.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
    try { localStorage.setItem('cipherly-theme', dark ? 'dark' : 'light'); } catch (error) { /* storage is optional */ }
  };
  apply(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  toggle.addEventListener('click', () => apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
