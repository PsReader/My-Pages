(() => {
  const tabs = [...document.querySelectorAll('[data-bh-tab]')];
  const panels = [...document.querySelectorAll('[data-bh-panel]')];
  if (!tabs.length || !panels.length) return;
  const activate = (slug, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.bhTab === slug;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.bhPanel === slug;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.bhTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next].dataset.bhTab, true);
    });
  });
  activate((tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]).dataset.bhTab);
})();
