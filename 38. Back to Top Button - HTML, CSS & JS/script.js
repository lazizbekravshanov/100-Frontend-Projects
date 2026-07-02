const button = document.getElementById('toTop');
const progress = document.getElementById('progress');
const prose = document.getElementById('prose');

const CIRCUMFERENCE = 2 * Math.PI * 20; // r = 20

/* ---------- Build real article content ---------- */
const article = [
  {
    h: 'Why a threshold matters',
    p: [
      'A back-to-top control should stay out of the way until it earns its place on screen. Show it too early and it clutters the first view; show it too late and it arrives after the reader already wanted it.',
      'The reliable trigger is a fraction of the viewport height. Once the page has scrolled past roughly one screen, the reader is committed to the content and a shortcut home becomes genuinely useful.',
    ],
  },
  {
    h: 'Feedback the reader can feel',
    p: [
      'A plain button works, but a progress ring turns the control into a quiet map of the whole document. As the ring fills, the reader gets an ambient sense of how much remains without a heavy scrollbar competing for attention.',
      'Keep the motion subtle. A short fade and a small lift are enough to signal that the button is interactive, and they never distract from the words on the page.',
    ],
    quote: 'Good affordances whisper. They tell you what is possible without shouting for a click.',
  },
  {
    h: 'Respecting the reader',
    p: [
      'Smooth scrolling is a pleasant default, but it is not universal. People who enable reduced-motion preferences deserve an instant jump instead of a long glide, and honoring that request is a single media query away.',
      'Accessibility is not an add-on here. The control is a real button, reachable by keyboard, labelled for screen readers, and hidden from the tab order until it is actually on screen.',
    ],
  },
  {
    h: 'Keeping it cheap',
    p: [
      'Scroll handlers run often, so they must stay light. Reading the scroll position and updating one CSS value is inexpensive, and marking the listener as passive lets the browser keep scrolling buttery smooth.',
      'That restraint is what lets a small flourish like a progress ring feel effortless. The interaction stays responsive because every frame does almost nothing.',
    ],
  },
  {
    h: 'The last stretch',
    p: [
      'By the time the ring is nearly full, the reader has travelled the whole article. The button now offers a single, satisfying tap back to the beginning, closing the loop on the journey down the page.',
      'Small components like this rarely get headlines, yet they shape how a page feels. Sweat the details and the whole experience reads as considered.',
    ],
  },
];

const html = article
  .map((section) => {
    const paras = section.p.map((text) => `<p>${text}</p>`).join('');
    const quote = section.quote
      ? `<blockquote>${section.quote}</blockquote>`
      : '';
    return `<h2>${section.h}</h2>${paras}${quote}`;
  })
  .join('');

prose.innerHTML = html;

/* ---------- Scroll behavior ---------- */
const update = () => {
  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

  progress.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - ratio)}`;

  const shouldShow = scrollTop > window.innerHeight * 0.6;
  button.hidden = false;
  button.dataset.visible = shouldShow ? 'true' : 'false';
};

update();
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update, { passive: true });

button.addEventListener('click', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
});
