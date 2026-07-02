const grid = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('start');
const messageEl = document.getElementById('message');

const HOLE_COUNT = 9;
const GAME_SECONDS = 30;
const STORAGE_KEY = 'whackAMoleHighScore';

let holes = [];
let score = 0;
let timeLeft = GAME_SECONDS;
let playing = false;
let countdownId = null;
let popTimeoutId = null;
let activeIndex = -1;
let highScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;

highScoreEl.textContent = String(highScore);

function buildGrid() {
  grid.innerHTML = '';
  holes = [];
  for (let i = 0; i < HOLE_COUNT; i++) {
    const hole = document.createElement('button');
    hole.type = 'button';
    hole.className = 'hole';
    hole.setAttribute('aria-label', `Hole ${i + 1}`);
    hole.innerHTML = '<span class="hole__mole" aria-hidden="true">🐹</span>';
    hole.addEventListener('click', () => whack(i));
    grid.appendChild(hole);
    holes.push(hole);
  }
}

function currentDelay() {
  // Faster as the clock runs down: from ~900ms to ~350ms.
  const progress = (GAME_SECONDS - timeLeft) / GAME_SECONDS;
  return Math.max(350, 900 - progress * 550);
}

function clearActive() {
  if (activeIndex >= 0) {
    holes[activeIndex].classList.remove('is-up', 'is-hit');
    activeIndex = -1;
  }
}

function popMole() {
  if (!playing) return;
  clearActive();
  let next = Math.floor(Math.random() * HOLE_COUNT);
  activeIndex = next;
  holes[next].classList.add('is-up');

  const visibleFor = currentDelay();
  popTimeoutId = setTimeout(() => {
    clearActive();
    if (playing) popMole();
  }, visibleFor);
}

function whack(index) {
  if (!playing) return;
  if (index !== activeIndex) return;
  if (holes[index].classList.contains('is-hit')) return;

  holes[index].classList.add('is-hit');
  score++;
  scoreEl.textContent = String(score);
}

function tick() {
  timeLeft--;
  timeEl.textContent = String(timeLeft);
  if (timeLeft <= 0) endGame();
}

function startGame() {
  score = 0;
  timeLeft = GAME_SECONDS;
  playing = true;
  scoreEl.textContent = '0';
  timeEl.textContent = String(GAME_SECONDS);
  messageEl.textContent = 'Go!';
  startBtn.disabled = true;

  countdownId = setInterval(tick, 1000);
  popMole();
}

function endGame() {
  playing = false;
  clearInterval(countdownId);
  clearTimeout(popTimeoutId);
  clearActive();
  startBtn.disabled = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem(STORAGE_KEY, String(highScore));
    highScoreEl.textContent = String(highScore);
    messageEl.textContent = `New best score: ${score}! 🎉`;
  } else {
    messageEl.textContent = `Time's up! You scored ${score}.`;
  }
}

startBtn.addEventListener('click', startGame);

buildGrid();
