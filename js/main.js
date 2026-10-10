import { PROJECTS, SERVICES, CATEGORIES } from './data.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const CONTACT_EMAIL = 'hello@thundercreatives.in'; // TODO(client): real inbox
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------------- smooth scroll ---------------- */
const lenis = new Lenis({ lerp: reducedMotion ? 1 : 0.1, wheelMultiplier: 1 });
lenis.stop();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------------- WebGL hero ---------------- */
let hero = null;
const heroReady = import('./hero.js')
  .then(({ createHero }) => createHero($('#gl'), { reducedMotion }))
  .then((h) => (hero = h))
  .catch((err) => {
    console.warn('WebGL hero unavailable, using DOM fallback', err);
    $('#gl').remove();
    $('.hero').insertAdjacentHTML('beforeend', '<div class="hero__fallback" aria-hidden="true"><span>We cause</span><span>creative</span><em>storms</em></div>');
  });

lenis.on('scroll', ({ scroll, velocity }) => {
  hero?.setScroll(scroll, velocity);
  $('.progress span').style.transform = `scaleX(${lenis.limit ? scroll / lenis.limit : 0})`;
});

/* ---------------- preloader ---------------- */
function runLoader() {
  const num = $('.loader__num');
  const counter = { v: 0 };
  const tl = gsap.timeline();
  tl.to('.loader__bolt', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
    .to(counter, { v: 80, duration: 1.4, ease: 'power1.inOut', onUpdate: () => (num.textContent = Math.round(counter.v)) }, 0);
  const minTime = new Promise((r) => setTimeout(r, reducedMotion ? 200 : 1500));
  Promise.all([heroReady, document.fonts.ready, minTime]).then(() => {
    gsap.timeline()
      .to(counter, { v: 100, duration: 0.5, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(counter.v)) })
      .to('.loader__bolt', { fill: '#ea1313', duration: 0.3 }, '<')
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '+=0.15')
      .add(() => {
        $('.loader').remove();
        document.body.classList.remove('is-loading');
        lenis.start();
        hero?.intro();
        refreshAll();
      }, '-=0.45')
      .from('.nav > *', { y: -30, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' }, '-=0.3')
      .from('.hero__top > *, .hero__bottom > *, .hero__fallback > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, '<0.2');
  });
  gsap.set('.loader', { clipPath: 'inset(0 0 0% 0)' });
}

/* ---------------- custom cursor ---------------- */
function initCursor() {
  if (!finePointer) return;
  const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    const h = e.target.closest('a, button, [data-hover], label, input, textarea');
    cur.classList.toggle('is-label', !!t);
    cur.classList.toggle('is-hover', !t && !!h);
    if (t) label.textContent = t.dataset.cursor;
  });
}

/* ---------------- magnetic buttons ---------------- */
function initMagnetic() {
  if (!finePointer) return;
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------------- nav ---------------- */
function initNav() {
  const nav = $('.nav');
  let last = 0;
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-solid', scroll > 40);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', scroll > last && scroll > 300);
    last = scroll;
  });
  const burger = $('.nav__burger');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('.menu').setAttribute('aria-hidden', !open);
    open ? lenis.stop() : lenis.start();
    if (open) gsap.fromTo('.menu__links a', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, delay: 0.25, ease: 'expo.out' });
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-open-contact')) return;
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    lenis.scrollTo(target, { duration: 1.6 });
  });

  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });
  $('.to-top').addEventListener('click', () => lenis.scrollTo(0, { duration: 2 }));
  $('.js-year').textContent = new Date().getFullYear();
}

/* ---------------- text reveals ---------------- */
function splitLines(el) {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map((p) => `<span class="line"><span class="line__in">${p.trim()}</span></span>`).join('');
  return $$('.line__in', el);
}
function initReveals() {
  $$('.split').forEach((el) => {
    const lines = splitLines(el);
    gsap.from(lines, {
      yPercent: 115, rotate: 4, transformOrigin: '0 0', duration: 1.3, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
  $$('.reveal-up').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  $$('.eyebrow').forEach((el) => {
    gsap.from(el, { x: -30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // about paragraph: words light up as you scroll
  const lead = $('.scrub-words');
  lead.innerHTML = lead.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  gsap.to($$('.w', lead), {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: lead, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
  gsap.from('.pillars li', { x: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.pillars', start: 'top 85%' } });
}

/* ---------------- marquee (direction follows scroll) ---------------- */
function initMarquee() {
  const track = $('.marquee__track');
  let x = 0, dir = -1, boost = 0;
  lenis.on('scroll', ({ velocity }) => {
    if (velocity) dir = velocity > 0 ? -1 : 1;
    boost = Math.min(Math.abs(velocity) * 0.6, 30);
  });
  gsap.ticker.add(() => {
    const half = track.scrollWidth / 2;
    x += dir * (reducedMotion ? 0 : 1.2 + boost);
    boost *= 0.92;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
  gsap.fromTo('.marquee', { rotate: -6 }, { rotate: 2, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------------- studio reel: pinned horizontal scroll ---------------- */
function initReel() {
  const track = $('.reel__track');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.reel', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
  });
  $$('.reel__item').forEach((item, i) => {
    const media = $('img, video', item);
    gsap.fromTo(media, { xPercent: -8 }, {
      xPercent: 8, ease: 'none',
      scrollTrigger: { trigger: item, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
    });
    gsap.from(item, {
      y: i % 2 ? 120 : -120, rotate: i % 2 ? 4 : -4, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: item, containerAnimation: tween, start: 'left 110%', end: 'left 55%', scrub: true },
    });
  });
}

/* ---------------- services ---------------- */
function initServices() {
  const grid = $('.svc-grid');
  grid.innerHTML = SERVICES.map((s, i) => `
    <article class="svc" data-hover>
      <span class="svc__num">${pad(i + 1)}</span>
      ${s.icon}
      <h3>${s.title}</h3>
      <p>${s.text}</p>
      <div class="svc__tags">${s.tags.map((t) => `<span>${t}</span>`).join('')}</div>
    </article>`).join('');

  const cards = $$('.svc', grid);
  gsap.from(cards, {
    y: 120, rotateX: -35, opacity: 0, transformOrigin: '50% 0%', duration: 1.3, stagger: { each: 0.08, grid: 'auto', from: 'start' }, ease: 'expo.out',
    scrollTrigger: { trigger: grid, start: 'top 80%' },
  });
  cards.forEach((card) => {
    // draw the icon strokes when the card enters
    const shapes = $$('path, circle, rect', card);
    shapes.forEach((sh) => { const L = sh.getTotalLength(); gsap.set(sh, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.to(shapes, { strokeDashoffset: 0, duration: 1.6, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: card, start: 'top 85%' } });

    if (!finePointer) return;
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6 }), ry = gsap.quickTo(card, 'rotationY', { duration: 0.6 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      rx((0.5 - py) * 10); ry((px - 0.5) * 12);
    });
    card.addEventListener('pointerenter', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ---------------- work: circular wheel ---------------- */
const STEP = 20; // degrees between projects on the wheel
let currentProject = 0;
let wheelST = null;

function panelSlots(p) {
  // always fill three slots; projects with fewer shots reuse them with different crops
  const crops = ['50% 50%', '20% 30%', '80% 70%'];
  const media = p.video ? [{ video: p.video, poster: p.images[0] }, ...p.images.slice(1).map((src) => ({ src }))] : p.images.map((src) => ({ src }));
  return [0, 1, 2].map((k) => ({ ...media[k % media.length], pos: media.length > k ? '50% 50%' : crops[k], zoom: media.length > k ? 1 : 1.6 }));
}
function slotHTML(s) {
  const style = `object-position:${s.pos};transform:scale(${s.zoom})`;
  return `<div class="panel__img">${s.video
    ? `<video src="${s.video}" poster="${s.poster}" muted loop playsinline autoplay style="${style}"></video>`
    : `<img src="${s.src}" alt="" style="${style}">`}</div>`;
}

function initWork() {
  const N = PROJECTS.length;
  const ring = $('.wheel__ring'), rays = $('.wheel__rays'), icons = $('.wheel__icons');
  $('.js-total').textContent = pad(N);

  ring.insertAdjacentHTML('beforeend', PROJECTS.map((p, i) => `
    <button class="wheel__tile" data-i="${i}" data-cursor="View" aria-label="${p.client} — ${p.title}"
      style="transform: rotate(${i * STEP}deg) translateX(var(--R)) translate(-50%, -50%)">
      <img src="${p.images[0]}" alt="" loading="lazy">
    </button>`).join(''));
  rays.innerHTML = Array.from({ length: N * 2 }, (_, k) => `<span class="wheel__ray" style="transform: rotate(${k * STEP / 2 - STEP / 4}deg)"></span>`).join('');

  const span = 84; // icons spread across ±42°
  icons.innerHTML = CATEGORIES.map((c, k) => {
    const a = -span / 2 + (span / (CATEGORIES.length - 1)) * k;
    return `<button class="wheel__icon" data-cat="${c.id}" aria-label="${c.label}"
      style="transform: rotate(${a}deg) translateX(calc(var(--R) * .6)) rotate(${-a}deg)">
      <svg viewBox="0 0 24 24">${c.icon}</svg><span>${c.label}</span></button>`;
  }).join('');

  const tiles = $$('.wheel__tile', ring);
  const state = { i: 0 };
  const spin = gsap.to(state, {
    i: N - 1, ease: 'none',
    onUpdate: () => {
      const rot = -state.i * STEP;
      gsap.set([ring, rays], { rotation: rot });
      const idx = Math.round(state.i);
      if (idx !== currentProject) setActive(idx);
    },
  });
  wheelST = ScrollTrigger.create({
    trigger: '.wheel-stage', start: 'top top', end: () => '+=' + (N - 1) * window.innerHeight * 0.42,
    pin: true, scrub: 0.9, animation: spin, invalidateOnRefresh: true,
    snap: { snapTo: 1 / (N - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: 'power2.inOut' },
  });

  // entrance: wheel spins in from below, info + panel slide in
  gsap.from('.wheel', { rotation: 90, xPercent: -40, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.wheel-stage', start: 'top 70%' } });
  gsap.from(['.wheel-info', '.panel'], { x: 80, opacity: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.wheel-stage', start: 'top 60%' } });

  ring.addEventListener('click', (e) => {
    const t = e.target.closest('.wheel__tile');
    if (!t) return;
    const i = +t.dataset.i;
    i === currentProject ? openProject(i) : goToProject(i);
  });
  icons.addEventListener('click', (e) => {
    const b = e.target.closest('.wheel__icon');
    if (!b) return;
    const i = PROJECTS.findIndex((p) => p.cat === b.dataset.cat);
    if (i >= 0) goToProject(i);
  });
  $$('[data-open-project]').forEach((b) => b.addEventListener('click', () => openProject(currentProject)));

  // first paint
  setActive(0, true);
}

function goToProject(i) {
  const N = PROJECTS.length;
  const y = wheelST.start + (i / (N - 1)) * (wheelST.end - wheelST.start);
  lenis.scrollTo(y, { duration: 1.2 });
}

function setActive(i, instant = false) {
  currentProject = i;
  const p = PROJECTS[i];
  $$('.wheel__tile').forEach((t, k) => t.classList.toggle('is-active', k === i));
  $$('.wheel__icon').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === p.cat));

  const texts = [['.js-cur', pad(i + 1)], ['.js-cat', p.catLabel], ['.js-client', p.client], ['.js-title', p.title], ['.js-p-client', p.client]];
  const els = texts.map(([s]) => $(s));
  const apply = () => {
    texts.forEach(([s, v]) => ($(s).textContent = v));
    $('.js-p-tags').innerHTML = p.tags.map((t) => `<span>${t}</span>`).join('');
  };

  const media = $('.panel__media');
  const slots = panelSlots(p);
  const set = document.createElement('div');
  set.className = 'panel__set';
  set.innerHTML = slots.map(slotHTML).join('');
  media.appendChild(set);

  if (instant || reducedMotion) {
    apply();
    [...media.children].forEach((c) => c !== set && c.remove());
    return;
  }

  gsap.killTweensOf(els);
  gsap.timeline()
    .to(els, { yPercent: -60, opacity: 0, duration: 0.22, stagger: 0.02, ease: 'power2.in' })
    .add(apply)
    .fromTo(els, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out' });
  gsap.fromTo('.wheel-info__bar', { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'expo.out' });

  // the new set wipes up over the previous one, then older sets are dropped
  const cells = $$('.panel__img', set);
  gsap.fromTo(cells, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)', duration: 0.8, stagger: 0.07, ease: 'expo.inOut',
    onComplete: () => { while (set.previousElementSibling) set.previousElementSibling.remove(); },
  });
  gsap.fromTo(cells.map((c) => c.firstElementChild), { scale: (k) => slots[k].zoom * 1.3 }, { scale: (k) => slots[k].zoom, duration: 1.2, ease: 'expo.out' });
}

/* ---------------- drawers ---------------- */
let lastFocus = null;
function openDrawer(el) {
  lastFocus = document.activeElement;
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  lenis.stop();
  gsap.to($('.drawer__scrim', el), { opacity: 1, duration: 0.5 });
  gsap.fromTo($('.drawer__panel', el), { xPercent: 100 }, { xPercent: 0, duration: 0.9, ease: 'expo.out' });
  gsap.from($$('.drawer__body > *', el), { x: 60, opacity: 0, stagger: 0.05, duration: 0.9, delay: 0.15, ease: 'expo.out' });
  $('.drawer__close', el).focus({ preventScroll: true });
}
function closeDrawer(el) {
  if (!el.classList.contains('is-open')) return;
  gsap.to($('.drawer__scrim', el), { opacity: 0, duration: 0.4 });
  gsap.to($('.drawer__panel', el), {
    xPercent: 100, duration: 0.6, ease: 'expo.in',
    onComplete: () => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); lenis.start(); lastFocus?.focus({ preventScroll: true }); },
  });
}

function openProject(i) {
  const p = PROJECTS[i], N = PROJECTS.length;
  const el = $('.drawer--project');
  const gallery = [
    ...(p.video ? [`<figure><video src="${p.video}" poster="${p.images[0]}" muted loop playsinline autoplay controls></video></figure>`] : []),
    ...p.images.map((src) => `<figure><img src="${src}" alt="${p.client} — ${p.title}" loading="lazy"></figure>`),
  ].join('');
  $('.drawer__body', el).innerHTML = `
    <p class="pd__cat">${p.catLabel} · ${pad(i + 1)}/${pad(N)}</p>
    <h3 class="pd__title">${p.client}</h3>
    <p class="pd__sub">${p.title}</p>
    <p class="pd__desc">${p.desc}</p>
    <p class="tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</p>
    <div class="pd__gallery">${gallery}</div>
    <div class="pd__next">
      <button data-go="${(i - 1 + N) % N}">← ${PROJECTS[(i - 1 + N) % N].client}</button>
      <button data-go="${(i + 1) % N}">${PROJECTS[(i + 1) % N].client} →</button>
    </div>`;
  $('.drawer__panel', el).scrollTop = 0;
  if (el.classList.contains('is-open')) {
    gsap.from($$('.drawer__body > *', el), { y: 40, opacity: 0, stagger: 0.04, duration: 0.7, ease: 'expo.out' });
  } else openDrawer(el);
}

function initDrawers() {
  gsap.set('.drawer__panel', { xPercent: 100 }); // GSAP owns this transform (no CSS transform to stack with)
  $$('.drawer').forEach((d) => d.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeDrawer(d);
    const go = e.target.closest('[data-go]');
    if (go) openProject(+go.dataset.go);
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.drawer.is-open').forEach(closeDrawer); });
  $$('[data-open-contact]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openDrawer($('.drawer--contact')); }));

  const form = $('.form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.field').classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    const note = $('.form__note');
    if (!ok) {
      note.textContent = 'Please fill in your name, a valid email and a few project details.';
      gsap.fromTo(form, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const d = new FormData(form);
    const services = d.getAll('service').join(', ') || '—';
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nCompany: ${d.get('company') || '—'}\nServices: ${services}\n\n${d.get('message')}`;
    // No backend yet: hand off to the visitor's mail app.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('New project — ' + (d.get('company') || d.get('name')))}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Thanks! Your mail app should open with the details — hit send and we’ll strike back soon.';
  });
}

/* ---------------- clients + contact + footer ---------------- */
function initOutro() {
  // (animate wrappers, never elements that carry CSS transitions on transform/opacity)
  gsap.from('.logo-rail__track', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.logo-rail', start: 'top 90%' } });
  gsap.fromTo('.word-rail', { xPercent: 10 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: '.word-rail', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.big-cta', { scale: 0, rotate: -120, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.contact__row', start: 'top 85%' } });

  const word = $('.footer__word');
  word.innerHTML = 'THUNDER'.split('').map((c) => `<span><i>${c}</i></span>`).join('');
  gsap.from($$('i', word), {
    yPercent: 100, opacity: 0, stagger: 0.06, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer', start: 'top 85%' },
  });
}

/* ---------------- boot ---------------- */
// Pinned sections first (top → bottom) so every later trigger measures with their spacers in place.
initReel();
initWork();
initCursor();
initMagnetic();
initNav();
initReveals();
initMarquee();
initServices();
initDrawers();
initOutro();
runLoader();
function refreshAll() { ScrollTrigger.refresh(); }
window.addEventListener('load', refreshAll);
