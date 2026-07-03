// NOTE: No reliable free, no-auth movie API exists (TMDB/OMDb both require keys),
// so this UI runs on a local mock dataset. Posters are drawn with CSS gradients
// rather than external images. Swap MOVIES for a real API response to go live.
const MOVIES = [
  { id: 1, title: 'Neon Skyline', year: 2021, genre: 'Sci-Fi', rating: 8.4, poster: 'linear-gradient(150deg, #1e3a8a, #7c3aed)', synopsis: 'In a rain-soaked megacity, a courier discovers a memory she was never meant to keep and must outrun the corporation that wants it back.' },
  { id: 2, title: 'The Quiet Coast', year: 2019, genre: 'Drama', rating: 7.9, poster: 'linear-gradient(150deg, #0f766e, #155e75)', synopsis: 'Two estranged siblings reunite at their late father’s seaside cottage and spend one summer sorting through what was left unsaid.' },
  { id: 3, title: 'Paper Lanterns', year: 2022, genre: 'Romance', rating: 7.5, poster: 'linear-gradient(150deg, #be123c, #db2777)', synopsis: 'A pastry chef and a festival organizer keep crossing paths across a single unforgettable week in Kyoto.' },
  { id: 4, title: 'Deadline City', year: 2018, genre: 'Thriller', rating: 8.1, poster: 'linear-gradient(150deg, #7f1d1d, #b45309)', synopsis: 'An investigative reporter has twelve hours to prove a senator’s alibi is a lie before the presses roll.' },
  { id: 5, title: 'Orbit', year: 2023, genre: 'Sci-Fi', rating: 8.8, poster: 'linear-gradient(150deg, #0c4a6e, #0891b2)', synopsis: 'The lone caretaker of a decommissioned space station receives a signal that should be impossible — and it is getting closer.' },
  { id: 6, title: 'Backroad Comedy Hour', year: 2020, genre: 'Comedy', rating: 6.9, poster: 'linear-gradient(150deg, #ca8a04, #ea580c)', synopsis: 'A failing radio duo drive across the country in a broken van, staging live shows in towns that never asked for them.' },
  { id: 7, title: 'The Cartographer', year: 2017, genre: 'Adventure', rating: 7.7, poster: 'linear-gradient(150deg, #166534, #4d7c0f)', synopsis: 'A mapmaker inherits an unfinished atlas and follows it into a valley that appears on no other chart.' },
  { id: 8, title: 'Midnight Ledger', year: 2016, genre: 'Thriller', rating: 7.3, poster: 'linear-gradient(150deg, #1f2937, #4338ca)', synopsis: 'A night-shift bank clerk notices a pattern in the numbers that someone is willing to kill to keep hidden.' },
  { id: 9, title: 'Sunday Painters', year: 2021, genre: 'Drama', rating: 7.6, poster: 'linear-gradient(150deg, #9d174d, #7c2d12)', synopsis: 'A retired teacher joins a community art class and rediscovers a talent — and a rivalry — she abandoned decades ago.' },
  { id: 10, title: 'Static', year: 2024, genre: 'Horror', rating: 7.1, poster: 'linear-gradient(150deg, #18181b, #7f1d1d)', synopsis: 'A family moves into a smart home that learns their habits a little too well, and starts making choices of its own.' },
  { id: 11, title: 'The Long Way Around', year: 2015, genre: 'Adventure', rating: 8.0, poster: 'linear-gradient(150deg, #0e7490, #15803d)', synopsis: 'Three friends attempt to circle a lake on foot in a weekend and end up walking straight through their oldest arguments.' },
  { id: 12, title: 'Encore', year: 2022, genre: 'Comedy', rating: 7.4, poster: 'linear-gradient(150deg, #7c3aed, #db2777)', synopsis: 'A one-hit wonder fakes a comeback tour to win back his old band, then has to actually learn the songs again.' }
];

const grid = document.getElementById('grid');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('results-count');
const searchEl = document.getElementById('search');
const genreEl = document.getElementById('genre');

const modal = document.getElementById('modal');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalSynopsis = document.getElementById('modal-synopsis');
const modalClose = document.getElementById('modal-close');

let lastFocused = null;

function populateGenres() {
  const genres = ['All', ...new Set(MOVIES.map((m) => m.genre))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));
  genreEl.innerHTML = genres.map((g) => `<option value="${g}">${g}</option>`).join('');
}

function render(movies) {
  countEl.textContent = `${movies.length} ${movies.length === 1 ? 'title' : 'titles'}`;
  emptyEl.hidden = movies.length > 0;
  grid.innerHTML = movies.map((m) => `
    <li>
      <button class="card" type="button" data-id="${m.id}">
        <span class="card__poster" style="background:${m.poster}">
          <span class="card__rating">★ ${m.rating.toFixed(1)}</span>
          <span class="card__poster-title">${m.title}</span>
        </span>
        <span class="card__body">
          <span class="card__title">${m.title}</span>
          <span class="card__meta">${m.year} · ${m.genre}</span>
        </span>
      </button>
    </li>`).join('');
}

function applyFilters() {
  const query = searchEl.value.trim().toLowerCase();
  const genre = genreEl.value;
  const filtered = MOVIES.filter((m) => {
    const matchesGenre = genre === 'All' || m.genre === genre;
    const matchesQuery = !query ||
      m.title.toLowerCase().includes(query) ||
      m.synopsis.toLowerCase().includes(query);
    return matchesGenre && matchesQuery;
  });
  render(filtered);
}

function openModal(id) {
  const movie = MOVIES.find((m) => m.id === Number(id));
  if (!movie) return;
  lastFocused = document.activeElement;
  modalPoster.style.background = movie.poster;
  modalTitle.textContent = movie.title;
  modalMeta.textContent = `${movie.year} · ${movie.genre} · ★ ${movie.rating.toFixed(1)}`;
  modalSynopsis.textContent = movie.synopsis;
  modal.hidden = false;
  modalClose.focus();
}

function closeModal() {
  modal.hidden = true;
  if (lastFocused) lastFocused.focus();
}

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) openModal(card.dataset.id);
});

modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeModal();
});
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

searchEl.addEventListener('input', applyFilters);
genreEl.addEventListener('change', applyFilters);

populateGenres();
applyFilters();
