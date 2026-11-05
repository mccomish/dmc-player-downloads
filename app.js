(() => {
  'use strict';
  let release;
  let faq = [];
  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  let toastTimer;
  function toast(message) { const element = $('#toast'); element.textContent = message; element.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 2600); }

  async function loadRelease() {
    try {
      const response = await fetch('./assets/release-data.json');
      if (!response.ok) throw new Error('Release information unavailable');
      release = await response.json();
      for (const type of ['installer', 'portable']) {
        const file = release.downloads[type];
        const url = new URL(file.url, location.href);
        if (!['https:', 'http:'].includes(url.protocol) || url.origin !== location.origin && url.protocol !== 'https:') throw new Error('Invalid download address');
        all(`[data-download="${type}"]`).forEach(link => { link.href = file.url; link.setAttribute('download', file.filename); });
        all(`[data-size="${type}"]`).forEach(node => { node.textContent = file.sizeLabel; });
        all(`[data-hash="${type}"]`).forEach(node => { node.textContent = file.sha256; });
      }
      all('[data-version]').forEach(node => { node.textContent = `Version ${release.version}`; });
      $('#download-status').textContent = `Version ${release.version} · Downloads include VLC and .NET. WebView2 is offered by Setup when missing.`;
      const installerUrl = new URL(release.downloads.installer.url, location.href);
      if (installerUrl.hostname === 'github.com') $('#release-link').href = installerUrl.href.split('/download/')[0] + '/tag/v' + release.version;
    } catch (_) {
      $('#download-status').textContent = 'Download information could not load. Please refresh, or use Release files & notes below.';
      all('[data-download]').forEach(link => { link.href = $('#release-link').href; link.removeAttribute('download'); });
    }
  }
  all('[data-copy-hash]').forEach(button => button.addEventListener('click', async () => {
    const value = release?.downloads[button.dataset.copyHash]?.sha256 || $(`[data-hash="${button.dataset.copyHash}"]`).textContent;
    try { await navigator.clipboard.writeText(value); toast('Checksum copied'); }
    catch (_) { toast('Select the checksum to copy it'); }
  }));

  const shots = {
    player: ['./assets/dmc-player.png', 'DMC Player main window with local file and direct stream controls.', 'Actual DMC Player interface. Your files and links supply the video.'],
    tv: ['./assets/dmc-live-tv.png', 'DMC Player direct live TV channel picker.', 'Choose a channel and watch directly. Import lists and keep favourites separately from the queue.'],
    queue: ['./assets/dmc-player-queue.png', 'DMC Player with a manually chosen queue.', 'Queue items are added only when you choose. Ordinary opens play on their own.']
  };
  function selectShot(button, focus = false) {
    all('[data-shot]').forEach(tab => { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    const [src, alt, caption] = shots[button.dataset.shot];
    $('#screenshot').src = src; $('#screenshot').alt = alt;
    $('#screenshot-caption').textContent = caption; $('#screenshot-panel').setAttribute('aria-labelledby', button.id);
    if (focus) button.focus();
  }
  all('[data-shot]').forEach((button, index, tabs) => {
    button.addEventListener('click', () => selectShot(button));
    button.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectShot(tabs[next], true); }
    });
  });

  function renderFaq() {
    const words = $('#faq-search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = faq.filter(entry => words.every(word => `${entry.question} ${entry.answer}`.toLocaleLowerCase().includes(word)));
    const fragment = document.createDocumentFragment();
    for (const entry of matches) {
      const detail = document.createElement('details'); detail.className = 'faq-item';
      const summary = document.createElement('summary'); summary.textContent = entry.question;
      const answer = document.createElement('p'); answer.textContent = entry.answer;
      detail.append(summary, answer); fragment.append(detail);
    }
    if (!matches.length) { const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'No matching questions. Try another word, or read the full FAQ below.'; fragment.append(empty); }
    $('#faq-list').replaceChildren(fragment);
  }
  async function loadFaq() {
    try {
      const response = await fetch('./assets/faq.json'); if (!response.ok) throw new Error('FAQ unavailable');
      const data = await response.json(); faq = data.entries; renderFaq();
    } catch (_) { $('#faq-list').textContent = 'The interactive FAQ could not load. Use the full FAQ link below.'; }
  }
  $('#faq-search').addEventListener('input', renderFaq);

  const stage = $('#demo-stage'), mini = $('#mini-demo');
  let locked = false, moving = null;
  function clampPosition(x, y) { mini.style.left = `${Math.max(0, Math.min(x, stage.clientWidth - mini.offsetWidth))}px`; mini.style.top = `${Math.max(0, Math.min(y, stage.clientHeight - mini.offsetHeight))}px`; }
  function lockDemo() {
    locked = !locked; mini.classList.toggle('locked', locked); $('#demo-lock').setAttribute('aria-pressed', String(locked));
    $('#demo-hint').textContent = locked ? 'Position locked. In the app, Ctrl+Alt+L unlocks clicks.' : 'Drag the mini player. Try its lock.';
  }
  $('#demo-lock').addEventListener('click', lockDemo);
  $('#demo-play').addEventListener('click', () => {
    const paused = mini.classList.toggle('paused'); $('#demo-play').textContent = paused ? '▶' : 'Ⅱ'; $('#demo-play').setAttribute('aria-label', paused ? 'Play demo animation' : 'Pause demo animation');
  });
  mini.addEventListener('pointerdown', e => {
    if (locked || e.target.closest('button') || e.button !== 0) return;
    e.preventDefault(); mini.focus({ preventScroll: true });
    moving = { x: e.clientX, y: e.clientY, left: mini.offsetLeft, top: mini.offsetTop, width: mini.offsetWidth, height: mini.offsetHeight, resize: e.target.id === 'demo-resize' };
    mini.setPointerCapture(e.pointerId);
  });
  mini.addEventListener('pointermove', e => {
    if (!moving) return;
    if (moving.resize) {
      const width = Math.min(Math.max(180, moving.width + e.clientX - moving.x), stage.clientWidth - moving.left);
      const height = Math.min(width / (240 / 145), stage.clientHeight - moving.top);
      mini.style.width = `${width}px`; mini.style.height = `${height}px`;
    } else clampPosition(moving.left + e.clientX - moving.x, moving.top + e.clientY - moving.y);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) mini.addEventListener(type, () => { moving = null; });
  mini.addEventListener('keydown', e => {
    if (e.target !== mini) return;
    if (e.key.toLowerCase() === 'l') { e.preventDefault(); lockDemo(); return; }
    if (locked) return;
    const movement = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (movement) { e.preventDefault(); clampPosition(mini.offsetLeft + movement[0], mini.offsetTop + movement[1]); }
  });
  window.addEventListener('resize', () => {
    if (mini.offsetWidth > stage.clientWidth - 12) { mini.style.width = `${stage.clientWidth - 12}px`; mini.style.height = `${(stage.clientWidth - 12) / (240 / 145)}px`; }
    clampPosition(mini.offsetLeft, mini.offsetTop);
  });
  loadRelease(); loadFaq();
})();
