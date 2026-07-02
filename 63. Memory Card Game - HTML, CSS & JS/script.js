const symbols = ['🍎', '🚀', '🌙', '🎲', '🎸', '🐳', '⚡', '🌵'];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const timeEl = document.getElementById('time');
const restartBtn = document.getElementById('restart');
const winEl = document.getElementById('win');

let firstCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let startTime = null;
let timerId = null;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
  if (timerId) return;
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeEl.textContent = formatTime(elapsed);
  }, 500);
}

function buildBoard() {
  board.innerHTML = '';
  const deck = shuffle([...symbols, ...symbols]);
  deck.forEach((symbol) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.setAttribute('aria-label', 'Hidden card');
    card.innerHTML = `
      <span class="card__inner">
        <span class="card__face card__face--front" aria-hidden="true"></span>
        <span class="card__face card__face--back">${symbol}</span>
      </span>`;
    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;

  startTimer();
  card.classList.add('is-flipped');
  card.setAttribute('aria-label', `Card showing ${card.dataset.symbol}`);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  moves++;
  movesEl.textContent = String(moves);

  if (firstCard.dataset.symbol === card.dataset.symbol) {
    markMatched(firstCard, card);
  } else {
    lockBoard = true;
    setTimeout(() => {
      unflip(firstCard, card);
      lockBoard = false;
      firstCard = null;
    }, 800);
    return;
  }

  firstCard = null;
}

function markMatched(a, b) {
  a.classList.add('is-matched');
  b.classList.add('is-matched');
  a.disabled = true;
  b.disabled = true;
  matches++;
  matchesEl.textContent = String(matches);
  if (matches === symbols.length) endGame();
}

function unflip(a, b) {
  a.classList.remove('is-flipped');
  b.classList.remove('is-flipped');
  a.setAttribute('aria-label', 'Hidden card');
  b.setAttribute('aria-label', 'Hidden card');
}

function endGame() {
  clearInterval(timerId);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  winEl.hidden = false;
  winEl.textContent = `You won in ${moves} moves and ${formatTime(elapsed)}!`;
}

function resetGame() {
  clearInterval(timerId);
  timerId = null;
  firstCard = null;
  lockBoard = false;
  moves = 0;
  matches = 0;
  movesEl.textContent = '0';
  matchesEl.textContent = '0';
  timeEl.textContent = '0:00';
  winEl.hidden = true;
  winEl.textContent = '';
  buildBoard();
}

restartBtn.addEventListener('click', resetGame);

resetGame();
