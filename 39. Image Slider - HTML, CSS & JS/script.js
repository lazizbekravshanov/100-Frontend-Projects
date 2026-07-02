const slider = document.getElementById('slider');
const track = document.getElementById('track');
const dotsWrap = document.getElementById('dots');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const AUTOPLAY_MS = 4500;

const slides = [
  {
    title: 'Aurora',
    caption: 'Cool teal and violet folding into a northern night.',
    from: '#0f766e',
    to: '#4338ca',
  },
  {
    title: 'Ember',
    caption: 'Warm amber bleeding into a deep rose horizon.',
    from: '#b45309',
    to: '#be123c',
  },
  {
    title: 'Tide',
    caption: 'Calm blues layered like water at first light.',
    from: '#0369a1',
    to: '#155e75',
  },
  {
    title: 'Bloom',
    caption: 'Soft magenta drifting toward a plum dusk.',
    from: '#db2777',
    to: '#6d28d9',
  },
  {
    title: 'Meadow',
    caption: 'Fresh greens rolling into a golden field.',
    from: '#15803d',
    to: '#a16207',
  },
];

const artSvg = (from, to, i) => `
  <svg class="slide__art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#g${i})"/>
    <circle cx="${60 + i * 30}" cy="60" r="70" fill="#ffffff" opacity="0.08"/>
    <circle cx="${250 - i * 20}" cy="130" r="50" fill="#000000" opacity="0.10"/>
  </svg>`;

let current = 0;
let timer = null;

/* ---------- Build slides ---------- */
slides.forEach((slide, i) => {
  const li = document.createElement('li');
  li.className = 'slide';
  li.setAttribute('role', 'group');
  li.setAttribute('aria-roledescription', 'slide');
  li.setAttribute('aria-label', `${i + 1} of ${slides.length}: ${slide.title}`);
  li.innerHTML = `
    ${artSvg(slide.from, slide.to, i)}
    <div class="slide__content">
      <p class="slide__index">Slide ${i + 1} / ${slides.length}</p>
      <h2 class="slide__title">${slide.title}</h2>
      <p class="slide__caption">${slide.caption}</p>
    </div>`;
  track.appendChild(li);

  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.type = 'button';
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

const dots = Array.from(dotsWrap.children);

/* ---------- Navigation ---------- */
function render() {
  track.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((dot, i) =>
    dot.setAttribute('aria-selected', i === current ? 'true' : 'false')
  );
}

function goTo(index) {
  current = (index + slides.length) % slides.length;
  render();
}

const next = () => goTo(current + 1);
const prev = () => goTo(current - 1);

nextBtn.addEventListener('click', () => {
  next();
  restart();
});
prevBtn.addEventListener('click', () => {
  prev();
  restart();
});

dots.forEach((dot) => dot.addEventListener('click', restart));

/* ---------- Keyboard ---------- */
slider.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    next();
    restart();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
    restart();
  }
});

/* ---------- Autoplay (pauses on hover / focus) ---------- */
function start() {
  stop();
  timer = window.setInterval(next, AUTOPLAY_MS);
}

function stop() {
  if (timer) window.clearInterval(timer);
  timer = null;
}

function restart() {
  if (timer) start();
}

slider.addEventListener('mouseenter', stop);
slider.addEventListener('mouseleave', start);
slider.addEventListener('focusin', stop);
slider.addEventListener('focusout', start);

document.addEventListener('visibilitychange', () => {
  document.hidden ? stop() : start();
});

render();
start();
