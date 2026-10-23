(() => {
'use strict';
const DF = window.DF; if (!DF) return;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const mk = (n, a = {}, t) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; };
const PTS = {"silverstone": [298.7, 129.2], "brands": [327.5, 161.7], "donington": [293.5, 97.9], "spa": [470.4, 207.8], "zandvoort": [437.1, 127.7], "hungaroring": [827.5, 301.9], "redbull": [707.6, 330.3], "monza": [558.7, 402.7], "barcelona": [348.8, 560.1]};
/* key = name used in the results data; label = display name; dx/anchor place the label on the map */
const CIRC = {
  silverstone: { match: 'Silverstone', label: 'Silverstone', where: 'Northamptonshire, England', dx: -13, dy: 4, a: 'end' },
  donington:   { match: 'Donington', label: 'Donington Park', where: 'Leicestershire, England', dx: -13, dy: 4, a: 'end' },
  brands:      { match: 'Brands Hatch', label: 'Brands Hatch', where: 'Kent, England', dx: 13, dy: 4, a: 'start' },
  zandvoort:   { match: 'Zandvoort', label: 'Zandvoort', where: 'Netherlands', dx: 13, dy: -6, a: 'start' },
  spa:         { match: 'Spa', label: 'Spa-Francorchamps', where: 'Belgium', dx: -13, dy: 18, a: 'end' },
  hungaroring: { match: 'Hungaroring', label: 'Hungaroring', where: 'Mogyor\u00f3d, Hungary', dx: -13, dy: -10, a: 'end' },
  redbull:     { match: 'Red Bull Ring', label: 'Red Bull Ring', where: 'Spielberg, Austria', dx: -13, dy: -10, a: 'end' },
  monza:       { match: 'Monza', label: 'Monza', where: 'Italy', dx: 13, dy: 5, a: 'start' },
  barcelona:   { match: 'Barcelona', label: 'Barcelona-Catalunya', where: 'Montmel\u00f3, Spain', dx: 13, dy: 5, a: 'start' }
};
/* 2026 rounds still to come (no results yet) */
const TO_COME = { 2026: ['donington', 'brands', 'barcelona'] };
/* raced already, results still being added to the site */
const PENDING = { 2026: ['donington', 'brands'] };
const labelOf = v => v === 'R' ? 'Retired' : v === 'DNS' ? 'Did not start' : v === 'C' ? 'Cancelled' : 'P' + v;
const keyOf = n => Object.keys(CIRC).find(k => CIRC[k].match === n);

let year = '2025', sel = null;
const svg = $('#tmapSvg'), pinsG = $('#mPins'), route = $('#mRoute'), panel = $('#tmapPanel');

function weekendsFor(k) { return DF.GB3[year].weekends.filter(w => keyOf(w.n) === k); }
function bestAt(k) {
  const fin = weekendsFor(k).flatMap(w => w.r).filter(v => typeof v === 'number');
  if (fin.length) return Math.min(...fin);
  return weekendsFor(k).length ? 'out' : null;
}
function cls(b) { return b === null ? 'none' : b === 'out' ? 'dnf' : b === 1 ? 'win' : b <= 3 ? 'pod' : 'pts'; }

function draw() {
  pinsG.replaceChildren();
  const data = DF.GB3[year], done = [];
  data.weekends.forEach(w => { const k = keyOf(w.n); if (k && !done.includes(k + w.n + done.length)) done.push(k); });
  // route through the rounds in order
  const seq = data.weekends.map(w => keyOf(w.n)).filter(Boolean);
  route.setAttribute('d', seq.slice(1).map((k, i) => {
    const a = PTS[seq[i]], b = PTS[k], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / l * l * .22, cy = my + dx / l * l * .22;
    return `M${a[0]} ${a[1]}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0]} ${b[1]}`;
  }).join(''));
  const len = route.getTotalLength();
  route.style.transition = 'none'; route.style.strokeDasharray = len; route.style.strokeDashoffset = len;
  requestAnimationFrame(() => requestAnimationFrame(() => { route.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.2,.8,.2,1)'; route.style.strokeDashoffset = 0; }));
  const keys = [...new Set(seq.concat(TO_COME[year] || []))];
  $('#mChips').innerHTML = keys.map(k => `<button type="button" data-k="${k}" aria-pressed="${sel === k}">${CIRC[k].label}</button>`).join('');
  keys.forEach(k => {
    const c = CIRC[k], [x, y] = PTS[k], toCome = (TO_COME[year] || []).includes(k) && !weekendsFor(k).length;
    const b = toCome ? null : bestAt(k);
    const g = mk('g', { class: 'pin ' + (toCome ? 'soon' : cls(b)) + (sel === k ? ' sel' : ''), tabindex: 0, role: 'button', 'aria-label': c.label + (toCome ? ((PENDING[year] || []).includes(k) ? ', results being added' : ', still to come') : ', best result ' + (b === 'out' ? 'none, retired' : 'P' + b)) });
    if (k === 'barcelona' && toCome) g.append(mk('circle', { class: 'pulse', cx: x, cy: y, r: 9 }));
    g.append(mk('circle', { class: 'halo', cx: x, cy: y, r: 15 }));
    g.append(mk('circle', { class: 'dot', cx: x, cy: y, r: 7.5 }));
    g.append(mk('text', { class: 'lab', x: x + c.dx, y: y + c.dy, 'text-anchor': c.a }, c.label));
    g.append(mk('circle', { class: 'hit', cx: x, cy: y, r: 20 }));
    g.addEventListener('click', () => select(k));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(k); } });
    pinsG.append(g);
  });
}

function select(k) {
  sel = k;
  $$('#mChips button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
  $$('.pin', pinsG).forEach((p, i) => p.classList.toggle('sel', p.querySelector('.lab').textContent === CIRC[k].label));
  const c = CIRC[k], ws = weekendsFor(k), toCome = !ws.length;
  let html = `<p class="mp-k">${year} round${ws.length > 1 ? 's' : ''}</p><h3>${c.label}</h3><p class="mp-w">${c.where}</p>`;
  if (toCome) {
    html += k === 'barcelona' && year === '2026'
      ? `<p class="mp-soon"><b>Season finale</b>7 and 8 November. Results will appear here after the weekend.</p>`
      : (PENDING[year] || []).includes(k)
        ? `<p class="mp-soon"><b>Raced in September</b>Deagen's results here are being added to the site.</p>`
        : `<p class="mp-soon"><b>Still to come</b>Results will appear here once the round has been raced.</p>`;
  } else {
    html += ws.map((w, wi) => `<div class="mp-wk">${ws.length > 1 ? `<p class="mp-wn">Visit ${wi + 1}</p>` : ''}<ul>${w.r.map((v, i) => `<li class="${v === 1 ? 'w' : typeof v === 'number' && v <= 3 ? 'p' : typeof v !== 'number' ? 'o' : ''}"><span>Race ${i + 1}</span><b>${labelOf(v)}</b></li>`).join('')}</ul></div>`).join('');
    const b = bestAt(k);
    html += `<p class="mp-best">Best here: <b>${b === 'out' ? 'no finish' : 'P' + b}</b></p>`;
  }
  panel.innerHTML = html;
}

$('#mChips').addEventListener('click', e => { const b = e.target.closest('button'); if (b) select(b.dataset.k); });
function setYear(y) {
  year = y;
  $$('.tmap-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.my === y)));
  const last = DF.GB3[y].weekends.map(w => keyOf(w.n)).filter(Boolean).pop();
  sel = last; draw(); select(last);
}
$$('.tmap-tabs button').forEach(b => b.addEventListener('click', () => setYear(b.dataset.my)));
setYear('2025');
})();
