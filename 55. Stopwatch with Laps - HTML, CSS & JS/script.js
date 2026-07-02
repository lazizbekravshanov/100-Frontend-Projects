const display = document.getElementById('display');
const startStopBtn = document.getElementById('start-stop');
const lapBtn = document.getElementById('lap');
const resetBtn = document.getElementById('reset');
const lapsList = document.getElementById('laps-list');
const lapsHead = document.getElementById('laps-head');
const emptyState = document.getElementById('empty-state');

let running = false;
let startTime = 0;
let elapsed = 0;
let rafId = null;
let laps = [];
let lastLapTime = 0;

function format(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function currentElapsed() {
  return running ? elapsed + (performance.now() - startTime) : elapsed;
}

function updateDisplay() {
  display.textContent = format(currentElapsed());
  if (running) rafId = requestAnimationFrame(updateDisplay);
}

function start() {
  running = true;
  startTime = performance.now();
  startStopBtn.textContent = 'Stop';
  startStopBtn.classList.add('is-running');
  lapBtn.disabled = false;
  resetBtn.disabled = true;
  rafId = requestAnimationFrame(updateDisplay);
}

function stop() {
  running = false;
  elapsed += performance.now() - startTime;
  cancelAnimationFrame(rafId);
  startStopBtn.textContent = 'Resume';
  startStopBtn.classList.remove('is-running');
  lapBtn.disabled = true;
  resetBtn.disabled = false;
  display.textContent = format(elapsed);
}

function reset() {
  running = false;
  cancelAnimationFrame(rafId);
  elapsed = 0;
  lastLapTime = 0;
  laps = [];
  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('is-running');
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  display.textContent = format(0);
  renderLaps();
}

function recordLap() {
  const total = currentElapsed();
  const split = total - lastLapTime;
  lastLapTime = total;
  laps.push({ split, total });
  renderLaps();
}

function renderLaps() {
  lapsList.innerHTML = '';

  const hasLaps = laps.length > 0;
  emptyState.hidden = hasLaps;
  lapsHead.hidden = !hasLaps;

  if (!hasLaps) return;

  let fastIndex = -1;
  let slowIndex = -1;
  if (laps.length > 1) {
    let min = Infinity;
    let max = -Infinity;
    laps.forEach((lap, i) => {
      if (lap.split < min) { min = lap.split; fastIndex = i; }
      if (lap.split > max) { max = lap.split; slowIndex = i; }
    });
  }

  laps.forEach((lap, i) => {
    const li = document.createElement('li');
    li.className = 'lap';
    let tag = '';
    if (i === fastIndex) { li.classList.add('lap--fast'); tag = 'Fastest'; }
    else if (i === slowIndex) { li.classList.add('lap--slow'); tag = 'Slowest'; }

    const index = document.createElement('span');
    index.className = 'lap__index';
    index.textContent = `#${i + 1}`;

    const split = document.createElement('span');
    split.className = 'lap__split';
    split.textContent = format(lap.split);
    if (tag) {
      const tagEl = document.createElement('span');
      tagEl.className = 'lap__tag';
      tagEl.textContent = tag;
      split.appendChild(tagEl);
    }

    const totalEl = document.createElement('span');
    totalEl.className = 'lap__total';
    totalEl.textContent = format(lap.total);

    li.append(index, split, totalEl);
    lapsList.appendChild(li);
  });
}

startStopBtn.addEventListener('click', () => {
  if (running) stop();
  else start();
});

lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', reset);

display.textContent = format(0);
