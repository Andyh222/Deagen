/* =========================================================
   WAYS TO GET ON BOARD: scroll-driven story
   The section is a tall track with a pinned (sticky) stage.
   Scroll progress through the track picks the active scene and
   feeds --lp (0 to 1, progress inside that scene) to the CSS,
   which drives the per-scene motion.
   With reduced motion the stage is not pinned and the four
   scenes just stack, fully drawn.
   ========================================================= */
(() => {
'use strict';

const root = document.getElementById('ways');
if (!root) return;

const track  = root.querySelector('.ws-track');
const stick  = root.querySelector('.ws-stick');
const scenes = [...root.querySelectorAll('.ws-scene')];
const ticks  = [...root.querySelectorAll('.ws-tick')];
const wipe   = root.querySelector('.ws-wipe');
const lapEl  = document.getElementById('wsLap');
const lights = [...root.querySelectorAll('.wl')];
const lightScene = root.querySelector('.ws-scene[data-scene="2"]');
const n = scenes.length;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

let on = false, cur = -1, queued = false, wasOut = false;

function setLights(count) {
  lights.forEach((l, k) => l.classList.toggle('on', k < count));
}

function reset() {
  cur = -1; wasOut = false;
  scenes.forEach(s => {
    s.classList.remove('is-active', 'is-past');
    s.style.removeProperty('--lp');
  });
  ticks.forEach(t => { t.classList.remove('on'); t.style.removeProperty('--fill'); });
  stick.style.removeProperty('--p');
  setLights(lights.length);          // static view: gantry fully lit
  lightScene && lightScene.classList.remove('out');
}

function update() {
  queued = false;
  if (!on) return;

  const r = track.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = total > 0 ? clamp(-r.top / total) : 0;
  const raw = p * n;
  const i = Math.min(n - 1, Math.floor(raw));
  const lp = clamp(raw - i);

  stick.style.setProperty('--p', p.toFixed(4));
  scenes.forEach((s, k) => {
    s.style.setProperty('--lp', (k < i ? 1 : k > i ? 0 : lp).toFixed(4));
    s.classList.toggle('is-active', k === i);
    s.classList.toggle('is-past', k < i);
  });
  ticks.forEach((t, k) => {
    t.style.setProperty('--fill', clamp(raw - k).toFixed(4));
    t.classList.toggle('on', k === i);
  });

  if (i !== cur) {
    if (lapEl) lapEl.textContent = String(i + 1).padStart(2, '0');
    if (cur !== -1 && wipe) {
      wipe.classList.remove('go', 'rev');
      void wipe.offsetWidth;                       // restart the animation
      if (i < cur) wipe.classList.add('rev');
      wipe.classList.add('go');
    }
    cur = i;
  }

  /* scene 3: start lights come on one by one, then lights out */
  if (i === 2) {
    const lit = lp > 0.9 ? 0 : clamp(Math.floor((lp - 0.04) / 0.16) + 1, 0, 5);
    setLights(lit);
    const out = lp > 0.9;
    if (out && !wasOut && lightScene) {
      lightScene.classList.remove('out'); void lightScene.offsetWidth; lightScene.classList.add('out');
    }
    wasOut = out;
  } else {
    setLights(0); wasOut = false;
  }
}

function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

function enable() {
  on = !motion.matches;
  root.classList.toggle('ws-on', on);
  if (on) update(); else reset();
}

ticks.forEach(t => t.addEventListener('click', () => {
  const k = +t.dataset.go;
  const r = track.getBoundingClientRect();
  const total = r.height - innerHeight;
  const top = scrollY + r.top + ((k + 0.5) / n) * total;
  scrollTo({ top, behavior: 'instant' });
}));

addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);
motion.addEventListener('change', enable);
enable();
})();
