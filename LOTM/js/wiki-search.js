(() => {
  const browser = document.getElementById('wikiSearchBrowser');
  if (!browser) return;

  const input = browser.querySelector('#wikiSearchInput');
  const submittedQuery = new URLSearchParams(window.location.search).get('q');
  if (submittedQuery !== null) input.value = submittedQuery;
  const status = browser.querySelector('#wikiSearchStatus');
  const results = browser.querySelector('#wikiSearchResults');
  const filterButtons = [...browser.querySelectorAll('.wiki-filter')];
  const clearButton = browser.querySelector('#wikiSearchClear');
  const quickSearch = browser.querySelector('#wikiSearchQuick');
  let entries = [];
  let activeCategory = 'all';
  let ready = false;
  let expanded = false;
  const search = window.LOTMSearch;
  const normalize = value => search ? search.normalize(value) : String(value || '').toLocaleLowerCase();

  function makeSnippet(entry, terms) {
    const summary = (entry.summary || '').replace(/\s+/g, ' ').trim();
    if (summary && (!terms.length || terms.some(term => normalize(summary).includes(term)))) return summary.slice(0, 220);
    const text = (entry.searchText || summary).replace(/\s+/g, ' ').trim();
    const lower = text.toLocaleLowerCase();
    const positions = terms.map(term => lower.indexOf(term)).filter(position => position >= 0);
    const position = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, position - 72);
    const end = Math.min(text.length, start + 220);
    return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
  }

  function addHighlightedText(node, text, terms) {
    const escape = term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const words = terms.filter(term => term.length > 1).sort((a, b) => b.length - a.length);
    if (!words.length) { node.textContent = text; return; }
    const alternatives = words.map(escape).join('|');
    const pattern = new RegExp(`(${alternatives})`, 'gi');
    const exact = new RegExp(`^(?:${alternatives})$`, 'i');
    text.split(pattern).forEach(part => {
      if (exact.test(part)) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        node.append(mark);
      } else node.append(document.createTextNode(part));
    });
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
    const rawQuery = input.value.trim();
    const query = normalize(rawQuery);
    const terms = search ? search.queryTerms(rawQuery) : query.split(/\s+/).filter(Boolean);
    const categoryOnly = activeCategory !== 'all' && terms.length === 0;
    if (clearButton) clearButton.hidden = !rawQuery;
    if (quickSearch) quickSearch.hidden = Boolean(rawQuery) || activeCategory !== 'all';

    if (!categoryOnly && terms.length === 0) {
      results.hidden = true;
      results.replaceChildren();
      status.textContent = `Search across ${entries.length} pages, or choose a category.`;
      return;
    }

    const matches = (terms.length
      ? (search ? search.rank(entries, rawQuery).map(hit => hit.entry) : entries)
      : entries.slice().sort((a, b) => a.title.localeCompare(b.title)))
      .filter(entry => activeCategory === 'all' || entry.category === activeCategory);

    results.replaceChildren();
    if (!matches.length) {
      const label = activeCategory === 'all' ? 'the archive' : categoryName(activeCategory);
      showEmpty(`No pages found in ${label}. Try fewer words, another spelling, or a different category.`);
    } else {
      const fragment = document.createDocumentFragment();
      const shown = expanded ? matches : matches.slice(0, 12);
      shown.forEach(entry => {
        const card = document.createElement('article');
        card.className = 'wiki-search-result';
        const category = document.createElement('span');
        category.className = 'wiki-search-category';
        category.textContent = entry.categoryLabel;
        const link = document.createElement('a');
        link.href = entry.url;
        link.textContent = entry.title;
        const description = document.createElement('p');
        addHighlightedText(description, makeSnippet(entry, terms), terms);
        card.append(category, link, description);
        fragment.append(card);
      });
      if (matches.length > shown.length) {
        const more = document.createElement('button');
        more.className = 'wiki-search-more';
        more.type = 'button';
        more.textContent = `Show all ${matches.length} results`;
        more.addEventListener('click', () => { expanded = true; render(); });
        fragment.append(more);
      }
      results.append(fragment);
      results.hidden = false;
      const qualifier = terms.length ? ` matching “${input.value.trim()}”` : '';
      const categoryLabel = activeCategory === 'all'
        ? ''
        : ` in ${categoryName(activeCategory)}`;
      const range = shown.length < matches.length ? `Top ${shown.length} of ${matches.length}` : `Showing ${matches.length}`;
      status.textContent = `${range} ${matches.length === 1 ? 'page' : 'pages'}${qualifier}${categoryLabel} · best matches first.`;
    }
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category || 'all';
      expanded = false;
      filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
  });
  input.addEventListener('input', () => { expanded = false; render(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      input.value = '';
      expanded = false;
      render();
    } else if (event.key === 'ArrowDown') {
      const first = results.querySelector('a');
      if (first) { event.preventDefault(); first.focus(); }
    } else if (event.key === 'Enter') {
      const first = results.querySelector('a');
      if (first) { event.preventDefault(); window.location.href = first.href; }
    }
  });
  results.addEventListener('keydown', event => {
    const options = [...results.querySelectorAll('a, .wiki-search-more')];
    const current = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = current + (event.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) input.focus();
      else if (next < options.length) options[next].focus();
    } else if (event.key === 'Escape') {
      input.value = '';
      expanded = false;
      render();
      input.focus();
    }
  });
  if (clearButton) clearButton.addEventListener('click', () => {
    input.value = '';
    activeCategory = 'all';
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === 'all')));
    expanded = false;
    render();
    input.focus();
  });
  if (quickSearch) quickSearch.addEventListener('click', event => {
    const button = event.target.closest('button[data-query]');
    if (!button) return;
    input.value = button.dataset.query;
    activeCategory = 'all';
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === 'all')));
    expanded = false;
    render();
    input.focus();
  });

  filterButtons.forEach(button => { button.disabled = true; });
  const indexRequest = window.loadLOTMSearchIndex
    ? window.loadLOTMSearchIndex()
    : fetch(browser.dataset.searchIndex || 'search-index.json').then(response => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        return response.json();
      });
  indexRequest
    .then(index => {
      entries = search ? search.prepareIndex(index) : (Array.isArray(index) ? index : []);
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
