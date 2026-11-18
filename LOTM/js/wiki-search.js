(() => {
  const browser = document.getElementById('wikiSearchBrowser');
  if (!browser) return;

  const input = browser.querySelector('#wikiSearchInput');
  const submittedQuery = new URLSearchParams(window.location.search).get('q');
  if (submittedQuery !== null) input.value = submittedQuery;
  const status = browser.querySelector('#wikiSearchStatus');
  const results = browser.querySelector('#wikiSearchResults');
  const filterButtons = [...browser.querySelectorAll('.wiki-filter')];
  let entries = [];
  let activeCategory = 'all';
  let ready = false;

  const normalize = value => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();

  function makeSnippet(entry, terms) {
    const text = entry.searchText || entry.summary || '';
    const folded = normalize(text);
    let position = -1;
    for (const term of terms) {
      const found = folded.indexOf(term);
      if (found >= 0 && (position < 0 || found < position)) position = found;
    }
    if (position < 0) return entry.summary;
    const start = Math.max(0, position - 72);
    const end = Math.min(text.length, position + 180);
    return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
  }

  function categoryName(category) {
    return filterButtons.find(button => button.dataset.category === category)?.dataset.label || 'this category';
  }

  function showEmpty(message) {
    const paragraph = document.createElement('p');
    paragraph.className = 'wiki-search-empty';
    paragraph.textContent = message;
    results.replaceChildren(paragraph);
    results.hidden = false;
  }

  function render() {
    if (!ready) return;
    const query = normalize(input.value.trim());
    const terms = query.split(/\s+/).filter(Boolean);
    const categoryOnly = activeCategory !== 'all' && terms.length === 0;

    if (!categoryOnly && terms.length === 0) {
      results.hidden = true;
      results.replaceChildren();
      status.textContent = `Search across ${entries.length} wiki pages, or choose a category.`;
      return;
    }

    const matches = entries.filter(entry => {
      if (activeCategory !== 'all' && entry.category !== activeCategory) return false;
      if (!terms.length) return true;
      return terms.every(term => entry._normalizedSearch.includes(term));
    });

    results.replaceChildren();
    if (!matches.length) {
      const label = activeCategory === 'all' ? 'the archive' : categoryName(activeCategory);
      showEmpty(`No wiki pages matched your search in ${label}. Try a different name or term.`);
    } else {
      const fragment = document.createDocumentFragment();
      matches.forEach(entry => {
        const card = document.createElement('article');
        card.className = 'wiki-search-result';
        const category = document.createElement('span');
        category.className = 'wiki-search-category';
        category.textContent = entry.categoryLabel;
        const link = document.createElement('a');
        link.href = entry.url;
        link.textContent = entry.title;
        const description = document.createElement('p');
        description.textContent = makeSnippet(entry, terms);
        card.append(category, link, description);
        fragment.append(card);
      });
      results.append(fragment);
      results.hidden = false;
      const qualifier = terms.length ? ` matching “${input.value.trim()}”` : '';
      const categoryLabel = activeCategory === 'all'
        ? ''
        : ` in ${categoryName(activeCategory)}`;
      status.textContent = `Showing ${matches.length} ${matches.length === 1 ? 'page' : 'pages'}${qualifier}${categoryLabel}.`;
    }
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category || 'all';
      filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
  });
  input.addEventListener('input', render);

  filterButtons.forEach(button => { button.disabled = true; });
  const indexRequest = window.loadLOTMSearchIndex
    ? window.loadLOTMSearchIndex()
    : fetch(browser.dataset.searchIndex || 'search-index.json').then(response => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        return response.json();
      });
  indexRequest
    .then(index => {
      entries = (Array.isArray(index) ? index : []).map(entry => ({
        ...entry,
        _normalizedSearch: normalize(`${entry.title || ''} ${entry.searchText || entry.summary || ''}`)
      }));
      ready = true;
      filterButtons.forEach(button => {
        const category = button.dataset.category || 'all';
        const count = category === 'all'
          ? entries.length
          : entries.filter(entry => entry.category === category).length;
        button.textContent = `${button.dataset.label || button.textContent.trim()} ${count}`;
        button.disabled = false;
      });
      render();
    })
    .catch(() => {
      status.textContent = 'Search could not load. Please refresh the page or try again later.';
      filterButtons.forEach(button => { button.disabled = true; });
    });
})();
