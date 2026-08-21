(() => {
  const topbar = document.querySelector('[data-topbar]');
  const tabs = [...document.querySelectorAll('[data-stage-tab]')];
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const counter = document.querySelector('[data-stage-counter]');
  const label = document.querySelector('[data-stage-label]');
  const description = document.querySelector('[data-stage-description]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 'automation';
  let flowTimers = [];

  addEventListener('scroll', () => topbar?.classList.toggle('is-scrolled', scrollY > 18), { passive: true });

  function clearTimers(){ flowTimers.forEach(clearTimeout); flowTimers = []; }

  function runAutomation(scene){
    const steps = [...scene.querySelectorAll('[data-flow-step]')];
    steps.forEach(s => s.classList.remove('is-live'));
    steps.forEach((step, i) => {
      flowTimers.push(setTimeout(() => step.classList.add('is-live'), reduce ? 0 : 180 + i * 310));
    });
  }

  function runRebuild(scene){
    const nodes = [...scene.querySelectorAll('[data-rebuild-node]')];
    scene.classList.remove('is-running');
    nodes.forEach(n => n.classList.remove('is-live'));
    void scene.offsetWidth;
    nodes.forEach((node, i) => {
      flowTimers.push(setTimeout(() => node.classList.add('is-live'), reduce ? 0 : 180 + i * 260));
    });
    flowTimers.push(setTimeout(() => scene.classList.add('is-running'), reduce ? 0 : 720));
  }

  function activate(name, userInitiated = false){
    if (!name) return;
    active = name;
    clearTimers();
    tabs.forEach(btn => {
      const yes = btn.dataset.stageTab === name;
      btn.classList.toggle('is-active', yes);
      btn.setAttribute('aria-selected', yes ? 'true' : 'false');
    });
    scenes.forEach(scene => {
      const yes = scene.dataset.scene === name;
      scene.classList.toggle('is-active', yes);
      scene.setAttribute('aria-hidden', yes ? 'false' : 'true');
      if (yes && name === 'automation') runAutomation(scene);
      if (yes && name === 'rebuild') runRebuild(scene);
    });
    if (counter) counter.textContent = name === 'automation' ? '01 / 02' : '02 / 02';
    if (label) label.textContent = name === 'automation' ? 'AUTOMATION' : 'SOFTWARE REBUILD';
    if (description) description.textContent = name === 'automation'
      ? '반복 입력을 흐름으로 바꾸고 결과까지 자동 생성'
      : '화면·파일·데이터·통신을 분석해 유지보수 가능한 새 코드로 전환';
    if (userInitiated) document.querySelector('[data-hero-stage]')?.setAttribute('data-user-controlled','true');
  }

  tabs.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.stageTab, true)));
  activate('automation');

  // 첫 방문에서만 한 번: 자동화 증명을 보여준 뒤 재구축 장면으로 전환하고 멈춥니다.
  if (!reduce) {
    setTimeout(() => {
      const stage = document.querySelector('[data-hero-stage]');
      if (!stage?.hasAttribute('data-user-controlled')) activate('rebuild');
    }, 3600);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting && entry.intersectionRatio > .28));
  }, { threshold:[0,.28,.6] });
  document.querySelectorAll('[data-work-panel]').forEach(el => io.observe(el));
})();
