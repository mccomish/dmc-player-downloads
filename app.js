(() => {
  'use strict';
  const one = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  let release;
  let toastTimer;
  function toast(message) {
    const element = one('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('visible'), 3000);
  }

  const menu = one('.main-nav');
  const toggle = one('.menu-toggle');
  if (menu && toggle) {
    function closeMenu() { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open);
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
  }

  async function loadRelease() {
    try {
      const response = await fetch('./assets/release-data.json');
      if (!response.ok) throw new Error('Release information unavailable');
      const data = await response.json();
      if (!/^\d+\.\d+\.\d+$/.test(data.version) || !data.downloads) throw new Error('Invalid release information');
      for (const kind of ['installer', 'portable']) {
        const file = data.downloads[kind];
        const url = new URL(file.url, location.href);
        if (url.protocol !== 'https:' || url.username || url.password || !url.pathname.endsWith('/' + file.filename)
            || !/^[a-f\d]{64}$/i.test(file.sha256)) throw new Error('Invalid download details');
      }
      release = data;
      for (const kind of ['installer', 'portable']) {
        const file = release.downloads[kind];
        all(`[data-download="${kind}"]`).forEach(link => { link.href = file.url; link.setAttribute('download', file.filename); });
        all(`[data-size="${kind}"]`).forEach(element => { element.textContent = file.sizeLabel; });
        all(`[data-hash="${kind}"]`).forEach(element => { element.textContent = file.sha256; });
      }
      all('[data-version]').forEach(element => { element.textContent = `Version ${release.version}`; });
      all('[data-release-link]').forEach(link => { link.href = `https://github.com/mccomish/dmc-player-downloads/releases/tag/v${release.version}`; });
      const status = one('#download-status');
      if (status) status.textContent = `Version ${release.version} · Includes VLC and .NET. Setup offers WebView2 when missing.`;
    } catch (_) {
      const status = one('#download-status');
      if (status) status.textContent = 'Live release details could not load. The download buttons use the packaged release links. Check Release files & notes below if you need help.';
    }
  }
  all('[data-copy-hash]').forEach(button => button.addEventListener('click', async () => {
    const kind = button.dataset.copyHash;
    const value = release?.downloads?.[kind]?.sha256 ?? one(`[data-hash="${kind}"]`)?.textContent;
    if (!value) return;
    try { await navigator.clipboard.writeText(value.trim()); toast('Checksum copied.'); }
    catch (_) { toast('Could not copy automatically. Select the checksum and copy it manually.'); }
  }));
  loadRelease();

  const faqList = one('#faq-list');
  const faqSearch = one('#faq-search');
  if (faqList && faqSearch) {
    let faq = [];
    function renderFaq() {
      const words = faqSearch.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      const entries = faq.filter(entry => words.every(word => `${entry.question} ${entry.answer}`.toLocaleLowerCase().includes(word)));
      const fragment = document.createDocumentFragment();
      for (const entry of entries) {
        const details = document.createElement('details'); details.className = 'faq-item';
        const summary = document.createElement('summary'); summary.textContent = entry.question;
        const answer = document.createElement('p'); answer.textContent = entry.answer;
        details.append(summary, answer); fragment.append(details);
      }
      if (!entries.length) { const empty = document.createElement('p'); empty.className = 'small-note'; empty.textContent = 'No matching questions. Try another word, or open the full FAQ document below.'; fragment.append(empty); }
      faqList.replaceChildren(fragment);
      const count = one('#faq-count');
      if (count) count.textContent = words.length ? `${entries.length} of ${faq.length} answers` : `${faq.length} answers from the in-app help`;
    }
    faqSearch.addEventListener('input', renderFaq);
    (async () => {
      try {
        const response = await fetch('./assets/faq.json');
        if (!response.ok) throw new Error('FAQ unavailable');
        const data = await response.json();
        if (!Array.isArray(data.entries) || !data.entries.every(entry => typeof entry.question === 'string' && typeof entry.answer === 'string')) throw new Error('Invalid FAQ');
        faq = data.entries; renderFaq();
      } catch (_) { faqList.textContent = 'The interactive FAQ could not load. Use the full FAQ document below.'; }
    })();
  }

  all('[data-game-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('[data-game-slide]')];
    const previous = carousel.querySelector('#demo-previous');
    const next = carousel.querySelector('#demo-next');
    const cycle = carousel.querySelector('#demo-cycle');
    const name = carousel.querySelector('#demo-game-name');
    const count = carousel.querySelector('#demo-scene-count');
    const source = carousel.querySelector('#demo-game-source');
    if (!slides.length || !previous || !next || !cycle || !name || !count || !source) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const failed = new Set();
    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let paused = motion.matches;
    let hovered = false;
    let focused = carousel.contains(document.activeElement);
    let visible = !('IntersectionObserver' in window);
    let stopped = false;
    let timer;
    const available = () => slides.filter(slide => !failed.has(slide));
    const ready = () => available().filter(slide => slide.complete && slide.naturalWidth > 0);

    function schedule() {
      clearTimeout(timer);
      timer = undefined;
      if (stopped || paused || hovered || focused || document.hidden || !visible || ready().length < 2) return;
      timer = setTimeout(() => { move(1); }, 6000);
    }
    function render() {
      const usable = available();
      const active = slides[current];
      slides.forEach(slide => {
        const selected = usable.length > 0 && slide === active;
        slide.classList.toggle('is-active', selected);
        slide.setAttribute('aria-hidden', String(!selected));
      });
      if (usable.length) {
        name.textContent = active.dataset.gameTitle;
        count.textContent = `${usable.indexOf(active) + 1} / ${usable.length}`;
        source.href = active.dataset.sourceUrl;
        source.title = active.dataset.gameCredit;
        source.setAttribute('aria-label', `${active.dataset.gameTitle} screenshot source: ${active.dataset.gameCredit}`);
      } else {
        name.textContent = 'Game screenshots unavailable';
        count.textContent = '0 / 0';
      }
      source.hidden = !usable.length;
      previous.disabled = next.disabled = cycle.disabled = ready().length < 2;
      cycle.setAttribute('aria-pressed', String(paused));
      cycle.setAttribute('aria-label', paused ? 'Play game backgrounds' : 'Pause game backgrounds');
      cycle.title = paused ? 'Play game backgrounds' : 'Pause game backgrounds';
      cycle.textContent = paused ? '▶' : 'Ⅱ';
      carousel.classList.toggle('screenshots-unavailable', !usable.length);
      schedule();
    }
    function move(direction) {
      const loaded = ready();
      if (loaded.length > 1) {
        const position = loaded.indexOf(slides[current]);
        const index = position < 0 ? (direction > 0 ? 0 : loaded.length - 1) : (position + direction + loaded.length) % loaded.length;
        current = slides.indexOf(loaded[index]);
      }
      render();
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    cycle.addEventListener('click', () => { paused = !paused; render(); });
    carousel.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; schedule(); } });
    carousel.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    carousel.addEventListener('focusin', () => { focused = true; schedule(); });
    carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', event => { if (event.matches) { paused = true; render(); } });

    slides.forEach(slide => {
      function unavailable() {
        failed.add(slide);
        if (slides[current] === slide) {
          const replacement = ready()[0] || available()[0];
          if (replacement) current = slides.indexOf(replacement);
        }
        render();
      }
      slide.addEventListener('error', unavailable);
      slide.addEventListener('load', () => {
        failed.delete(slide);
        if (!slides[current].complete || !slides[current].naturalWidth || failed.has(slides[current])) current = slides.indexOf(slide);
        render();
      });
      if (slide.complete && !slide.naturalWidth) failed.add(slide);
    });
    if (failed.has(slides[current])) {
      const replacement = ready()[0] || available()[0];
      if (replacement) current = slides.indexOf(replacement);
    }
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new window.IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        schedule();
      }, { threshold: 0.1 });
      observer.observe(carousel);
    }
    window.addEventListener('pagehide', () => { stopped = true; clearTimeout(timer); observer?.disconnect(); });
    window.addEventListener('pageshow', () => {
      if (!stopped) return;
      stopped = false;
      if (observer) { visible = false; observer.observe(carousel); }
      schedule();
    });
    render();
  });

  const stage = one('#demo-stage');
  const mini = one('#mini-demo');
  const lock = one('#demo-lock');
  const play = one('#demo-play');
  if (stage && mini && lock && play) {
    let locked = false;
    let moving = null;
    function clamp(x, y) {
      mini.style.left = `${Math.max(0, Math.min(x, stage.clientWidth - mini.offsetWidth))}px`;
      mini.style.top = `${Math.max(0, Math.min(y, stage.clientHeight - mini.offsetHeight))}px`;
    }
    function toggleLock() {
      locked = !locked; moving = null;
      mini.classList.toggle('locked', locked); lock.setAttribute('aria-pressed', String(locked));
      lock.setAttribute('aria-label', locked ? 'Unlock demo position' : 'Lock demo position');
      const hint = one('#demo-hint');
      if (hint) hint.textContent = locked ? 'Position locked. The app unlocks with Ctrl+Alt+L.' : 'Move it. Resize it. Try the lock.';
    }
    lock.addEventListener('click', toggleLock);
    play.addEventListener('click', () => {
      const paused = mini.classList.toggle('paused');
      play.textContent = paused ? '▶' : 'Ⅱ';
      play.setAttribute('aria-label', paused ? 'Play demo animation' : 'Pause demo animation');
    });
    mini.addEventListener('pointerdown', event => {
      if (locked || event.target.closest('button') || event.button !== 0) return;
      event.preventDefault(); mini.focus({ preventScroll: true });
      moving = { x:event.clientX, y:event.clientY, left:mini.offsetLeft, top:mini.offsetTop, width:mini.offsetWidth, height:mini.offsetHeight, resize:event.target.id === 'demo-resize' };
      mini.setPointerCapture(event.pointerId);
    });
    mini.addEventListener('pointermove', event => {
      if (!moving) return;
      if (moving.resize) {
        const ratio = 260 / 157;
        const maximum = Math.min(stage.clientWidth - moving.left, (stage.clientHeight - moving.top) * ratio);
        const width = Math.min(Math.max(180, moving.width + event.clientX - moving.x), maximum);
        mini.style.width = `${width}px`; mini.style.height = `${width / ratio}px`;
      } else clamp(moving.left + event.clientX - moving.x, moving.top + event.clientY - moving.y);
    });
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) mini.addEventListener(eventName, () => { moving = null; });
    mini.addEventListener('keydown', event => {
      if (event.target !== mini) return;
      if (event.key.toLowerCase() === 'l') { event.preventDefault(); toggleLock(); return; }
      if (locked) return;
      const movement = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[event.key];
      if (movement) { event.preventDefault(); clamp(mini.offsetLeft + movement[0], mini.offsetTop + movement[1]); }
    });
    window.addEventListener('resize', () => {
      if (mini.offsetWidth > stage.clientWidth - 12) { const width = stage.clientWidth - 12; mini.style.width = `${width}px`; mini.style.height = `${width / (260 / 157)}px`; }
      clamp(mini.offsetLeft, mini.offsetTop);
    });
  }
})();
