(() => {
  const tabs = [...document.querySelectorAll("[data-ingredient-tab]")];
  const panels = [...document.querySelectorAll("[data-ingredient-panel]")];
  if (!tabs.length) return;
  panels.forEach((panel) => {
    const cards = [...panel.querySelectorAll(".ingredient-card")];
    cards.forEach((card) => {
      const image = card.querySelector(".ingredient-card__image");
      const body = card.querySelector(".ingredient-card__body");
      const title = body?.querySelector("h2, h3");
      const description = body?.querySelector(".ingredient-card__description");
      if (!image || !title || !description) return;

      const disclosure = document.createElement("details");
      disclosure.className = card.className;
      const summary = document.createElement("summary");
      summary.className = "ingredient-card__summary";
      summary.append(image, title);
      disclosure.append(summary, description);
      card.replaceWith(disclosure);
    });
  });
  const activate = (slug, updateHash = true) => {
    const valid = tabs.some(t => t.dataset.ingredientTab === slug) ? slug : tabs[0].dataset.ingredientTab;
    tabs.forEach(t => { const active = t.dataset.ingredientTab === valid; t.setAttribute("aria-selected", active ? "true" : "false"); t.id = `tab-${t.dataset.ingredientTab}`; });
    panels.forEach(p => { p.hidden = p.dataset.ingredientPanel !== valid; });
    if (updateHash) history.replaceState(null, "", `#${valid}`);
  };
  tabs.forEach(t => t.addEventListener("click", () => activate(t.dataset.ingredientTab)));
  activate(location.hash.slice(1), false);
})();
