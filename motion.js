(() => {
  "use strict";
  const projects = Array.isArray(window.SF_PROJECTS) ? window.SF_PROJECTS : [];
  const byId = new Map(projects.map((project) => [project.id, project]));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const replaceHeadline = (selector, markup, label) => {
    const heading = document.querySelector(selector);
    if (!heading) return null;
    heading.className = "sf-v2-motion";
    heading.dataset.v2Motion = "true";
    heading.setAttribute("aria-label", label);
    heading.innerHTML = markup;
    return heading;
  };

  const play = (target, className) => {
    target.classList.remove(className);
    void target.offsetWidth;
    target.classList.add(className);
  };
  let headlineObserver = null;
  const prepareHeadlines = () => {
    const firstTitle = document.querySelector(".case-story-1 h3");
    if (firstTitle) {
      firstTitle.className = "case-semantic-assembly motion-target";
      firstTitle.dataset.motion = "semantic-assembly";
      firstTitle.setAttribute("aria-label", "추천부터 매칭, 대화와 관리자 운영까지 하나의 서비스로 연결합니다.");
      firstTitle.innerHTML = `
        <span class="semantic-label">MATCHING SERVICE FLOW</span>
        <span class="semantic-terms" aria-hidden="true">
          <span class="semantic-term">추천·인연 신청</span>
          <span class="semantic-term">매칭·대화</span>
          <span class="semantic-term">관리자 운영</span>
        </span>
        <span class="semantic-join" aria-hidden="true"></span>
        <span class="semantic-core" aria-hidden="true"><span>사용자와 운영을 하나로</span><em>연결.</em></span>`;
    }
    replaceHeadline(
      ".case-story-2 h3",
      '<span class="sf-cinematic-cut"><span class="sf-cut-a">웹 상담 흐름과,</span><span class="sf-cut-b">통신 상태를 추적합니다.</span><i aria-hidden="true"></i></span>',
      "웹 상담 흐름과 Asterisk 통신 상태를 한 화면에서 추적합니다."
    );
    replaceHeadline(
      ".case-story-3 h3",
      '<span class="sf-focus-scan"><span>외부 주문과 내부 검사 상태를,</span><br><strong>하나의 흐름으로 연결합니다.</strong></span>',
      "외부 주문과 내부 검사 상태를 하나의 추적 가능한 흐름으로 연결합니다."
    );
    replaceHeadline(
      ".case-story-4 h3",
      '<span class="sf-convergence"><span class="sf-conv-left">콘텐츠 작성·사진 검수</span><i aria-hidden="true"></i><span class="sf-conv-right">예약 실행 자동화</span><em>작업 흐름과 이력을 한 프로그램에서 관리합니다.</em></span>',
      "콘텐츠 작성, 사진 검수와 예약 실행을 한 프로그램에서 관리합니다."
    );
    replaceHeadline(
      ".case-story-5 h3",
      '<span class="sf-storyboard"><span class="sf-storyboard-flow"><span>DICOM 로딩</span><i>→</i><span>3방향 단면</span><i>→</i><span>HU·거리 측정</span></span><strong>영상 측정을 한 화면에서.</strong></span>',
      "DICOM 영상을 세 방향으로 확인하며 HU와 거리를 측정합니다."
    );
    const standardTargets = [...document.querySelectorAll(".motion-target")];
    const v2Targets = [...document.querySelectorAll(".sf-v2-motion")];
    headlineObserver?.disconnect();
    if (reduce || !("IntersectionObserver" in window)) {
      standardTargets.forEach((target) => target.classList.add("motion-play"));
      v2Targets.forEach((target) => target.classList.add("sf-v2-play"));
      return;
    }
    headlineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        play(target, target.classList.contains("sf-v2-motion") ? "sf-v2-play" : "motion-play");
        headlineObserver.unobserve(target);
      });
    }, { threshold: .28, rootMargin: "0px 0px -8%" });
    [...standardTargets, ...v2Targets].forEach((target) => headlineObserver.observe(target));
  };
  prepareHeadlines();
  document.addEventListener("suaveforge:featured-rendered", prepareHeadlines);

  const initCaseGallery = (media) => {
    if (media.dataset.galleryReady === "true") return;
    const project = byId.get(media.getAttribute("data-open-project"));
    if (!project) return;
    const images = [...new Set([project.cover, ...(project.gallery || [])].filter(Boolean))];
    if (!images.length) return;
    const original = media.querySelector(":scope > img");
    const caption = media.querySelector(".case-story-caption");
    const gallery = document.createElement("span");
    gallery.className = "case-hover-gallery";
    gallery.setAttribute("aria-hidden", "true");
    const layerA = original || document.createElement("img");
    const layerB = document.createElement("img");
    if (!layerA.src) layerA.src = images[0];
    layerA.alt = "";
    layerA.decoding = "async";
    layerA.className = "is-active";
    layerB.alt = "";
    layerB.loading = "lazy";
    layerB.decoding = "async";
    layerB.fetchPriority = "low";
    gallery.append(layerA, layerB);
    const meter = document.createElement("span");
    meter.className = "case-gallery-meter";
    meter.setAttribute("aria-hidden", "true");
    meter.innerHTML = '<span class="case-gallery-meter-track"><i></i></span><b>01 / ' + String(images.length).padStart(2, "0") + "</b>";
    media.insertBefore(gallery, caption || null);
    media.append(meter);
    media.dataset.galleryReady = "true";
    let index = 0, active = layerA, standby = layerB, timer = 0, warmup = 0;
    const show = (nextIndex) => {
      index = (nextIndex + images.length) % images.length;
      standby.src = images[index];
      standby.classList.add("is-active");
      active.classList.remove("is-active");
      [active, standby] = [standby, active];
      const count = meter.querySelector("b");
      if (count) count.textContent = String(index + 1).padStart(2, "0") + " / " + String(images.length).padStart(2, "0");
    };
    const stop = () => {
      clearTimeout(warmup); clearInterval(timer); warmup = 0; timer = 0;
      media.classList.remove("is-browsing");
    };
    const start = () => {
      if (reduce || images.length < 2 || timer || warmup) return;
      media.classList.add("is-browsing");
      standby.src = images[(index + 1) % images.length];
      warmup = setTimeout(() => {
        warmup = 0; show(index + 1);
        timer = setInterval(() => show(index + 1), 1800);
      }, 420);
    };
    media.addEventListener("pointerenter", start);
    media.addEventListener("pointerleave", stop);
    media.addEventListener("focusin", start);
    media.addEventListener("focusout", stop);
  };

  let galleryObserver = null;
  const prepareCaseGalleries = () => {
    galleryObserver?.disconnect();
    const galleryMedia = [...document.querySelectorAll(".case-story-media[data-open-project]")];
    if (!("IntersectionObserver" in window)) {
      galleryMedia.forEach(initCaseGallery);
      return;
    }
    galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        initCaseGallery(entry.target);
        galleryObserver.unobserve(entry.target);
      });
    }, { rootMargin: "500px 0px", threshold: 0 });
    galleryMedia.forEach((media) => galleryObserver.observe(media));
  };
  prepareCaseGalleries();
  document.addEventListener("suaveforge:featured-rendered", prepareCaseGalleries);

  const grid = document.querySelector("[data-portfolio-track]");
  let trackEntryObserver = null;
  let trackActivityObserver = null;
  let trackResizeHandler = null;
  const updatePageVisibility = () => document.documentElement.classList.toggle("is-page-hidden", document.hidden);
  updatePageVisibility();
  document.addEventListener("visibilitychange", updatePageVisibility, { passive: true });

  const observeMotionActivity = (element) => {
    if (!element) return null;
    if (!("IntersectionObserver" in window)) {
      element.classList.add("is-motion-active");
      return null;
    }
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle("is-motion-active", entry.isIntersecting);
    }, { rootMargin: "180px 0px", threshold: 0 });
    observer.observe(element);
    return observer;
  };

  observeMotionActivity(document.querySelector(".live-demo-rail"));

  const initAllWork = () => {
    if (!grid || grid.querySelector(":scope > .sf-all-work-track")) return;
    const cards = [...grid.querySelectorAll(":scope > .portfolio-card")];
    if (!cards.length) return;
    cards.forEach((card) => card.classList.remove("portfolio-card-more", "is-shown"));
    const track = document.createElement("div"); track.className = "sf-all-work-track";
    const groupA = document.createElement("div"); groupA.className = "sf-all-work-group"; groupA.setAttribute("aria-label", "전체 작업");
    cards.forEach((card) => groupA.append(card));
    const groupB = groupA.cloneNode(true); groupB.setAttribute("aria-hidden", "true");
    groupB.querySelectorAll("a,button").forEach((node) => node.setAttribute("tabindex", "-1"));
    groupB.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
    });
    track.append(groupA, groupB);
    grid.replaceChildren(track);
    grid.classList.add("is-motion-ready");
    const setSpeed = () => {
      const distance = groupA.getBoundingClientRect().width;
      const pxPerSecond = innerWidth <= 760 ? 42 : 56;
      track.style.setProperty("--all-work-duration", Math.max(48, distance / pxPerSecond).toFixed(2) + "s");
    };
    requestAnimationFrame(() => requestAnimationFrame(setSpeed));
    if (trackResizeHandler) window.removeEventListener("resize", trackResizeHandler);
    let resizeFrame = 0;
    trackResizeHandler = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(setSpeed);
    };
    window.addEventListener("resize", trackResizeHandler, { passive: true });
    trackActivityObserver?.disconnect();
    trackActivityObserver = observeMotionActivity(grid);
  };

  const prepareAllWork = () => {
    trackEntryObserver?.disconnect();
    trackActivityObserver?.disconnect();
    if (!grid) return;
    if (!("IntersectionObserver" in window)) {
      initAllWork();
      return;
    }
    trackEntryObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      trackEntryObserver.disconnect();
      requestAnimationFrame(initAllWork);
    }, { rootMargin: "1000px 0px", threshold: 0 });
    trackEntryObserver.observe(grid);
  };

  prepareAllWork();
  document.addEventListener("suaveforge:portfolio-rendered", prepareAllWork);
})();
