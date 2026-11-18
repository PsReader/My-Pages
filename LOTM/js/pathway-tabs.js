(function () {
  const tabs = Array.from(document.querySelectorAll('[data-pathway-tab]'));
  const panels = { standard: document.getElementById('standard-pathways-panel'), nonstandard: document.getElementById('nonstandard-pathways-panel') };
  if (!tabs.length || !panels.standard || !panels.nonstandard) return;
  function activate(key) {
    tabs.forEach(tab => {
      const active = tab.dataset.pathwayTab === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    Object.entries(panels).forEach(([name, panel]) => { panel.hidden = name !== key; });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.pathwayTab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      activate(next.dataset.pathwayTab);
    });
  });
  activate('standard');
})();
