(() => {
  "use strict";

  // Concept-only portfolio priority. The source data and main page stay untouched.
  const priority = ["acs", "u2link", "ontalk", "dicom", "gyeol"];
  const rank = new Map(priority.map((id, index) => [id, index]));

  const organizePortfolio = () => {
    const grid = document.querySelector("[data-portfolio-track]");
    if (!grid || grid.querySelector(":scope > .sf-all-work-track")) return;

    const cards = [...grid.querySelectorAll(":scope > .portfolio-card")];
    if (!cards.length) return;

    cards.forEach((card) => {
      const id = card.querySelector("[data-open-project]")?.getAttribute("data-open-project") || "";
      card.dataset.conceptProject = id;
      card.classList.toggle("concept-featured-work", rank.has(id));
    });

    cards.sort((a, b) => {
      const aId = a.dataset.conceptProject || "";
      const bId = b.dataset.conceptProject || "";
      const aRank = rank.has(aId) ? rank.get(aId) : Number.MAX_SAFE_INTEGER;
      const bRank = rank.has(bId) ? rank.get(bId) : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return 0;
    });

    cards.forEach((card) => grid.append(card));
  };

  document.addEventListener("suaveforge:portfolio-rendered", organizePortfolio);
  organizePortfolio();
})();
