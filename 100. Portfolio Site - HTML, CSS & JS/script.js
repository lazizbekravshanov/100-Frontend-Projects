(() => {
  'use strict';

  const THEME_KEY = 'portfolio-theme';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Theme toggle ---- */
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Switch to light theme');
    } else {
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.setAttribute('aria-label', 'Switch to dark theme');
    }
  };

  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const next = root.hasAttribute('data-theme') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---- Nav border on scroll ---- */
  const nav = document.querySelector('[data-nav]');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Scroll reveal ---- */
  const animated = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    animated.forEach((el) => io.observe(el));
  } else {
    animated.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Active nav link (scroll spy) ---- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__menu a');
  const linkById = new Map();
  navLinks.forEach((link) => linkById.set(link.getAttribute('href').slice(1), link));

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            const active = linkById.get(entry.target.id);
            if (active) active.classList.add('is-active');
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -60% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---- Contact form validation ---- */
  const form = document.querySelector('[data-form]');
  const success = document.querySelector('[data-success]');

  const validators = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? ''
        : 'Please enter a valid email address.',
    message: (v) =>
      v.trim().length >= 10 ? '' : 'A little more detail, please (10+ characters).'
  };

  const showError = (field, message) => {
    const wrap = field.closest('.field');
    const errorEl = form.querySelector(`[data-error-for="${field.name}"]`);
    wrap.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message;
    return !message;
  };

  const validateField = (field) => {
    const validate = validators[field.name];
    if (!validate) return true;
    return showError(field, validate(field.value));
  };

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    let firstInvalid = null;
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      const ok = validateField(field);
      if (!ok && !firstInvalid) firstInvalid = field;
      valid = valid && ok;
    });

    if (!valid) {
      success.hidden = true;
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    success.hidden = false;
    form.reset();
    Object.keys(validators).forEach((name) => {
      form.elements[name].closest('.field').classList.remove('has-error');
    });
  });
})();
