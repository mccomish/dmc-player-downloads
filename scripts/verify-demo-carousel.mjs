import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const application = fs.readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');

class Target {
  constructor() { this.events = new Map(); this.attributes = new Map(); this.textContent = ''; this.hidden = false; }
  addEventListener(type, listener) { this.events.set(type, [...(this.events.get(type) || []), listener]); }
  emit(type, event = {}) { for (const listener of this.events.get(type) || []) listener({ target: this, ...event }); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name); }
}
function classes(initial = []) {
  const values = new Set(initial);
  return {
    contains: name => values.has(name),
    toggle(name, force = !values.has(name)) { if (force) values.add(name); else values.delete(name); return force; },
  };
}
function fixture({ reducedMotion = false, pending = [], noObserver = false } = {}) {
  const document = new Target(); document.hidden = false; document.activeElement = null;
  const window = new Target();
  const motion = new Target(); motion.matches = reducedMotion;
  window.matchMedia = () => motion;
  const nodes = Object.fromEntries(['previous', 'next', 'cycle', 'game-name', 'scene-count', 'game-source'].map(name => [`#demo-${name}`, new Target()]));
  const slides = ['First game', 'Second game', 'Third game'].map((title, index) => {
    const slide = new Target(); slide.classList = classes(index === 0 ? ['is-active'] : []);
    slide.dataset = { gameTitle: title, gameCredit: `Studio ${index + 1}`, sourceUrl: `https://example.test/game-${index + 1}` };
    slide.complete = !pending.includes(index); slide.naturalWidth = slide.complete ? 1280 : 0;
    return slide;
  });
  const carousel = new Target(); carousel.classList = classes();
  carousel.querySelector = selector => nodes[selector] || null;
  carousel.querySelectorAll = () => slides;
  carousel.contains = element => element === carousel || Object.values(nodes).includes(element) || slides.includes(element);
  document.querySelector = () => null;
  document.querySelectorAll = selector => selector === '[data-game-carousel]' ? [carousel] : [];
  const timers = new Map(); let timerId = 0; let observer;
  if (!noObserver) window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.observations = 0; this.disconnected = false; observer = this; }
    observe() { this.observations++; }
    disconnect() { this.disconnected = true; }
  };
  vm.runInNewContext(application, {
    document, window, URL, location: { href: 'https://example.test/' },
    fetch: async () => ({ ok: false }),
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  return {
    document, window, motion, nodes, slides, carousel, timers,
    get observer() { return observer; },
    title: () => nodes['#demo-game-name'].textContent,
    click: name => nodes[`#demo-${name}`].emit('click'),
    intersect(value) { observer.callback([{ isIntersecting: value }]); },
    tick() {
      assert.equal(timers.size, 1, 'Only one automatic rotation may be scheduled');
      const [id, timer] = [...timers][0]; assert.equal(timer.delay, 6000);
      timers.delete(id); timer.callback();
    },
  };
}

const checks = [];
function check(name, action) { action(); checks.push(name); }

check('Manual browsing wraps and updates the visible title, count and source together', () => {
  const demo = fixture(); assert.equal(demo.title(), 'First game');
  demo.click('previous'); assert.equal(demo.title(), 'Third game');
  assert.equal(demo.nodes['#demo-scene-count'].textContent, '3 / 3');
  assert.equal(demo.nodes['#demo-game-source'].href, 'https://example.test/game-3');
  assert.match(demo.nodes['#demo-game-source'].getAttribute('aria-label'), /Third game.*Studio 3/);
  demo.click('next'); assert.equal(demo.title(), 'First game');
  assert.equal(demo.slides.filter(slide => slide.classList.contains('is-active')).length, 1);
  assert.deepEqual(demo.slides.map(slide => slide.getAttribute('aria-hidden')), ['false', 'true', 'true']);
});

check('Automatic cycling waits for visibility and keeps one six-second timer', () => {
  const demo = fixture(); assert.equal(demo.timers.size, 0);
  demo.intersect(true); demo.tick(); assert.equal(demo.title(), 'Second game');
  demo.tick(); assert.equal(demo.title(), 'Third game');
  demo.tick(); assert.equal(demo.title(), 'First game');
  demo.intersect(false); assert.equal(demo.timers.size, 0);
});

check('Explicit pause stops rotation while previous and next keep working', () => {
  const demo = fixture(); demo.intersect(true); demo.click('cycle');
  assert.equal(demo.timers.size, 0);
  assert.equal(demo.nodes['#demo-cycle'].getAttribute('aria-label'), 'Play game backgrounds');
  assert.equal(demo.nodes['#demo-cycle'].getAttribute('aria-pressed'), 'true');
  demo.click('next'); assert.equal(demo.title(), 'Second game'); assert.equal(demo.timers.size, 0);
  demo.click('cycle'); assert.equal(demo.timers.size, 1);
});

check('Hover and keyboard focus prevent changes during interaction', () => {
  const demo = fixture(); demo.intersect(true);
  demo.carousel.emit('pointerenter', { pointerType: 'mouse' }); assert.equal(demo.timers.size, 0);
  demo.carousel.emit('pointerleave'); assert.equal(demo.timers.size, 1);
  demo.carousel.emit('pointerenter', { pointerType: 'touch' }); assert.equal(demo.timers.size, 1);
  demo.carousel.emit('focusin'); assert.equal(demo.timers.size, 0);
  demo.carousel.emit('focusout', { relatedTarget: demo.nodes['#demo-next'] }); assert.equal(demo.timers.size, 0);
  demo.carousel.emit('focusout', { relatedTarget: null }); assert.equal(demo.timers.size, 1);
});

check('Hidden browser tabs stop cycling until visible again', () => {
  const demo = fixture(); demo.intersect(true);
  demo.document.hidden = true; demo.document.emit('visibilitychange'); assert.equal(demo.timers.size, 0);
  demo.document.hidden = false; demo.document.emit('visibilitychange'); assert.equal(demo.timers.size, 1);
});

check('Reduced-motion preference starts paused and can also pause an active carousel', () => {
  const demo = fixture({ reducedMotion: true }); demo.intersect(true);
  assert.equal(demo.timers.size, 0); demo.click('next'); assert.equal(demo.title(), 'Second game');
  demo.click('cycle'); assert.equal(demo.timers.size, 1);
  demo.motion.emit('change', { matches: true }); assert.equal(demo.timers.size, 0);
  demo.motion.emit('change', { matches: false }); assert.equal(demo.timers.size, 0);
});

check('Unloaded images are skipped until their load event, without exposing a blank slide', () => {
  const demo = fixture({ pending: [1] }); demo.click('next'); assert.equal(demo.title(), 'Third game');
  demo.click('previous'); assert.equal(demo.title(), 'First game');
  demo.slides[1].complete = true; demo.slides[1].naturalWidth = 1280; demo.slides[1].emit('load');
  assert.equal(demo.title(), 'First game'); demo.click('next'); assert.equal(demo.title(), 'Second game');
});

check('A failed active screenshot is replaced, unavailable screenshots are skipped, and total failure leaves controls safe', () => {
  const demo = fixture(); demo.intersect(true); demo.slides[0].emit('error');
  assert.equal(demo.title(), 'Second game'); assert.equal(demo.nodes['#demo-scene-count'].textContent, '1 / 2');
  demo.click('previous'); assert.equal(demo.title(), 'Third game');
  demo.slides[2].emit('error'); assert.equal(demo.title(), 'Second game'); assert.equal(demo.timers.size, 0);
  demo.slides[1].emit('error'); assert.equal(demo.title(), 'Game screenshots unavailable');
  assert.equal(demo.nodes['#demo-game-source'].hidden, true);
  assert.equal(demo.nodes['#demo-next'].disabled, true); assert.equal(demo.timers.size, 0);
  demo.slides[0].emit('load'); assert.equal(demo.title(), 'First game');
  assert.equal(demo.nodes['#demo-game-source'].hidden, false);
});

check('Leaving the page cleans up rotation and returning from browser cache observes visibility again', () => {
  const demo = fixture(); demo.intersect(true); demo.window.emit('pagehide');
  assert.equal(demo.timers.size, 0); assert.equal(demo.observer.disconnected, true);
  demo.window.emit('pageshow'); assert.equal(demo.timers.size, 0);
  assert.equal(demo.observer.observations, 2); demo.intersect(true); assert.equal(demo.timers.size, 1);
});

check('Browsers without IntersectionObserver retain browsing and automatic rotation', () => {
  const demo = fixture({ noObserver: true }); demo.tick(); assert.equal(demo.title(), 'Second game');
});

console.log(`Demo carousel interaction checks: ${checks.length}/${checks.length} passed.`);
for (const name of checks) console.log(`- ${name}`);
