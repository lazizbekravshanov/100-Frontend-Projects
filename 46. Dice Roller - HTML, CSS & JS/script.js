const diceEl = document.getElementById('dice');
const resultEl = document.getElementById('result');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const rollCountEl = document.getElementById('rollCount');
const totalPipsEl = document.getElementById('totalPips');
const bestRollEl = document.getElementById('bestRoll');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');
const chips = document.querySelectorAll('.chip');

// Pip positions (grid cells 0-8) that are filled for each face value.
const FACES = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

let diceCount = 1;
let rolls = 0;
let totalPips = 0;
let best = 0;
let rolling = false;

function buildDie(value) {
  const die = document.createElement('div');
  die.className = 'die is-rolling';
  die.setAttribute('role', 'img');
  die.setAttribute('aria-label', `Die showing ${value}`);
  const filled = FACES[value];
  for (let i = 0; i < 9; i++) {
    const pip = document.createElement('span');
    pip.className = filled.includes(i) ? 'pip' : 'pip pip--empty';
    die.appendChild(pip);
  }
  die.addEventListener('animationend', () => die.classList.remove('is-rolling'), { once: true });
  return die;
}

function renderDice(values) {
  diceEl.innerHTML = '';
  values.forEach((v) => diceEl.appendChild(buildDie(v)));
}

function addHistory(values, sum) {
  if (historyEmpty) historyEmpty.remove();
  const item = document.createElement('li');
  item.className = 'history__item';
  const label = document.createElement('span');
  label.textContent = values.join(' + ');
  const value = document.createElement('strong');
  value.textContent = sum;
  item.append(label, value);
  historyList.prepend(item);
}

function roll() {
  if (rolling) return;
  rolling = true;
  const values = [];
  for (let i = 0; i < diceCount; i++) {
    values.push(Math.floor(Math.random() * 6) + 1);
  }
  renderDice(values);
  const sum = values.reduce((a, b) => a + b, 0);

  rolls += 1;
  totalPips += sum;
  if (sum > best) best = sum;

  rollCountEl.textContent = rolls;
  totalPipsEl.textContent = totalPips;
  bestRollEl.textContent = best;
  resultEl.textContent = diceCount === 1
    ? `You rolled a ${sum}.`
    : `You rolled ${values.join(' and ')} — total ${sum}.`;
  addHistory(values, sum);

  window.setTimeout(() => { rolling = false; }, 500);
}

function resetHistory() {
  rolls = 0;
  totalPips = 0;
  best = 0;
  rollCountEl.textContent = '0';
  totalPipsEl.textContent = '0';
  bestRollEl.textContent = '—';
  resultEl.textContent = 'History cleared. Ready to roll.';
  historyList.innerHTML = '<li class="history__empty" id="historyEmpty">No rolls yet.</li>';
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-checked', 'false');
    });
    chip.classList.add('is-active');
    chip.setAttribute('aria-checked', 'true');
    diceCount = Number(chip.dataset.count);
    diceEl.innerHTML = '';
    resultEl.textContent = `${diceCount} ${diceCount === 1 ? 'die' : 'dice'} selected. Ready to roll.`;
  });
});

rollBtn.addEventListener('click', roll);
resetBtn.addEventListener('click', resetHistory);

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (tag === 'BUTTON' && e.key === 'Enter') return;
  if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
    e.preventDefault();
    roll();
  }
});
