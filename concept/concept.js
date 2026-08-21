(() => {
  "use strict";

  // Only the Korean concept copy is changed. Other language modes keep the main site's translations.
  const applyKoreanConceptCopy = () => {
    if (document.documentElement.lang !== "ko") return;

    const set = (selector, text) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = text;
    };

    set('[data-i18n="hero.auto1"]', "사람이 반복하는 일을");
    set('[data-i18n="hero.auto2"]', "없앱니다.");
    set('[data-i18n="hero.rebuild1"]', "소스 없는 프로그램도");
    set('[data-i18n="hero.rebuild2"]', "되살립니다.");
    set('[data-i18n="hero.support"]', "화면과 동작, 파일·데이터 흐름을 분석해 기능 추가가 가능한 새 코드로 재구축합니다.");
  };

  applyKoreanConceptCopy();

  const languageObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "lang")) {
      requestAnimationFrame(applyKoreanConceptCopy);
    }
  });
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
