'use strict';

const LIST_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151';
const BATCH_SIZE = 12;
const STAT_MAX = 200; // reasonable cap for base-stat bars

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const typeEl = document.getElementById('type');
const modalEl = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

let allPokemon = [];
let lastFocused = null;

function pad(n) { return '#' + String(n).padStart(3, '0'); }

function typeColor(type) { return 'var(--t-' + type + ')'; }

function renderSkeletons(count = 24) {
  gridEl.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'card card--skeleton';
    li.innerHTML =
      '<span class="card__id skel"></span>' +
      '<span class="card__sprite"></span>' +
      '<span class="skel"></span>';
    gridEl.appendChild(li);
  }
}

function typeBadges(types) {
  return types
    .map((t) => `<span class="type" style="background:${typeColor(t)}">${t}</span>`)
    .join('');
}

function renderCards(list) {
  gridEl.innerHTML = '';
  if (list.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No Pokemon match your filters.';
    gridEl.appendChild(li);
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach((p) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    btn.dataset.id = String(p.id);

    const id = document.createElement('span');
    id.className = 'card__id';
    id.textContent = pad(p.id);

    const img = document.createElement('img');
    img.className = 'card__sprite';
    img.loading = 'lazy';
    img.width = 96; img.height = 96;
    img.alt = p.name;
    if (p.sprite) img.src = p.sprite;

    const name = document.createElement('span');
    name.className = 'card__name';
    name.textContent = p.name;

    const types = document.createElement('span');
    types.className = 'types';
    types.innerHTML = typeBadges(p.types);

    btn.append(id, img, name, types);
    li.append(btn);
    frag.append(li);
  });
  gridEl.append(frag);
}

function populateTypeFilter() {
  const set = new Set();
  allPokemon.forEach((p) => p.types.forEach((t) => set.add(t)));
  [...set].sort().forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    typeEl.appendChild(opt);
  });
}

function applyFilter() {
  const q = searchEl.value.trim().toLowerCase();
  const type = typeEl.value;
  let list = allPokemon;
  if (type) list = list.filter((p) => p.types.includes(type));
  if (q) {
    list = list.filter(
      (p) => p.name.includes(q) || String(p.id).includes(q) || pad(p.id).includes(q)
    );
  }
  renderCards(list);
}

function openDetail(id) {
  const p = allPokemon.find((x) => x.id === id);
  if (!p) return;
  lastFocused = document.activeElement;

  const statsHtml = p.stats
    .map((s) => {
      const pct = Math.min(100, Math.round((s.value / STAT_MAX) * 100));
      return (
        '<div class="stat">' +
        `<span class="stat__label">${s.name}</span>` +
        `<span class="stat__val">${s.value}</span>` +
        `<span class="stat__bar"><span class="stat__fill" style="width:${pct}%"></span></span>` +
        '</div>'
      );
    })
    .join('');

  modalBody.innerHTML =
    '<div class="detail__head">' +
    `<img class="detail__sprite" src="${p.spriteLarge || p.sprite}" alt="${p.name}" width="140" height="140">` +
    `<p class="detail__id">${pad(p.id)}</p>` +
    `<h2 class="detail__name" id="modal-name">${p.name}</h2>` +
    `<div class="types">${typeBadges(p.types)}</div>` +
    '</div>' +
    '<div class="detail__facts">' +
    `<span>Height <b>${(p.height / 10).toFixed(1)} m</b></span>` +
    `<span>Weight <b>${(p.weight / 10).toFixed(1)} kg</b></span>` +
    '</div>' +
    '<div class="stats"><h3>Base stats</h3>' + statsHtml + '</div>';

  modalEl.hidden = false;
  document.body.style.overflow = 'hidden';
  modalEl.querySelector('.modal__close').focus();
}

function closeDetail() {
  modalEl.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

async function fetchDetail(entry) {
  const res = await fetch(entry.url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const d = await res.json();
  return {
    id: d.id,
    name: d.name,
    sprite: d.sprites.front_default,
    spriteLarge:
      d.sprites.other?.['official-artwork']?.front_default || d.sprites.front_default,
    types: d.types.map((t) => t.type.name),
    height: d.height,
    weight: d.weight,
    stats: d.stats.map((s) => ({
      name: s.stat.name.replace('special-', 'sp. ').replace('-', ' '),
      value: s.base_stat
    }))
  };
}

async function loadPokedex() {
  statusEl.textContent = 'Loading Pokedex…';
  renderSkeletons();

  try {
    const res = await fetch(LIST_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { results } = await res.json();

    // Fetch details on demand, in batches, so we can show types and stats.
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      const detailed = await Promise.all(batch.map(fetchDetail));
      allPokemon.push(...detailed);
      statusEl.textContent = `Loaded ${allPokemon.length} of ${results.length}…`;
      renderCards(allPokemon);
    }

    allPokemon.sort((a, b) => a.id - b.id);
    populateTypeFilter();
    statusEl.textContent = allPokemon.length + ' Pokemon loaded.';
    applyFilter();
  } catch (err) {
    statusEl.textContent = 'Could not load the Pokedex. Please try again later.';
    if (allPokemon.length === 0) {
      gridEl.innerHTML = '<li class="empty">Something went wrong fetching data.</li>';
    }
  }
}

gridEl.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) openDetail(Number(card.dataset.id));
});
searchEl.addEventListener('input', applyFilter);
typeEl.addEventListener('change', applyFilter);
modalEl.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalEl.hidden) closeDetail();
});

loadPokedex();
