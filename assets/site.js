/* Loksevak AI site script: drawer, auto-advancing feature accordion, reveal and
   count-up on scroll, FAQ accordion, review carousel on mobile, next exam
   dates, the Group C tracker (days left, application window), the next live
   test date, the sticky sign-up on phones, the vacancy table filter, and the
   daily question with a local streak. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mr = document.documentElement.lang === 'mr';
  var DEV = '०१२३४५६७८९';
  var fmt = function (n) { var s = typeof n === 'number' ? n.toLocaleString('en-IN') : String(n); return mr ? s.replace(/\d/g, function (d) { return DEV[d]; }) : s; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // drawer
  var drawer = $('#drawer');
  $$('[data-drawer]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = !drawer.classList.contains('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      var bg = $('.burger'); if (bg) bg.setAttribute('aria-expanded', String(open));
    });
  });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a')) { drawer.classList.remove('open'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) { drawer.classList.remove('open'); document.body.style.overflow = ''; } });

  // comparison table: one competitor column at a time on phones
  var cw = $('.cmp-wrap');
  $$('.cmp-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      cw.setAttribute('data-show', b.getAttribute('data-show'));
      $$('.cmp-toggle button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });

  // swipe helper
  function swipe(el, fn) {
    if (!el) return; var x0 = 0, y0 = 0, t0 = 0;
    el.addEventListener('touchstart', function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); }, { passive: true });
    el.addEventListener('touchend', function (e) { var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - t0 < 600) fn(dx < 0 ? 1 : -1); }, { passive: true });
  }

  // reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; cio.unobserve(en.target);
        var el = en.target, to = +el.getAttribute('data-count');
        if (reduce) { el.textContent = fmt(to); return; }
        var t0 = performance.now(), dur = 1300;
        var step = function (t) { var p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = fmt(v); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  // feature accordion with auto-advance and phone swap
  var acc = $('#acc');
  if (acc) {
    var items = $$('.acc-item', acc), phone = $('#phone'), imgs = phone ? $$('img', phone) : [];
    var i = 0, start = 0, elapsed = 0, paused = true, DUR = 6000;
    var bar = function () { return $('.prog i', items[i]); };
    var show = function (n) {
      i = (n + items.length) % items.length;
      items.forEach(function (it, k) {
        var on = k === i; it.classList.toggle('on', on); $('.acc-h', it).setAttribute('aria-expanded', String(on));
        var b = $('.prog i', it); if (b) b.style.width = '0%';
      });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      start = performance.now(); elapsed = 0;
    };
    var loop = function (now) {
      if (!paused) {
        elapsed = now - start; var p = Math.min(1, elapsed / DUR); var b = bar(); if (b) b.style.width = (p * 100) + '%';
        if (p >= 1) show(i + 1);
      }
      requestAnimationFrame(loop);
    };
    var pause = function () { paused = true; };
    var resume = function () { if (reduce) return; start = performance.now() - elapsed; paused = false; };
    items.forEach(function (it, k) { $('.acc-h', it).addEventListener('click', function () { show(k); resume(); }); });
    acc.addEventListener('mouseenter', pause); acc.addEventListener('mouseleave', resume);
    acc.addEventListener('focusin', pause); acc.addEventListener('focusout', resume);
    $$('[data-acc]').forEach(function (b) { b.addEventListener('click', function () { show(i + (+b.getAttribute('data-acc'))); resume(); }); });
    if ('IntersectionObserver' in window) {
      var aio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) resume(); else pause(); }); }, { threshold: 0.25 });
      aio.observe(acc);
    } else resume();
    swipe($('.fgrid2'), function (d) { show(i + d); resume(); });
    show(0); requestAnimationFrame(loop);
  }

  // review carousel buttons (mobile)
  var rv = $('.rv-col');
  $$('[data-rv]').forEach(function (b) { b.addEventListener('click', function () { var card = $('.rv', rv); var w = card ? card.getBoundingClientRect().width + 12 : 300; rv.scrollBy({ left: w * (+b.getAttribute('data-rv')), behavior: 'smooth' }); }); });

  // faq: one open at a time
  $$('.faq').forEach(function (f) {
    $$('.faq-q', f).forEach(function (q) {
      q.addEventListener('click', function () {
        var it = q.parentElement, open = it.classList.contains('open');
        $$('.faq-item', f).forEach(function (x) { x.classList.remove('open'); $('.faq-q', x).setAttribute('aria-expanded', 'false'); });
        if (!open) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
      });
    });
  });

  // next exam dates
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var months = { mr: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'], en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
  var fmtDate = function (d) { return fmt(d.getDate()) + ' ' + months[mr ? 'mr' : 'en'][d.getMonth()] + ' ' + fmt(String(d.getFullYear())); };
  $$('[data-next-date]').forEach(function (t) {
    var d = null, full = t.getAttribute('data-full'), md = t.getAttribute('data-next-date');
    if (full) d = new Date(full + 'T00:00:00');
    else if (md) { var p = md.split('-').map(Number); d = new Date(today.getFullYear(), p[0] - 1, p[1]); if (d < today) d = new Date(today.getFullYear() + 1, p[0] - 1, p[1]); }
    if (d && !isNaN(d)) { t.textContent = fmtDate(d); t.setAttribute('datetime', d.toISOString().slice(0, 10)); }
  });

  // Group C tracker: days left and the state of the application window
  $$('[data-days-to]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-days-to') + 'T00:00:00'); if (isNaN(d)) return;
    el.textContent = fmt(Math.max(0, Math.round((d - today) / 864e5)));
  });
  $$('[data-window]').forEach(function (el) {
    var o = new Date(el.getAttribute('data-open') + 'T14:00:00'), c = new Date(el.getAttribute('data-close') + 'T23:59:59'), now = new Date();
    var k = now < o ? 'before' : (now <= c ? 'during' : 'after');
    el.classList.remove('before', 'during', 'after'); el.classList.add(k);
    var s = $('.wstate', el); if (s) s.textContent = el.getAttribute('data-' + k) || '';
  });

  // next live test: the first Sunday on or after the start date, 11 AM
  $$('[data-next-sunday]').forEach(function (el) {
    var start = el.getAttribute('data-start'), from = start ? new Date(start + 'T00:00:00') : new Date(today);
    if (isNaN(from) || from < today) from = new Date(today);
    var d = new Date(from); d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    if (d.getTime() === today.getTime() && new Date().getHours() >= 12) d.setDate(d.getDate() + 7);
    el.textContent = fmtDate(d); el.classList.remove('tba');
  });

  // sticky sign-up on phones: after the hero, never over the footer
  var sticky = $('.sticky-cta');
  if (sticky) {
    var foot = $('footer'), footIn = false;
    var upd = function () { sticky.classList.toggle('show', window.scrollY > 560 && !footIn); };
    if ('IntersectionObserver' in window && foot) new IntersectionObserver(function (es) { footIn = es[0].isIntersecting; upd(); }).observe(foot);
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  // Group C vacancy table: filter by post or department
  var vf = $('#vac-filter');
  if (vf) {
    var vrows = $$('#vac tbody tr, #vcards .vcard:not(.vtotal)'), nomatch = $('.no-match'), tfoot = $('#vac tfoot'), vtotal = $('#vcards .vtotal');
    vf.addEventListener('input', function () {
      var q = vf.value.trim().toLowerCase(), n = 0;
      vrows.forEach(function (r) { var ok = !q || (r.getAttribute('data-q') || '').indexOf(q) !== -1 || r.textContent.toLowerCase().indexOf(q) !== -1; r.hidden = !ok; if (ok) n++; });
      if (nomatch) nomatch.hidden = n > 0;
      if (tfoot) tfoot.hidden = !!q;
      if (vtotal) vtotal.hidden = !!q;
    });
  }

  // daily question
  var dd = $('#daily-data');
  if (dd) {
    var Q = JSON.parse(dd.textContent), T = JSON.parse($('#daily-text').textContent);
    var box = $('.qcard .q'), q = Q[Math.floor(Date.now() / 864e5) % Q.length], key = 'lsv-daily', st = {};
    try { st = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { st = {}; }
    var todayKey = new Date().toISOString().slice(0, 10), yKey = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    var streakEl = $('#streak'); var showStreak = function () { if (streakEl) streakEl.textContent = fmt(st.streak || 0); }; showStreak();
    var letters = 'ABCD';
    box.innerHTML = '<div class="subj">' + esc(q.subject) + '</div><div class="qt">' + esc(q.q) + '</div><div class="opts">' + q.options.map(function (o, k) { return '<button class="opt" type="button" data-k="' + k + '"><i>' + letters[k] + '</i><span>' + esc(o) + '</span></button>'; }).join('') + '</div><div class="after"></div>';
    var after = $('.after', box);
    var reveal = function (k) {
      $$('.opt', box).forEach(function (b, j) { b.disabled = true; if (j === q.answer) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); });
      var ok = k === q.answer;
      after.innerHTML = '<div class="res ' + (ok ? 'ok' : 'bad') + '">' + esc(ok ? T.correct : T.wrong) + '</div><div class="expl"><b>' + esc(T.explain) + '</b>' + esc(q.explanation) + '</div><div class="qact"><a class="btn-green" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(T.share_text + ' ' + location.href) + '">' + esc(T.share) + '</a></div><p class="note">' + esc(T.answered) + '</p>';
    };
    if (st.day === todayKey && typeof st.pick === 'number') reveal(st.pick);
    $$('.opt', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = +b.getAttribute('data-k');
        st.streak = st.day === yKey ? (st.streak || 0) + 1 : (st.day === todayKey ? (st.streak || 1) : 1);
        st.day = todayKey; st.pick = k;
        try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {}
        showStreak(); reveal(k);
      });
    });
  }
})();
