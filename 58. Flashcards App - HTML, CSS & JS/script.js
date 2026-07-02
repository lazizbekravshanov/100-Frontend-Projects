const DECK = [
  { front: 'France', back: 'Paris' },
  { front: 'Japan', back: 'Tokyo' },
  { front: 'Canada', back: 'Ottawa' },
  { front: 'Australia', back: 'Canberra' },
  { front: 'Egypt', back: 'Cairo' },
  { front: 'Brazil', back: 'Brasília' },
  { front: 'Norway', back: 'Oslo' },
  { front: 'Kenya', back: 'Nairobi' },
  { front: 'Thailand', back: 'Bangkok' },
  { front: 'Peru', back: 'Lima' },
];

const el = {
  card: document.getElementById('card'),
  front: document.getElementById('front'),
  back: document.getElementById('back'),
  counter: document.getElementById('counter'),
  knownCount: document.getElementById('knownCount'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  knownBtn: document.getElementById('knownBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  resetBtn: document.getElementById('resetBtn'),
};

let cards = DECK.map((c, i) => ({ ...c, id: i, known: false }));
let index = 0;

function render() {
  const card = cards[index];
  el.front.textContent = card.front;
  el.back.textContent = card.back;
  el.card.classList.remove('is-flipped');
  el.card.classList.toggle('is-known', card.known);
  el.counter.textContent = `Card ${index + 1} of ${cards.length}`;
  const knownTotal = cards.filter((c) => c.known).length;
  el.knownCount.textContent = `${knownTotal} known`;
  el.knownBtn.setAttribute('aria-pressed', card.known ? 'true' : 'false');
  el.knownBtn.textContent = card.known ? 'Known ✓' : 'Mark known';
}

function flip() {
  el.card.classList.toggle('is-flipped');
}

function next() {
  index = (index + 1) % cards.length;
  render();
}

function prev() {
  index = (index - 1 + cards.length) % cards.length;
  render();
}

function toggleKnown() {
  cards[index].known = !cards[index].known;
  render();
}

function shuffle() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  index = 0;
  render();
}

function reset() {
  cards = DECK.map((c, i) => ({ ...c, id: i, known: false }));
  index = 0;
  render();
}

el.card.addEventListener('click', flip);
el.prevBtn.addEventListener('click', prev);
el.nextBtn.addEventListener('click', next);
el.knownBtn.addEventListener('click', toggleKnown);
el.shuffleBtn.addEventListener('click', shuffle);
el.resetBtn.addEventListener('click', reset);

window.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (e.key === ' ' || e.key === 'Enter') {
    // Let native button activation handle Enter/Space when a button is focused,
    // except the card itself which we flip.
    if (document.activeElement === el.card || tag === 'BODY') {
      e.preventDefault();
      flip();
    }
  } else if (e.key === 'ArrowRight') {
    next();
  } else if (e.key === 'ArrowLeft') {
    prev();
  } else if (e.key.toLowerCase() === 'k') {
    toggleKnown();
  }
});

render();
