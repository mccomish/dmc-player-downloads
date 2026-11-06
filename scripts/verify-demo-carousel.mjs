import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const application = fs.readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
class Target {
  constructor() { this.events = new Map(); this.attributes = new Map(); this.textContent = ''; }
  addEventListener(type, callback) { this.events.set(type, [...(this.events.get(type) || []), callback]); }
  emit(type, event = {}) { for (const callback of this.events.get(type) || []) callback({ target: this, ...event }); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
}
function classes(initial = []) {
  const values = new Set(initial);
  return { contains: name => values.has(name), toggle(name, force = !values.has(name)) { if (force) values.add(name); else values.delete(name); } };
}
function fixture({ reducedMotion = false, pending = [], deferred = [], rejected = [], noObserver = false } = {}) {
  const document = new Target(); document.hidden = false; document.activeElement = null;
  const window = new Target(); const motion = new Target(); motion.matches = reducedMotion;
  window.matchMedia = () => motion;
  const nodes = Object.fromEntries(['previous', 'next', 'cycle', 'game-name', 'scene-count', 'game-source', 'playback-status'].map(name => ['#demo-' + name, new Target()]));
  const slides = ['First game', 'Second game', 'Third game'].map((title, index) => {
    const slide = new Target(); slide.classList = classes(index === 0 ? ['is-active'] : []);
    slide.dataset = { gameTitle: title, gameCredit: 'Studio ' + (index + 1), sourceUrl: 'https://example.test/game-' + (index + 1), src: './game-' + (index + 1) + '.mp4' };
    slide.paused = true; slide.readyState = 0; slide.error = null;
    slide.loadCalls = slide.playCalls = slide.pauseCalls = 0; slide.pendingPlays = [];
    Object.defineProperty(slide, 'src', { get: () => slide.getAttribute('src'), set: value => slide.setAttribute('src', value) });
    slide.load = () => { slide.loadCalls++; slide.paused = true; slide.readyState = pending.includes(index) ? 0 : 2; };
    slide.pause = () => { slide.pauseCalls++; slide.paused = true; };
    slide.play = () => {
      slide.playCalls++;
      if (rejected.includes(index)) return Promise.reject(Object.assign(new Error('Autoplay blocked'), { name: 'NotAllowedError' }));
      slide.paused = false;
      return deferred.includes(index) ? new Promise((resolve, reject) => slide.pendingPlays.push({ resolve, reject })) : Promise.resolve();
    };
    return slide;
  });
  const carousel = new Target(); carousel.classList = classes();
  carousel.querySelector = selector => nodes[selector] || null; carousel.querySelectorAll = () => slides;
  carousel.contains = element => element === carousel || Object.values(nodes).includes(element) || slides.includes(element);
  document.querySelector = () => null;
  document.querySelectorAll = selector => selector === '[data-game-carousel]' ? [carousel] : [];
  const timers = new Map(); let timerId = 0; let observer;
  if (!noObserver) window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.observations = 0; observer = this; }
    observe() { this.observations++; }
    disconnect() { this.disconnected = true; }
  };
  vm.runInNewContext(application, { document, window, URL, location: { href: 'https://example.test/' }, fetch: async () => ({ ok: false }),
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; }, clearTimeout(id) { timers.delete(id); } });
  return { document, window, motion, nodes, slides, carousel, timers, get observer() { return observer; },
    title: () => nodes['#demo-game-name'].textContent, click: name => nodes['#demo-' + name].emit('click'),
    intersect(value) { observer.callback([{ isIntersecting: value }]); },
    fail(index) { slides[index].error = { code: 4 }; slides[index].emit('error'); },
    ready(index) { slides[index].error = null; slides[index].readyState = 2; slides[index].emit('loadeddata'); },
    tick() { assert.equal(timers.size, 1); const [id, timer] = [...timers][0]; assert.equal(timer.delay, 12000); timers.delete(id); timer.callback(); } };
}
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
const checks = [];
async function check(name, action) { await action(); checks.push(name); }

await check('Only the visible active clip loads and plays, muted and inline', async () => {
  const d = fixture(); assert.equal(d.slides.reduce((n, s) => n + s.loadCalls, 0), 0);
  d.intersect(true); await settle(); assert.deepEqual(d.slides.map(s => s.playCalls), [1, 0, 0]); assert.deepEqual(d.slides.map(s => s.loadCalls), [1, 0, 0]);
  for (const flag of ['muted', 'defaultMuted', 'loop', 'playsInline']) assert.equal(d.slides[0][flag], true);
  d.ready(0); await settle(); assert.equal(d.slides[0].playCalls, 1, 'Readiness cannot duplicate a play request');
});
await check('Manual browsing wraps, updates source/count and pauses the old video', async () => {
  const d = fixture(); d.intersect(true); await settle(); d.click('previous'); await settle();
  assert.equal(d.title(), 'Third game'); assert.equal(d.nodes['#demo-scene-count'].textContent, '3 / 3');
  assert.equal(d.nodes['#demo-game-source'].href, 'https://example.test/game-3');
  assert.match(d.nodes['#demo-game-source'].getAttribute('aria-label'), /Third game gameplay source: Studio 3/);
  assert.deepEqual(d.slides.map(s => s.paused), [true, true, false]); d.click('next'); await settle(); assert.equal(d.title(), 'First game');
  assert.deepEqual(d.slides.map(s => s.getAttribute('aria-hidden')), ['false', 'true', 'true']);
});
await check('One twelve-second timer cycles clips and loads the next only when selected', async () => {
  const d = fixture(); assert.equal(d.timers.size, 0); d.intersect(true); await settle(); d.tick(); await settle();
  assert.equal(d.title(), 'Second game'); assert.deepEqual(d.slides.map(s => s.playCalls), [1, 1, 0]);
  d.tick(); await settle(); assert.equal(d.title(), 'Third game'); d.tick(); await settle(); assert.equal(d.title(), 'First game');
});
await check('Pause stops video and rotation while arrows browse unloaded posters', async () => {
  const d = fixture(); d.intersect(true); await settle(); d.click('cycle'); assert.equal(d.slides[0].paused, true); assert.equal(d.timers.size, 0);
  assert.equal(d.nodes['#demo-cycle'].getAttribute('aria-label'), 'Play gameplay backgrounds'); assert.equal(d.nodes['#demo-cycle'].getAttribute('aria-pressed'), 'true');
  assert.equal(d.nodes['#demo-cycle'].textContent, '\u25b6');
  d.click('next'); assert.equal(d.title(), 'Second game'); assert.equal(d.slides[1].loadCalls, 0); assert.equal(d.slides[1].playCalls, 0);
  d.click('cycle'); await settle(); assert.equal(d.slides[1].paused, false); assert.equal(d.timers.size, 1);
  assert.equal(d.nodes['#demo-cycle'].textContent, '\u2161');
});
await check('Hover and focus stop scene changes while the gameplay keeps moving', async () => {
  const d = fixture(); d.intersect(true); await settle(); d.carousel.emit('pointerenter', { pointerType: 'mouse' });
  assert.equal(d.timers.size, 0); assert.equal(d.slides[0].paused, false); d.carousel.emit('pointerleave'); assert.equal(d.timers.size, 1);
  d.carousel.emit('pointerenter', { pointerType: 'touch' }); assert.equal(d.timers.size, 1); d.carousel.emit('focusin'); assert.equal(d.timers.size, 0);
  assert.equal(d.slides[0].paused, false); d.carousel.emit('focusout', { relatedTarget: d.nodes['#demo-next'] }); assert.equal(d.timers.size, 0);
  d.carousel.emit('focusout', { relatedTarget: null }); assert.equal(d.timers.size, 1);
});
await check('Offscreen, hidden tabs and page exit stop all playback and timers', async () => {
  const d = fixture(); d.intersect(true); await settle(); d.intersect(false); assert.equal(d.slides[0].paused, true); assert.equal(d.timers.size, 0);
  d.intersect(true); await settle(); assert.equal(d.slides[0].paused, false); d.document.hidden = true; d.document.emit('visibilitychange'); assert.equal(d.slides[0].paused, true);
  d.document.hidden = false; d.document.emit('visibilitychange'); await settle(); assert.equal(d.slides[0].paused, false);
  d.window.emit('pagehide'); assert.equal(d.slides[0].paused, true); assert.equal(d.observer.disconnected, true);
  d.window.emit('pageshow'); assert.equal(d.timers.size, 0); assert.equal(d.observer.observations, 2); d.intersect(true); await settle(); assert.equal(d.slides[0].paused, false);
});
await check('Reduced motion uses posters until the visitor explicitly presses Play', async () => {
  const d = fixture({ reducedMotion: true }); d.intersect(true); await settle(); assert.equal(d.slides[0].loadCalls, 0); assert.equal(d.timers.size, 0);
  d.click('next'); assert.equal(d.title(), 'Second game'); assert.equal(d.slides[1].loadCalls, 0); d.click('cycle'); await settle(); assert.equal(d.slides[1].paused, false);
  d.motion.emit('change', { matches: true }); assert.equal(d.slides[1].paused, true); assert.equal(d.timers.size, 0);
  d.motion.emit('change', { matches: false }); assert.equal(d.timers.size, 0);
});
await check('Pending video data postpones rotation without repeated play requests', async () => {
  const d = fixture({ pending: [0] }); d.intersect(true); await settle(); assert.equal(d.timers.size, 0);
  d.ready(0); await settle(); assert.equal(d.timers.size, 1); assert.equal(d.slides[0].playCalls, 1);
});
await check('Autoplay rejection restores the poster and offers an explicit Play action', async () => {
  const rejected = [0]; const d = fixture({ rejected }); d.intersect(true); await settle(); assert.equal(d.slides[0].paused, true);
  assert.equal(d.slides[0].loadCalls, 2); assert.equal(d.timers.size, 0); assert.equal(d.nodes['#demo-playback-status'].textContent, 'Press play to start the clip.');
  assert.equal(d.nodes['#demo-cycle'].getAttribute('aria-label'), 'Play gameplay backgrounds'); rejected.length = 0; d.click('cycle'); await settle();
  assert.equal(d.slides[0].paused, false); assert.equal(d.nodes['#demo-playback-status'].textContent, ''); assert.equal(d.timers.size, 1);
});
await check('Rotation waits until the active play promise has actually started playback', async () => {
  const d = fixture({ deferred: [0] }); d.intersect(true); await settle(); assert.equal(d.timers.size, 0);
  d.ready(0); await settle(); assert.equal(d.timers.size, 0);
  d.slides[0].pendingPlays[0].resolve(); await settle(); assert.equal(d.timers.size, 1);
});
await check('Late play promises cannot restart inactive/hidden clips or pause newer playback', async () => {
  const d = fixture({ deferred: [0] }); d.intersect(true); const old = d.slides[0].pendingPlays[0]; d.click('next'); await settle();
  d.slides[0].paused = false; old.resolve(); await settle(); assert.equal(d.slides[0].paused, true); assert.equal(d.slides[1].paused, false);
  d.click('previous'); const hidden = d.slides[0].pendingPlays[1]; d.intersect(false); d.slides[0].paused = false; hidden.resolve(); await settle(); assert.equal(d.slides[0].paused, true);
  d.intersect(true); const stale = d.slides[0].pendingPlays[2]; d.click('cycle'); d.click('cycle'); const latest = d.slides[0].pendingPlays[3];
  stale.resolve(); await settle(); assert.equal(d.slides[0].paused, false); latest.resolve(); await settle(); assert.equal(d.slides[0].paused, false);
});
await check('Failures skip bad clips; one remaining clip still plays; total failure keeps a poster', async () => {
  const d = fixture(); d.intersect(true); await settle(); d.fail(0); await settle(); assert.equal(d.title(), 'Second game'); assert.equal(d.nodes['#demo-scene-count'].textContent, '1 / 2');
  d.click('previous'); await settle(); assert.equal(d.title(), 'Third game'); d.fail(2); await settle(); assert.equal(d.title(), 'Second game');
  assert.equal(d.nodes['#demo-next'].disabled, true); assert.equal(d.nodes['#demo-cycle'].disabled, false); assert.equal(d.timers.size, 0);
  d.fail(1); assert.equal(d.title(), 'Gameplay clips unavailable'); assert.equal(d.nodes['#demo-cycle'].disabled, true);
  assert.equal(d.nodes['#demo-game-source'].getAttribute('aria-disabled'), 'true'); assert.equal(d.slides.filter(s => s.classList.contains('is-active')).length, 1);
  d.ready(0); await settle(); assert.equal(d.title(), 'First game'); assert.equal(d.nodes['#demo-cycle'].disabled, false);
});
await check('Browsers without IntersectionObserver still play muted clips and browse', async () => {
  const d = fixture({ noObserver: true }); await settle(); assert.equal(d.slides[0].paused, false); d.tick(); await settle(); assert.equal(d.title(), 'Second game');
});
console.log('Demo gameplay interaction checks: ' + checks.length + '/' + checks.length + ' passed.');
for (const name of checks) console.log('- ' + name);
