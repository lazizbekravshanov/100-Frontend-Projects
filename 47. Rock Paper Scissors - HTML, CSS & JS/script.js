const choices = document.querySelectorAll('.choice');
const playerEmoji = document.getElementById('playerEmoji');
const cpuEmoji = document.getElementById('cpuEmoji');
const playerHand = document.getElementById('playerHand');
const cpuHand = document.getElementById('cpuHand');
const outcome = document.getElementById('outcome');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');
const roundCountEl = document.getElementById('roundCount');
const resetBtn = document.getElementById('resetBtn');

const MOVES = {
  rock: { emoji: '✊', beats: 'scissors', label: 'Rock' },
  paper: { emoji: '✋', beats: 'rock', label: 'Paper' },
  scissors: { emoji: '✌️', beats: 'paper', label: 'Scissors' }
};
const KEYS = Object.keys(MOVES);

let playerScore = 0;
let cpuScore = 0;
let rounds = 0;
let busy = false;

function clearHandState() {
  playerHand.classList.remove('hand--win', 'hand--lose');
  cpuHand.classList.remove('hand--win', 'hand--lose');
  outcome.classList.remove('outcome--win', 'outcome--lose', 'outcome--draw');
}

function play(playerMove) {
  if (busy) return;
  busy = true;

  choices.forEach((c) => c.classList.toggle('is-selected', c.dataset.move === playerMove));
  clearHandState();

  playerHand.classList.add('is-shaking');
  cpuHand.classList.add('is-shaking');
  playerEmoji.textContent = '✊';
  cpuEmoji.textContent = '✊';
  outcome.textContent = 'Shoot!';

  window.setTimeout(() => {
    playerHand.classList.remove('is-shaking');
    cpuHand.classList.remove('is-shaking');

    const cpuMove = KEYS[Math.floor(Math.random() * KEYS.length)];
    playerEmoji.textContent = MOVES[playerMove].emoji;
    cpuEmoji.textContent = MOVES[cpuMove].emoji;

    rounds += 1;
    roundCountEl.textContent = rounds;

    if (playerMove === cpuMove) {
      outcome.textContent = `Draw — both chose ${MOVES[playerMove].label}.`;
      outcome.classList.add('outcome--draw');
    } else if (MOVES[playerMove].beats === cpuMove) {
      playerScore += 1;
      playerScoreEl.textContent = playerScore;
      outcome.textContent = `You win! ${MOVES[playerMove].label} beats ${MOVES[cpuMove].label}.`;
      outcome.classList.add('outcome--win');
      playerHand.classList.add('hand--win');
      cpuHand.classList.add('hand--lose');
    } else {
      cpuScore += 1;
      cpuScoreEl.textContent = cpuScore;
      outcome.textContent = `You lose. ${MOVES[cpuMove].label} beats ${MOVES[playerMove].label}.`;
      outcome.classList.add('outcome--lose');
      cpuHand.classList.add('hand--win');
      playerHand.classList.add('hand--lose');
    }

    busy = false;
  }, 450);
}

function reset() {
  playerScore = 0;
  cpuScore = 0;
  rounds = 0;
  playerScoreEl.textContent = '0';
  cpuScoreEl.textContent = '0';
  roundCountEl.textContent = '0';
  playerEmoji.textContent = '✊';
  cpuEmoji.textContent = '✊';
  clearHandState();
  choices.forEach((c) => c.classList.remove('is-selected'));
  outcome.textContent = 'Make your move to start.';
}

choices.forEach((choice) => {
  choice.addEventListener('click', () => play(choice.dataset.move));
});

resetBtn.addEventListener('click', reset);
