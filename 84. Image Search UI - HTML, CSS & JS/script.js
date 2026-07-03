'use strict';

/*
 * Approach note:
 * Lorem Picsum serves RANDOM images and has no keyword search endpoint.
 * To fake a "search" experience we build deterministic, seeded URLs of the
 * form https://picsum.photos/seed/{seed}/{w}/{h}. The seed is derived from
 * the search term (or category) plus an index, so the same keyword always
 * returns the same, stable set of images — giving the feel of a real gallery.
 * Varying heights create a masonry layout; there is no auth or API key.
 */

const CATEGORIES = ['Nature', 'City', 'Ocean', 'Mountains', 'Food', 'People', 'Tech', 'Abstract'];
const HEIGHTS = [520, 380, 460, 340, 600, 420]; // rotated for masonry variety
const COUNT = 12;

const galleryEl = document.getElementById('gallery');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const goBtn = document.getElementById('go');
const catsEl = document.getElementById('categories');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCap = document.getElementById('lightbox-cap');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentImages = [];
let activeIndex = 0;
let lastFocused = null;

function slug(term) {
  return term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
}

function buildImages(term) {
  const base = slug(term);
  const images = [];
  for (let i = 0; i < COUNT; i++) {
    const h = HEIGHTS[i % HEIGHTS.length];
    const seed = base + '-' + (i + 1);
    images.push({
      thumb: `https://picsum.photos/seed/${seed}/500/${h}`,
      full: `https://picsum.photos/seed/${seed}/1200/${Math.round(h * 1.6)}`,
      caption: term.charAt(0).toUpperCase() + term.slice(1) + ' · ' + (i + 1)
    });
  }
  return images;
}

function renderCategories() {
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat';
    btn.textContent = cat;
    btn.dataset.term = cat;
    btn.setAttribute('aria-pressed', 'false');
    catsEl.appendChild(btn);
  });
}

function setActiveCategory(term) {
  catsEl.querySelectorAll('.cat').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.term.toLowerCase() === term.toLowerCase()));
  });
}

function renderGallery(term) {
  currentImages = buildImages(term);
  galleryEl.innerHTML = '';
  statusEl.textContent = `Showing ${currentImages.length} images for “${term}”.`;

  currentImages.forEach((img, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile is-loading';
    btn.dataset.index = String(i);
    btn.setAttribute('aria-label', 'View image: ' + img.caption);

    const el = document.createElement('img');
    el.loading = 'lazy';
    el.alt = img.caption;
    el.src = img.thumb;
    el.addEventListener('load', () => btn.classList.remove('is-loading'));
    el.addEventListener('error', () => {
      btn.classList.remove('is-loading');
      statusEl.textContent = 'Some images failed to load. Check your connection.';
    });

    const cap = document.createElement('span');
    cap.className = 'tile__cap';
    cap.textContent = img.caption;

    btn.append(el, cap);
    galleryEl.appendChild(btn);
  });
}

function openLightbox(index) {
  activeIndex = index;
  lastFocused = document.activeElement;
  updateLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  nextBtn.focus();
}

function updateLightbox() {
  const img = currentImages[activeIndex];
  lightboxImg.src = img.full;
  lightboxImg.alt = img.caption;
  lightboxCap.textContent = img.caption;
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

function step(delta) {
  activeIndex = (activeIndex + delta + currentImages.length) % currentImages.length;
  updateLightbox();
}

// Events
goBtn.addEventListener('click', () => {
  const term = searchEl.value.trim();
  if (!term) return;
  setActiveCategory('');
  renderGallery(term);
});

searchEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') goBtn.click();
});

catsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat');
  if (!btn) return;
  searchEl.value = '';
  setActiveCategory(btn.dataset.term);
  renderGallery(btn.dataset.term);
});

galleryEl.addEventListener('click', (e) => {
  const tile = e.target.closest('.tile');
  if (tile) openLightbox(Number(tile.dataset.index));
});

prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));
lightbox.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key === 'ArrowLeft') step(-1);
});

// Init
renderCategories();
setActiveCategory('Nature');
renderGallery('Nature');
