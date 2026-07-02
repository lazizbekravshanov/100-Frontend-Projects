const navbar = document.getElementById('navbar');
const links = Array.from(document.querySelectorAll('[data-nav]'));
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

/* ---------- Shrink navbar on scroll ---------- */
const setScrolled = () => {
  navbar.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false';
};
setScrolled();
window.addEventListener('scroll', setScrolled, { passive: true });

/* ---------- Scroll spy ---------- */
const linkFor = (id) =>
  links.find((link) => link.getAttribute('href') === `#${id}`);

const setActive = (id) => {
  links.forEach((link) => link.classList.remove('is-active'));
  const active = linkFor(id);
  if (active) active.classList.add('is-active');
};

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  },
  {
    rootMargin: '-45% 0px -45% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
  }
);

sections.forEach((section) => observer.observe(section));

/* ---------- Move focus to the section on link activation ---------- */
links.forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    // Let the smooth scroll happen, then hand keyboard focus to the section.
    window.setTimeout(() => target.focus({ preventScroll: true }), 500);
  });
});
