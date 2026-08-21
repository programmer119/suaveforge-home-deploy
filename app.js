(() => {
  "use strict";

  const qs = (selector, root = document) => root?.querySelector(selector) || null;
  const qsa = (selector, root = document) => root ? [...root.querySelectorAll(selector)] : [];
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  const projects = Array.isArray(window.SF_PROJECTS) ? window.SF_PROJECTS : [];
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const config = window.SF_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = qs("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = qs("[data-header]");
  const menuButton = qs("[data-menu-button]");
  const mobileMenu = qs("[data-mobile-menu]");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    mobileMenu?.classList.toggle("is-open", open);
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  qsa("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));

  const languageSwitcher = qs("[data-language-switcher]");
  const languageTrigger = qs("[data-language-trigger]", languageSwitcher);
  const languageFlag = qs("[data-language-flag]", languageSwitcher);
  const languageLabel = qs("[data-language-label]", languageSwitcher);
  const languageOptions = qsa("[data-language-option]", languageSwitcher);
  const i18n = {
    ko: {
      "nav.cases": "대표 사례", "nav.demos": "라이브 데모", "nav.portfolio": "전체 작업", "nav.process": "진행 방식", "nav.team": "개발팀",
      "cta.contact": "상담 요청", "cta.cases": "대표 작업 보기", "cta.demoArrow": "데모 보기 ↗", "cta.moreCases": "대표 작업 더 보기", "cta.lessCases": "대표 작업 접기", "cta.moreWork": "더 많은 작업 보기", "cta.lessWork": "작업 접기", "cta.detail": "자세히 보기", "cta.demo": "데모 보기 ↗",
      "hero.auto1": "반복 업무를", "hero.auto2": "프로그램에 맡깁니다.", "hero.rebuild1": "소스 없는 프로그램도", "hero.rebuild2": "새 코드로 다시 만듭니다.", "hero.product": "Windows 설치형 제품", "hero.productName": "ACS 사고 콘텐츠 스튜디오", "hero.realNote": "실제 화면과 구현 범위를<br/>함께 공개합니다", "hero.support": "소스가 없어도 화면과 동작, 파일과 데이터 흐름을 분석해 새 코드로 재구축합니다. 이후 기능 추가와 업데이트가 가능한 상태로 넘깁니다.",
      "trust.autoTitle": "자동화", "trust.autoText": "반복 작업을 실행 가능한 흐름으로 전환", "trust.rebuildTitle": "재구축", "trust.rebuildText": "소스가 없는 프로그램도 새 코드로 개발", "trust.realTitle": "실제 화면", "trust.realText": "작업 화면과 구현 범위를 함께 공개", "trust.monthTitle": "3개월", "trust.monthText": "실제 운영까지 이어지는 품질보증",
      "cases.title1": "말보다,", "cases.title2": "화면으로 보시는 게 빠릅니다.", "demos.title1": "궁금한 건,", "demos.title2": "직접 열어보는 편이 빠릅니다.", "demos.lead": "브라우저에서 확인할 수 있는 작업 화면입니다.",
      "start.line1": "잘 짜인 기획서가 없어도", "start.line2": "함께 정리하며 시작할 수 있고,", "start.line3": "소스가 없는 프로그램도", "start.line4": "새 코드로 다시 만들 수 있습니다.", "project.screen": "프로젝트 화면", "project.detail": "상세 보기",
      "search.label": "프로젝트 검색", "search.header": "프로젝트 검색", "search.placeholder": "프로젝트명 또는 기술 스택을 입력하세요", "search.clear": "검색어 지우기", "search.empty": "일치하는 프로젝트가 없습니다.", "search.result": "상세 보기", "search.demo": "라이브 데모", "search.globalTitle": "필요한 작업을 바로 찾으세요", "search.quick": "빠른 검색", "search.featured": "추천 프로젝트", "search.move": "결과 이동", "search.open": "상세 열기", "search.close": "검색 닫기", "search.closeShort": "닫기"
    },
    en: {
      "nav.cases": "Case Studies", "nav.demos": "Live Demos", "nav.portfolio": "All Work", "nav.process": "Process", "nav.team": "Team",
      "cta.contact": "Get in Touch", "cta.cases": "View Case Studies", "cta.demoArrow": "View demo ↗", "cta.moreCases": "View more cases", "cta.lessCases": "Collapse cases", "cta.moreWork": "View more work", "cta.lessWork": "Collapse work", "cta.detail": "View details", "cta.demo": "View demo ↗",
      "hero.auto1": "Automate", "hero.auto2": "repetitive work.", "hero.rebuild1": "Rebuild software", "hero.rebuild2": "without source.", "hero.product": "Windows product", "hero.productName": "ACS Accident Content Studio", "hero.realNote": "Real screens and scope,<br/>shown up front", "hero.support": "Even when the source code is gone, we analyze screens, behavior, files, and data flow, then rebuild the software as maintainable new code.",
      "trust.autoTitle": "Automation", "trust.autoText": "Turn repeat work into executable flows", "trust.rebuildTitle": "Rebuild", "trust.rebuildText": "Recreate source-less software in new code", "trust.realTitle": "Real Screens", "trust.realText": "Show the actual UI and implementation scope", "trust.monthTitle": "3 Months", "trust.monthText": "Warranty through real operation",
      "cases.title1": "Less talk.", "cases.title2": "Screens make it faster.", "demos.title1": "Curious?", "demos.title2": "Open the work and see it.", "demos.lead": "Live work screens you can check in the browser.",
      "start.line1": "Even without a polished brief,", "start.line2": "we can shape the work together,", "start.line3": "and source-less software", "start.line4": "can be rebuilt as new code.", "project.screen": "project screen", "project.detail": "details",
      "search.label": "Project search", "search.header": "Search projects", "search.placeholder": "Search project names or technologies", "search.clear": "Clear search", "search.empty": "No matching projects found.", "search.result": "View details", "search.demo": "Live demo", "search.globalTitle": "Find the right work instantly", "search.quick": "Quick search", "search.featured": "Featured projects", "search.move": "Move", "search.open": "Open details", "search.close": "Close search", "search.closeShort": "Close"
    },
    ja: {
      "nav.cases": "代表事例", "nav.demos": "ライブデモ", "nav.portfolio": "制作実績", "nav.process": "進行方式", "nav.team": "チーム",
      "cta.contact": "相談する", "cta.cases": "代表事例を見る", "cta.demoArrow": "デモを見る ↗", "cta.moreCases": "事例をもっと見る", "cta.lessCases": "事例を閉じる", "cta.moreWork": "実績をもっと見る", "cta.lessWork": "実績を閉じる", "cta.detail": "詳細を見る", "cta.demo": "デモを見る ↗",
      "hero.auto1": "反復業務を", "hero.auto2": "自動化します。", "hero.rebuild1": "ソースなしでも", "hero.rebuild2": "再構築します。", "hero.product": "Windows製品", "hero.productName": "ACS事故コンテンツスタジオ", "hero.realNote": "実画面と実装範囲を<br/>先に共有します", "hero.support": "ソースコードがなくても、画面・動作・ファイル・データの流れを分析し、保守できる新しいコードとして再構築します。",
      "trust.autoTitle": "自動化", "trust.autoText": "反復作業を実行可能な流れに変換", "trust.rebuildTitle": "再構築", "trust.rebuildText": "ソースのないソフトも新規コードで開発", "trust.realTitle": "実画面", "trust.realText": "画面と実装範囲を明確に公開", "trust.monthTitle": "3か月", "trust.monthText": "運用まで見据えた品質保証",
      "cases.title1": "説明より、", "cases.title2": "画面で見る方が早いです。", "demos.title1": "気になるなら、", "demos.title2": "直接開くのが一番です。", "demos.lead": "ブラウザで確認できる作業画面です。",
      "start.line1": "整った企画書がなくても", "start.line2": "一緒に整理して始められます。", "start.line3": "ソースのないプログラムも", "start.line4": "新しいコードで作り直せます。", "project.screen": "プロジェクト画面", "project.detail": "詳細",
      "search.label": "プロジェクト検索", "search.header": "プロジェクト検索", "search.placeholder": "プロジェクト名または技術を検索", "search.clear": "検索をクリア", "search.empty": "該当するプロジェクトがありません。", "search.result": "詳細を見る", "search.demo": "ライブデモ", "search.globalTitle": "必要な実績をすぐに探せます", "search.quick": "クイック検索", "search.featured": "おすすめプロジェクト", "search.move": "結果を移動", "search.open": "詳細を開く", "search.close": "検索を閉じる", "search.closeShort": "閉じる"
    },
    es: {
      "nav.cases": "Casos", "nav.demos": "Demos", "nav.portfolio": "Trabajos", "nav.process": "Proceso", "nav.team": "Equipo",
      "cta.contact": "Contactar", "cta.cases": "Ver casos", "cta.demoArrow": "Ver demo ↗", "cta.moreCases": "Ver más casos", "cta.lessCases": "Cerrar casos", "cta.moreWork": "Ver más trabajos", "cta.lessWork": "Cerrar trabajos", "cta.detail": "Ver detalles", "cta.demo": "Ver demo ↗",
      "hero.auto1": "Automatizamos", "hero.auto2": "trabajo repetitivo.", "hero.rebuild1": "Reconstruimos", "hero.rebuild2": "software sin fuente.", "hero.product": "Producto Windows", "hero.productName": "ACS Accident Content Studio", "hero.realNote": "Pantallas reales y alcance,<br/>claros desde el inicio", "hero.support": "Aunque falte el código fuente, analizamos pantallas, comportamiento, archivos y flujo de datos para reconstruir el software como código nuevo y mantenible.",
      "trust.autoTitle": "Automatización", "trust.autoText": "Convertimos tareas repetitivas en flujos ejecutables", "trust.rebuildTitle": "Reconstrucción", "trust.rebuildText": "Recreamos software sin código fuente", "trust.realTitle": "Pantallas reales", "trust.realText": "Mostramos la interfaz y el alcance real", "trust.monthTitle": "3 meses", "trust.monthText": "Garantía hasta operación real",
      "cases.title1": "Menos palabras.", "cases.title2": "Las pantallas lo explican mejor.", "demos.title1": "¿Tienes curiosidad?", "demos.title2": "Abre el trabajo y míralo.", "demos.lead": "Pantallas de trabajo que puedes revisar en el navegador.",
      "start.line1": "Aunque no tengas un brief perfecto,", "start.line2": "podemos ordenar el proyecto contigo,", "start.line3": "y el software sin fuente", "start.line4": "puede renacer como código nuevo.", "project.screen": "pantalla del proyecto", "project.detail": "detalles",
      "search.label": "Buscar proyectos", "search.header": "Buscar proyectos", "search.placeholder": "Buscar proyectos o tecnologías", "search.clear": "Limpiar búsqueda", "search.empty": "No se encontraron proyectos.", "search.result": "Ver detalles", "search.demo": "Demo en vivo", "search.globalTitle": "Encuentra el trabajo adecuado al instante", "search.quick": "Búsqueda rápida", "search.featured": "Proyectos destacados", "search.move": "Mover", "search.open": "Abrir detalles", "search.close": "Cerrar búsqueda", "search.closeShort": "Cerrar"
    }
  };
  const languageMeta = {
    ko: { label: "KO", flagClass: "language-flag-ko", htmlLang: "ko" },
    en: { label: "EN", flagClass: "language-flag-en", htmlLang: "en" },
    ja: { label: "JP", flagClass: "language-flag-ja", htmlLang: "ja" },
    es: { label: "ES", flagClass: "language-flag-es", htmlLang: "es" }
  };
  let currentLanguage = "ko";
  const t = (key) => i18n[currentLanguage]?.[key] || i18n.ko[key] || key;
  const updateStaticLanguage = () => {
    qsa("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    qsa("[data-i18n-html]").forEach((node) => { node.innerHTML = t(node.dataset.i18nHtml); });
    qsa("[data-i18n-aria-label]").forEach((node) => {
      const label = t(node.dataset.i18nAriaLabel);
      node.setAttribute("aria-label", label);
      node.setAttribute("title", label);
    });
  };
  const setLanguageMenu = (open) => {
    languageSwitcher?.classList.toggle("is-open", open);
    languageTrigger?.setAttribute("aria-expanded", String(open));
  };
  const applyLanguage = (lang) => {
    const selected = languageMeta[lang] || languageMeta.ko;
    currentLanguage = languageMeta[lang] ? lang : "ko";
    document.documentElement.lang = selected.htmlLang;
    if (languageFlag) {
      languageFlag.className = `language-flag ${selected.flagClass}`;
      languageFlag.textContent = "";
    }
    if (languageLabel) languageLabel.textContent = selected.label;
    languageOptions.forEach((option) => {
      option.setAttribute("aria-selected", String(option.dataset.lang === currentLanguage));
    });
    updateStaticLanguage();
    renderFeaturedCases();
    renderPortfolioCards();
    refreshProjectSearch();
    updateCaseMoreButton();
    updatePortfolioMoreButton();
    try { localStorage.setItem("suaveforge.language", currentLanguage); } catch (_) {}
  };
  languageTrigger?.addEventListener("click", () => {
    setLanguageMenu(languageTrigger.getAttribute("aria-expanded") !== "true");
  });
  languageOptions.forEach((option) => option.addEventListener("click", () => {
    applyLanguage(option.dataset.lang || "ko");
    setLanguageMenu(false);
  }));
  document.addEventListener("click", (event) => {
    if (!languageSwitcher || languageSwitcher.contains(event.target)) return;
    setLanguageMenu(false);
  });

  let headerScrolled = null;
  let headerFrame = 0;
  const updateHeader = () => {
    headerFrame = 0;
    const next = window.scrollY > 16;
    if (next === headerScrolled) return;
    headerScrolled = next;
    header?.classList.toggle("is-scrolled", next);
  };
  const requestHeaderUpdate = () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
  };
  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });

  const renderStack = (stack, className = "stack-chips", limit = 5) =>
    `<div class="${className}">${(stack || []).slice(0, limit).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;

  const categoryClass = (category = "") => (category.includes("제품") && !category.includes("사전")) ? "project-badge-product" : "project-badge-prototype";

  const featuredRoot = qs("[data-featured-cases]");
  const renderFeaturedCases = () => {
    if (!featuredRoot) return;
    const featured = projects.filter((project) => project.featured).sort((a, b) => a.featured - b.featured);
    featuredRoot.innerHTML = featured.map((project, index) => {
      const extraClass = index >= 3 ? " case-extra" : "";
      return `
      <article class="case-story case-story-${index + 1}${extraClass} reveal">
        <div class="case-story-copy">
          <div class="case-story-meta">
            <span class="project-badge ${categoryClass(project.category)}">${escapeHtml(project.category)}</span>
            <small>${escapeHtml(project.kind)} · ${escapeHtml(project.date)}</small>
          </div>
          <span class="case-story-number" aria-hidden="true">0${index + 1}</span>
          <h3>${escapeHtml(project.headline || project.short)}</h3>
          <p>${escapeHtml(project.result || project.short)}</p>
          <div class="case-proof-list">${(project.proofs || project.features || []).slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
          ${renderStack(project.stack, "stack-chips case-stack", 5)}
          <button class="case-detail-button" type="button" data-open-project="${escapeHtml(project.id)}">${escapeHtml(t("cta.detail"))} <span>↗</span></button>
        </div>
        <button class="case-story-media" type="button" data-open-project="${escapeHtml(project.id)}" aria-label="${escapeHtml(project.title)} ${escapeHtml(t("project.detail"))}">
          <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title)} ${escapeHtml(t("project.screen"))}" decoding="async" fetchpriority="${index === 0 ? "high" : "low"}" loading="${index === 0 ? "eager" : "lazy"}"/>
          <span class="case-story-caption">${escapeHtml(project.title)} <i>DETAIL ↗</i></span>
        </button>
      </article>`;
    }).join("");
    document.dispatchEvent(new CustomEvent("suaveforge:featured-rendered"));
  };

  const caseMore = qs("[data-case-more]");
  const updateCaseMoreButton = () => {
    if (!caseMore) return;
    const expanded = caseMore.getAttribute("aria-expanded") === "true";
    caseMore.innerHTML = expanded ? `${escapeHtml(t("cta.lessCases"))} <span>−</span>` : `${escapeHtml(t("cta.moreCases"))} <span>＋</span>`;
  };
  caseMore?.addEventListener("click", () => {
    const expanded = caseMore.getAttribute("aria-expanded") === "true";
    caseMore.setAttribute("aria-expanded", String(!expanded));
    qsa(".case-extra", featuredRoot).forEach((item) => item.classList.toggle("is-shown", !expanded));
    updateCaseMoreButton();
    if (expanded) qs("#cases")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  const portfolioTrack = qs("[data-portfolio-track]");
  let portfolioReady = !("IntersectionObserver" in window);
  const renderPortfolioCards = () => {
    if (!portfolioTrack) return;
    if (!portfolioReady) {
      portfolioTrack.replaceChildren();
      return;
    }
    portfolioTrack.classList.remove("is-motion-ready", "is-motion-active");
    portfolioTrack.innerHTML = projects.map((project, index) => `
      <article class="portfolio-card${index >= 6 ? " portfolio-card-more" : ""}" data-project-card>
        <button type="button" class="portfolio-figure" data-open-project="${escapeHtml(project.id)}" aria-label="${escapeHtml(project.title)} ${escapeHtml(t("project.detail"))}">
          <img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title)} ${escapeHtml(t("project.screen"))}" decoding="async" fetchpriority="low" loading="lazy"/>
          <span class="project-badge ${categoryClass(project.category)}">${escapeHtml(project.category)}</span>
        </button>
        <div class="portfolio-card-body">
          <div class="portfolio-meta"><span>${escapeHtml(project.kind)}</span><i>${escapeHtml(project.date || "")}</i></div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.short)}</p>
          ${renderStack(project.stack, "stack-chips", 4)}
          <div class="portfolio-actions">
            <button type="button" data-open-project="${escapeHtml(project.id)}">${escapeHtml(t("cta.detail"))}</button>
            ${project.url ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener">${escapeHtml(t("cta.demo"))}</a>` : `<span>${escapeHtml(t("project.screen"))}</span>`}
          </div>
        </div>
      </article>`).join("");
    document.dispatchEvent(new CustomEvent("suaveforge:portfolio-rendered"));
  };

  const portfolioMore = qs("[data-portfolio-more]");
  const updatePortfolioMoreButton = () => {
    if (!portfolioMore) return;
    const expanded = portfolioMore.getAttribute("aria-expanded") === "true";
    portfolioMore.innerHTML = expanded ? `${escapeHtml(t("cta.lessWork"))} <span>−</span>` : `${escapeHtml(t("cta.moreWork"))} <span>＋</span>`;
  };
  portfolioMore?.addEventListener("click", () => {
    const expanded = portfolioMore.getAttribute("aria-expanded") === "true";
    portfolioMore.setAttribute("aria-expanded", String(!expanded));
    qsa(".portfolio-card-more", portfolioTrack).forEach((card) => card.classList.toggle("is-shown", !expanded));
    updatePortfolioMoreButton();
  });

  const portfolioSection = portfolioTrack?.closest("#portfolio");
  const projectSearchInput = qs("[data-project-search]");
  const projectSearchClear = qs("[data-project-search-clear]");
  const projectSearchSummary = qs("[data-project-search-summary]");
  const projectSearchResults = qs("[data-project-search-results]");
  const globalSearchDialog = qs("[data-global-search-dialog]");
  const globalSearchInput = qs("[data-global-search-input]", globalSearchDialog);
  const globalSearchResults = qs("[data-global-search-results]", globalSearchDialog);
  const globalSearchSummary = qs("[data-global-search-summary]", globalSearchDialog);
  const globalSearchQuick = qs("[data-global-search-quick]", globalSearchDialog);
  const globalSearchTriggers = qsa("[data-global-search-open]");
  const shortcutLabel = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
  qsa("[data-search-shortcut]").forEach((node) => { node.textContent = shortcutLabel; });
  const normalizeSearch = (value) => String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
    .trim();
  const capabilityAliases = {
    frontend: ["frontend", "front-end", "front end", "프론트", "프론트엔드", "웹 화면", "사용자 화면", "UI"],
    client: ["client", "클라이언트", "클라", "native", "네이티브", "desktop", "데스크톱", "PC", "mobile", "모바일", "app", "앱"],
    backend: ["backend", "back-end", "back end", "백엔드", "server", "서버", "API server", "API 서버"],
    database: ["database", "DB", "데이터베이스", "디비", "data store", "데이터 저장소", "persistence", "영속성"],
    serverless: ["serverless", "서버리스", "function", "함수형 백엔드", "backend", "back-end", "back end", "백엔드", "server", "서버"],
    ai: ["AI", "인공지능", "machine learning", "머신러닝", "ML"],
    devops: ["DevOps", "데브옵스", "CI/CD", "배포 자동화", "container", "컨테이너"]
  };
  const technologyAliasRules = [
    { matches: ["react", "react 19"], aliases: ["React", "리액트"] },
    { matches: ["vue.js"], aliases: ["Vue", "Vue.js", "뷰", "뷰JS"] },
    { matches: ["python"], aliases: ["Python", "파이썬"] },
    { matches: ["node.js"], aliases: ["Node", "Node.js", "노드", "노드JS"] },
    { matches: ["java 17"], aliases: ["Java", "자바"] },
    { matches: ["javascript"], aliases: ["JavaScript", "JS", "자바스크립트"] },
    { matches: ["spring boot"], aliases: ["Spring", "Spring Boot", "스프링", "스프링부트"] },
    { matches: ["mariadb"], aliases: ["MariaDB", "마리아DB", "마리아디비"] },
    { matches: ["sqlite"], aliases: ["SQLite", "에스큐엘라이트"] },
    { matches: ["redis"], aliases: ["Redis", "레디스", "cache", "캐시"] },
    { matches: ["flutter"], aliases: ["Flutter", "플러터"] },
    { matches: ["dart", "dart 3"], aliases: ["Dart", "다트"] },
    { matches: ["fastapi"], aliases: ["FastAPI", "패스트API", "패스트에이피아이"] },
    { matches: ["google apps script"], aliases: ["Google Apps Script", "Apps Script", "GAS", "구글 앱스 스크립트"] },
    { matches: ["tensorflow.js"], aliases: ["TensorFlow.js", "TensorFlow", "텐서플로", "텐서플로JS"] },
    { matches: ["pytorch"], aliases: ["PyTorch", "파이토치"] },
    { matches: ["c++"], aliases: ["C++", "CPP", "씨플플"] },
    { matches: ["html", "html/css"], aliases: ["HTML", "마크업"] },
    { matches: ["css", "html/css"], aliases: ["CSS", "스타일시트"] },
    { matches: ["docker"], aliases: ["Docker", "도커", "container", "컨테이너"] },
    { matches: ["nginx"], aliases: ["Nginx", "엔진엑스", "web server", "웹서버"] },
    { matches: ["rest api", "api server"], aliases: ["REST", "REST API", "API", "에이피아이"] }
  ];
  const expandVerifiedSearchTerms = (project) => {
    const capabilityTerms = (project.capabilities || []).flatMap((capability) => capabilityAliases[capability] || [capability]);
    const normalizedStack = (project.stack || []).map(normalizeSearch);
    const technologyTerms = technologyAliasRules
      .filter(({ matches }) => matches.some((match) => normalizedStack.includes(normalizeSearch(match))))
      .flatMap(({ aliases }) => aliases);
    return [...capabilityTerms, ...technologyTerms];
  };
  const projectSearchIndex = projects.map((project) => ({
    project,
    text: normalizeSearch([
      project.id, project.title, project.short, project.headline, project.category,
      project.kind, project.stack, project.features, project.scope, project.result,
      expandVerifiedSearchTerms(project)
    ].flat(Infinity).filter(Boolean).join(" "))
  }));
  const featuredSearchProjects = projects.filter((project) => project.featured).sort((a, b) => a.featured - b.featured).slice(0, 6);
  let projectSearchFrame = 0;
  let currentSearchResults = projects;

  const formatProjectCount = (count) => ({
    ko: `${count}개 프로젝트`,
    en: `${count} projects`,
    ja: `${count}件のプロジェクト`,
    es: `${count} proyectos`
  }[currentLanguage] || `${count} PROJECTS`);

  const filterProjects = (value) => {
    const query = normalizeSearch(value);
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];
    return {
      terms,
      results: terms.length
        ? projectSearchIndex.filter(({ text }) => terms.every((term) => text.includes(term))).map(({ project }) => project)
        : projects
    };
  };
  const highlightSearch = (value, terms) => {
    const source = String(value || "");
    if (!terms.length) return escapeHtml(source);
    const escapedTerms = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
    if (!escapedTerms.length) return escapeHtml(source);
    const matcher = new RegExp(`(${escapedTerms.join("|")})`, "giu");
    return source.split(matcher).map((part, index) => index % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)).join("");
  };
  const renderInlineSearchResults = (results, terms) => {
    if (!projectSearchResults) return;
    if (!results.length) {
      projectSearchResults.innerHTML = `<p class="portfolio-search-empty">${escapeHtml(t("search.empty"))}</p>`;
      return;
    }
    projectSearchResults.innerHTML = results.map((project) => `
      <article class="portfolio-search-result">
        <button type="button" data-open-project="${escapeHtml(project.id)}" aria-label="${escapeHtml(project.title)} ${escapeHtml(t("project.detail"))}">
          <span class="portfolio-search-result-meta"><i>${highlightSearch(project.kind, terms)}</i><b>${escapeHtml(project.date || "")}</b></span>
          <strong>${highlightSearch(project.title, terms)}</strong>
          <small>${highlightSearch((project.stack || []).slice(0, 5).join(" · "), terms)}</small>
          <em>${escapeHtml(t("search.result"))} <span aria-hidden="true">↗</span></em>
        </button>
        ${project.url ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener">${escapeHtml(t("search.demo"))} <span aria-hidden="true">↗</span></a>` : ""}
      </article>`).join("");
  };
  const renderGlobalSearchResults = (results, terms) => {
    if (!globalSearchResults) return;
    if (!results.length) {
      globalSearchResults.innerHTML = `<p class="global-search-empty">${escapeHtml(t("search.empty"))}</p>`;
      return;
    }
    globalSearchResults.innerHTML = results.map((project, index) => `
      <article class="global-search-result">
        <button type="button" data-open-project="${escapeHtml(project.id)}" ${index === 0 ? "data-search-first=\"\"" : ""}>
          <span><i>${highlightSearch(project.kind, terms)}</i><strong>${highlightSearch(project.title, terms)}</strong><small>${highlightSearch((project.stack || []).slice(0, 4).join(" · "), terms)}</small></span>
          <em>${escapeHtml(t("search.result"))} <b aria-hidden="true">↗</b></em>
        </button>
        ${project.url ? `<a aria-label="${escapeHtml(project.title)} ${escapeHtml(t("search.demo"))}" href="${escapeHtml(project.url)}" target="_blank" rel="noopener"><span>${escapeHtml(t("search.demo"))}</span><b aria-hidden="true">↗</b></a>` : ""}
      </article>`).join("");
  };

  function refreshProjectSearch() {
    if (!projectSearchInput || !projectSearchResults || !projectSearchSummary) return;
    projectSearchInput.placeholder = t("search.placeholder");
    projectSearchClear?.setAttribute("aria-label", t("search.clear"));
    projectSearchClear?.setAttribute("title", t("search.clear"));
    const { terms, results } = filterProjects(projectSearchInput.value);
    currentSearchResults = results;
    const searching = terms.length > 0;
    portfolioSection?.classList.toggle("is-searching", searching);
    portfolioTrack?.setAttribute("aria-hidden", String(searching));
    projectSearchResults.hidden = !searching;
    if (projectSearchClear) projectSearchClear.hidden = !projectSearchInput.value;
    projectSearchSummary.textContent = formatProjectCount(currentSearchResults.length);
    if (!searching) {
      projectSearchResults.replaceChildren();
      return;
    }
    renderInlineSearchResults(currentSearchResults, terms);
  }

  function refreshGlobalSearch() {
    if (!globalSearchInput || !globalSearchResults || !globalSearchSummary) return;
    globalSearchInput.placeholder = t("search.placeholder");
    const { terms, results } = filterProjects(globalSearchInput.value);
    const searching = terms.length > 0;
    const visibleResults = searching ? results : featuredSearchProjects;
    globalSearchQuick?.toggleAttribute("hidden", searching);
    globalSearchSummary.textContent = searching ? formatProjectCount(results.length) : t("search.featured");
    renderGlobalSearchResults(visibleResults, terms);
  }

  const syncSearchQuery = (value, source) => {
    if (source !== projectSearchInput && projectSearchInput) projectSearchInput.value = value;
    if (source !== globalSearchInput && globalSearchInput) globalSearchInput.value = value;
    refreshProjectSearch();
    refreshGlobalSearch();
  };
  const scheduleSearch = (value, source) => {
    cancelAnimationFrame(projectSearchFrame);
    projectSearchFrame = requestAnimationFrame(() => syncSearchQuery(value, source));
  }

  projectSearchInput?.addEventListener("input", () => {
    scheduleSearch(projectSearchInput.value, projectSearchInput);
  });
  projectSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectSearchInput.value) {
      event.stopPropagation();
      syncSearchQuery("", projectSearchInput);
    } else if (event.key === "Enter" && currentSearchResults.length) {
      event.preventDefault();
      projectSearchResults?.querySelector("[data-open-project]")?.click();
    }
  });
  projectSearchClear?.addEventListener("click", () => {
    if (!projectSearchInput) return;
    syncSearchQuery("", projectSearchInput);
    projectSearchInput.focus();
  });
  globalSearchInput?.addEventListener("input", () => scheduleSearch(globalSearchInput.value, globalSearchInput));

  const openGlobalSearch = () => {
    if (!globalSearchDialog || !globalSearchInput) return;
    setMenu(false);
    setLanguageMenu(false);
    if (!globalSearchDialog.open) globalSearchDialog.showModal();
    document.body.classList.add("global-search-open");
    refreshGlobalSearch();
    requestAnimationFrame(() => {
      globalSearchInput.focus();
      globalSearchInput.select();
    });
  };
  globalSearchTriggers.forEach((trigger) => trigger.addEventListener("click", openGlobalSearch));
  qs("[data-global-search-close]", globalSearchDialog)?.addEventListener("click", () => globalSearchDialog.close());
  qsa("[data-search-suggestion]", globalSearchDialog).forEach((button) => button.addEventListener("click", () => {
    if (!globalSearchInput) return;
    syncSearchQuery(button.dataset.searchSuggestion || "", button);
    globalSearchInput.focus();
  }));
  globalSearchDialog?.addEventListener("close", () => document.body.classList.remove("global-search-open"));
  globalSearchDialog?.addEventListener("click", (event) => {
    if (event.target === globalSearchDialog) globalSearchDialog.close();
    if (event.target.closest("[data-open-project]")) globalSearchDialog.close();
  });
  globalSearchDialog?.addEventListener("keydown", (event) => {
    const resultButtons = qsa("[data-open-project]", globalSearchResults);
    if (event.key === "Enter" && event.target === globalSearchInput && resultButtons.length) {
      event.preventDefault();
      resultButtons[0].click();
      return;
    }
    if (!resultButtons.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = resultButtons.indexOf(document.activeElement);
    const nextIndex = event.key === "ArrowDown"
      ? Math.min(currentIndex + 1, resultButtons.length - 1)
      : Math.max(currentIndex < 0 ? resultButtons.length - 1 : currentIndex - 1, 0);
    resultButtons[nextIndex].focus();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isEditing = target instanceof HTMLElement && (target.matches("input, textarea, select") || target.isContentEditable);
    const commandSearch = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    const slashSearch = event.key === "/" && !isEditing && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (!commandSearch && !slashSearch) return;
    if (qs("[data-project-dialog]")?.open) return;
    event.preventDefault();
    openGlobalSearch();
  });

  if (portfolioTrack && !portfolioReady) {
    const portfolioRenderObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      portfolioReady = true;
      portfolioRenderObserver.disconnect();
      renderPortfolioCards();
    }, { rootMargin: "1200px 0px", threshold: 0 });
    portfolioRenderObserver.observe(portfolioTrack);
  }

  let savedLanguage = "ko";
  try { savedLanguage = localStorage.getItem("suaveforge.language") || "ko"; } catch (_) {}
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage && languageMeta[urlLanguage]) savedLanguage = urlLanguage;
  applyLanguage(savedLanguage);

  const revealItems = qsa(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -35px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const projectDialog = qs("[data-project-dialog]");
  let activeProject = null;
  let activeGalleryIndex = 0;
  const dialogImage = qs("[data-dialog-image]", projectDialog);
  const dialogLive = qs("[data-dialog-live]", projectDialog);
  const updateDialogImage = () => {
    if (!activeProject || !dialogImage) return;
    const gallery = activeProject.gallery?.length ? activeProject.gallery : [activeProject.cover];
    activeGalleryIndex = (activeGalleryIndex + gallery.length) % gallery.length;
    dialogImage.src = gallery[activeGalleryIndex];
    dialogImage.alt = `${activeProject.title} 프로젝트 화면 ${activeGalleryIndex + 1}`;
    const count = qs("[data-gallery-count]", projectDialog);
    if (count) count.textContent = `${activeGalleryIndex + 1} / ${gallery.length}`;
    qsa("[data-gallery-prev],[data-gallery-next]", projectDialog).forEach((button) => button.hidden = gallery.length < 2);
  };
  const openProject = (project) => {
    if (!projectDialog || !project) return;
    activeProject = project;
    activeGalleryIndex = 0;
    qs("[data-dialog-kind]", projectDialog).innerHTML = `<span class="project-badge ${categoryClass(project.category)}">${escapeHtml(project.category)}</span><small>${escapeHtml(project.kind)}</small>`;
    qs("[data-dialog-title]", projectDialog).textContent = project.title;
    qs("[data-dialog-short]", projectDialog).textContent = project.headline || project.short;
    qs("[data-dialog-stack]", projectDialog).innerHTML = (project.stack || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    qs("[data-dialog-features]", projectDialog).innerHTML = (project.features || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    qs("[data-dialog-scope]", projectDialog).textContent = project.scope || "";
    qs("[data-dialog-result]", projectDialog).textContent = project.result || "";
    if (dialogLive) {
      dialogLive.hidden = !project.url;
      dialogLive.href = project.url || "#";
    }
    updateDialogImage();
    projectDialog.showModal();
    document.body.classList.add("dialog-open");
  };
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-project]");
    if (!opener) return;
    const project = projectById.get(opener.getAttribute("data-open-project"));
    if (project) openProject(project);
  });
  qs("[data-project-close]", projectDialog)?.addEventListener("click", () => projectDialog.close());
  qs("[data-gallery-prev]", projectDialog)?.addEventListener("click", () => { activeGalleryIndex -= 1; updateDialogImage(); });
  qs("[data-gallery-next]", projectDialog)?.addEventListener("click", () => { activeGalleryIndex += 1; updateDialogImage(); });
  projectDialog?.addEventListener("click", (event) => { if (event.target === projectDialog) projectDialog.close(); });
  projectDialog?.addEventListener("close", () => { document.body.classList.remove("dialog-open"); activeProject = null; });

  const projectForm = qs("[data-project-form]");
  const formStatus = qs("[data-form-status]");
  const submitButton = qs("[data-submit-button]", projectForm);
  const formLoadedAt = Date.now();

  const normalizeReferenceUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw;
    if (/^(localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/i.test(raw)) return `http://${raw}`;
    return `https://${raw}`;
  };

  const referenceInput = projectForm?.querySelector('[name="reference"]');
  referenceInput?.addEventListener("blur", () => {
    if (referenceInput.value.trim()) referenceInput.value = normalizeReferenceUrl(referenceInput.value);
  });

  const buildBrief = () => {
    if (!projectForm) return "";
    const data = new FormData(projectForm);
    return [
      "안녕하세요. SuaveForge 프로젝트 상담을 요청합니다.", "",
      `[이름 / 회사] ${data.get("name") || ""}`,
      `[회신 이메일] ${data.get("email") || ""}`,
      `[연락처] ${data.get("phone") || "미기재"}`,
      `[필요한 프로그램] ${data.get("type") || "미정"}`,
      `[희망 일정] ${data.get("timeline") || "미정"}`,
      `[예산 범위] ${data.get("budget") || "미정"}`,
      `[참고 링크] ${normalizeReferenceUrl(data.get("reference")) || "없음"}`, "",
      `[현재 해결하려는 일]\n${data.get("problem") || ""}`
    ].join("\n");
  };

  const setFormStatus = (message, state = "") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.state = state;
  };

  projectForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!projectForm.reportValidity()) return;
    const formData = new FormData(projectForm);
    if (formData.get("_honey")) return;
    if (Date.now() - formLoadedAt < 2500) {
      setFormStatus("잠시 후 다시 제출해 주세요.", "error");
      return;
    }
    const endpoint = config.contactEndpoint;
    if (!endpoint) {
      setFormStatus("지금은 온라인 접수가 어렵습니다. 이메일이나 전화로 연락해 주세요. 내용을 복사해 이메일로 보내주세요.", "error");
      return;
    }
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "미기재",
      project_type: formData.get("type"),
      timeline: formData.get("timeline") || "미정",
      budget: formData.get("budget") || "미정",
      reference: normalizeReferenceUrl(formData.get("reference")) || "없음",
      message: formData.get("problem"),
      _replyto: formData.get("email"),
      _subject: `[SuaveForge 프로젝트 상담] ${formData.get("name")} · ${formData.get("type")}`,
      _template: "table",
      _captcha: "false",
      // 캐시용 쿼리나 해시가 달라도 FormSubmit에는 항상 같은 폼으로 전달합니다.
      _url: "https://suaveforge.com/"
    };
    submitButton?.setAttribute("disabled", "");
    if (submitButton) submitButton.firstChild.textContent = "접수 중... ";
    setFormStatus("상담 내용을 전송하고 있습니다.", "loading");
    try {
      // FormSubmit 공식 AJAX 예시와 같은 일반 폼 인코딩을 사용합니다.
      // application/json은 CORS 사전 요청을 발생시켜, 메일은 전달됐지만
      // 브라우저가 응답을 읽지 못해 실패로 표시되는 경우가 있습니다.
      const encoded = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => encoded.append(key, String(value ?? "")));
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: encoded
      });
      const responseText = await response.text();
      let result = {};
      try { result = responseText ? JSON.parse(responseText) : {}; } catch { result = {}; }
      const explicitFailure = result.success === false || result.success === "false";
      const responseMessage = String(result.message || "");
      const activationPending = /activat|confirm|verif|not\s+active/i.test(responseMessage);
      if (!response.ok || explicitFailure) {
        if (!activationPending) throw new Error(responseMessage || `submit failed (${response.status})`);
        // FormSubmit은 비활성 폼의 내용을 보관한 뒤 활성화 후 메일로 전달하면서도
        // 최초 AJAX 응답은 실패로 반환할 수 있습니다. 같은 내용을 다시 전송하지 않고
        // 요청이 서버에 도달했다는 사실만 안내해 중복 접수를 막습니다.
        console.warn("FormSubmit delivery pending", response.status, responseMessage);
        projectForm.reset();
        setFormStatus(`상담 전송 요청이 접수되었습니다. ${config.responsePromise || "확인 후 연락드리겠습니다."}`, "success");
        return;
      }
      projectForm.reset();
      setFormStatus(`상담 내용이 접수되었습니다. ${config.responsePromise || "확인 후 연락드리겠습니다."}`, "success");
    } catch (error) {
      console.error(error);
      if (error instanceof TypeError) {
        setFormStatus(`전송 결과를 바로 확인하지 못했습니다. 잠시 후 메일을 확인하거나 전화로 문의해 주세요.`, "warning");
      } else {
        setFormStatus(`전송하지 못했습니다. 내용을 복사해 ${config.contactEmail || "이메일"}로 보내거나 전화로 문의해 주세요.`, "error");
      }
    } finally {
      submitButton?.removeAttribute("disabled");
      if (submitButton) submitButton.firstChild.textContent = "상담 내용 보내기 ";
    }
  });

  qs("[data-copy-brief]")?.addEventListener("click", async () => {
    if (!projectForm?.reportValidity()) return;
    const text = buildBrief();
    try {
      await navigator.clipboard.writeText(text);
      setFormStatus("상담 내용을 복사했습니다. 이메일에 붙여 넣어 보내주세요.", "success");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      setFormStatus("상담 내용을 복사했습니다.", "success");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setMenu(false);
    setLanguageMenu(false);
    if (projectDialog?.open) projectDialog.close();
  });
})();
