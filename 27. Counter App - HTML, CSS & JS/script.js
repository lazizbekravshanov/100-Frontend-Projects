const valueEl = document.getElementById('value');
const stepInput = document.getElementById('step');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

let count = 0;

function getStep() {
  const step = parseInt(stepInput.value, 10);
  return Number.isNaN(step) || step < 1 ? 1 : step;
}

function render() {
  valueEl.textContent = count;
  valueEl.style.color = count > 0 ? 'var(--accent)' : count < 0 ? '#dc2626' : 'var(--text)';
}

function increment() {
  count += getStep();
  render();
}

function decrement() {
  count -= getStep();
  render();
}

function reset() {
  count = 0;
  render();
}

incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', reset);

document.addEventListener('keydown', (e) => {
  if (document.activeElement === stepInput) return;
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    increment();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    decrement();
  } else if (e.key.toLowerCase() === 'r') {
    reset();
  }
});

render();
