(() => {
  'use strict';

  const cursor = document.querySelector('[data-cursor]');
  const dot = document.querySelector('[data-cursor-dot]');
  const ring = document.querySelector('[data-cursor-ring]');
  const ringLabel = ring;

  // Detect a real pointer device. Touch / coarse pointers keep the native cursor.
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!finePointer || !cursor) {
    return;
  }

  document.body.classList.add('cursor-active');

  // Target position (raw pointer) and rendered position (eased) for the ring.
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pointer.x, y: pointer.y };
  const EASE = 0.18;

  const setPos = (el, x, y) => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };

  window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // The dot tracks the pointer exactly.
    setPos(dot, pointer.x, pointer.y);
    if (reduceMotion) {
      setPos(ring, pointer.x, pointer.y);
    }
  });

  // Show cursor once it enters, hide when the mouse leaves the window.
  document.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));
  document.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));

  // Press feedback.
  window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

  // Eased trailing ring via rAF (skipped when reduced motion is requested).
  const render = () => {
    ringPos.x += (pointer.x - ringPos.x) * EASE;
    ringPos.y += (pointer.y - ringPos.y) * EASE;
    setPos(ring, ringPos.x, ringPos.y);
    requestAnimationFrame(render);
  };

  if (!reduceMotion) {
    requestAnimationFrame(render);
  }

  // Hover state over interactive elements.
  const hoverTargets = document.querySelectorAll(
    'a, button, [data-cursor-label]'
  );

  hoverTargets.forEach((el) => {
    const label = el.getAttribute('data-cursor-label');
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hover');
      if (label) {
        cursor.classList.add('is-label');
        ringLabel.setAttribute('data-label', label);
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hover', 'is-label');
      ringLabel.removeAttribute('data-label');
    });
  });

  // Magnetic targets: gently pull the element toward the pointer.
  const magnets = document.querySelectorAll('[data-magnetic]');
  const STRENGTH = 0.35;

  magnets.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      if (reduceMotion) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${relX * STRENGTH}px, ${relY * STRENGTH}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();
