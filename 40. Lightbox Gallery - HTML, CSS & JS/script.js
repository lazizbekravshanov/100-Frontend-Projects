const grid = document.getElementById('grid');
const lightbox = document.getElementById('lightbox');
const stage = document.getElementById('stage');
const caption = document.getElementById('caption');
const counter = document.getElementById('counter');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('lbPrev');
const nextBtn = document.getElementById('lbNext');

const items = [
  { title: 'Coastline', from: '#0ea5e9', to: '#1e3a8a', shape: 'waves' },
  { title: 'Canyon', from: '#f97316', to: '#7c2d12', shape: 'peaks' },
  { title: 'Orchard', from: '#22c55e', to: '#14532d', shape: 'dots' },
  { title: 'Dusk', from: '#a855f7', to: '#4c1d95', shape: 'peaks' },
  { title: 'Harbor', from: '#14b8a6', to: '#134e4a', shape: 'waves' },
  { title: 'Sandstone', from: '#eab308', to: '#78350f', shape: 'dots' },
  { title: 'Glacier', from: '#38bdf8', to: '#0c4a6e', shape: 'peaks' },
  { title: 'Rosewood', from: '#f43f5e', to: '#881337', shape: 'waves' },
];

const shapeMarkup = (shape, id) => {
  if (shape === 'waves') {
    return `
      <path d="M0 120 Q75 90 150 120 T300 120 V225 H0 Z" fill="#ffffff" opacity="0.14"/>
      <path d="M0 150 Q75 120 150 150 T300 150 V225 H0 Z" fill="#000000" opacity="0.12"/>`;
  }
  if (shape === 'peaks') {
    return `
      <path d="M0 225 L90 90 L160 160 L230 70 L300 225 Z" fill="#ffffff" opacity="0.14"/>
      <path d="M0 225 L120 140 L200 190 L300 130 L300 225 Z" fill="#000000" opacity="0.12"/>`;
  }
  return `
    <circle cx="80" cy="80" r="46" fill="#ffffff" opacity="0.14"/>
    <circle cx="210" cy="150" r="60" fill="#000000" opacity="0.12"/>
    <circle cx="230" cy="60" r="28" fill="#ffffff" opacity="0.12"/>`;
};

const svgFor = (item, i) => `
  <svg viewBox="0 0 300 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${item.title}">
    <defs>
      <linearGradient id="lb${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${item.from}"/>
        <stop offset="1" stop-color="${item.to}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="225" fill="url(#lb${i})"/>
    ${shapeMarkup(item.shape, i)}
  </svg>`;

let index = 0;
let lastFocused = null;

/* ---------- Build the grid ---------- */
items.forEach((item, i) => {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tile';
  button.setAttribute('aria-label', `Open ${item.title}`);
  button.innerHTML = `${svgFor(item, i)}<span class="tile__label">${item.title}</span>`;
  button.addEventListener('click', () => open(i));
  li.appendChild(button);
  grid.appendChild(li);
});

/* ---------- Lightbox controls ---------- */
function show(i) {
  index = (i + items.length) % items.length;
  const item = items[index];
  stage.innerHTML = svgFor(item, `full${index}`);
  caption.textContent = item.title;
  counter.textContent = `${index + 1} / ${items.length}`;
}

function open(i) {
  lastFocused = document.activeElement;
  show(i);
  lightbox.hidden = false;
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => (lightbox.dataset.open = 'true'));
  closeBtn.focus();
}

function close() {
  lightbox.dataset.open = 'false';
  document.body.classList.remove('is-locked');
  const finish = () => {
    lightbox.hidden = true;
    lightbox.removeEventListener('transitionend', finish);
    if (lastFocused) lastFocused.focus();
  };
  lightbox.addEventListener('transitionend', finish);
  // Fallback in case the transition does not fire.
  window.setTimeout(() => {
    if (!lightbox.hidden && lightbox.dataset.open === 'false') finish();
  }, 260);
}

const next = () => show(index + 1);
const prev = () => show(index - 1);

nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
closeBtn.addEventListener('click', close);

/* Close on backdrop click (but not when clicking the figure or a button). */
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) close();
});

/* ---------- Keyboard support + focus trap ---------- */
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;

  if (e.key === 'Escape') {
    close();
  } else if (e.key === 'ArrowRight') {
    next();
  } else if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key === 'Tab') {
    const focusable = [prevBtn, nextBtn, closeBtn];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
