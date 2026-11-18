(() => {
  const tabs = [...document.querySelectorAll('[data-org-tab]')];
  const panels = [...document.querySelectorAll('[data-org-panel]')];
  if (!tabs.length || !panels.length) return;
  const sectionContainers = panels.flatMap((panel) => [
    ...panel.querySelectorAll('.org-source-content, .mw-content-ltr, .org-faction-card__content'),
  ]);
  const usedIds = new Set([...document.querySelectorAll('[id]')].map((element) => element.id));
  sectionContainers.forEach((container) => {
    if (container.closest('.portable-infobox')) return;
    const children = [...container.children];
    const headings = children
      .map((element, index) => ({ element, index }))
      .filter(({ element }) => element.tagName === 'H2');
    if (headings.length < 2) return;

    headings.forEach(({ element: heading, index }, sectionIndex) => {
      if (!heading.id) {
        const base = heading.textContent.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        let id = base;
        let suffix = 2;
        while (usedIds.has(id)) id = `${base}-${suffix++}`;
        heading.id = id;
        usedIds.add(id);
      }

      const end = headings[sectionIndex + 1]?.index ?? children.length;
      const disclosure = document.createElement('details');
      disclosure.className = 'org-source-section';
      disclosure.open = sectionIndex === 0;
      const summary = document.createElement('summary');
      const content = document.createElement('div');
      content.className = 'org-source-section__content';
      container.insertBefore(disclosure, heading);
      summary.append(heading);
      for (let childIndex = index + 1; childIndex < end; childIndex += 1) {
        content.append(children[childIndex]);
      }
      disclosure.append(summary, content);
    });
  });
  const activate = (slug, focus = false, updateHash = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.orgTab === slug;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.orgPanel === slug;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    if (updateHash && window.history.replaceState) {
      window.history.replaceState(null, '', `#${slug}`);
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.orgTab, false, true));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next].dataset.orgTab, true, true);
    });
  });
  const resolveHash = () => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(hash);
    const linkedPanel = panels.find((panel) =>
      panel.id === hash || panel.dataset.orgPanel === hash || (target && panel.contains(target))
    );
    const linkedTab = tabs.find((tab) => tab.dataset.orgTab === (linkedPanel?.dataset.orgPanel || hash));
    return linkedTab?.dataset.orgTab;
  };
  const revealHashTarget = () => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    target.closest('details')?.setAttribute('open', '');
    target.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', () => {
    const slug = resolveHash();
    if (slug) activate(slug);
    revealHashTarget();
  });
  const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  activate(resolveHash() || selected.dataset.orgTab);
  revealHashTarget();
})();
