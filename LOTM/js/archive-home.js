(() => {
  const input = document.getElementById("archiveSearch");
  const status = document.getElementById("archiveSearchStatus");
  const results = [...document.querySelectorAll(".explore-tile, .vol-card")];
  if (!input || !status || results.length === 0) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase();
    let shown = 0;
    for (const result of results) {
      const matches = !query || result.textContent.toLocaleLowerCase().includes(query);
      result.hidden = !matches;
      if (matches) shown += 1;
    }
    status.textContent = query
      ? shown ? `${shown} matching archive entries.` : "No matching entries. Try another search."
      : "Search the archive index and volume list.";
  });
})();
