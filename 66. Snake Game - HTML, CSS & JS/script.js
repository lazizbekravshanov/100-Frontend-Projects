const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const primaryBtn = document.getElementById('primaryBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const GRID = 20;
const CELL = canvas.width / GRID;
const BASE_SPEED = 160;
const MIN_SPEED = 70;
const HIGH_SCORE_KEY = 'snake.highScore';

const colors = {
  bg: '#171a21',
  grid: '#1f232c',
  snake: '#22c55e',
  head: '#4ade80',
  food: '#f97316'
};

let snake, direction, nextDirection, food, score, speed, loopId;
let state = 'idle';

let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
highScoreEl.textContent = highScore;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = BASE_SPEED;
  scoreEl.textContent = score;
  placeFood();
  draw();
}

function placeFood() {
  let spot;
  do {
    spot = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID)
    };
  } while (snake.some((seg) => seg.x === spot.x && seg.y === spot.y));
  food = spot;
}

function startGame() {
  resetGame();
  state = 'running';
  hideOverlay();
  scheduleTick();
}

function scheduleTick() {
  clearTimeout(loopId);
  loopId = setTimeout(tick, speed);
}

function tick() {
  if (state !== 'running') return;
  step();
  if (state === 'running') scheduleTick();
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
  const hitSelf = snake.some((seg) => seg.x === head.x && seg.y === head.y);
  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    speed = Math.max(MIN_SPEED, BASE_SPEED - score * 5);
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(canvas.width, i * CELL);
    ctx.stroke();
  }

  drawCell(food.x, food.y, colors.food, true);

  snake.forEach((seg, i) => {
    drawCell(seg.x, seg.y, i === 0 ? colors.head : colors.snake);
  });
}

function drawCell(x, y, color, round) {
  const pad = 1.5;
  const size = CELL - pad * 2;
  ctx.fillStyle = color;
  if (round) {
    ctx.beginPath();
    ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(x * CELL + pad, y * CELL + pad, size, size);
  }
}

function endGame() {
  state = 'gameover';
  clearTimeout(loopId);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    highScoreEl.textContent = highScore;
  }
  showOverlay('Game over', `You scored ${score}. Press Start to try again.`, 'Play again');
}

function pauseGame() {
  if (state !== 'running') return;
  state = 'paused';
  clearTimeout(loopId);
  showOverlay('Paused', 'Press Resume or Space to continue.', 'Resume');
}

function resumeGame() {
  if (state !== 'paused') return;
  state = 'running';
  hideOverlay();
  scheduleTick();
}

function showOverlay(title, text, btnLabel) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  primaryBtn.textContent = btnLabel;
  overlay.hidden = false;
}

function hideOverlay() {
  overlay.hidden = true;
}

function setDirection(dir) {
  const opposite = dir.x === -direction.x && dir.y === -direction.y;
  const same = dir.x === direction.x && dir.y === direction.y;
  if (opposite || same) return;
  nextDirection = dir;
}

const keyMap = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 }
};

const dirNames = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

document.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    if (state === 'running') pauseGame();
    else if (state === 'paused') resumeGame();
    return;
  }

  const dir = keyMap[key];
  if (!dir) return;
  e.preventDefault();

  if (state === 'idle' || state === 'gameover') {
    startGame();
  }
  setDirection(dir);
});

primaryBtn.addEventListener('click', () => {
  if (state === 'paused') resumeGame();
  else startGame();
});

pauseBtn.addEventListener('click', () => {
  if (state === 'running') pauseGame();
  else if (state === 'paused') resumeGame();
});

restartBtn.addEventListener('click', startGame);

document.querySelectorAll('.dpad__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dir = dirNames[btn.dataset.dir];
    if (state === 'idle' || state === 'gameover') startGame();
    if (state === 'paused') resumeGame();
    setDirection(dir);
  });
});

resetGame();
