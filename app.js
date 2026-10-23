(() => {
'use strict';

/* =========================================================
   CONFIG: edit these
   ========================================================= */
const CONTACT_EMAIL = '';                              // e.g. 'team@yourdomain.com' (enquiry form opens the visitor's email app)
const FINALE = new Date('2026-11-07T00:00:00+01:00');  // GB3 finale, Barcelona-Catalunya

/* Videos for the Watch section. Three types:
   { type:'youtube',  id:'VIDEO_ID', ... }          plays on the page
   { type:'facebook', url:'https://www.facebook.com/.../videos/123/', ... }   plays on the page (the video must be public)
   { type:'link',     url:'https://...', ... }       opens in a new tab (for sites that can't be embedded)
   Each takes: title, source (where it's from and when), and optionally note. */
const VIDEOS = [
  { type: 'youtube', id: 'WwDh5gu2k0o', title: 'Young Driver of the Year: assessment day',
    source: 'Silverstone, January 2025', note: 'Four finalists, one Aston Martin F1 test.' },
  { type: 'link', url: 'https://www.motorsport.com/autosport-awards/video/young-driver-of-the-year-deagen-fairclough/658643/',
    title: 'Deagen wins Young Driver of the Year', source: 'Motorsport.com, February 2025', note: '4 min 21 sec' }
];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* =========================================================
   DATA
   ========================================================= */
const SEASONS = {
  2020: { note: 'First year in cars, aged 13. He had first driven Silverstone in Citroën Saxos.',
    entries: [{ series: 'Junior Saloon Car Championship', team: 'Orex Racing', races: 12, wins: 0, poles: 0, fl: 0, pod: 3, pts: '187', pos: '6th' }] },
  2021: { note: 'Eight wins from 14 races in the BRSCC Ford Fiesta Junior Championship, plus a two-race cameo in Junior Saloons.',
    entries: [
      { series: 'BRSCC Ford Fiesta Junior', team: 'Jamsport / Ciceley', races: 14, wins: 8, poles: 7, fl: 13, pod: 11, pts: '471', pos: '5th' },
      { series: 'Junior Saloon Car Championship', team: 'Orex Racing', races: 2, wins: 0, poles: 0, fl: 0, pod: 0, pts: '13', pos: '34th' }] },
  2022: { note: 'A short Fiesta campaign, then the big one: in May he won the ROKiT Racing Star F4 Esports Competition. The prize was a fully funded British F4 seat.',
    entries: [{ series: 'BRSCC Ford Fiesta Junior', team: 'Jamsport / Ciceley', races: 2, wins: 0, poles: 1, fl: 0, pod: 1, pts: '43', pos: '17th' }] },
  2023: { note: 'First win at round eight, then two more in the last two rounds. Third in the championship as a rookie.',
    entries: [{ series: 'British F4', team: 'JHR Developments', races: 30, wins: 3, poles: 0, fl: 6, pod: 8, pts: '296', pos: '3rd' }] },
  2024: { champ: true, note: 'Champion with five races to spare and a record 14 wins in a single British F4 season. Also won the Autosport BRDC Award.',
    entries: [
      { series: 'British F4', team: 'Hitech Pulse-Eight', races: 30, wins: 14, poles: 15, fl: 19, pod: 22, pts: '579.5', pos: '1st', champ: true },
      { series: 'Formula 4 UAE', team: 'Hitech Pulse-Eight', races: 15, wins: 0, poles: 0, fl: 0, pod: 2, pts: '75', pos: '7th' },
      { series: 'Euro 4', team: 'Hitech Pulse-Eight', races: 3, wins: 0, poles: 0, fl: 0, pod: 0, pts: '0', pos: '24th' }] },
  2025: { note: 'GB3 debut. Five podiums across the last three weekends, ending with a Monza finale of 4th, 1st and 2nd. In September he drove an Aston Martin AMR23 F1 car.',
    entries: [{ series: 'GB3 Championship', team: 'Hitech TGR', races: 24, wins: 1, poles: 0, fl: 0, pod: 7, pts: '373', pos: '3rd' }] },
  2026: { live: true, note: 'Second GB3 season with Hitech. Fourth in the standings with the Barcelona finale on 7 and 8 November. Full race stats will be added when the season closes.',
    entries: [{ series: 'GB3 Championship', team: 'Hitech', live: true, pos: '4th', pts: '303' }] }
};

const GB3 = {
  2025: { weekends: [
    { n: 'Silverstone', r: [17, 22, 7] }, { n: 'Zandvoort', r: [2, 3, 4] }, { n: 'Spa', r: [19, 11, 5] },
    { n: 'Hungaroring', r: [6, 6, 5] }, { n: 'Silverstone', r: [4, 20, 'R'] }, { n: 'Brands Hatch', r: [3, 3, 18] },
    { n: 'Donington', r: [6, 3, 15] }, { n: 'Monza', r: [4, 1, 2] }],
    note: 'Third in the championship with 373 points.' },
  2026: { weekends: [
    { n: 'Silverstone', r: [4, 'R', 'R'] }, { n: 'Spa', r: ['R', 4, 'C'] }, { n: 'Hungaroring', r: [1, 'R', 'R'] },
    { n: 'Red Bull Ring', r: [4, 17, 'DNS'] }, { n: 'Silverstone', r: [1, 1, 10] }],
    note: 'Showing the first five rounds. Donington and Brands Hatch results are being added, and the Barcelona finale is still to come. Spa race three was cancelled.' }
};

/* =========================================================
   INTRO: start lights
   ========================================================= */
const intro = $('#intro');
let introDone = false, introTimers = [];
function reveal(skipped) {
  if (introDone) return;
  introDone = true;
  introTimers.forEach(clearTimeout);
  $$('.pod', intro).forEach(p => p.classList.remove('on'));
  if (skipped) intro.classList.add('skipped');
  intro.classList.add('out');
  document.body.classList.remove('locked');
  document.body.classList.add('go');
  startCar();
  setTimeout(() => intro.remove(), 1400);
}
const finishIntro = () => reveal(true);

// the launch: darkness, then flash, shake, streaks and the 6 rushing the camera
function launch() {
  if (introDone) return;
  const streaks = $('#streaks');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    s.className = 'streak';
    s.style.top = (Math.random() * 100) + '%';
    s.style.width = (22 + Math.random() * 50) + 'vw';
    s.style.height = (1 + Math.random() * 3) + 'px';
    s.style.setProperty('--d', (Math.random() * .28).toFixed(2) + 's');
    streaks.appendChild(s);
  }
  intro.classList.add('launch');
  introTimers.push(setTimeout(() => reveal(false), 700));
}
if (reduced) {
  intro.remove();
  document.body.classList.add('go');
} else {
  document.body.classList.add('locked');
  const pods = $$('.pod', intro), txt = $('#introText');
  const at = (ms, fn) => introTimers.push(setTimeout(fn, ms));
  at(500, () => (txt.textContent = 'Five lights'));
  pods.forEach((p, i) => at(900 + i * 650, () => p.classList.add('on')));
  const hold = 900 + 5 * 650 + 700 + Math.random() * 700;
  at(hold, () => { pods.forEach(p => p.classList.remove('on')); txt.textContent = ''; });
  at(hold + 420, launch);   // a beat of darkness, then go
  $('#skipIntro').addEventListener('click', finishIntro);
  addEventListener('keydown', e => { if (e.key === 'Escape') finishIntro(); });
}

/* =========================================================
   HERO: a three-lap race. A rival leads early, the lead changes
   hands twice, and Deagen wins on lap 3 of 3.
   ========================================================= */
const path = $('#trackBase'), trail = $('#trackTrail'), trailR = $('#trackTrailR'), trailT = $('#trackTrailT');
const car = $('#car'), carR = $('#carR'), carT = $('#carT');
const L = path.getTotalLength();
const TRAIL = 140, LAPS = 3, RACE_MS = 24000;
const flag = $('#flag'), winner = $('#winner'), tower = $('#tower'), lapText = $('#lapText');
const lapPanel = $('#lapTime'), ltNow = $('#ltNow'), ltLast = $('#ltLast'), ltBest = $('#ltBest'), ltTag = $('#ltTag'), wFl = $('#wFl');
// find the start/finish line on the path
let P0 = 0;
{ let best = 1e9; for (let i = 0; i < 1000; i++) { const p = path.getPointAtLength(i / 1000 * L), d = Math.hypot(p.x - 262, p.y - 256); if (d < best) { best = d; P0 = i; } } }

/* How far each car is ahead of (+) or behind (-) an even pace, in track units
   (1000 units = one lap), at points through the race: [u, Deagen, Rival, Challenger].
   Lead changes: Rival, then Challenger, then Deagen, Challenger back in front,
   and Deagen finally takes it on the last lap. Edit the numbers to change the story. */
const GAPS = [
  [0,   -8,   0, -14],
  [.12, -10,  6, -12],
  [.24, -12,  8,   2],
  [.31, -10,  2,  10],
  [.42,  -4, -6,  14],
  [.52,  10, -8,   8],
  [.60,  14, -10,  2],
  [.68,  10, -12, 11],
  [.76,   4,  -4, 14],
  [.84,  16,  -2, 10],
  [.92,  20,  -6,  6],
  [1,    24, -10,  0]
];
function gapAt(u, col) {
  for (let i = 1; i < GAPS.length; i++) if (u <= GAPS[i][0]) {
    const [u0, ...g0] = GAPS[i - 1], [u1, ...g1] = GAPS[i], k = (u - u0) / (u1 - u0), e = (1 - Math.cos(k * Math.PI)) / 2;
    return g0[col] + (g1[col] - g0[col]) * e;
  }
  return GAPS[GAPS.length - 1][col + 1];
}
const wob = (u, f, ph) => 7 * Math.sin(u * Math.PI * 2 * f + ph);
const distD = u => LAPS * 1000 * u + wob(u, 9, 0) + gapAt(u, 0);
const distR = u => LAPS * 1000 * u + wob(u, 9, 0) + gapAt(u, 1);
const distT = u => LAPS * 1000 * u + wob(u, 7, 1.3) + gapAt(u, 2);
let uEnd = 1; while (distD(uEnd) > LAPS * 1000) uEnd -= 0.0005;   // the instant Deagen takes the flag

/* Deagen's simulated lap times, in seconds. A made-up race, not real results. */
const LAP_TIMES = [92.418, 91.907, 91.536];
const fmt = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(3); };

function norm(len) { const a = path.getPointAtLength(len - 2), b = path.getPointAtLength(len + 2); const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1; return [-dy / m, dx / m]; }
function put(el, tr, dist, side) {
  const pos = (((P0 + dist) % 1000) + 1000) % 1000, len = pos / 1000 * L;
  const pt = path.getPointAtLength(len), [nx, ny] = norm(len);
  el.setAttribute('transform', `translate(${pt.x + nx * side} ${pt.y + ny * side})`);
  tr.style.strokeDashoffset = TRAIL - pos;
  return pos;
}
const towerEls = { d: $('.t-d', tower), r: $('.t-r', tower), t: $('.t-t', tower) };

/* F1-style timing tower: Deagen plus two made-up rivals, with a flag each. The rivals change every race. */
const flagSvg = body => `<svg viewBox="0 0 30 20" aria-hidden="true">${body}</svg>`;
const bandsV = c => c.map((f, i) => `<rect x="${i * 10}" width="10" height="20" fill="${f}"/>`).join('');
const bandsH = (c, hs = [1, 1, 1]) => { let y = 0; const t = hs.reduce((p, q) => p + q, 0); return c.map((f, i) => { const h = 20 * hs[i] / t, r = `<rect y="${y}" width="30" height="${h}" fill="${f}"/>`; y += h; return r; }).join(''); };
const cross = (bg, fg, x) => `<rect width="30" height="20" fill="${bg}"/><rect x="${x}" width="4" height="20" fill="${fg}"/><rect y="8" width="30" height="4" fill="${fg}"/>`;
const FLAGS = {
  GB: flagSvg('<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.5"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.5"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="4"/>'),
  IT: flagSvg(bandsV(['#009246', '#fff', '#CE2B37'])),
  FR: flagSvg(bandsV(['#0055A4', '#fff', '#EF4135'])),
  BE: flagSvg(bandsV(['#111', '#FDDA24', '#EF3340'])),
  IE: flagSvg(bandsV(['#169B62', '#fff', '#FF883E'])),
  MX: flagSvg(bandsV(['#006847', '#fff', '#CE1126'])),
  DE: flagSvg(bandsH(['#111', '#DD0000', '#FFCE00'])),
  NL: flagSvg(bandsH(['#AE1C28', '#fff', '#21468B'])),
  AT: flagSvg(bandsH(['#ED2939', '#fff', '#ED2939'])),
  ES: flagSvg(bandsH(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1])),
  PL: flagSvg(bandsH(['#fff', '#DC143C'], [1, 1])),
  JP: flagSvg('<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>'),
  FI: flagSvg(cross('#fff', '#003580', 8)),
  DK: flagSvg(cross('#C8102E', '#fff', 8)),
  SE: flagSvg(cross('#006AA7', '#FECC00', 8)),
  CH: flagSvg('<rect width="30" height="20" fill="#D52B1E"/><rect x="13" y="4" width="4" height="12" fill="#fff"/><rect x="9" y="8" width="12" height="4" fill="#fff"/>'),
  BR: flagSvg('<rect width="30" height="20" fill="#009C3B"/><path d="M15 3L27 10L15 17L3 10Z" fill="#FFDF00"/><circle cx="15" cy="10" r="4" fill="#002776"/>')
};
const DRIVERS = [
  ['Rossi', 'IT'], ['Moretti', 'IT'], ['Ferrante', 'IT'], ['Marchand', 'FR'], ['Girard', 'FR'], ['Brandt', 'DE'], ['Vogel', 'DE'], ['Keller', 'CH'],
  ['Navarro', 'ES'], ['Ortega', 'ES'], ['Visser', 'NL'], ['Bakker', 'NL'], ['Almeida', 'BR'], ['Costa', 'BR'], ['Tanaka', 'JP'], ['Sato', 'JP'],
  ['Laine', 'FI'], ['Virtanen', 'FI'], ['Herrera', 'MX'], ['Janssens', 'BE'], ['Nielsen', 'DK'], ['Lindqvist', 'SE'], ['Gruber', 'AT'], ['Gallagher', 'IE'],
  ['Kowalski', 'PL'], ['Hartley', 'GB'], ['Whitmore', 'GB']
];
function setDriver(el, name, cc) { $('.tn', el).textContent = name; $('.tf', el).innerHTML = FLAGS[cc] || ''; }
function pickRivals() {
  const a = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
  let b; do { b = DRIVERS[Math.floor(Math.random() * DRIVERS.length)]; } while (b[0] === a[0] || b[1] === a[1]);
  setDriver(towerEls.r, a[0], a[1]); setDriver(towerEls.t, b[0], b[1]);
}
setDriver(towerEls.d, 'Fairclough', 'GB'); pickRivals();
let racing = false, raf = 0, raceT0 = 0, lastOrder = '', lastDone = 0, flashTimer = 0, flashUntil = 0;

function lapBoard(dd, final) {
  const done = Math.min(LAPS, Math.floor(dd / 1000));
  const times = LAP_TIMES.slice(0, done), best = times.length ? Math.min(...times) : null;
  if (done > lastDone) {                       // a lap has just been completed
    lastDone = done;
    const pb = done > 1 && LAP_TIMES[done - 1] <= best && LAP_TIMES[done - 1] < Math.min(...LAP_TIMES.slice(0, done - 1));
    const delta = done > 1 ? LAP_TIMES[done - 1] - LAP_TIMES[done - 2] : 0;
    ltTag.textContent = pb ? 'Fastest lap  ' + (delta < 0 ? '' : '+') + delta.toFixed(3) : 'Lap ' + done;
    lapPanel.classList.toggle('pb', pb);
    lapPanel.classList.add('lap-done');
    flashUntil = performance.now() + 1500;
    clearTimeout(flashTimer); flashTimer = setTimeout(() => lapPanel.classList.remove('lap-done', 'pb'), 1500);
  }
  const n = Math.min(LAPS - 1, done), frac = done >= LAPS ? 1 : Math.max(0, (dd - done * 1000) / 1000);
  const flashing = performance.now() < flashUntil && done > 0 && !final;
  const shown = flashing ? LAP_TIMES[done - 1] : (done >= LAPS ? LAP_TIMES[LAPS - 1] : LAP_TIMES[n] * frac);
  ltNow.textContent = fmt(shown);
  ltLast.textContent = done ? fmt(LAP_TIMES[done - 1]) : '-';
  ltBest.textContent = best ? fmt(best) : '-';
  return best;
}
function frame(u) {
  const dd = distD(u), dr = distR(u), dt = distT(u);
  const pos = put(car, trail, dd, -7); put(carR, trailR, dr, 7); put(carT, trailT, dt, 0);
  const maxD = Math.max(dd, dr, dt);
  const order = [['d', dd], ['r', dr], ['t', dt]].sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const key = order.join('');
  if (key !== lastOrder) { lastOrder = key; order.forEach((c, i) => { towerEls[c].dataset.p = i + 1; }); }
  const lapNow = Math.min(LAPS, Math.floor(maxD / 1000) + 1);
  $('#lapNo').textContent = lapNow;
  lapText.classList.toggle('final', lapNow === LAPS);
  const s = Math.min(2, Math.floor(((maxD % 1000) / 1000) * 3));
  $$('.sector').forEach((el, i) => el.classList.toggle('on', i <= s));
  lapBoard(dd, false);
}
function finish(u) {
  racing = false; cancelAnimationFrame(raf);
  frame(u);
  $('#lapNo').textContent = LAPS;
  lapBoard(LAPS * 1000, true);
  wFl.textContent = 'Fastest lap ' + fmt(Math.min(...LAP_TIMES));
  lapPanel.classList.add('gone');
  flag.classList.add('show'); winner.classList.add('show');
}
function runRace() {
  flag.classList.remove('show'); winner.classList.remove('show'); lapPanel.classList.remove('gone', 'lap-done', 'pb');
  lastOrder = ''; lastDone = 0; flashUntil = 0; ltTag.textContent = ''; pickRivals();
  racing = true; raceT0 = performance.now();
  const step = t => {
    if (!racing) return;
    const u = Math.min(uEnd, (t - raceT0) / RACE_MS * uEnd);
    frame(u);
    if (u >= uEnd) { finish(uEnd); return; }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
let started = false;
function startCar() {
  if (started) return; started = true;
  if (reduced) { finish(uEnd); return; }
  frame(0);
  setTimeout(runRace, 1800);
}
frame(0); if (reduced) { finish(uEnd); }
$('#raceAgain').addEventListener('click', () => { if (!reduced) { lastDone = 0; frame(0); runRace(); } });

// pointer parallax
const track = $('#heroTrack'), track2 = $('#raceLayer'), six = $('.hero-six');
if (!reduced && matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
    track.style.transform = track2.style.transform = `translate(${x * -22}px, ${y * -16}px)`;
    six.style.transform = `translate(${x * 30}px, calc(-52% + ${y * 20}px))`;
  }, { passive: true });
}

// nav
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 60);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// countdown
const cd = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
function countdown() {
  let ms = FINALE - Date.now();
  if (ms <= 0) { $('.countdown').innerHTML = '<div><b>Done</b><span>Season complete</span></div>'; return; }
  const p = n => String(n).padStart(2, '0');
  const s = Math.floor(ms / 1000);
  cd.d.textContent = Math.floor(s / 86400);
  cd.h.textContent = p(Math.floor(s % 86400 / 3600));
  cd.m.textContent = p(Math.floor(s % 3600 / 60));
  cd.s.textContent = p(s % 60);
  setTimeout(countdown, 1000);
}
countdown();

/* =========================================================
   CAREER
   ========================================================= */
const years = Object.keys(SEASONS);
const scrub = $('#scrub'), seasonEl = $('#season');
const winsOf = y => SEASONS[y].entries.reduce((a, e) => a + (e.wins || 0), 0);
const maxWins = Math.max(...years.map(winsOf));
let current = null;

years.forEach(y => {
  const s = SEASONS[y], w = winsOf(y);
  const b = document.createElement('button');
  b.className = 'yr' + (s.champ ? ' champ' : '') + (s.live ? ' live' : '');
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', `${y}: ${s.live ? 'season in progress' : w + ' wins'}`);
  b.innerHTML = `<span class="w">${s.live ? '' : w}</span><span class="bar"></span><span class="y">${y}</span>`;
  b.dataset.h = s.live ? '' : Math.max(4, Math.round(w / maxWins * 120));
  b.addEventListener('click', () => showSeason(y));
  scrub.appendChild(b);
});

function countTo(el, to, dur = 900) {
  if (reduced || isNaN(to)) { el.textContent = isNaN(to) ? el.textContent : to; return; }
  const t0 = performance.now(), dec = String(to).includes('.') ? 1 : 0;
  (function f(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * e).toFixed(dec);
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}

function showSeason(y) {
  if (current === y) return; current = y;
  $$('.yr', scrub).forEach(b => b.setAttribute('aria-pressed', String(b.querySelector('.y').textContent === y)));
  const s = SEASONS[y];
  seasonEl.innerHTML = s.entries.map(e => {
    const tag = `<span class="tag${e.champ ? ' gold' : ''}">${e.champ ? 'Champion' : (e.pos + ' in the championship')}</span>`;
    const nums = e.live
      ? `<dl class="nums"><div><dt>Position</dt><dd>${e.pos}</dd></div><div><dt>Points</dt><dd data-to="${e.pts}">${e.pts}</dd></div></dl>`
      : `<dl class="nums">
          <div><dt>Races</dt><dd data-to="${e.races}">${e.races}</dd></div>
          <div><dt>Wins</dt><dd data-to="${e.wins}">${e.wins}</dd></div>
          <div><dt>Poles</dt><dd data-to="${e.poles}">${e.poles}</dd></div>
          <div><dt>Podiums</dt><dd data-to="${e.pod}">${e.pod}</dd></div>
          <div><dt>Fastest laps</dt><dd data-to="${e.fl}">${e.fl}</dd></div>
          <div><dt>Points</dt><dd data-to="${e.pts}">${e.pts}</dd></div>
        </dl>`;
    return `<article class="entry"><div><h3>${e.series}</h3><p class="team">${e.team}</p>${tag}</div>${nums}</article>`;
  }).join('') + `<p class="season-note">${s.note}</p>`;
  $$('[data-to]', seasonEl).forEach(el => countTo(el, parseFloat(el.dataset.to), 700));
}

// grow bars when career section appears
const careerIO = new IntersectionObserver(([en]) => {
  if (!en.isIntersecting) return;
  careerIO.disconnect();
  $$('.yr', scrub).forEach((b, i) => setTimeout(() => { if (b.dataset.h) b.querySelector('.bar').style.height = b.dataset.h + 'px'; }, reduced ? 0 : i * 90));
  showSeason('2024');
  // totals
  const all = years.filter(y => !SEASONS[y].live).flatMap(y => SEASONS[y].entries);
  const tot = {
    races: all.reduce((a, e) => a + e.races, 0),
    wins: all.reduce((a, e) => a + e.wins, 0),
    pod: all.reduce((a, e) => a + e.pod, 0),
    titles: all.filter(e => e.champ).length
  };
  $$('[data-count]').forEach(el => countTo(el, tot[el.dataset.count], 1400));
}, { threshold: .25 });
careerIO.observe($('#career'));
// before it is seen, give bars their base height and an initial panel for no-JS-scroll cases
$$('.yr .bar', scrub).forEach(b => (b.style.height = '4px'));

/* =========================================================
   TELEMETRY CHART
   ========================================================= */
window.DF = { GB3, SEASONS, FINALE };
const chart = $('#chart'), tip = $('#tip'), wrap = $('.chart-wrap');
const NS = 'http://www.w3.org/2000/svg';
const mk = (n, a = {}, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; };
const labelOf = v => v === 'R' ? 'Retired' : v === 'DNS' ? 'Did not start' : v === 'C' ? 'Cancelled' : 'P' + v;

let items = [], wkLines = [], replayTimer = 0;
function drawChart(year) {
  const data = GB3[year];
  const W = 960, H = 380, left = 48, right = 12, top = 22, bottom = 66;
  const plotH = H - top - bottom, MAXP = 22;
  const races = data.weekends.flatMap((w, wi) => w.r.map((v, ri) => ({ v, w: w.n, wi, ri })));
  const n = races.length, step = (W - left - right) / n;
  const yP = p => top + (p - 1) / (MAXP - 1) * (plotH - 38);
  const yOut = top + plotH - 10;
  const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Finishing positions for each GB3 race in ${year}` });

  [1, 5, 10, 15, 20].forEach(p => {
    svg.append(mk('line', { class: 'grid-l', x1: left, x2: W - right, y1: yP(p), y2: yP(p) }));
    svg.append(mk('text', { class: 'axis-t', x: left - 10, y: yP(p) + 4, 'text-anchor': 'end' }, 'P' + p));
  });
  svg.append(mk('line', { class: 'grid-l', x1: left, x2: W - right, y1: yOut, y2: yOut, 'stroke-dasharray': '3 5' }));
  svg.append(mk('text', { class: 'axis-t', x: left - 10, y: yOut + 4, 'text-anchor': 'end' }, 'Out'));

  let idx = 0;
  const dots = [];
  items = []; wkLines = [];
  data.weekends.forEach((w, wi) => {
    const x0 = left + step * idx, wW = step * w.r.length;
    if (wi % 2 === 0) svg.append(mk('rect', { class: 'wk-band', x: x0, y: top - 8, width: wW, height: plotH + 8 }));
    svg.append(mk('text', { class: 'wk-t', x: x0 + wW / 2, y: H - 30, 'text-anchor': 'middle' }, w.n));
    const pts = [];
    w.r.forEach((v, ri) => {
      const x = left + step * (idx + ri + .5);
      if (typeof v === 'number') pts.push([x, yP(v)]);
      dots.push({ v, x, y: typeof v === 'number' ? yP(v) : yOut, w: w.n, ri, wi, last: ri === w.r.length - 1 });
    });
    if (pts.length > 1) { const wl = mk('path', { class: 'wk-l', d: 'M' + pts.map(p => p.join(' ')).join('L') }); svg.append(wl); wkLines[wi] = wl; }
    idx += w.r.length;
  });

  dots.forEach(d => {
    if (d.v === 'C') { const tx = mk('text', { class: 'axis-t cancel', x: d.x, y: d.y + 4, 'text-anchor': 'middle' }, '–'); svg.append(tx); items.push({ d, els: [tx] }); return; }
    const cls = typeof d.v !== 'number' ? 'dnf' : d.v === 1 ? 'win' : d.v <= 3 ? 'pod' : 'pts';
    const c = mk('circle', { class: 'dot ' + cls, cx: d.x, cy: d.y, r: 8, tabindex: 0, 'aria-label': `${d.w}, race ${d.ri + 1}: ${labelOf(d.v)}` });
    const show = () => {
      const cr = c.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      tip.innerHTML = `<b>${labelOf(d.v)}</b>${d.w}, race ${d.ri + 1}`;
      tip.style.left = (cr.left - wr.left + cr.width / 2) + 'px';
      tip.style.top = (cr.top - wr.top) + 'px';
      tip.classList.add('show');
    };
    const hit = mk('circle', { class: 'hit', cx: d.x, cy: d.y, r: 17, tabindex: -1 });
    const on = () => { c.classList.add('hot'); show(); }, off = () => { c.classList.remove('hot'); tip.classList.remove('show'); };
    hit.addEventListener('pointerenter', on); hit.addEventListener('pointerleave', off);
    c.addEventListener('focus', on); c.addEventListener('blur', off);
    svg.append(c);
    if (cls === 'dnf') {
      const s = 3.5;
      svg.append(mk('path', { class: 'cx', d: `M${d.x - s} ${d.y - s}L${d.x + s} ${d.y + s}M${d.x + s} ${d.y - s}L${d.x - s} ${d.y + s}` }));
    }
    svg.append(hit);
    items.push({ d, els: [c, hit].concat(cls === 'dnf' ? [svg.querySelector('.cx:last-of-type')] : []) });
  });

  chart.replaceChildren(svg);
  stopReplay(true);

  // readout
  const fin = races.filter(r => typeof r.v === 'number').map(r => r.v);
  const out = races.filter(r => r.v === 'R' || r.v === 'DNS').length;
  const rows = [
    ['Best finish', 'P' + Math.min(...fin)],
    ['Wins', fin.filter(v => v === 1).length],
    ['Podiums', fin.filter(v => v <= 3).length],
    ['Average finish', (fin.reduce((a, b) => a + b, 0) / fin.length).toFixed(1)],
    ['Retirements', out]
  ];
  $('#readout').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#chartNote').textContent = data.note;
}

/* Season replay: the dots appear one race at a time with a running tally */
const ticker = $('#ticker'), replayBtn = $('#replayBtn');
function stopReplay(quiet) {
  clearInterval(replayTimer); replayTimer = 0;
  chart.classList.remove('replaying');
  items.forEach(it => it.els.forEach(e => e && e.classList.remove('rev')));
  const cur = chart.querySelector('.cursor'); if (cur) cur.remove();
  replayBtn.textContent = '\u25B6 Replay season'; replayBtn.setAttribute('aria-pressed', 'false');
  if (quiet !== true) ticker.classList.remove('show');
  else ticker.classList.remove('show');
}
function startReplay() {
  if (replayTimer) { stopReplay(); return; }
  const svg = chart.querySelector('svg'); if (!svg || !items.length) return;
  chart.classList.add('replaying');
  items.forEach(it => it.els.forEach(e => e && e.classList.remove('rev')));
  wkLines.forEach(l => l && l.classList.remove('rev'));
  const cur = mk('line', { class: 'cursor', y1: 14, y2: 300 }); svg.append(cur);
  replayBtn.textContent = '\u25A0 Stop'; replayBtn.setAttribute('aria-pressed', 'true');
  ticker.classList.add('show');
  const total = items.filter(it => it.d.v !== 'C').length;
  let i = 0, raceNo = 0, wins = 0, pods = 0, best = 99;
  const tick = () => {
    if (i >= items.length) {
      clearInterval(replayTimer); replayTimer = 0; cur.remove();
      wkLines.forEach(l => l && l.classList.add('rev'));
      replayBtn.textContent = '\u25B6 Replay season'; replayBtn.setAttribute('aria-pressed', 'false');
      return;
    }
    const it = items[i++], d = it.d;
    cur.setAttribute('x1', d.x); cur.setAttribute('x2', d.x);
    it.els.forEach(e => e && e.classList.add('rev'));
    if (d.last && wkLines[d.wi]) wkLines[d.wi].classList.add('rev');
    if (d.v === 'C') { ticker.innerHTML = `<b>${d.w}</b> race ${d.ri + 1} was cancelled`; return; }
    raceNo++;
    if (typeof d.v === 'number') { if (d.v === 1) wins++; if (d.v <= 3) pods++; best = Math.min(best, d.v); }
    ticker.innerHTML = `<span class="tk-r">Race ${raceNo} of ${total}</span><b>${d.w}</b><span class="tk-res ${d.v === 1 ? 'w' : typeof d.v !== 'number' ? 'o' : ''}">${labelOf(d.v)}</span><span class="tk-t">Wins <b>${wins}</b></span><span class="tk-t">Podiums <b>${pods}</b></span><span class="tk-t">Best <b>${best === 99 ? '-' : 'P' + best}</b></span>`;
  };
  tick(); replayTimer = setInterval(tick, reduced ? 120 : 700);
}
replayBtn.addEventListener('click', startReplay);
$$('.tabs button').forEach(b => b.addEventListener('click', () => {
  stopReplay();
  $$('.tabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  drawChart(b.dataset.year);
}));
drawChart('2025');

/* =========================================================
   LAUNCH TEST
   ========================================================= */
const lights = $$('#rigLights .pod'), btn = $('#rigBtn'), msg = $('#rigMsg');
let state = 'idle', t0 = 0, timers = [], best = null;
try { best = parseInt(localStorage.getItem('df-best'), 10) || null; } catch (e) {}
if (best) $('#bestMs').textContent = best + ' ms';

const clearT = () => { timers.forEach(clearTimeout); timers = []; };
function arm() {
  clearT(); lights.forEach(l => l.classList.remove('on'));
  state = 'arming'; btn.classList.remove('go'); btn.textContent = 'Wait for it'; msg.textContent = 'Lights coming on. Do not move.';
  lights.forEach((l, i) => timers.push(setTimeout(() => l.classList.add('on'), 700 * (i + 1))));
  timers.push(setTimeout(() => {
    lights.forEach(l => l.classList.remove('on'));
    state = 'go'; t0 = performance.now();
    btn.classList.add('go'); btn.textContent = 'Go'; msg.textContent = '';
  }, 700 * 5 + 600 + Math.random() * 2200));
}
function press() {
  if (state === 'idle') return arm();
  if (state === 'arming') {
    clearT(); lights.forEach(l => l.classList.remove('on'));
    state = 'idle'; btn.textContent = 'Try again'; msg.textContent = 'Jump start. You moved before the lights went out.';
    $('#lastMs').textContent = 'Jump';
    return;
  }
  if (state === 'go') {
    const ms = Math.round(performance.now() - t0);
    state = 'idle'; btn.classList.remove('go'); btn.textContent = 'Go again';
    $('#lastMs').textContent = ms + ' ms';
    if (!best || ms < best) { best = ms; $('#bestMs').textContent = ms + ' ms'; try { localStorage.setItem('df-best', ms); } catch (e) {} }
    msg.textContent = ms < 120 ? 'Suspiciously quick. Was that a guess?' : ms < 220 ? 'Sharp launch.' : ms < 350 ? 'Solid. There is more in it.' : 'Slow off the line. Go again.';
  }
}
btn.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) press(); } });
btn.addEventListener('click', e => e.preventDefault());

/* =========================================================
   LADDER: staircase indent
   ========================================================= */
$$('#rungs li').forEach((li, i) => li.style.setProperty('--i', i));

/* =========================================================
   WATCH: click-to-load video player
   ========================================================= */
(function watch() {
  const stage = $('#stage'), list = $('#playlist');
  if (!stage || !VIDEOS.length) { const s = $('#watch'); if (s) s.hidden = true; return; }
  const playable = VIDEOS.filter(v => v.type !== 'link');
  const srcOf = v => v.type === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&modestbranding=1`
    : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.url)}&show_text=false&autoplay=true`;
  const pageOf = v => v.type === 'youtube' ? `https://www.youtube.com/watch?v=${v.id}` : v.url;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let fb = $('.stage-fallback'); if (!fb) { fb = document.createElement('p'); fb.className = 'stage-fallback'; stage.after(fb); }

  function select(v) {
    $$('[data-i]', list).forEach(el => el.setAttribute('aria-current', String(VIDEOS[el.dataset.i] === v)));
    const thumb = v.type === 'youtube' ? `--thumb:url(https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg)` : '';
    stage.innerHTML = `<button class="poster" type="button" style="${thumb}" aria-label="Play: ${esc(v.title)}">
      <span class="play" aria-hidden="true"></span><b>${esc(v.title)}</b><span>${esc(v.source)}</span></button>`;
    fb.innerHTML = `Video not playing? <a href="${esc(pageOf(v))}" target="_blank" rel="noopener">Watch it on ${v.type === 'youtube' ? 'YouTube' : 'Facebook'}</a>.`;
    $('.poster', stage).addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = srcOf(v); f.title = v.title; f.loading = 'lazy';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.replaceChildren(f);
    });
  }

  VIDEOS.forEach((v, i) => {
    const li = document.createElement('li');
    const inner = `<b>${esc(v.title)}</b><span>${esc(v.source)}</span>${v.note ? `<span>${esc(v.note)}</span>` : ''}`;
    if (v.type === 'link') {
      li.innerHTML = `<a href="${esc(v.url)}" target="_blank" rel="noopener">${inner}<span class="ext">Opens in a new tab</span></a>`;
    } else {
      li.innerHTML = `<button type="button" data-i="${i}">${inner}</button>`;
      $('button', li).addEventListener('click', () => { select(v); $('.poster', stage).click(); });
    }
    list.appendChild(li);
  });

  if (playable.length) select(playable[0]);
  else { stage.hidden = true; }
})();

/* =========================================================
   ENQUIRY FORM
   ========================================================= */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = encodeURIComponent('Sponsorship enquiry: ' + (f.get('company') || f.get('name')));
  const body = encodeURIComponent(`${f.get('msg')}\n\n${f.get('name')}${f.get('company') ? ', ' + f.get('company') : ''}`);
  location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

})();


/* =========================================================
   SPONSOR: "ways to get on board" cards prefill the enquiry form
   ========================================================= */
document.querySelectorAll('.ways button').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.to) { const d = document.getElementById(b.dataset.to); if (d) { d.scrollIntoView({ behavior: 'smooth' }); return; } }
  const f = document.getElementById('form');
  const m = f && f.querySelector('textarea[name="msg"]');
  if (m) { m.value = "I'd like to talk about " + b.dataset.way + ". "; }
  const t = document.getElementById('partner');
  if (t) t.scrollIntoView({ behavior: 'smooth' });
  if (m) setTimeout(() => { m.focus(); m.setSelectionRange(m.value.length, m.value.length); }, 600);
}));
