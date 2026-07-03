'use strict';

const FIELDS = 'name,flags,region,population,capital,languages,currencies,borders,cca3';
const API_URL = 'https://restcountries.com/v3.1/all?fields=' + FIELDS;

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const regionEl = document.getElementById('region');
const modalEl = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

let allCountries = [];
let byCode = {};
let lastFocused = null;

const numFmt = new Intl.NumberFormat('en-US');

function renderSkeletons(count = 12) {
  gridEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'card card--skeleton';
    li.innerHTML =
      '<span class="card__flag"></span>' +
      '<span class="card__body">' +
      '<span class="skel skel--title"></span>' +
      '<span class="skel"></span><span class="skel"></span>' +
      '</span>';
    gridEl.appendChild(li);
  }
}

function renderCards(countries) {
  gridEl.innerHTML = '';
  if (countries.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No countries match your search.';
    gridEl.appendChild(li);
    return;
  }

  const frag = document.createDocumentFragment();
  countries.forEach((c) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    btn.dataset.code = c.cca3;

    const img = document.createElement('img');
    img.className = 'card__flag';
    img.loading = 'lazy';
    img.src = c.flags?.png || c.flags?.svg || '';
    img.alt = c.flags?.alt || ('Flag of ' + c.name.common);

    const body = document.createElement('div');
    body.className = 'card__body';
    const h = document.createElement('h2');
    h.className = 'card__name';
    h.textContent = c.name.common;

    const meta = document.createElement('ul');
    meta.className = 'card__meta';
    meta.innerHTML =
      '<li>Region: <b></b></li>' +
      '<li>Population: <b></b></li>' +
      '<li>Capital: <b></b></li>';
    const bolds = meta.querySelectorAll('b');
    bolds[0].textContent = c.region || '—';
    bolds[1].textContent = numFmt.format(c.population || 0);
    bolds[2].textContent = (c.capital && c.capital[0]) || '—';

    body.append(h, meta);
    btn.append(img, body);
    li.append(btn);
    frag.append(li);
  });
  gridEl.append(frag);
}

function applyFilter() {
  const q = searchEl.value.trim().toLowerCase();
  const region = regionEl.value;
  let list = allCountries;
  if (region) list = list.filter((c) => c.region === region);
  if (q) list = list.filter((c) => c.name.common.toLowerCase().includes(q));
  renderCards(list);
}

function currenciesText(c) {
  if (!c.currencies) return '—';
  return Object.values(c.currencies)
    .map((cur) => cur.name + (cur.symbol ? ' (' + cur.symbol + ')' : ''))
    .join(', ');
}

function languagesText(c) {
  if (!c.languages) return '—';
  return Object.values(c.languages).join(', ');
}

function openDetail(code) {
  const c = byCode[code];
  if (!c) return;
  lastFocused = document.activeElement;

  const borders = (c.borders || [])
    .map((b) => byCode[b]?.name.common)
    .filter(Boolean);

  modalBody.innerHTML = '';

  const flag = document.createElement('img');
  flag.className = 'detail__flag';
  flag.src = c.flags?.png || c.flags?.svg || '';
  flag.alt = c.flags?.alt || ('Flag of ' + c.name.common);

  const name = document.createElement('h2');
  name.className = 'detail__name';
  name.id = 'modal-name';
  name.textContent = c.name.common;

  const list = document.createElement('ul');
  list.className = 'detail__list';
  const rows = [
    ['Official name', c.name.official],
    ['Region', c.region],
    ['Capital', (c.capital && c.capital.join(', ')) || '—'],
    ['Population', numFmt.format(c.population || 0)],
    ['Languages', languagesText(c)],
    ['Currencies', currenciesText(c)]
  ];
  rows.forEach(([label, value]) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = label;
    li.append(b, document.createTextNode(value || '—'));
    list.append(li);
  });

  modalBody.append(flag, name, list);

  if (borders.length) {
    const wrap = document.createElement('div');
    wrap.className = 'detail__borders';
    const h3 = document.createElement('h3');
    h3.textContent = 'Bordering countries';
    const chips = document.createElement('ul');
    chips.className = 'chips';
    borders.forEach((b) => {
      const li = document.createElement('li');
      li.className = 'chip';
      li.textContent = b;
      chips.append(li);
    });
    wrap.append(h3, chips);
    modalBody.append(wrap);
  }

  modalEl.hidden = false;
  document.body.style.overflow = 'hidden';
  modalEl.querySelector('.modal__close').focus();
}

function closeDetail() {
  modalEl.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

async function loadCountries() {
  statusEl.textContent = 'Loading countries…';
  renderSkeletons();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    byCode = {};
    allCountries.forEach((c) => { byCode[c.cca3] = c; });
    statusEl.textContent = allCountries.length + ' countries loaded.';
    applyFilter();
  } catch (err) {
    statusEl.textContent = 'Could not load countries. Please try again later.';
    gridEl.innerHTML = '<li class="empty">Something went wrong fetching data.</li>';
  }
}

gridEl.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) openDetail(card.dataset.code);
});
searchEl.addEventListener('input', applyFilter);
regionEl.addEventListener('change', applyFilter);
modalEl.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalEl.hidden) closeDetail();
});

loadCountries();
