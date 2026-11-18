(() => {
  const tabs = [...document.querySelectorAll('[data-artifact-tab]')];
  const panels = [...document.querySelectorAll('[data-artifact-panel]')];
  if (!tabs.length || !panels.length) return;

  const activate = (slug, moveFocus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.artifactTab === slug;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.artifactPanel === slug;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
  };

  tabs.forEach((tab, index) => {
    tab.id = `tab-${tab.dataset.artifactTab}`;
    tab.addEventListener('click', () => activate(tab.dataset.artifactTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next].dataset.artifactTab, true);
    });
  });

  activate((tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]).dataset.artifactTab);
})();
