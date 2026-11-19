(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Thanh tiến độ cuộn + parallax nhẹ cho ảnh bìa
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  const cover = document.querySelector('.hero-cover');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (cover && !reduce && window.scrollY < window.innerHeight * 1.2) {
        cover.style.transform = `translate3d(0, ${window.scrollY * 0.06}px, 0)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal lần lượt khi cuộn tới
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.skill-card, .qa-card').forEach((el, i) => {
    el.classList.add('rv');
    el.style.setProperty('--i', el.matches('.qa-card') ? [...el.parentElement.children].indexOf(el) : i);
    io.observe(el);
  });
  document.querySelectorAll('.section-title').forEach((el) => io.observe(el));

  // Spotlight bám theo con trỏ
  document.querySelectorAll('.skill-card, .qa-card').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
