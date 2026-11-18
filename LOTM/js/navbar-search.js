(() => {
  const form = document.querySelector('.navbar-search');
  if (!form) return;
  const input = form.querySelector('input[name="q"]');
  const panel = form.querySelector('.navbar-search-suggestions');
  panel.id = panel.id || 'navbarSearchSuggestions';
  panel.setAttribute('role', 'listbox');
  panel.setAttribute('aria-label', 'Search suggestions');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-controls', panel.id);
  input.setAttribute('aria-expanded', 'false');
  let entries = [];
  const search = window.LOTMSearch;
  const normalize = value => search ? search.normalize(value) : String(value || '').toLocaleLowerCase();
  function closePanel() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    panel.replaceChildren();
  }
  function renderSuggestions() {
    const query = input.value.trim();
    if (!normalize(query) || !entries.length) { closePanel(); return; }
    const matches = search ? search.rank(entries, query).slice(0, 7).map(hit => hit.entry) : [];
    panel.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No matching pages. Press Enter to search the archive.';
      panel.append(empty);
    } else {
      for (const entry of matches) {
        const link = document.createElement('a');
        link.href = entry.url;
        link.textContent = entry.title;
        link.id = `navbar-search-option-${panel.childElementCount}`;
        link.setAttribute('role', 'option');
        link.tabIndex = -1;
        const category = document.createElement('small');
        category.textContent = entry.categoryLabel || '';
        link.append(category);
        panel.append(link);
      }
    }
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.removeAttribute('aria-activedescendant');
  }
  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanel();
    else if (event.key === 'ArrowDown' && !panel.hidden) {
      const first = panel.querySelector('a[role="option"]');
      if (first) { event.preventDefault(); first.focus(); }
    }
  });
  panel.addEventListener('keydown', event => {
    const options = [...panel.querySelectorAll('a[role="option"]')];
    const current = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = current + direction;
      if (next < 0) input.focus();
      else if (next >= options.length) options[0]?.focus();
      else options[next]?.focus();
    } else if (event.key === 'Escape') {
      closePanel();
      input.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!form.contains(event.target)) closePanel();
  });
  document.addEventListener('focusin', event => {
    if (!form.contains(event.target)) closePanel();
  });
  const indexRequest = window.loadLOTMSearchIndex
    ? window.loadLOTMSearchIndex()
    : fetch('search-index.json').then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      });
  indexRequest
    .then(index => {
      entries = search ? search.prepareIndex(index) : (Array.isArray(index) ? index : []);
      renderSuggestions();
    })
    .catch(() => { /* The form still submits to the full homepage search if suggestions fail. */ });
})();
