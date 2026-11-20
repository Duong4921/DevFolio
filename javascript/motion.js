(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ------------------------------------------------------------------
     Thanh tien do cuon + parallax nhe cho anh bia
  ------------------------------------------------------------------ */
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  const cover = $('.hero-cover');

  /* ------------------------------------------------------------------
     Spotlight bam theo con tro tren card
  ------------------------------------------------------------------ */
  $$('.skill-card, .qa-card').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ------------------------------------------------------------------
     He thong SLIDE: moi phan cua trang la mot slide co intro / outro
       before  -> chua toi luot (an, nam duoi)
       current -> dang xem (intro: truot len + hien)
       after   -> da di qua (outro: truot len + mo di)
  ------------------------------------------------------------------ */
  let slides = [];
  let cur = 0;
  let started = false;

  // Vi tri tuyet doi, khong bi anh huong boi transform cua phan tu
  const docTop = (el) => {
    let y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  };

  const buildSlides = () => {
    const list = [];
    const add = (items) => {
      items = items.filter(Boolean);
      if (items.length) list.push({ items, state: null });
    };

    add([$('#hero .hero-title'), $('#hero .hero-cta'), $('#hero .hero-avatar-container')]);
    add([$('#skills .section-title'), $('#skills .skills-wrapper')]);
    add([$('#projects .section-title'), $('.portfolio-tab-nav')]);
    if (list.length) list[list.length - 1].pair = true; // tieu de + tab di cung slide ke tiep

    const pane = $('.portfolio-tab-content.active');
    if (pane) {
      const rows = $$('.project-row', pane);
      if (rows.length) {
        rows.forEach((row) => add([$('.project-info', row), $('.project-media', row)]));
      } else {
        add([$('.section-subtitle', pane), $('.qa-grid', pane)]);
      }
    }
    add([$('.footer > .container')]);

    list.forEach((s) => {
      s.items.forEach((el, i) => {
        if (!reduce) el.classList.add('sl');
        el.style.setProperty('--si', i);
        el.dataset.sl = 'before';
      });
    });
    slides = list;
    cur = Math.min(cur, slides.length - 1);
  };

  const geometry = (s) => {
    let top = Infinity;
    let bottom = -Infinity;
    s.items.forEach((el) => {
      const t = docTop(el);
      top = Math.min(top, t);
      bottom = Math.max(bottom, t + el.offsetHeight);
    });
    return { top, bottom };
  };

  const computeCurrent = () => {
    if (!slides.length) return 0;
    const vh = window.innerHeight;
    const maxScroll = root.scrollHeight - vh;
    if (window.scrollY >= maxScroll - 4 && maxScroll > 0) return slides.length - 1;
    const line = window.scrollY + vh * 0.5;
    let best = 0;
    let bestD = Infinity;
    slides.forEach((s, i) => {
      const g = geometry(s);
      const d = line < g.top ? g.top - line : line > g.bottom ? line - g.bottom : 0;
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };

  const makeBtn = (cls, html, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    document.body.appendChild(b);
    return b;
  };
  const hint = makeBtn('next-slide-btn is-hidden',
    '<span>Cuộn xuống</span><i class="fa-solid fa-chevron-down"></i>', 'Xuống slide tiếp theo');
  const backBtn = makeBtn('prev-slide-btn is-hidden',
    '<i class="fa-solid fa-chevron-up"></i><span>Cuộn lên</span>', 'Lên slide trước');

  // Chi hien nut khi con cuon duoc theo huong do
  const renderHint = () => {
    const maxScroll = root.scrollHeight - window.innerHeight;
    const atBottom = maxScroll > 0 && window.scrollY >= maxScroll - 4;
    const canDown = cur < slides.length - 1 && !atBottom;
    const canUp = cur > 0 || window.scrollY > 40;
    hint.classList.toggle('is-hidden', !canDown);
    backBtn.classList.toggle('is-hidden', !canUp);
    hint.tabIndex = canDown ? 0 : -1;
    backBtn.tabIndex = canUp ? 0 : -1;
  };

  const applyStates = () => {
    slides.forEach((s, i) => {
      let st = i < cur ? 'after' : i === cur ? 'current' : 'before';
      // Slide tieu de + tab hien cung luc voi slide du an dau tien
      if (s.pair && cur === i + 1) st = 'current';
      if (i > 0 && slides[i - 1].pair && cur === i - 1) st = 'current';
      if (s.state === st) return;
      s.state = st;
      if (!reduce) s.items.forEach((el) => { el.dataset.sl = st; });
    });
  };

  const update = () => {
    if (!started) return;
    cur = computeCurrent();
    applyStates();
    renderHint();
  };

  const goTo = (i) => {
    const s = slides[i];
    if (!s) return;
    const g = geometry(s);
    const vh = window.innerHeight;
    const h = g.bottom - g.top;
    let y = h < vh ? g.top - (vh - h) / 2 : g.top - 40;
    y = Math.max(0, Math.min(y, root.scrollHeight - vh));
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };

  hint.addEventListener('click', () => {
    if (cur < slides.length - 1) goTo(cur + 1);
  });
  backBtn.addEventListener('click', () => {
    if (cur === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else goTo(cur - 1);
  });

  // main.js goi ham nay khi bam nut hero "Dev Projects" / "QA & Playtest"
  window.SlideNav = {
    goToProjects() {
      const i = slides.findIndex((s) => s.pair);
      if (i < 0) return false;
      goTo(i);
      return true;
    },
  };

  /* ------------------------------------------------------------------
     Scroll handler (rAF) + rebuild khi doi tab / mo rong du an
  ------------------------------------------------------------------ */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (cover && !reduce && window.scrollY < window.innerHeight * 1.2) {
        cover.style.transform = `translate3d(0, ${window.scrollY * 0.06}px, 0)`;
      }
      update();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  let rebuildTimer = null;
  const rebuild = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      buildSlides();
      applyStates();
      update();
    }, 60);
  };
  const mo = new MutationObserver(rebuild);
  $$('.portfolio-tab-content').forEach((p) => mo.observe(p, { attributes: true, attributeFilter: ['class'] }));
  $$('.project-expand-btn').forEach((b) => b.addEventListener('click', () => setTimeout(onScroll, 450)));

  /* ------------------------------------------------------------------
     Khoi dong: man che intro -> hero vao cuoc
  ------------------------------------------------------------------ */
  buildSlides();
  void root.offsetHeight; // chot trang thai "before" truoc khi go bo lop an ban dau
  root.classList.add('sl-ready');
  renderHint();
  onScroll();

  const curtain = $('#intro-curtain');
  // Nguoi dung cham vao trang thi huy cu cuon tu dong cua intro
  let userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) => {
    window.addEventListener(ev, () => { userMoved = true; }, { once: true, passive: true });
  });

  // Cuon cham, easing mem (smooth scroll mac dinh cua trinh duyet qua nhanh)
  const animateScrollTo = (y, dur) => {
    const from = window.scrollY;
    const dist = y - from;
    const t0 = performance.now();
    root.style.scrollBehavior = 'auto';
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, from + dist * e);
      if (p < 1 && !userMoved) requestAnimationFrame(step);
      else root.style.scrollBehavior = '';
    };
    requestAnimationFrame(step);
  };

  // Sau intro: tu cuon xuong de dong "Hi, I'm ... Unity Developer." nam giua man hinh
  const focusHeroText = () => {
    const t = $('#hero .hero-title');
    const c = $('#hero .hero-cta');
    if (!t || reduce || userMoved || window.scrollY > 40) return;
    const top = docTop(t);
    const bottom = c ? docTop(c) + c.offsetHeight : top + t.offsetHeight;
    const y = Math.max(0, top - (window.innerHeight - (bottom - top)) / 2);
    if (y > 20) animateScrollTo(y, 1800);
  };

  const begin = () => {
    started = true;
    update();
    setTimeout(focusHeroText, 1600);
  };
  if (curtain && !reduce) {
    setTimeout(() => {
      curtain.classList.add('lift');
      setTimeout(begin, 700);
      setTimeout(() => curtain.remove(), 1700);
    }, 3200);
  } else {
    if (curtain) curtain.remove();
    begin();
  }
})();
