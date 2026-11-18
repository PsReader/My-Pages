(() => {
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  const readTheme = () => root.dataset.theme === 'light' ? 'light' : 'dark';
  const paintButton = () => {
    const nextTheme = readTheme() === 'dark' ? 'light' : 'dark';
    button.textContent = `Use ${nextTheme} theme`;
    button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  };

  paintButton();
  button.addEventListener('click', () => {
    const nextTheme = readTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem('lotm-theme', nextTheme);
    } catch {
      // The current page still changes when storage is unavailable.
    }
    paintButton();
  });
})();
