/* =========================================================
   FIND YOUR FIT (quiz) and LOGO PREVIEW
   Both feed the enquiry form at the bottom of the page.
   The logo never leaves the visitor's browser: it is read with
   an object URL and shown in <img> tags, nothing is uploaded.
   ========================================================= */
(() => {
'use strict';

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* put text in the enquiry form, scroll to it and focus it */
function prefill(text) {
  const f = document.getElementById('form');
  const m = f && f.querySelector('textarea[name="msg"]');
  if (m) m.value = text;
  const t = document.getElementById('partner');
  if (t) t.scrollIntoView({ behavior: 'smooth' });
  if (m) setTimeout(() => { m.focus(); m.setSelectionRange(m.value.length, m.value.length); }, 600);
}

/* =========================================================
   QUIZ
   Each answer adds points to the four ways, in this order:
   [partner, content, race weekends, appearances]
   ========================================================= */
const WAYS = [
  { n: '01', title: 'Be a partner',     way: 'a partnership with Deagen',
    blurb: 'Put your name alongside Deagen as he climbs the ladder. What that looks like is shaped around you.' },
  { n: '02', title: 'Content & social', way: 'a content and social media partnership',
    blurb: 'Behind-the-scenes stories, launches and race-day content built around your brand.' },
  { n: '03', title: 'Race weekends',    way: 'race weekend hospitality',
    blurb: 'Bring clients into the paddock and see the racing from the inside.' },
  { n: '04', title: 'Appearances',      way: 'a Deagen appearance at our event',
    blurb: 'Deagen at your launch, your team day or your conference.' }
];

const Q = [
  { q: 'What do you want from backing Deagen?', o: [
    { t: 'Get our name in front of more people',   m: 'get our name in front of more people',        s: [2, 3, 0, 1] },
    { t: 'Treat our clients, staff or suppliers',  m: 'treat our clients, staff or suppliers',       s: [0, 0, 3, 2] },
    { t: 'Fresh content for our own channels',     m: 'get fresh content for our own channels',      s: [1, 3, 0, 1] },
    { t: 'Be part of a rising driver’s story', m: 'be part of a rising driver’s story',    s: [3, 2, 1, 0] } ] },
  { q: 'Who do you most want to reach?', o: [
    { t: 'Customers and the public',     m: 'customers and the public',     s: [2, 3, 0, 1] },
    { t: 'Our clients and key contacts', m: 'our clients and key contacts', s: [0, 0, 3, 2] },
    { t: 'Our own team and staff',       m: 'our own team and staff',       s: [0, 0, 2, 3] },
    { t: 'Motorsport fans and followers', m: 'motorsport fans and followers', s: [3, 2, 1, 0] } ] },
  { q: 'How hands-on do you want to be?', o: [
    { t: 'Hands-off. Just put our name out there', m: 'hands-off',                                     s: [3, 1, 0, 0] },
    { t: 'Some. Shout-outs and shared content',    m: 'involved through shout-outs and shared content', s: [1, 3, 0, 0] },
    { t: 'Hands-on. We want to meet Deagen',       m: 'hands-on, meeting Deagen',                       s: [0, 0, 2, 3] },
    { t: 'Full experience. Track-side with the team', m: 'there for the full track-side experience',    s: [0, 0, 3, 1] } ] }
];

const root = $('#quiz');
if (root) {
  let step = 0, interacted = false;
  const picks = [];

  const scores = () => {
    const s = [0, 0, 0, 0];
    picks.forEach((p, qi) => Q[qi].o[p].s.forEach((v, k) => { s[k] += v; }));
    return s;
  };
  const ranked = () => {
    const s = scores();
    return s.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || a.i - b.i);
  };

  function settle(sel) {
    if (!interacted) return;
    const el = $(sel, root);
    if (el) el.focus({ preventScroll: true });
    const r = root.getBoundingClientRect();
    if (r.top < 70 || r.top > innerHeight * 0.6) {
      scrollTo({ top: scrollY + r.top - 90, behavior: reduced ? 'auto' : 'smooth' });
    }
  }

  function renderQ() {
    const q = Q[step];
    root.innerHTML = `
      <div class="q-step">
        <div class="q-top">
          <div class="q-prog" aria-hidden="true">${Q.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>
          <span class="q-count">Question ${step + 1} of ${Q.length}</span>
        </div>
        <h3 class="q-h" tabindex="-1">${q.q}</h3>
        <div class="q-opts">
          ${q.o.map((o, i) => `<button type="button" class="q-opt${picks[step] === i ? ' sel' : ''}" data-i="${i}"><b aria-hidden="true">${'ABCD'[i]}</b><span>${o.t}</span></button>`).join('')}
        </div>
        ${step ? '<button type="button" class="q-link q-back">Back</button>' : ''}
      </div>`;
    $$('.q-opt', root).forEach(b => b.addEventListener('click', () => {
      interacted = true;
      picks[step] = +b.dataset.i;
      $$('.q-opt', root).forEach(x => x.classList.toggle('sel', x === b));
      setTimeout(() => { step++; render(); }, reduced ? 0 : 280);
    }));
    const back = $('.q-back', root);
    if (back) back.addEventListener('click', () => { interacted = true; step--; render(); });
    settle('.q-h');
  }

  function renderResult() {
    const r = ranked();
    const top = WAYS[r[0].i], also = WAYS[r[1].i];
    const max = r[0].v || 1;
    const msg = `I’d like to talk about ${top.way}. Our goal is to ${Q[0].o[picks[0]].m}, we want to reach ${Q[1].o[picks[1]].m}, and we’d like to be ${Q[2].o[picks[2]].m}. `;
    root.innerHTML = `
      <div class="q-res">
        <div>
          <p class="q-kick">Your best fit</p>
          <h3 class="q-title" tabindex="-1">${top.title}</h3>
          <p class="q-desc">${top.blurb}</p>
          <p class="q-also">Also worth a look: <b>${also.title}</b></p>
          <div class="q-cta">
            <button type="button" class="btn q-go">Enquire about this <i style="font-style:normal">&rarr;</i></button>
            <a class="q-link" href="#studio">Try your logo</a>
            <button type="button" class="q-link q-again">Start again</button>
          </div>
        </div>
        <ul class="q-bars" aria-label="How well each way fits you">
          ${r.map((x, k) => `<li class="${k === 0 ? 'top' : ''}"><span><em>${WAYS[x.i].n}</em>${WAYS[x.i].title}</span><i data-w="${(x.v / max).toFixed(3)}"></i></li>`).join('')}
        </ul>
      </div>`;
    $('.q-go', root).addEventListener('click', () => prefill(msg));
    $('.q-again', root).addEventListener('click', () => { picks.length = 0; step = 0; render(); });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.q-bars i', root).forEach(i => i.style.setProperty('--w', i.dataset.w));
    }));
    settle('.q-title');
  }

  function render() { step < Q.length ? renderQ() : renderResult(); }
  render();
}

/* =========================================================
   LOGO PREVIEW
   ========================================================= */
const studio = $('#studio');
if (studio) {
  const file = $('#stFile'), drop = $('#stDrop'), msg = $('#stMsg');
  const sample = $('#stSample'), clear = $('#stClear'), plateSet = $('#stPlate');
  const grid = $('#evGrid');

  /* step-and-repeat backdrop: 12 plates */
  grid.innerHTML = '<div class="lg"><img alt="" hidden><b>Your logo</b></div>'.repeat(12);
  const imgs = $$('.lg img', studio);

  const SAMPLE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="110" viewBox="0 0 360 110">' +
    '<polygon points="55,8 95,30 95,80 55,102 15,80 15,30" fill="#E8590C"/>' +
    '<path d="M40 70V40l15 12 15-12v30" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<text x="112" y="62" font-family="Georgia,serif" font-weight="700" font-size="38" fill="#14213D">Northgate</text>' +
    '<text x="114" y="88" font-family="Arial,sans-serif" font-size="15" letter-spacing="5" fill="#6B7280">BUILDERS</text></svg>');

  let current = null;   // { url, name, info }

  const say = (t, ok) => { msg.textContent = t || ''; msg.classList.toggle('ok', !!ok); };

  /* decide what to put behind the logo so it stays readable */
  function analyse(img) {
    try {
      const w0 = img.naturalWidth || 300, h0 = img.naturalHeight || 100;
      const k = Math.min(1, 64 / Math.max(w0, h0));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, c.width, c.height);
      const W = c.width, H = c.height, d = x.getImageData(0, 0, W, H).data;
      const at = (i, j) => { const o = (j * W + i) * 4; return [d[o], d[o + 1], d[o + 2], d[o + 3]]; };
      const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
      if (corners.every(p => p[3] > 240)) {          // solid background (JPG, flat PNG): match it
        const [r, g, b] = corners[0];
        return { plate: `rgb(${r},${g},${b})` };
      }
      let sum = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 40) { sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; n++; }
      }
      const avg = n ? sum / n : 0.5;
      return { plate: avg > 0.6 ? '#0b1020' : '#ffffff' };   // light logo on dark, dark logo on white
    } catch (e) {
      return { plate: '#ffffff' };
    }
  }

  function plateColour() {
    const mode = ($('input[name="plate"]:checked', studio) || {}).value;
    if (mode === 'light') return '#ffffff';
    if (mode === 'dark')  return '#0b1020';
    return current ? current.info.plate : '#ffffff';
  }

  function apply() {
    if (!current) {
      studio.classList.remove('has-logo');
      imgs.forEach(i => { i.hidden = true; i.removeAttribute('src'); });
      clear.hidden = true; plateSet.disabled = true;
      return;
    }
    imgs.forEach(i => { i.src = current.url; i.hidden = false; });
    studio.style.setProperty('--plate', plateColour());
    studio.classList.add('has-logo');
    clear.hidden = false; plateSet.disabled = false;
  }

  function release() {
    if (current && current.url.startsWith('blob:')) URL.revokeObjectURL(current.url);
  }

  function show(url, name) {
    const probe = new Image();
    probe.onload = () => {
      release();
      current = { url, name, info: analyse(probe) };
      $('input[name="plate"][value="auto"]', studio).checked = true;
      apply();
      say(name === 'sample' ? 'Showing a sample logo.' : 'Showing your logo.', true);
    };
    probe.onerror = () => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      say('We could not read that image. Try a PNG, JPG, SVG or WebP.');
    };
    probe.src = url;
  }

  function take(f) {
    if (!f) return;
    const okType = /^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(f.type) || /\.svg$/i.test(f.name);
    if (!okType) { say('That file type isn’t supported. Try a PNG, JPG, SVG or WebP.'); return; }
    if (f.size > 8 * 1024 * 1024) { say('That file is over 8 MB. Try a smaller version of your logo.'); return; }
    say('');
    show(URL.createObjectURL(f), 'logo');
  }

  file.addEventListener('change', () => { take(file.files[0]); file.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => take(e.dataTransfer && e.dataTransfer.files[0]));

  sample.addEventListener('click', () => { say(''); show(SAMPLE, 'sample'); });
  clear.addEventListener('click', () => { release(); current = null; apply(); say(''); });
  $$('input[name="plate"]', studio).forEach(r => r.addEventListener('change', apply));

  $('#stSend').addEventListener('click', () => {
    prefill(current && current.name === 'logo'
      ? 'I’d like to talk about partnering with Deagen. I’ve tried our logo on the site and I’ll attach it to this message. '
      : 'I’d like to talk about partnering with Deagen. ');
  });

  /* cards rise in as they scroll into view */
  const cards = $$('.st-card', studio);
  if (!reduced && 'IntersectionObserver' in window) {
    $('.st-grid', studio).classList.add('st-anim');
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.15 });
    cards.forEach((c, i) => { c.style.transitionDelay = (i % 2) * 120 + 'ms'; io.observe(c); });
  }
}
})();
