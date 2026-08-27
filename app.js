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
      "mega.services.title": "지금 가진 상태에서<br>가장 빠른 시작점", "mega.services.desc": "기획서가 있든 없든, 운영 중이든 소스가 없든 현재 상태에 맞춰 접근합니다.", "mega.services.serviceDesc": "자동화 · 시스템 개선 · 재구축", "mega.services.diagnosisDesc": "URL 하나로 먼저 고칠 순서 확인", "mega.services.processDesc": "범위 확정 → 검증 → 개발 → 배포와 인계", "mega.services.faqDesc": "소스 없음 · 기획 미완성 · 부분 개선 가능 여부",
      "mega.work.title": "말보다 실제 화면과<br>동작을 먼저", "mega.work.desc": "대표 사례, 직접 열어보는 데모, 전체 작업을 목적에 따라 나눠 봅니다.", "mega.work.casesDesc": "문제와 해결 범위를 빠르게 파악", "mega.work.demosDesc": "브라우저에서 실제 동작 확인", "mega.work.portfolioDesc": "프로젝트 검색과 기술 스택 기준 탐색",
      "mega.company.title": "누가 어떻게 만들고<br>끝까지 책임하는지", "mega.company.desc": "경험, 협업 방식, 장기 파트너십과 실제 개발팀을 한 곳에 묶었습니다.", "mega.company.experienceDesc": "게임 · 플랫폼 · 산업 시스템", "mega.company.partnershipDesc": "프로젝트 이후까지 이어지는 맥락", "mega.company.teamDesc": "분야별 담당자와 팀 리더 직접 참여",
      "nav.diagnosis": "무료 진단", "nav.servicesGroup": "서비스", "nav.workGroup": "작업 보기", "nav.companyGroup": "SuaveForge", "nav.services": "개발 서비스", "nav.cases": "대표 사례", "nav.demos": "라이브 데모", "nav.portfolio": "전체 작업", "nav.process": "진행 방식", "nav.experience": "경험", "nav.partnership": "파트너십", "nav.team": "개발팀", "nav.faq": "자주 묻는 질문",
      "cta.contact": "상담 요청", "cta.diagnosis": "무료 사이트 진단", "cta.cases": "대표 작업 보기", "cta.demoArrow": "데모 보기 ↗", "cta.moreCases": "대표 작업 더 보기", "cta.lessCases": "대표 작업 접기", "cta.moreWork": "더 많은 작업 보기", "cta.lessWork": "작업 접기", "cta.detail": "자세히 보기", "cta.demo": "데모 보기 ↗",
      "hero.auto1": "반복 업무를", "hero.auto2": "프로그램에 맡깁니다.", "hero.rebuild1": "소스 없는 프로그램도", "hero.rebuild2": "새 코드로 다시 만듭니다.", "hero.product": "Windows 설치형 제품", "hero.productName": "ACS 사고 콘텐츠 스튜디오", "hero.realNote": "실제 화면과 구현 범위를<br/>함께 공개합니다", "hero.support": "소스가 없어도 화면과 동작, 파일과 데이터 흐름을 분석해 새 코드로 재구축합니다. 이후 기능 추가와 업데이트가 가능한 상태로 넘깁니다.",
      "trust.autoTitle": "자동화", "trust.autoText": "반복 작업을 실행 가능한 흐름으로 전환", "trust.rebuildTitle": "재구축", "trust.rebuildText": "소스가 없는 프로그램도 새 코드로 개발", "trust.realTitle": "실제 화면", "trust.realText": "작업 화면과 구현 범위를 함께 공개", "trust.monthTitle": "3개월", "trust.monthText": "실제 운영까지 이어지는 품질보증",
      "diagnosis.title1": "URL 하나면,", "diagnosis.title2": "먼저 고칠 순서가 보입니다.", "diagnosis.lead": "회원가입 없이 공개 페이지를 실제 브라우저로 검사합니다. 성능·모바일·SEO·AEO·GEO·접근성·기본 보안을 확인하고, 근거가 있는 문제만 우선순위로 정리합니다.", "diagnosis.point1": "가입 없이 URL 하나로 시작", "diagnosis.point2": "이메일은 결과 확인 뒤 선택", "diagnosis.point3": "공개 페이지에서 확인한 사실만 사용", "diagnosis.point4": "전체 재개발보다 먼저 고칠 부분부터", "diagnosis.label": "진단할 사이트 주소", "diagnosis.button": "무료 진단 시작", "diagnosis.note1": "회원가입 불필요", "diagnosis.note2": "공개 URL만 검사", "diagnosis.note3": "내부 기능은 추측하지 않음", "diagnosis.check1": "로딩·렌더링·Core Web Vitals", "diagnosis.check2": "넘침·터치·첫 화면 배치", "diagnosis.check3": "SEO·AEO·GEO · 색인·답변·엔티티 구조", "diagnosis.check4": "라벨·대비·ARIA·키보드", "diagnosis.check5": "HTTPS·헤더·혼합 콘텐츠",
      "cases.title1": "말보다,", "cases.title2": "화면으로 보시는 게 빠릅니다.", "demos.title1": "궁금한 건,", "demos.title2": "직접 열어보는 편이 빠릅니다.", "demos.lead": "브라우저에서 확인할 수 있는 작업 화면입니다.",
      "start.line1": "잘 짜인 기획서가 없어도", "start.line2": "함께 정리하며 시작할 수 있고,", "start.line3": "소스가 없는 프로그램도", "start.line4": "새 코드로 다시 만들 수 있습니다.", "project.screen": "프로젝트 화면", "project.detail": "상세 보기",
      "faq.eyebrow": "QUICK ANSWERS", "faq.title1": "시작 전에 많이 묻는 것만,", "faq.title2": "짧게 답합니다.", "faq.q1": "소스 코드가 없어도 기존 프로그램을 다시 만들 수 있나요?", "faq.a1": "가능합니다. 화면과 동작, 파일과 데이터 흐름을 실제로 확인해 현재 프로그램의 핵심 기능을 정리하고, 이후 유지보수와 기능 추가가 가능한 새 코드로 재구축합니다.", "faq.q2": "완성된 기획서가 없어도 시작할 수 있나요?", "faq.a2": "가능합니다. 현재 업무 방식과 불편한 지점, 실제 사용 화면부터 함께 정리해 범위와 완료 기준을 먼저 확정한 뒤 개발을 시작합니다.", "faq.q3": "전체 재개발 말고 문제 있는 부분만 개선할 수도 있나요?", "faq.a3": "가능합니다. 기존 자산을 먼저 진단하고 살릴 수 있는 구조는 유지합니다. UX, 오류, 성능, 보안, 배포처럼 효과가 명확한 부분부터 단계적으로 개선합니다.", "search.label": "프로젝트 검색", "search.header": "프로젝트 검색", "search.placeholder": "프로젝트명 또는 기술 스택을 입력하세요", "search.clear": "검색어 지우기", "search.empty": "일치하는 프로젝트가 없습니다.", "search.result": "상세 보기", "search.demo": "라이브 데모", "search.globalTitle": "필요한 작업을 바로 찾으세요", "search.quick": "빠른 검색", "search.featured": "추천 프로젝트", "search.move": "결과 이동", "search.open": "상세 열기", "search.close": "검색 닫기", "search.closeShort": "닫기"
    },
    en: {
      "mega.services.title": "The fastest starting point<br>from where you are now", "mega.services.desc": "Whether the brief is complete, the service is live, or the source is missing, we start from the current reality.", "mega.services.serviceDesc": "Automation · system improvement · rebuild", "mega.services.diagnosisDesc": "See what to fix first from one URL", "mega.services.processDesc": "Scope → validate → build → deploy and hand over", "mega.services.faqDesc": "No source · incomplete brief · partial improvement",
      "mega.work.title": "See the screens and behavior<br>before the pitch", "mega.work.desc": "Browse representative cases, live demos, and the full body of work by intent.", "mega.work.casesDesc": "Understand the problem and fix scope quickly", "mega.work.demosDesc": "Open real behavior in the browser", "mega.work.portfolioDesc": "Explore by project and technology",
      "mega.company.title": "Who builds it and<br>who stays accountable", "mega.company.desc": "Experience, collaboration, long-term context, and the actual development team in one place.", "mega.company.experienceDesc": "Games · platforms · industrial systems", "mega.company.partnershipDesc": "Context that continues after delivery", "mega.company.teamDesc": "Specialists and team lead participate directly",
      "nav.diagnosis": "Free Audit", "nav.servicesGroup": "Services", "nav.workGroup": "Work", "nav.companyGroup": "SuaveForge", "nav.services": "Development Services", "nav.cases": "Case Studies", "nav.demos": "Live Demos", "nav.portfolio": "All Work", "nav.process": "Process", "nav.experience": "Experience", "nav.partnership": "Partnership", "nav.team": "Team", "nav.faq": "FAQ",
      "cta.contact": "Get in Touch", "cta.diagnosis": "Free Site Audit", "cta.cases": "View Case Studies", "cta.demoArrow": "View demo ↗", "cta.moreCases": "View more cases", "cta.lessCases": "Collapse cases", "cta.moreWork": "View more work", "cta.lessWork": "Collapse work", "cta.detail": "View details", "cta.demo": "View demo ↗",
      "hero.auto1": "Automate", "hero.auto2": "repetitive work.", "hero.rebuild1": "Rebuild software", "hero.rebuild2": "without source.", "hero.product": "Windows product", "hero.productName": "ACS Accident Content Studio", "hero.realNote": "Real screens and scope,<br/>shown up front", "hero.support": "Even when the source code is gone, we analyze screens, behavior, files, and data flow, then rebuild the software as maintainable new code.",
      "trust.autoTitle": "Automation", "trust.autoText": "Turn repeat work into executable flows", "trust.rebuildTitle": "Rebuild", "trust.rebuildText": "Recreate source-less software in new code", "trust.realTitle": "Real Screens", "trust.realText": "Show the actual UI and implementation scope", "trust.monthTitle": "3 Months", "trust.monthText": "Warranty through real operation",
      "diagnosis.title1": "One URL.", "diagnosis.title2": "See what to fix first.", "diagnosis.lead": "We inspect the public page in a real browser without requiring an account. Performance, mobile, SEO, AEO, GEO, accessibility, and basic security are checked and only evidence-backed issues are prioritized.", "diagnosis.point1": "Start with one URL, no account", "diagnosis.point2": "Email is optional after results", "diagnosis.point3": "Use only facts visible on public pages", "diagnosis.point4": "Fix gaps before recommending a rebuild", "diagnosis.label": "Website to diagnose", "diagnosis.button": "Start free audit", "diagnosis.note1": "No sign-up", "diagnosis.note2": "Public URLs only", "diagnosis.note3": "No guesses about private features", "diagnosis.check1": "Loading, rendering, Core Web Vitals", "diagnosis.check2": "Overflow, touch targets, first viewport", "diagnosis.check3": "SEO, AEO, GEO: indexability, answers, entities", "diagnosis.check4": "Labels, contrast, ARIA, keyboard", "diagnosis.check5": "HTTPS, headers, mixed content",
      "cases.title1": "Less talk.", "cases.title2": "Screens make it faster.", "demos.title1": "Curious?", "demos.title2": "Open the work and see it.", "demos.lead": "Live work screens you can check in the browser.",
      "start.line1": "Even without a polished brief,", "start.line2": "we can shape the work together,", "start.line3": "and source-less software", "start.line4": "can be rebuilt as new code.", "project.screen": "project screen", "project.detail": "details",
      "faq.eyebrow": "QUICK ANSWERS", "faq.title1": "The questions that matter", "faq.title2": "before we start.", "faq.q1": "Can you rebuild an existing program without its source code?", "faq.a1": "Yes. We inspect the actual screens, behavior, files, and data flow, then rebuild the core behavior as maintainable new code that can be updated later.", "faq.q2": "Can we start without a finished specification?", "faq.a2": "Yes. We begin with the current workflow, pain points, and real screens, then define scope and completion criteria before development.", "faq.q3": "Can you improve only the broken parts instead of rebuilding everything?", "faq.a3": "Yes. We preserve useful assets first and improve the parts with clear impact, such as UX, defects, performance, security, and deployment.", "search.label": "Project search", "search.header": "Search projects", "search.placeholder": "Search project names or technologies", "search.clear": "Clear search", "search.empty": "No matching projects found.", "search.result": "View details", "search.demo": "Live demo", "search.globalTitle": "Find the right work instantly", "search.quick": "Quick search", "search.featured": "Featured projects", "search.move": "Move", "search.open": "Open details", "search.close": "Close search", "search.closeShort": "Close"
    },
    ja: {
      "mega.services.title": "今ある状態から<br>最短で始める", "mega.services.desc": "仕様書の有無、運用中かどうか、ソースの有無にかかわらず、現在の状態から始めます。", "mega.services.serviceDesc": "自動化 · システム改善 · 再構築", "mega.services.diagnosisDesc": "URLひとつで先に直す順番を確認", "mega.services.processDesc": "範囲確定 → 検証 → 開発 → 配布・引き継ぎ", "mega.services.faqDesc": "ソースなし · 仕様未完成 · 部分改善",
      "mega.work.title": "説明より先に<br>実画面と動作を見る", "mega.work.desc": "代表事例、実際に開けるデモ、全実績を目的別に確認できます。", "mega.work.casesDesc": "問題と改善範囲を素早く把握", "mega.work.demosDesc": "ブラウザで実際の動作を確認", "mega.work.portfolioDesc": "プロジェクト・技術別に探す",
      "mega.company.title": "誰が作り<br>最後まで責任を持つか", "mega.company.desc": "経験、協業方式、長期パートナーシップ、実際の開発チームをまとめました。", "mega.company.experienceDesc": "ゲーム · プラットフォーム · 産業システム", "mega.company.partnershipDesc": "納品後にも続く業務理解", "mega.company.teamDesc": "担当者とチームリーダーが直接参加",
      "nav.diagnosis": "無料診断", "nav.servicesGroup": "サービス", "nav.workGroup": "実績を見る", "nav.companyGroup": "SuaveForge", "nav.services": "開発サービス", "nav.cases": "代表事例", "nav.demos": "ライブデモ", "nav.portfolio": "制作実績", "nav.process": "進行方式", "nav.experience": "経験", "nav.partnership": "パートナーシップ", "nav.team": "チーム", "nav.faq": "よくある質問",
      "cta.contact": "相談する", "cta.diagnosis": "無料サイト診断", "cta.cases": "代表事例を見る", "cta.demoArrow": "デモを見る ↗", "cta.moreCases": "事例をもっと見る", "cta.lessCases": "事例を閉じる", "cta.moreWork": "実績をもっと見る", "cta.lessWork": "実績を閉じる", "cta.detail": "詳細を見る", "cta.demo": "デモを見る ↗",
      "hero.auto1": "反復業務を", "hero.auto2": "自動化します。", "hero.rebuild1": "ソースなしでも", "hero.rebuild2": "再構築します。", "hero.product": "Windows製品", "hero.productName": "ACS事故コンテンツスタジオ", "hero.realNote": "実画面と実装範囲を<br/>先に共有します", "hero.support": "ソースコードがなくても、画面・動作・ファイル・データの流れを分析し、保守できる新しいコードとして再構築します。",
      "trust.autoTitle": "自動化", "trust.autoText": "反復作業を実行可能な流れに変換", "trust.rebuildTitle": "再構築", "trust.rebuildText": "ソースのないソフトも新規コードで開発", "trust.realTitle": "実画面", "trust.realText": "画面と実装範囲を明確に公開", "trust.monthTitle": "3か月", "trust.monthText": "運用まで見据えた品質保証",
      "diagnosis.title1": "URLひとつで、", "diagnosis.title2": "先に直す順番が見えます。", "diagnosis.lead": "登録なしで公開ページを実ブラウザで検査します。性能・モバイル・SEO・AEO・GEO・アクセシビリティ・基本セキュリティを確認し、根拠のある問題だけを優先順位で整理します。", "diagnosis.point1": "登録なし、URLひとつで開始", "diagnosis.point2": "メールは結果確認後に任意", "diagnosis.point3": "公開ページで確認できる事実だけを使用", "diagnosis.point4": "全面改修より先に直す箇所から", "diagnosis.label": "診断するサイトURL", "diagnosis.button": "無料診断を開始", "diagnosis.note1": "登録不要", "diagnosis.note2": "公開URLのみ", "diagnosis.note3": "内部機能を推測しない", "diagnosis.check1": "読み込み・描画・Core Web Vitals", "diagnosis.check2": "はみ出し・タップ・初期画面", "diagnosis.check3": "SEO・AEO・GEO：インデックス・回答・エンティティ", "diagnosis.check4": "ラベル・コントラスト・ARIA", "diagnosis.check5": "HTTPS・ヘッダー・混在コンテンツ",
      "cases.title1": "説明より、", "cases.title2": "画面で見る方が早いです。", "demos.title1": "気になるなら、", "demos.title2": "直接開くのが一番です。", "demos.lead": "ブラウザで確認できる作業画面です。",
      "start.line1": "整った企画書がなくても", "start.line2": "一緒に整理して始められます。", "start.line3": "ソースのないプログラムも", "start.line4": "新しいコードで作り直せます。", "project.screen": "プロジェクト画面", "project.detail": "詳細",
      "faq.eyebrow": "QUICK ANSWERS", "faq.title1": "開始前によく聞かれることだけ、", "faq.title2": "短く答えます。", "faq.q1": "ソースコードがなくても既存プログラムを再構築できますか？", "faq.a1": "可能です。実際の画面・動作・ファイル・データの流れを確認し、後から保守や機能追加ができる新しいコードとして再構築します。", "faq.q2": "完成した仕様書がなくても始められますか？", "faq.a2": "可能です。現在の業務、困っている点、実画面から範囲と完了基準を先に整理してから開発を始めます。", "faq.q3": "全面再開発ではなく問題部分だけ改善できますか？", "faq.a3": "可能です。使える既存資産は残し、UX・不具合・性能・セキュリティ・配布など効果が明確な部分から段階的に改善します。", "search.label": "プロジェクト検索", "search.header": "プロジェクト検索", "search.placeholder": "プロジェクト名または技術を検索", "search.clear": "検索をクリア", "search.empty": "該当するプロジェクトがありません。", "search.result": "詳細を見る", "search.demo": "ライブデモ", "search.globalTitle": "必要な実績をすぐに探せます", "search.quick": "クイック検索", "search.featured": "おすすめプロジェクト", "search.move": "結果を移動", "search.open": "詳細を開く", "search.close": "検索を閉じる", "search.closeShort": "閉じる"
    },
    es: {
      "mega.services.title": "El punto de partida más rápido<br>desde tu situación actual", "mega.services.desc": "Con o sin especificación, en producción o sin código fuente, empezamos desde el estado real.", "mega.services.serviceDesc": "Automatización · mejora de sistemas · reconstrucción", "mega.services.diagnosisDesc": "Una URL para ver qué corregir primero", "mega.services.processDesc": "Alcance → validación → desarrollo → despliegue y entrega", "mega.services.faqDesc": "Sin código · especificación incompleta · mejora parcial",
      "mega.work.title": "Primero pantallas y<br>comportamiento real", "mega.work.desc": "Casos representativos, demos reales y todo el trabajo, agrupado por objetivo.", "mega.work.casesDesc": "Entender rápido el problema y el alcance", "mega.work.demosDesc": "Comprobar el comportamiento en el navegador", "mega.work.portfolioDesc": "Explorar por proyecto y tecnología",
      "mega.company.title": "Quién lo construye y<br>quién responde hasta el final", "mega.company.desc": "Experiencia, colaboración, contexto a largo plazo y el equipo real en un solo lugar.", "mega.company.experienceDesc": "Juegos · plataformas · sistemas industriales", "mega.company.partnershipDesc": "Contexto que continúa después de la entrega", "mega.company.teamDesc": "Especialistas y líder participan directamente",
      "nav.diagnosis": "Auditoría gratis", "nav.servicesGroup": "Servicios", "nav.workGroup": "Trabajos", "nav.companyGroup": "SuaveForge", "nav.services": "Servicios de desarrollo", "nav.cases": "Casos", "nav.demos": "Demos", "nav.portfolio": "Trabajos", "nav.process": "Proceso", "nav.experience": "Experiencia", "nav.partnership": "Colaboración", "nav.team": "Equipo", "nav.faq": "Preguntas frecuentes",
      "cta.contact": "Contactar", "cta.diagnosis": "Auditoría web gratis", "cta.cases": "Ver casos", "cta.demoArrow": "Ver demo ↗", "cta.moreCases": "Ver más casos", "cta.lessCases": "Cerrar casos", "cta.moreWork": "Ver más trabajos", "cta.lessWork": "Cerrar trabajos", "cta.detail": "Ver detalles", "cta.demo": "Ver demo ↗",
      "hero.auto1": "Automatizamos", "hero.auto2": "trabajo repetitivo.", "hero.rebuild1": "Reconstruimos", "hero.rebuild2": "software sin fuente.", "hero.product": "Producto Windows", "hero.productName": "ACS Accident Content Studio", "hero.realNote": "Pantallas reales y alcance,<br/>claros desde el inicio", "hero.support": "Aunque falte el código fuente, analizamos pantallas, comportamiento, archivos y flujo de datos para reconstruir el software como código nuevo y mantenible.",
      "trust.autoTitle": "Automatización", "trust.autoText": "Convertimos tareas repetitivas en flujos ejecutables", "trust.rebuildTitle": "Reconstrucción", "trust.rebuildText": "Recreamos software sin código fuente", "trust.realTitle": "Pantallas reales", "trust.realText": "Mostramos la interfaz y el alcance real", "trust.monthTitle": "3 meses", "trust.monthText": "Garantía hasta operación real",
      "diagnosis.title1": "Una URL.", "diagnosis.title2": "Ve qué corregir primero.", "diagnosis.lead": "Revisamos la página pública en un navegador real sin registro. Analizamos rendimiento, móvil, SEO, AEO, GEO, accesibilidad y seguridad básica, y priorizamos solo problemas con evidencia.", "diagnosis.point1": "Empieza con una URL y sin cuenta", "diagnosis.point2": "El email es opcional después del resultado", "diagnosis.point3": "Solo hechos visibles en páginas públicas", "diagnosis.point4": "Corregir primero antes de recomendar rehacer", "diagnosis.label": "Sitio web a diagnosticar", "diagnosis.button": "Iniciar auditoría gratis", "diagnosis.note1": "Sin registro", "diagnosis.note2": "Solo URLs públicas", "diagnosis.note3": "Sin suposiciones sobre funciones privadas", "diagnosis.check1": "Carga, renderizado y Core Web Vitals", "diagnosis.check2": "Desbordes, toque y primer viewport", "diagnosis.check3": "SEO, AEO y GEO: indexación, respuestas y entidades", "diagnosis.check4": "Etiquetas, contraste, ARIA y teclado", "diagnosis.check5": "HTTPS, cabeceras y contenido mixto",
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
  let featuredReady = !("IntersectionObserver" in window);
  const renderFeaturedCases = () => {
    if (!featuredRoot || !featuredReady) return;
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

  if (featuredRoot && !featuredReady) {
    const featuredRenderObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      featuredReady = true;
      featuredRenderObserver.disconnect();
      renderFeaturedCases();
      updateCaseMoreButton();
    }, { rootMargin: "1100px 0px", threshold: 0 });
    featuredRenderObserver.observe(featuredRoot);
  }

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

  const buildBrief = () => {
    if (!projectForm) return "";
    const data = new FormData(projectForm);
    return [
      "안녕하세요. SuaveForge 프로젝트 상담을 요청합니다.", "",
      `[이름 / 회사] ${data.get("name") || ""}`,
      `[회신 이메일] ${data.get("email") || ""}`,
      `[연락처] ${data.get("phone") || "미기재"}`,
      `[필요한 프로그램] ${data.get("type") || "미정"}`,
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
