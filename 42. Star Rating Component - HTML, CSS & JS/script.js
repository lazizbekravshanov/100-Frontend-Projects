const STAR_COUNT = 5;

const STAR_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z"/>
  </svg>`;

function buildStars(root) {
  const stars = root.querySelector('[data-stars]');
  const frag = document.createDocumentFragment();

  for (let i = 1; i <= STAR_COUNT; i++) {
    const star = document.createElement('span');
    star.className = 'star star--empty';
    star.dataset.index = String(i);
    star.innerHTML = `<span class="star__bg">${STAR_SVG}</span><span class="star__fill">${STAR_SVG}</span>`;
    frag.appendChild(star);
  }
  stars.appendChild(frag);
  return Array.from(stars.children);
}

function paint(starEls, value) {
  starEls.forEach((el, i) => {
    const position = i + 1;
    el.classList.remove('star--empty', 'star--half');
    if (value >= position) {
      // fully filled
    } else if (value >= position - 0.5) {
      el.classList.add('star--half');
    } else {
      el.classList.add('star--empty');
    }
  });
}

function labelFor(value) {
  if (value === 0) return 'No rating';
  const suffix = value === 1 ? 'star' : 'stars';
  return `${value} ${suffix} out of 5`;
}

function initInteractive(root) {
  const starEls = buildStars(root);
  const valueEl = root.parentElement.querySelector('[data-value]');
  let current = 0;

  function setValue(value) {
    current = Math.max(0, Math.min(STAR_COUNT, value));
    paint(starEls, current);
    root.setAttribute('aria-valuenow', String(current));
    root.setAttribute('aria-valuetext', labelFor(current));
    valueEl.textContent = current === 0 ? 'Not rated yet' : labelFor(current);
  }

  function valueFromEvent(el, event) {
    const index = Number(el.dataset.index);
    const rect = el.getBoundingClientRect();
    const isHalf = (event.clientX - rect.left) < rect.width / 2;
    return isHalf ? index - 0.5 : index;
  }

  starEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => paint(starEls, valueFromEvent(el, e)));
    el.addEventListener('click', (e) => setValue(valueFromEvent(el, e)));
  });

  root.addEventListener('mouseleave', () => paint(starEls, current));

  root.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.5 : 1;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setValue(current + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setValue(current - step);
        break;
      case 'Home':
        e.preventDefault();
        setValue(0);
        break;
      case 'End':
        e.preventDefault();
        setValue(STAR_COUNT);
        break;
      default:
        if (e.key >= '0' && e.key <= '5') {
          e.preventDefault();
          setValue(Number(e.key));
        }
    }
  });

  setValue(0);
}

function initReadonly(root) {
  const starEls = buildStars(root);
  const value = parseFloat(root.dataset.initial) || 0;
  paint(starEls, value);
}

document.querySelectorAll('[data-rating]').forEach((root) => {
  if (root.hasAttribute('data-readonly')) {
    initReadonly(root);
  } else {
    initInteractive(root);
  }
});
