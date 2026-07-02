const passages = [
  'The quiet morning light spilled across the wooden desk, catching the edge of a half-finished cup of tea. Outside, the city began to stir, one honking car at a time.',
  'Good design is as little design as possible. Less, but better, because it concentrates on the essential aspects and the products are not burdened with things that do not matter.',
  'A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.',
  'She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills, she had a last view back on the skyline of her hometown.',
  'The best way to predict the future is to invent it. Every great idea starts as a small, stubborn thought that refuses to leave until you finally give it a place to live.'
];

const passageEl = document.getElementById('passage');
const inputEl = document.getElementById('input');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
const restartBtn = document.getElementById('restart');
const doneMsg = document.getElementById('doneMsg');

let currentText = '';
let startTime = null;
let timerId = null;
let finished = false;

function pickPassage() {
  const index = Math.floor(Math.random() * passages.length);
  return passages[index];
}

function renderPassage(text) {
  passageEl.innerHTML = '';
  for (const char of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char;
    passageEl.appendChild(span);
  }
}

function resetTest() {
  clearInterval(timerId);
  timerId = null;
  startTime = null;
  finished = false;
  currentText = pickPassage();
  renderPassage(currentText);
  inputEl.value = '';
  inputEl.disabled = false;
  timeEl.textContent = '0s';
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100%';
  errorsEl.textContent = '0';
  doneMsg.textContent = '';
  const first = passageEl.querySelector('.char');
  if (first) first.classList.add('char--current');
}

function tick() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timeEl.textContent = elapsed + 's';
  updateWpm();
}

function updateWpm() {
  if (!startTime) return;
  const minutes = (Date.now() - startTime) / 60000;
  const typed = inputEl.value.length;
  const words = typed / 5;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  wpmEl.textContent = String(Math.max(0, wpm));
}

function handleInput() {
  if (finished) return;

  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(tick, 250);
  }

  const typed = inputEl.value;
  const chars = passageEl.querySelectorAll('.char');
  let errors = 0;

  chars.forEach((span, index) => {
    span.classList.remove('char--correct', 'char--incorrect', 'char--current');
    const typedChar = typed[index];
    if (typedChar == null) {
      if (index === typed.length) span.classList.add('char--current');
      return;
    }
    if (typedChar === currentText[index]) {
      span.classList.add('char--correct');
    } else {
      span.classList.add('char--incorrect');
      errors++;
    }
  });

  errorsEl.textContent = String(errors);
  const correct = typed.length - errors;
  const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  accuracyEl.textContent = accuracy + '%';
  updateWpm();

  if (typed.length >= currentText.length) {
    finishTest();
  }
}

function finishTest() {
  finished = true;
  clearInterval(timerId);
  inputEl.disabled = true;
  updateWpm();
  doneMsg.textContent = `Done! ${wpmEl.textContent} WPM at ${accuracyEl.textContent} accuracy.`;
}

restartBtn.addEventListener('click', () => {
  resetTest();
  inputEl.focus();
});

inputEl.addEventListener('input', handleInput);

resetTest();
