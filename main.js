/* ============================================================
   OBSIDIAN & LIME — interactions
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Persian digits helper ---------- */
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function toFa(v) {
    return String(v).replace(/\d/g, function (d) { return FA[+d]; }).replace(/\./g, '٫');
  }

  /* ---------- Tehran system clock ---------- */
  var clockEl = $('#clock');
  function tick() {
    if (!clockEl) return;
    try {
      var t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tehran', hour12: false });
      clockEl.textContent = 'TEHRAN ' + t;
    } catch (e) {
      clockEl.textContent = 'TEHRAN ' + new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500;
    var t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(dec);
      el.textContent = toFa(val) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduceMotion) { el.textContent = toFa(target.toFixed(dec)) + suffix; return; }
    requestAnimationFrame(frame);
  }

  /* ---------- Bars ---------- */
  function growBars(scope) {
    $$('.bar i', scope).forEach(function (b, i) {
      b.style.transitionDelay = (i * 90) + 'ms';
      b.style.height = b.getAttribute('data-h') + '%';
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.id === 'bars' || $('.bar i', en.target)) growBars(en.target);
      $$('[data-count]', en.target).forEach(function (c) {
        if (!c.dataset.done) { c.dataset.done = '1'; animateCount(c); }
      });
      if (en.target.hasAttribute('data-count') && !en.target.dataset.done) {
        en.target.dataset.done = '1'; animateCount(en.target);
      }
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(function (el) { io.observe(el); });
  var barsBox = $('#bars');
  if (barsBox) io.observe(barsBox);

  /* ---------- Active nav link ---------- */
  var links = $$('.nav-pill a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { navIO.observe(s); });

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var pill = $('#navPill');
  if (burger && pill) {
    burger.addEventListener('click', function () {
      if (pill.classList.contains('open')) {
        pill.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      } else {
        pill.style.setProperty('--nav-h', pill.scrollHeight + 'px');
        pill.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
      }
    });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        pill.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    var mqNav = window.matchMedia('(max-width: 1000px)');
    mqNav.addEventListener('change', function () {
      if (pill.classList.contains('open')) pill.style.setProperty('--nav-h', pill.scrollHeight + 'px');
    });
  }

  /* ---------- Hero mock tilt + AI cursor ---------- */
  var visual = $('#heroVisual');
  var mock = $('#mock');
  var cursor = $('#aiCursor');
  if (visual && mock && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, px = 0, py = 0, inside = false;
    visual.addEventListener('mousemove', function (e) {
      var r = visual.getBoundingClientRect();
      var rx = (e.clientX - r.left) / r.width - 0.5;
      var ry = (e.clientY - r.top) / r.height - 0.5;
      tx = rx * 10; ty = -ry * 10;
      px = e.clientX - r.left; py = e.clientY - r.top;
      inside = true;
    });
    visual.addEventListener('mouseleave', function () {
      tx = 0; ty = 0; inside = false;
    });
    (function loop() {
      mock.style.transform = 'rotateY(' + tx.toFixed(2) + 'deg) rotateX(' + ty.toFixed(2) + 'deg)';
      cx += (px - cx) * 0.12;
      cy += (py - cy) * 0.12;
      if (cursor) {
        cursor.style.transform = 'translate(' + (cx + 14).toFixed(1) + 'px,' + (cy + 10).toFixed(1) + 'px)';
        cursor.style.opacity = inside ? '1' : '0';
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- To top ---------- */
  var toTop = $('#toTop');
  window.addEventListener('scroll', function () {
    toTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Print ---------- */
  $$('[data-print]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
})();
