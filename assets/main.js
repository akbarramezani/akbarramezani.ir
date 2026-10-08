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

  /* ============================================================
     DOCUMENTS VIEWER — certificate pop-up
     Each key maps to the "data-docs" attribute of a course card.
     ============================================================ */
  var DOCS = {
    'network-principles': [{
      src: 'assets/images/network-principles.jpg',
      label: 'گواهینامه مکتب‌خونه',
      alt: 'گواهینامه دوره درک مقدماتی شبکه — مکتب‌خونه',
      cap: 'دوره «درک مقدماتی شبکه» — مکتب‌خونه | مدرس: جادی میرمیرانی | ۴ ساعت | پایان دوره: ۱۴۰۵/۰۳/۳۱'
    }],
    'help-desk': [{
      src: 'assets/images/help-desk.png',
      label: 'گواهینامه پایان دوره',
      alt: 'گواهینامه پایان دوره جامع پرورش متخصص Help Desk — آموزشگاه مهندسی کندو',
      cap: 'دوره جامع پرورش متخصص Help Desk — آموزشگاه مهندسی کندو | ۸۰ ساعت | برگزاری: ۱۴۰۵/۰۱/۰۳ تا ۱۴۰۵/۰۱/۱۰ | تاریخ صدور: ۱۴۰۵/۰۷/۱۵'
    }],
    'windows-server': [{
      src: 'assets/images/windows-server-essential.jpg',
      label: 'گواهینامه مکتب‌خونه',
      alt: 'گواهینامه دوره Windows Server Essential Training — مکتب‌خونه',
      cap: 'دوره «Windows Server Essential Training» — مکتب‌خونه | مدرس: Robert McMillen | ۳ ساعت'
    }],
    'sql-server-2022': [{
      src: 'assets/images/sql-server-2022.jpg',
      label: 'گواهینامه مکتب‌خونه',
      alt: 'گواهینامه دوره کوئری‌نویسی جامع در SQL Server 2022 — مکتب‌خونه',
      cap: 'دوره «کوئری‌نویسی جامع در SQL Server 2022 — قسمت اول: اصول کلی پایگاه‌داده‌ها و طراحی پروژه‌ی عملی CKD» — مکتب‌خونه | مدرس: سید ناصر هادی | ۳ ساعت'
    }],
    'dahua': [{
      src: 'assets/images/dahua.jpg',
      label: 'گواهینامه مهارت',
      alt: 'گواهینامه مهارت دوربین مدار بسته داهوا — سازمان آموزش فنی و حرفه‌ای',
      cap: 'گواهینامه مهارت «دوربین مدار بسته داهوا» — سازمان آموزش فنی و حرفه‌ای، مرکز تربیت مربی و پژوهش‌های فنی و حرفه‌ای | ۱۶ ساعت | درجه عالی | تاریخ صدور: ۱۴۰۲/۰۵/۲۳'
    }],
    'dcsa': [{
      src: 'assets/images/ocsa.jpg',
      label: 'گواهینامه مهارت',
      alt: 'گواهینامه مهارت تکنسین سیستم نظارت تصویری — سازمان آموزش فنی و حرفه‌ای',
      cap: 'گواهینامه مهارت «تکنسین سیستم نظارت تصویری (دوربین مدار بسته)» — سازمان آموزش فنی و حرفه‌ای، مرکز تربیت مربی و پژوهش‌های فنی و حرفه‌ای | ۳۲ ساعت | درجه عالی | تاریخ صدور: ۱۴۰۲/۱۱/۲۸'
    }],
    'network-plus': [{
      src: 'assets/images/network-plus-3.jpg',
      label: 'Certificate of Excellence',
      alt: 'گواهینامه انگلیسی Network+ با نشان Certificate of Excellence',
      cap: 'دوره Network+ — آموزشگاه مهندسی کندو | Certificate of Excellence | برگزاری: ۲۵.۰۲.۲۰۲۳ تا ۱۳.۰۵.۲۰۲۳ | تاریخ صدور: ۱۶.۰۶.۲۰۲۳'
    }, {
      src: 'assets/images/network-plus-1.jpg',
      label: 'گواهینامه فارسی',
      alt: 'گواهینامه فارسی پایان دوره Network+ — آموزشگاه مهندسی کندو',
      cap: 'دوره Network+ (بخش اول) — آموزشگاه مهندسی کندو | ۳۰ ساعت | تاریخ صدور: ۱۴۰۲/۰۳/۲۸'
    }, {
      src: 'assets/images/network-plus-2.jpg',
      label: 'گواهینامه فارسی',
      alt: 'گواهینامه فارسی پایان دوره Network+ — آموزشگاه مهندسی کندو',
      cap: 'دوره Network+ (بخش دوم) — آموزشگاه مهندسی کندو | ۳۰ ساعت | تاریخ صدور: ۱۴۰۲/۰۳/۲۶'
    }],
    'icdl': [{
      src: 'assets/images/icdl.jpg',
      label: 'گواهینامه مهارت',
      alt: 'گواهینامه پایان دوره ICDL درجه ۲',
      cap: 'گواهینامه پایان دوره «مهارت ICDL درجه ۲» — مجتمع فنی و حرفه‌ای آزاد فناوری پاسارسه کسری، کرج | با امتیاز رسمی سازمان آموزش فنی و حرفه‌ای | ۳۲ ساعت | تاریخ صدور: ۱۳۹۶/۰۲/۰۱'
    }],
    'alborz': [{
      src: 'assets/images/alborz-2.jpg',
      label: 'مجتمع اداری تجاری البرز — تصویر ۱',
      alt: 'نمای کلی ساختمان مجتمع اداری تجاری البرز',
      cap: 'مجتمع اداری تجاری البرز — نمای کلی مجموعه اداری و تجاری | تهران'
    }, {
      src: 'assets/images/alborz-1.jpeg',
      label: 'مجتمع اداری تجاری البرز — تصویر ۲',
      alt: 'نمای بیرونی و ورودی مجتمع اداری تجاری البرز',
      cap: 'مجتمع اداری تجاری البرز — ناظر پیمانکار | اردیبهشت ۱۳۹۷ تا مرداد ۱۳۹۹ (۲ سال و ۳ ماه) — تهران'
    }],
    'atiye2': [{
      src: 'assets/images/image-1.webp',
      label: 'مجتمع بیمارستانی آتیه ۲ — تصویر ۱',
      alt: 'نمای بیرونی برج مجتمع بیمارستانی آتیه ۲',
      cap: 'مجتمع بیمارستانی آتیه ۲ — نمای بیرونی برج بیمارستانی | تهران'
    }, {
      src: 'assets/images/atiye2-1.jpg',
      label: 'مجتمع بیمارستانی آتیه ۲ — تصویر ۲',
      alt: 'نمای برج و سازه در حال احداث مجتمع بیمارستانی آتیه ۲',
      cap: 'مجتمع بیمارستانی آتیه ۲ — ناظر پیمانکار | خرداد ۱۳۹۵ تا اسفند ۱۳۹۶ (۱ سال و ۹ ماه) — تهران'
    }, {
      src: 'assets/images/atiye2-2.jpg',
      label: 'مجتمع بیمارستانی آتیه ۲ — تصویر ۳',
      alt: 'نمای نزدیک طبقات و اجرای سازه مجتمع بیمارستانی آتیه ۲',
      cap: 'مجتمع بیمارستانی آتیه ۲ — روند اجرای طبقات و نمای پروژه درمانی | تهران'
    }, {
      src: 'assets/images/atiye2-3.jpg',
      label: 'مجتمع بیمارستانی آتیه ۲ — تصویر ۴',
      alt: 'نمای عمومی کارگاه و برج مجتمع بیمارستانی آتیه ۲',
      cap: 'مجتمع بیمارستانی آتیه ۲ — نمای عمومی سازه و کارگاه اجرایی | تهران'
    }],
    'elysium': [{
      src: 'assets/images/image-1.jpeg',
      label: 'پروژه الیزیوم — تصویر ۱',
      alt: 'نمای بیرونی مجتمع تجاری و اداری الیزیوم (Elysium Mall)',
      cap: 'پروژه آفتاب (الیزیوم) — نمای بیرونی مجتمع الیزیوم مال (Elysium Mall) | تهران'
    }, {
      src: 'assets/images/elysium-1.webp',
      label: 'پروژه الیزیوم — تصویر ۲',
      alt: 'نمای بیرونی و سازه در حال احداث پروژه آفتاب (الیزیوم)',
      cap: 'پروژه آفتاب (الیزیوم) — ناظر نهایی پیمانکار | مهر ۱۳۹۳ تا فروردین ۱۳۹۵ (۱ سال و ۶ ماه) — تهران'
    }, {
      src: 'assets/images/elysium-2.webp',
      label: 'پروژه الیزیوم — تصویر ۳',
      alt: 'اجرای تأسیسات سقفی و سینی کابل در پروژه آفتاب (الیزیوم)',
      cap: 'پروژه آفتاب (الیزیوم) — اجرای زیرساخت‌ها، سینی‌کشی و تأسیسات سقفی طبقات'
    }, {
      src: 'assets/images/elysium-3.webp',
      label: 'پروژه الیزیوم — تصویر ۴',
      alt: 'فضای داخلی طبقات و اجرای سازه پروژه آفتاب (الیزیوم)',
      cap: 'پروژه آفتاب (الیزیوم) — نمای وید مرکزی و روند اجرای داخلی طبقات'
    }, {
      src: 'assets/images/elysium-4.webp',
      label: 'پروژه الیزیوم — تصویر ۵',
      alt: 'مراحل اجرای فضای داخلی پروژه آفتاب (الیزیوم)',
      cap: 'پروژه آفتاب (الیزیوم) — مراحل آماده‌سازی و نظارت بر اجرای فضاهای داخلی'
    }, {
      src: 'assets/images/elysium-5.webp',
      label: 'پروژه الیزیوم — تصویر ۶',
      alt: 'تصویر هوایی کارگاه و سازه پروژه آفتاب (الیزیوم)',
      cap: 'پروژه آفتاب (الیزیوم) — نمای هوایی کارگاه و موقعیت پروژه در تهران'
    }]
  };

  var modal = $('#docModal');
  if (modal) {
    var panel = $('.doc-panel', modal);
    var frame = $('#docFrame');
    var img = $('#docImg');
    var capEl = $('#docCap');
    var errEl = $('#docErr');
    var thumbsBox = $('#docThumbs');
    var counterEl = $('#docCounter');
    var openLink = $('#docOpen');
    var titleEl = $('#docTitle');
    var subEl = $('#docSub');
    var closeBtn = $('.doc-close', modal);
    var scroller = $('.doc-scroll', modal);
    var headEl = $('.doc-head', modal);

    /* the header only becomes a frosted bar while content is scrolling under it,
       which keeps the panel looking like a single surface at rest */
    if (scroller && headEl) {
      scroller.addEventListener('scroll', function () {
        headEl.classList.toggle('is-stuck', scroller.scrollTop > 4);
      }, { passive: true });
    }

    var items = [], idx = 0, opener = null;
    var zoom = 1, panX = 0, panY = 0, ox = 50, oy = 50, drag = null, skipClick = false;
    var ZOOM_LEVEL = 2.2;

    /* Size the <img> element so the full document always fits inside the frame.
       (The panel scrolls if there is not enough room, so nothing is ever cropped.) */
    var fitRaf = 0;
    function fitImage() {
      var nw = img.naturalWidth, nh = img.naturalHeight;
      if (!nw || !nh) return;

      /* the frame (not its parent) is what the image must fit into */
      var availW = frame.clientWidth || 0;
      if (availW < 40) return;

      /* 1) give the frame every pixel the panel can spare, so the document is
            shown as large as possible while still fully visible */
      var chrome = 0;
      ['.doc-head', '.doc-cap', '.doc-thumbs', '.doc-foot'].forEach(function (sel) {
        var el = $(sel, modal);
        if (el) chrome += el.getBoundingClientRect().height;
      });
      chrome += 28;                                  /* stage + caption margins */
      var panelMax = Math.min(window.innerHeight * 0.94, 940) - 16;
      var availH = Math.max(200, panelMax - chrome);

      var naturalAtFullWidth = nh * (availW / nw);
      var frameH = Math.floor(Math.min(availH, Math.max(200, naturalAtFullWidth)));
      frame.style.height = frameH + 'px';

      /* 2) size the <img> so the whole document fits inside the frame */
      var s = Math.min(availW / nw, frameH / nh);
      if (s > 1) s = Math.min(s, 1.25);              /* gentle upscale for small scans */
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.width = Math.max(1, Math.round(nw * s)) + 'px';
      img.style.height = Math.max(1, Math.round(nh * s)) + 'px';
    }

    function refit() {
      cancelAnimationFrame(fitRaf);
      fitRaf = requestAnimationFrame(function () {
        if (!modal.classList.contains('open')) return;
        resetZoom();
        fitImage();
      });
    }
    window.addEventListener('resize', refit);
    window.addEventListener('orientationchange', refit);

    function applyTransform() {
      img.style.transformOrigin = ox + '% ' + oy + '%';
      img.style.transform = 'translate3d(' + panX.toFixed(1) + 'px,' + panY.toFixed(1) + 'px,0) scale(' + zoom + ')';
    }

    function clampPan() {
      if (zoom <= 1) { panX = 0; panY = 0; return; }
      var r = frame.getBoundingClientRect();
      var W = img.offsetWidth, H = img.offsetHeight;
      if (!W || !H) return;
      var x0 = (r.width - W) / 2, y0 = (r.height - H) / 2;
      var left0 = x0 + W * (ox / 100) * (1 - zoom);
      var top0 = y0 + H * (oy / 100) * (1 - zoom);
      var minX = r.width - (left0 + W * zoom), maxX = -left0;
      var minY = r.height - (top0 + H * zoom), maxY = -top0;
      panX = W * zoom <= r.width ? (minX + maxX) / 2 : Math.min(Math.max(panX, minX), maxX);
      panY = H * zoom <= r.height ? (minY + maxY) / 2 : Math.min(Math.max(panY, minY), maxY);
    }

    function resetZoom() {
      zoom = 1; panX = 0; panY = 0; ox = 50; oy = 50;
      frame.classList.remove('zoomed', 'dragging');
      img.style.transformOrigin = '50% 50%';
      img.style.transform = '';
      img.style.willChange = 'auto';
    }

    function zoomInAt(cx, cy) {
      var r = frame.getBoundingClientRect();
      ox = Math.min(100, Math.max(0, ((cx - r.left) / r.width) * 100));
      oy = Math.min(100, Math.max(0, ((cy - r.top) / r.height) * 100));
      zoom = ZOOM_LEVEL; panX = 0; panY = 0;
      frame.classList.add('zoomed');
      img.style.willChange = 'transform';
      clampPan();
      applyTransform();
    }

    function buildThumbs() {
      thumbsBox.innerHTML = '';
      if (items.length < 2) return;
      items.forEach(function (it, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'doc-thumb';
        b.setAttribute('aria-label', it.label || ('تصویر ' + toFa(i + 1)));
        b.innerHTML = '<img src="' + it.src + '" alt="" loading="lazy" decoding="async">' +
                      '<b class="lat">' + toFa(i + 1) + '</b>';
        b.addEventListener('click', function () { render(i); });
        thumbsBox.appendChild(b);
      });
    }

    function markThumb() {
      $$('.doc-thumb', thumbsBox).forEach(function (b, i) {
        b.classList.toggle('is-active', i === idx);
        b.setAttribute('aria-current', i === idx ? 'true' : 'false');
      });
    }

    function preload() {
      [idx + 1, idx - 1].forEach(function (n) {
        var it = items[(n + items.length) % items.length];
        if (it) { var i = new Image(); i.src = it.src; }
      });
    }

    function render(i) {
      if (!items.length) return;
      idx = ((i % items.length) + items.length) % items.length;
      var it = items[idx];

      resetZoom();
      errEl.hidden = true;
      frame.classList.remove('is-ready');
      img.classList.remove('is-loaded');
      img.alt = it.alt || it.label || '';
      img.src = it.src;

      capEl.innerHTML = it.label
        ? '<strong class="doc-cap-label">' + it.label + '</strong> — ' + it.cap
        : it.cap;
      counterEl.textContent = toFa(idx + 1) + ' / ' + toFa(items.length);
      if (openLink) openLink.href = it.src;
      markThumb();
      preload();
    }

    function step(d) { render(idx + d); }

    function openDocs(key, btn) {
      var data = DOCS[key];
      if (!data || !data.length) return;
      items = data;
      opener = btn;

      var card = btn.closest('.course, .job');
      var h3 = card ? card.querySelector('h3') : null;
      var jobCo = card ? $('.job-co', card) : null;
      var issuer = card ? $('.c-issuer', card) : null;
      if (jobCo && h3) {
        titleEl.textContent = jobCo.textContent.trim();
        subEl.textContent = h3.textContent.trim();
      } else {
        titleEl.textContent = (h3 && h3.textContent ? h3.textContent : key).trim();
        subEl.textContent = issuer ? issuer.textContent.trim() : '';
      }

      modal.setAttribute('data-count', String(items.length));
      buildThumbs();
      render(0);
      lastFocusDoc = document.activeElement;
      if (scroller && headEl) {
        scroller.scrollTop = 0;
        headEl.classList.remove('is-stuck');
      }
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('doc-lock');
      requestAnimationFrame(function () { resetZoom(); fitImage(); });
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    var lastFocusDoc = null;
    function closeDocs() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('doc-lock');
      resetZoom();
      var back = opener || lastFocusDoc;
      if (back && back.focus) back.focus({ preventScroll: true });
      opener = null;
    }

    /* ---- wiring ---- */
    $$('[data-docs]').forEach(function (btn) {
      var data = DOCS[btn.getAttribute('data-docs')];
      if (!data || !data.length) return;
      if (data.length > 1) {
        var badge = document.createElement('span');
        badge.className = 'doc-badge lat';
        badge.textContent = toFa(data.length) + ' تصویر';
        btn.appendChild(badge);
      }
      btn.addEventListener('click', function () { openDocs(btn.getAttribute('data-docs'), btn); });
    });

    $$('[data-doc-close]', modal).forEach(function (el) { el.addEventListener('click', closeDocs); });

    $$('[data-doc-step]', modal).forEach(function (b) {
      b.addEventListener('click', function () { step(parseInt(b.getAttribute('data-doc-step'), 10)); });
    });

    img.addEventListener('load', function () {
      fitImage();
      img.classList.add('is-loaded');
      frame.classList.add('is-ready');
    });
    img.addEventListener('error', function () {
      errEl.hidden = false;
      frame.classList.add('is-ready');
    });

    /* ---- zoom & pan ---- */
    frame.addEventListener('click', function (e) {
      if (skipClick) { skipClick = false; return; }
      if (zoom > 1) { resetZoom(); return; }
      zoomInAt(e.clientX, e.clientY);
    });
    frame.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (zoom > 1) { resetZoom(); return; }
      var r = frame.getBoundingClientRect();
      zoomInAt(r.left + r.width / 2, r.top + r.height / 2);
    });

    frame.addEventListener('pointerdown', function (e) {
      if (zoom <= 1 || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, px: panX, py: panY, moved: false };
      frame.classList.add('dragging');
      if (frame.setPointerCapture) frame.setPointerCapture(e.pointerId);
    });
    frame.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      panX = drag.px + dx; panY = drag.py + dy;
      clampPan();
      applyTransform();
    });
    function endDrag(e) {
      if (!drag) return;
      skipClick = drag.moved;
      drag = null;
      frame.classList.remove('dragging');
      if (e && e.pointerId != null && frame.releasePointerCapture && frame.hasPointerCapture && frame.hasPointerCapture(e.pointerId)) {
        frame.releasePointerCapture(e.pointerId);
      }
    }
    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);

    /* ---- swipe between certificates (touch) ---- */
    var swipeX = null, swipeY = null;
    frame.addEventListener('touchstart', function (e) {
      if (zoom > 1 || e.touches.length !== 1) { swipeX = null; return; }
      swipeX = e.touches[0].clientX; swipeY = e.touches[0].clientY;
    }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      if (swipeX === null || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - swipeX;
      var dy = e.changedTouches[0].clientY - swipeY;
      swipeX = null;
      if (items.length < 2 || Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;
      step(dx < 0 ? 1 : -1);
    }, { passive: true });

    /* ---- keyboard ---- */
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeDocs(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(-1); return; }   /* RTL: راست = قبلی */
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(1); return; }     /* RTL: چپ = بعدی */
      if (e.key === 'Tab') {
        var f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', panel);
        if (!f.length) return;
        var first = f[0], lastF = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
        else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
