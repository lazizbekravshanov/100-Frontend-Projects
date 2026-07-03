/*
 * News Feed Layout
 * Data source: local MOCK dataset embedded below (no external API).
 * Each article carries a CSS gradient string used as its "image".
 */

const ARTICLES = [
  {
    id: 1, title: 'Cities Rethink the Street as Car Traffic Quietly Declines',
    category: 'World', author: 'Mara Elvia', date: '2026-06-30',
    excerpt: 'A wave of pedestrian-first redesigns is reshaping how downtowns move, breathe, and do business.',
    gradient: 'linear-gradient(135deg,#1e3a8a,#6d28d9)', glyph: '🌍', featured: true
  },
  {
    id: 2, title: 'Small Modular Reactors Clear Their First Regulatory Hurdle',
    category: 'Science', author: 'Devon Ortiz', date: '2026-06-30',
    excerpt: 'Backers say the compact design could bring firm, low-carbon power to the grid within the decade.',
    gradient: 'linear-gradient(135deg,#0f766e,#65a30d)', glyph: '⚛️'
  },
  {
    id: 3, title: 'The Quiet Comeback of the Neighborhood Bookstore',
    category: 'Culture', author: 'Priya Nandakumar', date: '2026-06-29',
    excerpt: 'Independent shops are opening at their fastest pace in a generation, defying predictions of extinction.',
    gradient: 'linear-gradient(135deg,#b45309,#be123c)', glyph: '📚'
  },
  {
    id: 4, title: 'Markets Steady as Central Banks Signal a Slower Path',
    category: 'Business', author: 'Tomas Reyer', date: '2026-06-29',
    excerpt: 'Investors welcomed cautious language on rates, sending bond yields to a three-month low.',
    gradient: 'linear-gradient(135deg,#0369a1,#0d9488)', glyph: '📈'
  },
  {
    id: 5, title: 'On-Device Models Push AI Off the Cloud and Into Your Pocket',
    category: 'Tech', author: 'Lena Whitmore', date: '2026-06-28',
    excerpt: 'A new class of compact models runs entirely offline, raising fresh questions about privacy and control.',
    gradient: 'linear-gradient(135deg,#4338ca,#0891b2)', glyph: '🤖'
  },
  {
    id: 6, title: 'Underdogs Stun the Champions in a Match for the Ages',
    category: 'Sports', author: 'Cole Ferreira', date: '2026-06-28',
    excerpt: 'A last-minute goal capped an improbable run that few analysts saw coming.',
    gradient: 'linear-gradient(135deg,#166534,#ca8a04)', glyph: '⚽'
  },
  {
    id: 7, title: 'Coastal Wetlands Emerge as an Unsung Climate Ally',
    category: 'Science', author: 'Amelia Frost', date: '2026-06-27',
    excerpt: 'Researchers find that restored marshland stores carbon far faster than previously believed.',
    gradient: 'linear-gradient(135deg,#065f46,#155e75)', glyph: '🌾'
  },
  {
    id: 8, title: 'Remote Work Reshapes the Map of Where People Live',
    category: 'World', author: 'Jonah Kessler', date: '2026-06-27',
    excerpt: 'Mid-sized towns are absorbing a fresh influx of residents chasing space and affordability.',
    gradient: 'linear-gradient(135deg,#7c2d12,#9d174d)', glyph: '🗺️'
  },
  {
    id: 9, title: 'A Streaming Giant Bets Big on Live Theater',
    category: 'Culture', author: 'Rosa Villanueva', date: '2026-06-26',
    excerpt: 'The unlikely partnership aims to beam sold-out productions to living rooms worldwide.',
    gradient: 'linear-gradient(135deg,#9333ea,#db2777)', glyph: '🎭'
  },
  {
    id: 10, title: 'Chipmakers Race to Build the Next Fabrication Hub',
    category: 'Business', author: 'Ken Abara', date: '2026-06-26',
    excerpt: 'Billions in subsidies are redrawing the global supply chain for advanced semiconductors.',
    gradient: 'linear-gradient(135deg,#1d4ed8,#7e22ce)', glyph: '🏭'
  },
  {
    id: 11, title: 'Open-Source Tools Are Quietly Running the Modern Web',
    category: 'Tech', author: 'Sofia Klein', date: '2026-06-25',
    excerpt: 'From databases to design systems, community-built software now underpins the biggest platforms.',
    gradient: 'linear-gradient(135deg,#0e7490,#4f46e5)', glyph: '💻'
  },
  {
    id: 12, title: 'The Marathon That Doubles as a Migration Study',
    category: 'Sports', author: 'Idris Baptiste', date: '2026-06-25',
    excerpt: 'Wearable sensors on thousands of runners are yielding a surprising trove of health data.',
    gradient: 'linear-gradient(135deg,#b91c1c,#c2410c)', glyph: '🏃'
  },
  {
    id: 13, title: 'A Telescope Peers Back at the Universe’s First Light',
    category: 'Science', author: 'Nadia Owens', date: '2026-06-24',
    excerpt: 'The freshly calibrated instrument has already spotted galaxies older than any on record.',
    gradient: 'linear-gradient(135deg,#312e81,#0891b2)', glyph: '🔭'
  }
];

const CATEGORIES = ['All', 'World', 'Business', 'Tech', 'Science', 'Culture', 'Sports'];

const els = {
  tabs: document.getElementById('tabs'),
  featured: document.getElementById('featured'),
  cards: document.getElementById('cards'),
  trending: document.getElementById('trending'),
  today: document.getElementById('today')
};

let activeCategory = 'All';

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function thumb(article) {
  return `<div class="thumb" style="background:${article.gradient}">
    <span class="thumb__glyph" aria-hidden="true">${article.glyph}</span>
  </div>`;
}

function byline(article) {
  return `<p class="byline">
    <span class="byline__author">${article.author}</span>
    <span class="byline__dot" aria-hidden="true">•</span>
    <span>${formatDate(article.date)}</span>
  </p>`;
}

function renderTabs() {
  els.tabs.innerHTML = CATEGORIES.map(cat => `
    <button class="tab" role="tab" data-cat="${cat}"
      aria-selected="${cat === activeCategory}">${cat}</button>
  `).join('');
}

function renderFeatured(list) {
  const article = list.find(a => a.featured) || list[0];
  if (!article) { els.featured.innerHTML = ''; return; }
  els.featured.innerHTML = `
    ${thumb(article)}
    <div class="featured__body">
      <span class="tag">${article.category}</span>
      <h3 class="featured__title">${article.title}</h3>
      <p class="featured__excerpt">${article.excerpt}</p>
      ${byline(article)}
    </div>
  `;
}

function renderCards(list) {
  const featured = list.find(a => a.featured) || list[0];
  const rest = list.filter(a => a !== featured);
  if (!rest.length) {
    els.cards.innerHTML = `<p class="card__excerpt">No more stories in this category.</p>`;
    return;
  }
  els.cards.innerHTML = rest.map(article => `
    <article class="card">
      ${thumb(article)}
      <div class="card__body">
        <span class="tag">${article.category}</span>
        <h3 class="card__title">${article.title}</h3>
        <p class="card__excerpt">${article.excerpt}</p>
        ${byline(article)}
      </div>
    </article>
  `).join('');
}

function renderTrending() {
  const top = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  els.trending.innerHTML = top.map(article => `
    <li class="trending__item">
      <span class="trending__rank" aria-hidden="true"></span>
      <div>
        <p class="trending__meta">${article.category}</p>
        <p class="trending__title">${article.title}</p>
      </div>
    </li>
  `).join('');
}

function render() {
  const list = activeCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);
  renderTabs();
  renderFeatured(list);
  renderCards(list);
}

els.tabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  activeCategory = btn.dataset.cat;
  render();
});

const form = document.getElementById('newsletter-form');
const note = document.getElementById('newsletter-note');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email');
  note.textContent = `Thanks — the brief will arrive at ${email.value}.`;
  form.reset();
});

els.today.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});

renderTrending();
render();
