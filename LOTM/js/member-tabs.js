(() => {
  const tablist = document.querySelector('.member-tabs[role="tablist"]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[data-member-tab]')];
  const panels = tabs
    .map(tab => document.getElementById(tab.getAttribute('aria-controls')))
    .filter(Boolean);
  if (!tabs.length || panels.length !== tabs.length) return;

  function setHidden(element, hidden) {
    element.hidden = hidden;
    element.setAttribute('aria-hidden', String(hidden));
  }

  function synchronizeQuoteView(selectedId) {
    const quoteOnly = selectedId === 'quotes';
    const pageContent = document.querySelector('.site-page__content');
    const layout = pageContent?.querySelector(':scope > .member-layout');
    if (!pageContent || !layout) return;

    [...pageContent.children].forEach(element => {
      setHidden(element, quoteOnly && element !== layout);
    });
    const article = layout.querySelector(':scope > .member-article');
    [...layout.children].forEach(element => {
      setHidden(element, quoteOnly && element !== article);
    });
    if (article) {
      [...article.children].forEach(element => {
        if (element.matches('.member-tab-panel')) return;
        setHidden(element, quoteOnly);
      });
    }
    document.body.classList.toggle('quotes-only-view', quoteOnly);
  }

  function activate(id, updateHash = true) {
    const selected = tabs.find(tab => tab.dataset.memberTab === id) || tabs[0];
    const selectedId = selected.dataset.memberTab;
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.id === selected.getAttribute('aria-controls');
      setHidden(panel, !active);
    });
    synchronizeQuoteView(selectedId);
    if (updateHash && window.history.replaceState) {
      window.history.replaceState(null, '', `#${selectedId}`);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.memberTab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      const next = tabs[nextIndex];
      next.focus();
      activate(next.dataset.memberTab);
    });
  });

  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (tabs.some(tab => tab.dataset.memberTab === id)) activate(id, false);
  });

  const mobile = window.matchMedia('(max-width: 720px)');
  const setupMobileMemberSections = () => {
    const sections = Array.from(document.querySelectorAll('.member-overview-subsection'));
    sections.forEach((section, index) => {
      const heading = section.querySelector(':scope > h2');
      if (!mobile.matches || !heading || section.querySelector(':scope > details.mobile-page-disclosure')) return;

      const details = document.createElement('details');
      details.className = 'mobile-page-disclosure';
      details.open = index === 0;
      const summary = document.createElement('summary');
      const content = document.createElement('div');
      content.className = 'mobile-page-disclosure__content';
      summary.append(heading);
      for (const child of Array.from(section.children)) {
        if (child !== heading) content.append(child);
      }
      details.append(summary, content);
      section.classList.add('has-mobile-disclosure');
      section.append(details);
    });
    if (!mobile.matches) {
      document.querySelectorAll('details.mobile-page-disclosure').forEach(details => {
        details.open = true;
      });
    }
  };
  setupMobileMemberSections();
  mobile.addEventListener('change', setupMobileMemberSections);

  const initialId = window.location.hash.slice(1);
  activate(tabs.some(tab => tab.dataset.memberTab === initialId) ? initialId : 'overview', false);
  const openMemberSection = hash => {
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    const section = target?.closest('.member-overview-subsection');
    const details = section?.querySelector(':scope > details.mobile-page-disclosure');
    if (details) details.open = true;
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) openMemberSection(link.getAttribute('href'));
  }, true);
  window.addEventListener('hashchange', () => openMemberSection(window.location.hash));
  openMemberSection(window.location.hash);
})();
