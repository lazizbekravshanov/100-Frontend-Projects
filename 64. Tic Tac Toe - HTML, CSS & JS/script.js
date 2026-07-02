const board = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const resetScoresBtn = document.getElementById('resetScores');
const mode2pBtn = document.getElementById('mode2p');
const modeAiBtn = document.getElementById('modeAi');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');
const labelOEl = document.getElementById('labelO');

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let cells = [];
let state = Array(9).fill('');
let current = 'X';
let active = true;
let vsAi = false;
const scores = { X: 0, O: 0, draw: 0 };

function buildBoard() {
  board.innerHTML = '';
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `Cell ${i + 1}, empty`);
    cell.addEventListener('click', () => handleMove(i));
    board.appendChild(cell);
    cells.push(cell);
  }
}

function handleMove(index) {
  if (!active || state[index] !== '') return;
  place(index, current);

  const result = checkResult();
  if (result) return finishRound(result);

  current = current === 'X' ? 'O' : 'X';
  updateStatus();

  if (vsAi && current === 'O' && active) {
    active = false;
    setTimeout(aiMove, 450);
  }
}

function place(index, mark) {
  state[index] = mark;
  const cell = cells[index];
  cell.textContent = mark;
  cell.dataset.mark = mark;
  cell.disabled = true;
  cell.setAttribute('aria-label', `Cell ${index + 1}, ${mark}`);
}

function aiMove() {
  const index = pickAiMove();
  if (index == null) return;
  place(index, 'O');

  const result = checkResult();
  if (result) return finishRound(result);

  current = 'X';
  active = true;
  updateStatus();
}

function pickAiMove() {
  const empty = state.map((v, i) => (v === '' ? i : null)).filter((i) => i !== null);
  if (empty.length === 0) return null;

  // Win if possible, then block, else center, corner, random.
  const findBest = (mark) => {
    for (const line of WIN_LINES) {
      const marks = line.map((i) => state[i]);
      const emptyInLine = line.filter((i) => state[i] === '');
      if (marks.filter((m) => m === mark).length === 2 && emptyInLine.length === 1) {
        return emptyInLine[0];
      }
    }
    return null;
  };

  const winMove = findBest('O');
  if (winMove !== null) return winMove;
  const blockMove = findBest('X');
  if (blockMove !== null) return blockMove;
  if (state[4] === '') return 4;
  const corners = [0, 2, 6, 8].filter((i) => state[i] === '');
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

function checkResult() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a], line };
    }
  }
  if (state.every((v) => v !== '')) return { winner: null };
  return null;
}

function finishRound(result) {
  active = false;
  if (result.winner) {
    result.line.forEach((i) => cells[i].classList.add('is-win'));
    scores[result.winner]++;
    updateScores();
    statusEl.textContent = result.winner === 'O' && vsAi
      ? 'Computer wins!'
      : `Player ${result.winner} wins!`;
  } else {
    scores.draw++;
    updateScores();
    statusEl.textContent = "It's a draw!";
  }
  cells.forEach((cell) => { cell.disabled = true; });
}

function updateStatus() {
  if (vsAi && current === 'O') {
    statusEl.textContent = 'Computer is thinking…';
  } else if (vsAi) {
    statusEl.textContent = 'Your turn (X)';
  } else {
    statusEl.textContent = `Player ${current}'s turn`;
  }
}

function updateScores() {
  scoreXEl.textContent = String(scores.X);
  scoreOEl.textContent = String(scores.O);
  scoreDrawEl.textContent = String(scores.draw);
}

function newRound() {
  state = Array(9).fill('');
  current = 'X';
  active = true;
  buildBoard();
  updateStatus();
}

function setMode(ai) {
  vsAi = ai;
  mode2pBtn.classList.toggle('is-active', !ai);
  modeAiBtn.classList.toggle('is-active', ai);
  mode2pBtn.setAttribute('aria-pressed', String(!ai));
  modeAiBtn.setAttribute('aria-pressed', String(ai));
  labelOEl.textContent = ai ? 'Computer' : 'Player O';
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  updateScores();
  newRound();
}

resetBtn.addEventListener('click', newRound);
resetScoresBtn.addEventListener('click', () => {
  scores.X = 0;
  scores.O = 0;
  scores.draw = 0;
  updateScores();
});
mode2pBtn.addEventListener('click', () => setMode(false));
modeAiBtn.addEventListener('click', () => setMode(true));

buildBoard();
updateStatus();
