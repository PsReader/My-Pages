(() => {
  const form = document.querySelector('.navbar-search');
  if (!form) return;
  const input = form.querySelector('input[name="q"]');
  const panel = form.querySelector('.navbar-search-suggestions');
  let entries = [];
  const normalize = value => (value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  function closePanel() {
    panel.hidden = true;
    panel.replaceChildren();
  }
  function renderSuggestions() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length || !entries.length) { closePanel(); return; }
    const matches = entries.filter(entry => {
      return terms.every(term => entry._normalizedSearch.includes(term));
    }).slice(0, 7);
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
        const category = document.createElement('small');
        category.textContent = entry.categoryLabel || '';
        link.append(category);
        panel.append(link);
      }
    }
    panel.hidden = false;
  }
  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanel();
  });
  document.addEventListener('click', event => {
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
      entries = (Array.isArray(index) ? index : []).map(entry => ({
        ...entry,
        _normalizedSearch: normalize(`${entry.title || ''} ${entry.searchText || ''}`)
      }));
      renderSuggestions();
    })
    .catch(() => { /* The form still submits to the full homepage search if suggestions fail. */ });
})();
