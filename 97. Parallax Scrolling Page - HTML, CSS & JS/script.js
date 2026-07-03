(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressBar = document.querySelector('[data-progress]');
  const layers = Array.from(document.querySelectorAll('[data-parallax]'));

  let ticking = false;
  let latestScroll = window.scrollY;

  const update = () => {
    const scrollY = latestScroll;

    // Scroll progress bar (scaleX 0..1).
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? scrollY / docHeight : 0;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.min(ratio, 1)})`;
    }

    // Parallax layers move relative to the centre of the viewport.
    if (!reduceMotion) {
      const viewMid = scrollY + window.innerHeight / 2;
      layers.forEach((layer) => {
        const section = layer.closest('.scene');
        if (!section) return;
        const secMid = section.offsetTop + section.offsetHeight / 2;
        const speed = parseFloat(layer.dataset.speed) || 0.3;
        // Distance of this section's centre from the viewport centre.
        const offset = (viewMid - secMid) * (speed - 0.5);
        layer.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }

    ticking = false;
  };

  const onScroll = () => {
    latestScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Scroll-driven reveals via IntersectionObserver.
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target.classList.contains('stats')) {
              runCounters(entry.target);
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    const stats = document.querySelector('.stats');
    if (stats) setCountersInstant(stats);
  }

  // Animated counters inside the stats block.
  function runCounters(container) {
    const nums = container.querySelectorAll('[data-count]');
    nums.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (target === 0) {
        el.textContent = '0';
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(p * target).toString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function setCountersInstant(container) {
    container.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = el.dataset.count;
    });
  }
})();
