/**
 * Shared search core: one index request, one ranking function.
 * Loaded before js/wiki-search.js and js/navbar-search.js on every page.
 */

// Share one search-index request between the homepage browser and navbar suggestions.
window.loadLOTMSearchIndex = window.loadLOTMSearchIndex || (() => {
  let request;
  return () => {
    if (!request) {
      request = fetch('search-index.json')
        .then(response => {
          if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
          return response.json();
        })
        .catch(error => { request = null; throw error; });
    }
    return request;
  };
})();

// Small client-side search engine shared by instant results and navbar suggestions.
window.LOTMSearch = window.LOTMSearch || (() => {
  const normalize = value => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  const words = value => normalize(value).split(/\s+/).filter(Boolean);
  const stopWords = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'is', 'of', 'on', 'or', 'the', 'to', 'with']);
  const queryTerms = value => {
    const all = words(value);
    const useful = all.filter(term => !stopWords.has(term));
    return useful.length ? useful : all;
  };
  const prepareIndex = index => (Array.isArray(index) ? index : []).map(entry => ({
    ...entry,
    _title: normalize(entry.title),
    _summary: normalize(entry.summary),
    _search: normalize(`${entry.title || ''} ${entry.categoryLabel || ''} ${entry.summary || ''} ${entry.searchText || ''}`),
    _titleWords: words(entry.title),
    _summaryWords: words(entry.summary),
    _searchWords: words(`${entry.title || ''} ${entry.categoryLabel || ''} ${entry.summary || ''} ${entry.searchText || ''}`)
  }));
  const withinOneEdit = (a, b) => {
    if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 4) return false;
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
  };
  function rank(entries, query) {
    const phrase = normalize(query);
    const terms = queryTerms(query);
    if (!terms.length) return [];
    return entries.map(entry => {
      let score = 0;
      for (const term of terms) {
        let best = 0;
        if (entry._titleWords.includes(term)) best = 260;
        else if (entry._titleWords.some(word => word.startsWith(term))) best = 190;
        else if (entry._title.includes(term)) best = 155;
        else if (entry._summaryWords.includes(term)) best = 90;
        else if (entry._summary.includes(term)) best = 70;
        else if (entry._searchWords.includes(term)) best = 42;
        else if (entry._searchWords.some(word => word.startsWith(term))) best = 25;
        else if (entry._search.includes(term)) best = 14;
        else {
          const nearTitleWord = entry._titleWords.findIndex(word => withinOneEdit(word, term));
          if (nearTitleWord >= 0) best = Math.max(38, 58 - nearTitleWord * 4);
        }
        if (!best) return null;
        score += best;
      }
      if (entry._title === phrase) score += 420;
      else if (entry._title.startsWith(phrase)) score += 280;
      else if (entry._title.includes(phrase)) score += 180;
      return { entry, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  }
  return { normalize, prepareIndex, rank, queryTerms };
})();
