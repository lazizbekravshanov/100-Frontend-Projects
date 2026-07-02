const WORDS = [
  { word: 'galaxy', category: 'Space' },
  { word: 'asteroid', category: 'Space' },
  { word: 'nebula', category: 'Space' },
  { word: 'orbit', category: 'Space' },
  { word: 'penguin', category: 'Animals' },
  { word: 'dolphin', category: 'Animals' },
  { word: 'leopard', category: 'Animals' },
  { word: 'octopus', category: 'Animals' },
  { word: 'keyboard', category: 'Technology' },
  { word: 'algorithm', category: 'Technology' },
  { word: 'network', category: 'Technology' },
  { word: 'pixel', category: 'Technology' },
  { word: 'avocado', category: 'Food' },
  { word: 'noodle', category: 'Food' },
  { word: 'pancake', category: 'Food' },
  { word: 'espresso', category: 'Food' },
  { word: 'volcano', category: 'Nature' },
  { word: 'glacier', category: 'Nature' },
  { word: 'canyon', category: 'Nature' },
  { word: 'meadow', category: 'Nature' }
];

const MAX_WRONG = 6;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const categoryEl = document.getElementById('category');
const wordEl = document.getElementById('word');
const wrongCountEl = document.getElementById('wrongCount');
const wrongLettersEl = document.getElementById('wrongLetters');
const keyboardEl = document.getElementById('keyboard');
const parts = document.querySelectorAll('.part');
const resultEl = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultWord = document.getElementById('resultWord');
const newWordBtn = document.getElementById('newWordBtn');

let current, guessed, wrongLetters, finished;

function buildKeyboard() {
  ALPHABET.forEach((letter) => {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'key';
    key.textContent = letter;
    key.dataset.letter = letter;
    key.setAttribute('aria-label', `Guess ${letter}`);
    key.addEventListener('click', () => handleGuess(letter));
    keyboardEl.appendChild(key);
  });
}

function newGame() {
  current = WORDS[Math.floor(Math.random() * WORDS.length)];
  guessed = new Set();
  wrongLetters = [];
  finished = false;

  categoryEl.textContent = current.category;
  wrongCountEl.textContent = '0';
  wrongLettersEl.textContent = '';
  resultEl.hidden = true;

  parts.forEach((part) => part.classList.remove('is-visible'));

  document.querySelectorAll('.key').forEach((key) => {
    key.disabled = false;
    key.classList.remove('is-correct', 'is-wrong');
  });

  renderWord();
}

function renderWord() {
  wordEl.innerHTML = '';
  current.word.split('').forEach((char) => {
    const slot = document.createElement('span');
    slot.className = 'word__letter';
    if (guessed.has(char)) {
      slot.textContent = char;
      slot.classList.add('is-revealed');
    }
    wordEl.appendChild(slot);
  });
}

function handleGuess(letter) {
  if (finished || guessed.has(letter) || wrongLetters.includes(letter)) return;

  const key = keyboardEl.querySelector(`[data-letter="${letter}"]`);

  if (current.word.includes(letter)) {
    guessed.add(letter);
    key.classList.add('is-correct');
    key.disabled = true;
    renderWord();
    checkWin();
  } else {
    wrongLetters.push(letter);
    key.classList.add('is-wrong');
    key.disabled = true;
    wrongCountEl.textContent = String(wrongLetters.length);
    wrongLettersEl.textContent = wrongLetters.join(' ');
    parts[wrongLetters.length - 1].classList.add('is-visible');
    checkLoss();
  }
}

function checkWin() {
  const won = current.word.split('').every((char) => guessed.has(char));
  if (won) endGame(true);
}

function checkLoss() {
  if (wrongLetters.length >= MAX_WRONG) endGame(false);
}

function endGame(won) {
  finished = true;
  document.querySelectorAll('.key').forEach((key) => (key.disabled = true));

  resultTitle.textContent = won ? 'You won!' : 'Out of guesses';
  resultTitle.className = `result__title ${won ? 'is-win' : 'is-lose'}`;
  resultWord.innerHTML = won
    ? 'Nicely done.'
    : `The word was <strong>${current.word}</strong>.`;

  if (!won) {
    current.word.split('').forEach((char) => guessed.add(char));
    renderWord();
  }

  resultEl.hidden = false;
}

document.addEventListener('keydown', (e) => {
  if (e.key.length !== 1) return;
  const letter = e.key.toLowerCase();
  if (ALPHABET.includes(letter)) handleGuess(letter);
});

newWordBtn.addEventListener('click', newGame);

buildKeyboard();
newGame();
